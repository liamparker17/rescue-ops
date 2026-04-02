import { NextRequest } from "next/server";
import prisma from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, diffChanges, NotFoundError,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(["Critical", "High", "Normal"]).optional(),
  status: z.enum(["Open", "InProgress", "Completed", "Cancelled"]).optional(),
  responsibleId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional().transform((s) => (s ? new Date(s) : null)),
  cancelReason: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.operationalTask.findUnique({
      where: { id },
      include: { responsible: true },
    });
    if (!task || task.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Task not found");
    return apiSuccess(task);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateTaskSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const existing = await prisma.operationalTask.findUnique({ where: { id } });
    if (!existing || existing.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Task not found");

    // Build update payload
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.responsibleId !== undefined) updateData.responsibleId = data.responsibleId;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    if (data.status === "Completed") {
      updateData.status = "Completed";
      updateData.completedAt = new Date();
    } else if (data.status === "Cancelled") {
      if (!data.cancelReason) throw new Error("Cancel reason is required");
      updateData.status = "Cancelled";
      updateData.cancelReason = data.cancelReason;
      updateData.cancelledAt = new Date();
    } else if (data.status) {
      updateData.status = data.status;
    }

    const updated = await prisma.operationalTask.update({
      where: { id },
      data: updateData,
      include: { responsible: { select: { id: true, name: true } } },
    });

    const changes = diffChanges(
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      ["title", "description", "priority", "status", "responsibleId", "dueDate"]
    );

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "update",
      entityType: "task",
      entityId: id,
      changes,
      ipAddress,
      userAgent,
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
