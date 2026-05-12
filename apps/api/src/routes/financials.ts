import { Router, type Request, type Response } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, projects, expenditureLines, fundDisbursements } from "@cefanet/db";
import type { FinancialOverview, ProjectCategory } from "@cefanet/shared";

export const financialsRouter = Router();

financialsRouter.get("/overview", async (req: Request, res: Response) => {
  const constituencyId = Number(req.query.constituencyId);
  if (!Number.isFinite(constituencyId)) {
    res.status(400).json({ error: "constituencyId is required" });
    return;
  }

  const allocRows = await db
    .select({ total: sql<string>`coalesce(sum(${fundDisbursements.amountZmw}), 0)::text` })
    .from(fundDisbursements)
    .where(eq(fundDisbursements.constituencyId, constituencyId));
  const totalAllocated = parseFloat(allocRows[0]?.total ?? "0");

  const spentRows = await db
    .select({ total: sql<string>`coalesce(sum(${projects.expenditureZmw}), 0)::text` })
    .from(projects)
    .where(eq(projects.constituencyId, constituencyId));
  const totalSpent = parseFloat(spentRows[0]?.total ?? "0");

  const byCategoryRows = await db
    .select({
      category: expenditureLines.category,
      amount: sql<string>`coalesce(sum(${expenditureLines.amountZmw}), 0)::text`,
    })
    .from(expenditureLines)
    .where(eq(expenditureLines.constituencyId, constituencyId))
    .groupBy(expenditureLines.category);

  const monthlyRows = await db
    .select({
      month: sql<string>`to_char(${expenditureLines.month}, 'YYYY-MM')`,
      amount: sql<string>`coalesce(sum(${expenditureLines.amountZmw}), 0)::text`,
    })
    .from(expenditureLines)
    .where(eq(expenditureLines.constituencyId, constituencyId))
    .groupBy(sql`to_char(${expenditureLines.month}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${expenditureLines.month}, 'YYYY-MM')`);

  const overview: FinancialOverview = {
    constituencyId,
    totalAllocated,
    totalSpent,
    variance: totalAllocated - totalSpent,
    utilisationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
    byCategory: byCategoryRows.map((r) => ({
      category: r.category as ProjectCategory,
      amount: parseFloat(r.amount),
    })),
    monthlyTrend: monthlyRows.map((r) => ({
      month: r.month,
      amount: parseFloat(r.amount),
    })),
  };
  res.json(overview);
});

financialsRouter.get("/stacked", async (req: Request, res: Response) => {
  // Stacked-by-category data for the per-month chart
  const constituencyId = Number(req.query.constituencyId);
  if (!Number.isFinite(constituencyId)) {
    res.status(400).json({ error: "constituencyId is required" });
    return;
  }
  const rows = await db
    .select({
      month: sql<string>`to_char(${expenditureLines.month}, 'YYYY-MM')`,
      category: expenditureLines.category,
      amount: sql<string>`coalesce(sum(${expenditureLines.amountZmw}), 0)::text`,
    })
    .from(expenditureLines)
    .where(eq(expenditureLines.constituencyId, constituencyId))
    .groupBy(
      sql`to_char(${expenditureLines.month}, 'YYYY-MM')`,
      expenditureLines.category
    )
    .orderBy(sql`to_char(${expenditureLines.month}, 'YYYY-MM')`);
  res.json(rows.map((r) => ({ ...r, amount: parseFloat(r.amount) })));
});
