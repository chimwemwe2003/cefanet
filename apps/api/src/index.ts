import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(__dirname, "../../../.env") });
loadDotenv({ path: path.resolve(__dirname, "../.env"), override: false });

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { constituenciesRouter } from "./routes/constituencies.js";
import { projectsRouter } from "./routes/projects.js";
import { financialsRouter } from "./routes/financials.js";
import { bursariesRouter } from "./routes/bursaries.js";
import { alertsRouter } from "./routes/alerts.js";

const app = express();
// Render/Railway/Fly inject PORT. Locally we use API_PORT.
const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

/** Normalize for comparison (scheme + host, no trailing path slash). */
function normalizeOrigin(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    return `${u.protocol}//${u.host}`;
  } catch {
    return s.replace(/\/$/, "");
  }
}

// Build allowed-origins list:
//   - In dev (no CORS_ORIGIN set), allow any browser origin
//   - In prod, set CORS_ORIGIN to comma-separated full origins, e.g.
//     "https://cefanet-2f71f.web.app,https://cefanet-2f71f.firebaseapp.com"
const corsAllowed = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => normalizeOrigin(s))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl / server-to-server
      if (corsAllowed.length === 0) return cb(null, true); // dev / open fallback
      const req = normalizeOrigin(origin);
      if (corsAllowed.includes(req)) return cb(null, true);
      console.warn(`[cors] blocked origin=${origin} normalized=${req} allowed=${corsAllowed.join("|")}`);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Soft auth: populates req.user if a valid bearer token is present.
// Routes that need RBAC enforce it themselves.
app.use(authMiddleware);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "cefanet-api", time: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/constituencies", constituenciesRouter);
app.use("/projects", projectsRouter);
app.use("/financials", financialsRouter);
app.use("/bursaries", bursariesRouter);
app.use("/alerts", alertsRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "not_found", path: req.path });
});

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[api error]", err);
  const message =
    err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: "internal_error", message });
});

app.listen(PORT, () => {
  console.log(`[cefanet-api] listening on http://localhost:${PORT}`);
});
