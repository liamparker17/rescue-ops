import prisma from "@rescue-ops/database";
import { apiSuccess, handleApiError, DEFAULT_ORG_ID } from "@rescue-ops/shared";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      where: { orgId: DEFAULT_ORG_ID },
      select: { id: true, name: true, role: true, company: true },
      orderBy: { name: "asc" },
    });
    return apiSuccess(contacts);
  } catch (error) {
    return handleApiError(error);
  }
}
