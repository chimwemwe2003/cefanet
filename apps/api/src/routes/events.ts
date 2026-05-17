import { Router, type Request, type Response } from "express";

export const eventsRouter = Router();

// ---- Event model ----
type LiveEventType =
  | "submission"
  | "alert"
  | "approval"
  | "grievance"
  | "scorecard"
  | "evidence";

interface LiveEvent {
  id: string;
  type: LiveEventType;
  title: string;
  detail: string;
  constituency: string;
  ts: string;
}

const CONSTITUENCIES = [
  "Lusaka Central", "Mandevu", "Kabulonga", "Kabwe Central", "Livingstone",
  "Kitwe Central", "Chipata Central", "Mongu Central", "Solwezi Central", "Kasama Central",
];

const TEMPLATES: Array<Omit<LiveEvent, "id" | "ts" | "constituency">> = [
  { type: "submission", title: "Project field update submitted", detail: "Kobo · Project Field Update form" },
  { type: "scorecard", title: "Community scorecard filed", detail: "WDC session · 4 dimensions scored" },
  { type: "grievance", title: "New grievance logged", detail: "Citizen report via USSD" },
  { type: "approval", title: "Disbursement approved", detail: "MP-review stage cleared" },
  { type: "evidence", title: "Photo evidence uploaded", detail: "Geotagged · awaiting verification" },
  { type: "alert", title: "Project flagged stalled", detail: "Auto red-flag · >30 days dormant" },
  { type: "submission", title: "Health facility inspection submitted", detail: "Kobo · drug availability recorded" },
];

function makeEvent(): LiveEvent {
  const t = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return {
    id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...t,
    constituency: CONSTITUENCIES[Math.floor(Math.random() * CONSTITUENCIES.length)],
    ts: new Date().toISOString(),
  };
}

/**
 * GET /events — Server-Sent Events stream.
 *
 * The blueprint recommends SSE (not WebSockets) for one-directional push on
 * variable African connectivity. Emits a live activity event every 7-12s.
 * EventSource auto-reconnects on the client if the connection drops.
 */
eventsRouter.get("/", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const send = (payload: unknown) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // Initial handshake
  send({ id: "hello", type: "connected", title: "Live stream connected", detail: "", constituency: "", ts: new Date().toISOString() });

  // Heartbeat comment every 20s keeps proxies from closing the connection
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 20_000);

  // Activity events
  const tick = () => {
    send(makeEvent());
    timer = setTimeout(tick, 7_000 + Math.random() * 5_000);
  };
  let timer = setTimeout(tick, 3_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clearTimeout(timer);
    res.end();
  });
});
