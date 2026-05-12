import { Router, type Request, type Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import {
  db,
  constituencies,
  projects,
  alerts,
} from "@cefanet/db";
import type { DashboardSummary } from "@cefanet/shared";

export const constituenciesRouter = Router();

constituenciesRouter.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(constituencies).orderBy(constituencies.name);
  res.json(rows);
});

constituenciesRouter.get("/:id/summary", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  const cRow = await db
    .select()
    .from(constituencies)
    .where(eq(constituencies.id, id))
    .limit(1);
  const c = cRow[0];
  if (!c) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const totals = await db
    .select({
      totalProjects: sql<number>`count(${projects.id})::int`,
      totalBudget: sql<string>`coalesce(sum(${projects.budgetZmw}), 0)::text`,
      totalExpenditure: sql<string>`coalesce(sum(${projects.expenditureZmw}), 0)::text`,
      avgCompletion: sql<string>`coalesce(avg(${projects.completionPct}), 0)::text`,
    })
    .from(projects)
    .where(eq(projects.constituencyId, id));

  const t = totals[0];

  const byCategoryRows = await db
    .select({
      category: projects.category,
      budget: sql<string>`coalesce(sum(${projects.budgetZmw}), 0)::text`,
      expenditure: sql<string>`coalesce(sum(${projects.expenditureZmw}), 0)::text`,
    })
    .from(projects)
    .where(eq(projects.constituencyId, id))
    .groupBy(projects.category);

  const alertsCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(alerts)
    .where(and(eq(alerts.constituencyId, id), eq(alerts.resolved, false)));

  const summary: DashboardSummary = {
    constituencyId: c.id,
    constituencyName: c.name,
    totalProjects: t.totalProjects ?? 0,
    totalBudget: parseFloat(t.totalBudget ?? "0"),
    totalExpenditure: parseFloat(t.totalExpenditure ?? "0"),
    completionPct: parseFloat(t.avgCompletion ?? "0"),
    activeAlerts: alertsCount[0]?.n ?? 0,
    byCategory: byCategoryRows.map((r) => ({
      category: r.category,
      budget: parseFloat(r.budget),
      expenditure: parseFloat(r.expenditure),
    })),
  };

  res.json(summary);
});
