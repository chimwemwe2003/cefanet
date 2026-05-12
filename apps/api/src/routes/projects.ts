import { Router, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db, projects, projectUpdates } from "@cefanet/db";

export const projectsRouter = Router();

projectsRouter.get("/", async (req: Request, res: Response) => {
  const constituencyId = req.query.constituencyId
    ? Number(req.query.constituencyId)
    : null;

  const rows = constituencyId
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.constituencyId, constituencyId))
        .orderBy(desc(projects.updatedAt))
    : await db.select().from(projects).orderBy(desc(projects.updatedAt));

  res.json(rows);
});

projectsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  const projectRow = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const p = projectRow[0];
  if (!p) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const updates = await db
    .select()
    .from(projectUpdates)
    .where(eq(projectUpdates.projectId, id))
    .orderBy(desc(projectUpdates.postedAt));

  res.json({ ...p, updates });
});
