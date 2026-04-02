import { NextResponse } from "next/server";

export async function POST() {
  // In production, the seed runs via CLI: npm run db:seed
  // This endpoint is a convenience for the demo — it shells out to the seed script.
  // For now, return instructions.
  return NextResponse.json({
    message: "Run `npm run db:seed` from the project root to seed demo data.",
  });
}
