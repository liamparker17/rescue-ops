import { NextResponse } from "next/server";
import prisma from "@rescue-ops/database";
import { handleApiError } from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

export async function GET() {
  try {
    const [balances, creditors] = await Promise.all([
      prisma.openingBalance.findMany({ where: { orgId: DEFAULT_ORG_ID } }),
      prisma.creditor.findMany({
        where: { orgId: DEFAULT_ORG_ID },
        include: { contact: { select: { name: true } } },
        orderBy: { claimAmountInCents: "desc" },
      }),
    ]);

    // -- Metrics --
    const assets = balances.filter((b) => b.accountType === "Asset");
    const liabilities = balances.filter((b) => b.accountType === "Liability");
    const equity = balances.filter((b) => b.accountType === "Equity");
    const expenses = balances.filter((b) => b.accountType === "Expense");

    const totalAssets = assets.reduce((sum, b) => sum + b.balanceInCents, 0);
    const totalLiabilities = liabilities.reduce((sum, b) => sum + b.balanceInCents, 0);
    const totalEquity = equity.reduce((sum, b) => sum + b.balanceInCents, 0);
    const monthlyBurn = expenses.reduce((sum, b) => sum + b.balanceInCents, 0);

    // Cash = accounts 1000-1099
    const cashPosition = assets
      .filter((b) => {
        const code = parseInt(b.accountCode, 10);
        return code >= 1000 && code <= 1099;
      })
      .reduce((sum, b) => sum + b.balanceInCents, 0);

    const solvencyRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : 0;

    // Runway in days (cash / daily burn)
    const dailyBurn = monthlyBurn / 30;
    const runwayDays = dailyBurn > 0 ? Math.floor(cashPosition / dailyBurn) : 999;

    // -- Cash Runway Projection (30/60/90 days) --
    const runway = [0, 30, 60, 90].map((day) => ({
      day,
      balance: cashPosition - dailyBurn * day,
    }));

    // -- Exposure by Security Class --
    const securityBreakdown = {
      Secured: creditors
        .filter((c) => c.securityType === "Secured")
        .reduce((sum, c) => sum + c.claimAmountInCents, 0),
      Preferent: creditors
        .filter((c) => c.securityType === "Preferent")
        .reduce((sum, c) => sum + c.claimAmountInCents, 0),
      Concurrent: creditors
        .filter((c) => c.securityType === "Concurrent")
        .reduce((sum, c) => sum + c.claimAmountInCents, 0),
    };

    // -- Top 10 Creditors --
    const totalClaims = creditors.reduce((sum, c) => sum + c.claimAmountInCents, 0);
    const top10 = creditors.slice(0, 10).map((c, i) => ({
      rank: i + 1,
      id: c.id,
      creditorName: c.creditorName,
      claimAmountInCents: c.claimAmountInCents,
      securityType: c.securityType,
      percentOfTotal: totalClaims > 0 ? (c.claimAmountInCents / totalClaims) * 100 : 0,
      contactName: c.contact?.name || null,
    }));

    // -- Balance Sheet Summary --
    const balanceSheet = {
      totalAssets,
      totalLiabilities,
      totalEquity,
      netPosition: totalAssets - totalLiabilities,
      assetCount: assets.length,
      liabilityCount: liabilities.length,
      equityCount: equity.length,
    };

    const response = NextResponse.json({
      metrics: {
        cashPosition,
        totalCreditorExposure: totalLiabilities,
        solvencyRatio: Math.round(solvencyRatio * 100) / 100,
        monthlyBurnRate: monthlyBurn,
        runwayDays,
      },
      runway,
      securityBreakdown,
      top10,
      balanceSheet,
    });

    response.headers.set(
      "Cache-Control",
      "private, max-age=15, stale-while-revalidate=30"
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
