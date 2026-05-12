import { Router, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, beneficiaries } from "@cefanet/db";
import type { BursaryStats, BeneficiaryLevel, Gender } from "@cefanet/shared";

export const bursariesRouter = Router();

bursariesRouter.get("/beneficiaries", async (req: Request, res: Response) => {
  const constituencyId = Number(req.query.constituencyId);
  if (!Number.isFinite(constituencyId)) {
    res.status(400).json({ error: "constituencyId is required" });
    return;
  }
  const rows = await db
    .select()
    .from(beneficiaries)
    .where(eq(beneficiaries.constituencyId, constituencyId))
    .orderBy(beneficiaries.code);
  res.json(rows);
});

bursariesRouter.get("/stats", async (req: Request, res: Response) => {
  const constituencyId = Number(req.query.constituencyId);
  if (!Number.isFinite(constituencyId)) {
    res.status(400).json({ error: "constituencyId is required" });
    return;
  }

  const totals = await db
    .select({
      total: sql<number>`count(*)::int`,
      sumAmount: sql<string>`coalesce(sum(${beneficiaries.amountZmw}), 0)::text`,
    })
    .from(beneficiaries)
    .where(eq(beneficiaries.constituencyId, constituencyId));

  const byGenderRows = await db
    .select({
      gender: beneficiaries.gender,
      count: sql<number>`count(*)::int`,
    })
    .from(beneficiaries)
    .where(eq(beneficiaries.constituencyId, constituencyId))
    .groupBy(beneficiaries.gender);

  const byLevelRows = await db
    .select({
      level: beneficiaries.level,
      count: sql<number>`count(*)::int`,
    })
    .from(beneficiaries)
    .where(eq(beneficiaries.constituencyId, constituencyId))
    .groupBy(beneficiaries.level);

  const out: BursaryStats = {
    constituencyId,
    totalBeneficiaries: totals[0]?.total ?? 0,
    totalDisbursed: parseFloat(totals[0]?.sumAmount ?? "0"),
    byGender: byGenderRows.map((r) => ({ gender: r.gender as Gender, count: r.count })),
    byLevel: byLevelRows.map((r) => ({
      level: r.level as BeneficiaryLevel,
      count: r.count,
    })),
  };
  res.json(out);
});
