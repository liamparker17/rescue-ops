import { NextRequest } from "next/server";
import prisma from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, diffChanges, NotFoundError, DEFAULT_ORG_ID,
} from "@rescue-ops/shared";

const updateCreditorSchema = z.object({
  creditorName: z.string().min(1).optional(),
  claimAmountInCents: z.number().int().positive().optional(),
  securityType: z.enum(["Secured", "Preferent", "Concurrent"]).optional(),
  stage: z.enum(["Identified", "Notified", "InNegotiation", "OfferMade", "Agreed", "Voted"]).optional(),
  contactId: z.string().nullable().optional(),
  votingStatus: z.enum(["Pending", "For", "Against", "Abstained"]).optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const creditor = await prisma.creditor.findUnique({
      where: { id },
      include: {
        contact: { select: { id: true, name: true, role: true, company: true } },
        communications: { orderBy: { date: "desc" } },
      },
    });
    if (!creditor || creditor.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Creditor not found");
    return apiSuccess(creditor);
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
    const data = updateCreditorSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const existing = await prisma.creditor.findUnique({ where: { id } });
    if (!existing || existing.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Creditor not found");

    const updateData: Record<string, unknown> = {};
    if (data.creditorName !== undefined) updateData.creditorName = data.creditorName;
    if (data.claimAmountInCents !== undefined) updateData.claimAmountInCents = data.claimAmountInCents;
    if (data.securityType !== undefined) updateData.securityType = data.securityType;
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.contactId !== undefined) updateData.contactId = data.contactId;
    if (data.votingStatus !== undefined) updateData.votingStatus = data.votingStatus;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await prisma.creditor.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { id: true, name: true } },
        _count: { select: { communications: true } },
      },
    });

    const changes = diffChanges(
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      ["creditorName", "claimAmountInCents", "securityType", "stage", "contactId", "votingStatus", "notes"]
    );

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "update",
      entityType: "creditor",
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
