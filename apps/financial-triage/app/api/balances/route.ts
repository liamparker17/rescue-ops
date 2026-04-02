import { NextRequest } from "next/server";
import prisma from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess,
  handleApiError,
  extractRequestMeta,
  writeAuditLog,
  parsePagination,
  paginatedResult,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const createBalanceSchema = z.object({
  accountCode: z.string().min(1, "Account code is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
  balanceInCents: z.number().int("Balance must be a whole number (cents)"),
  asAtDate: z.string().transform((s) => new Date(s)),
});

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.openingBalance.findMany({
        where: { orgId: DEFAULT_ORG_ID },
        orderBy: { accountCode: "asc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.openingBalance.count({ where: { orgId: DEFAULT_ORG_ID } }),
    ]);
    return apiSuccess(paginatedResult(data, total, pagination));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createBalanceSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const balance = await prisma.openingBalance.create({
      data: {
        orgId: DEFAULT_ORG_ID,
        ...data,
      },
    });

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "opening_balance",
      entityId: balance.id,
      metadata: { accountCode: data.accountCode, accountName: data.accountName },
      ipAddress,
      userAgent,
    });

    return apiSuccess(balance, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
