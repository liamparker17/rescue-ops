import { NextRequest } from "next/server";
import prisma, { Prisma } from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, parsePagination, paginatedResult,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["Critical", "High", "Normal"]).default("Normal"),
  responsibleId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional().transform((s) => (s ? new Date(s) : null)),
});

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    const status = req.nextUrl.searchParams.get("status");
    const priority = req.nextUrl.searchParams.get("priority");
    const search = req.nextUrl.searchParams.get("search");

    const where = { orgId: DEFAULT_ORG_ID };
    if (status) where.status = status as Prisma.EnumTaskStatusFilter["equals"];
    if (priority) where.priority = priority as Prisma.EnumTaskPriorityFilter["equals"];
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.operationalTask.findMany({
        where,
        include: { responsible: { select: { id: true, name: true } } },
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.operationalTask.count({ where }),
    ]);

    return apiSuccess(paginatedResult(data, total, pagination));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createTaskSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    // Atomic auto-numbering via $transaction at Serializable isolation
    const task = await prisma.$transaction(async (tx) => {
      const seq = await tx.taskSequence.upsert({
        where: { orgId: DEFAULT_ORG_ID },
        update: { lastSeq: { increment: 1 } },
        create: { orgId: DEFAULT_ORG_ID, lastSeq: 1 },
      });

      return tx.operationalTask.create({
        data: {
          orgId: DEFAULT_ORG_ID,
          taskNumber: seq.lastSeq,
          title: data.title,
          description: data.description,
          priority: data.priority,
          responsibleId: data.responsibleId || null,
          dueDate: data.dueDate,
        },
        include: { responsible: { select: { id: true, name: true } } },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "task",
      entityId: task.id,
      metadata: { taskNumber: task.taskNumber, title: data.title },
      ipAddress,
      userAgent,
    });

    return apiSuccess(task, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

