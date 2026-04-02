import { NextRequest } from "next/server";
import prisma from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, NotFoundError, DEFAULT_ORG_ID,
} from "@rescue-ops/shared";

const createCommunicationSchema = z.object({
  method: z.enum(["Email", "Phone", "Meeting", "Letter"]),
  summary: z.string().min(1, "Summary is required"),
  date: z.string().transform((s) => new Date(s)),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const creditor = await prisma.creditor.findUnique({ where: { id } });
    if (!creditor || creditor.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Creditor not found");

    const communications = await prisma.creditorCommunication.findMany({
      where: { creditorId: id },
      orderBy: { date: "desc" },
    });

    return apiSuccess(communications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = createCommunicationSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const creditor = await prisma.creditor.findUnique({ where: { id } });
    if (!creditor || creditor.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Creditor not found");

    const [communication] = await Promise.all([
      prisma.creditorCommunication.create({
        data: {
          creditorId: id,
          method: data.method,
          summary: data.summary,
          date: data.date,
        },
      }),
      prisma.creditor.update({
        where: { id },
        data: { lastContactDate: data.date },
      }),
    ]);

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "creditor_communication",
      entityId: communication.id,
      metadata: { creditorId: id, method: data.method },
      ipAddress,
      userAgent,
    });

    return apiSuccess(communication, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
