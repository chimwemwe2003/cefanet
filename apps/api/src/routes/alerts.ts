import { Router, type Request, type Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, alerts, projects, constituencies } from "@cefanet/db";

export const alertsRouter = Router();

alertsRouter.get("/", async (req: Request, res: Response) => {
  const constituencyId = req.query.constituencyId
    ? Number(req.query.constituencyId)
    : null;

  const baseSelect = db
    .select({
      id: alerts.id,
      constituencyId: alerts.constituencyId,
      projectId: alerts.projectId,
      severity: alerts.severity,
      title: alerts.title,
      message: alerts.message,
      daysOverdue: alerts.daysOverdue,
      budgetAtRiskZmw: alerts.budgetAtRiskZmw,
      resolved: alerts.resolved,
      createdAt: alerts.createdAt,
      projectName: projects.name,
      constituencyName: constituencies.name,
    })
    .from(alerts)
    .leftJoin(projects, eq(projects.id, alerts.projectId))
    .leftJoin(constituencies, eq(constituencies.id, alerts.constituencyId));

  const rows = constituencyId
    ? await baseSelect
        .where(
          and(eq(alerts.constituencyId, constituencyId), eq(alerts.resolved, false))
        )
        .orderBy(desc(alerts.daysOverdue))
    : await baseSelect.where(eq(alerts.resolved, false)).orderBy(desc(alerts.daysOverdue));

  res.json(rows);
});
