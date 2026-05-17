import { Router, type Request, type Response } from "express";
import { isKoboConfigured, listForms, listSubmissions } from "../services/kobo.js";

export const koboRouter = Router();

/** GET /kobo/status — what's wired up? */
koboRouter.get("/status", (_req, res) => {
  res.json({
    configured: isKoboConfigured(),
    base: process.env.KOBO_BASE ?? null,
    forms: {
      project_update: Boolean(process.env.KOBO_UID_PROJECT_UPDATE),
      scorecard: Boolean(process.env.KOBO_UID_SCORECARD),
      grievance: Boolean(process.env.KOBO_UID_GRIEVANCE),
      bursary: Boolean(process.env.KOBO_UID_BURSARY),
      health: Boolean(process.env.KOBO_UID_HEALTH),
    },
  });
});

/** GET /kobo/forms — list metadata for every configured form. */
koboRouter.get("/forms", async (_req: Request, res: Response) => {
  try {
    const forms = await listForms();
    res.json({ configured: isKoboConfigured(), forms });
  } catch (err) {
    res.status(500).json({ error: "kobo_forms_failed", message: (err as Error).message });
  }
});

/** GET /kobo/submissions?limit=100 — pull recent submissions across all forms. */
koboRouter.get("/submissions", async (req: Request, res: Response) => {
  const limit = Math.min(500, Math.max(1, Number(req.query.limit ?? 100)));
  try {
    const submissions = await listSubmissions({ limit });
    res.json({ configured: isKoboConfigured(), count: submissions.length, submissions });
  } catch (err) {
    res.status(500).json({ error: "kobo_submissions_failed", message: (err as Error).message });
  }
});
