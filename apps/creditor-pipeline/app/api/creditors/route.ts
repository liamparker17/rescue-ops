import { NextRequest } from "next/server";
import prisma, { Prisma } from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, parsePagination, paginatedResult,
  DEFAULT_ORG_ID,
} from "@rescue-ops/shared";

const createCreditorSchema = z.object({
  creditorName: z.string().min(1, "Creditor name is required"),
  claimAmountInCents: z.number().int().positive("Claim amount must be positive"),
  securityType: z.enum(["Secured", "Preferent", "Concurrent"]),
  stage: z.enum(["Identified", "Notified", "InNegotiation", "OfferMade", "Agreed", "Voted"]).default("Identified"),
  contactId: z.string().nullable().optional(),
  votingStatus: z.enum(["Pending", "For", "Against", "Abstained"]).default("Pending"),
  notes: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    const stage = req.nextUrl.searchParams.get("stage");
    const securityType = req.nextUrl.searchParams.get("securityType");

    const where: Prisma.CreditorWhereInput = { orgId: DEFAULT_ORG_ID };
    if (stage) where.stage = stage as Prisma.EnumCreditorStageFilter["equals"];
    if (securityType) where.securityType = securityType as Prisma.EnumSecurityTypeFilter["equals"];

    const [data, total] = await Promise.all([
      prisma.creditor.findMany({
        where,
        include: {
          contact: { select: { id: true, name: true } },
          _count: { select: { communications: true } },
        },
        orderBy: [{ claimAmountInCents: "desc" }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.creditor.count({ where }),
    ]);

    return apiSuccess(paginatedResult(data, total, pagination));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createCreditorSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const creditor = await prisma.creditor.create({
      data: {
        orgId: DEFAULT_ORG_ID,
        creditorName: data.creditorName,
        claimAmountInCents: data.claimAmountInCents,
        securityType: data.securityType,
        stage: data.stage,
        contactId: data.contactId || null,
        votingStatus: data.votingStatus,
        notes: data.notes || null,
      },
      include: {
        contact: { select: { id: true, name: true } },
        _count: { select: { communications: true } },
      },
    });

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "creditor",
      entityId: creditor.id,
      metadata: { creditorName: data.creditorName, claimAmountInCents: data.claimAmountInCents },
      ipAddress,
      userAgent,
    });

    return apiSuccess(creditor, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
