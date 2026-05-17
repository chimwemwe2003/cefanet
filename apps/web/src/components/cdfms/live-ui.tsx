"use client";

import { useEffect, useRef, useState } from "react";
import {
  Radio,
  FileInput,
  AlertOctagon,
  CheckCircle2,
  MessageSquareWarning,
  ClipboardList,
  Camera,
  X,
} from "lucide-react";
import { useLive, type LiveEvent, type LiveEventType } from "./live-provider";

const ICON: Record<LiveEventType, typeof FileInput> = {
  submission: FileInput,
  alert: AlertOctagon,
  approval: CheckCircle2,
  grievance: MessageSquareWarning,
  scorecard: ClipboardList,
  evidence: Camera,
  connected: Radio,
};

const TONE: Record<LiveEventType, string> = {
  submission: "text-blue-600 bg-blue-50",
  alert: "text-red-600 bg-red-50",
  approval: "text-emerald-600 bg-emerald-50",
  grievance: "text-amber-600 bg-amber-50",
  scorecard: "text-ministry-700 bg-ministry-50",
  evidence: "text-gold-700 bg-gold-50",
  connected: "text-ink-600 bg-ink-50",
};

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}

/** Small pulsing LIVE indicator for the top bar. */
export function LiveBadge() {
  const { mode } = useLive();
  const label = mode === "live" ? "Live" : mode === "simulated" ? "Live demo" : "Connecting";
  const color =
    mode === "live"
      ? "bg-emerald-500"
      : mode === "simulated"
      ? "bg-ministry-500"
      : "bg-ink-300";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink-200 px-2.5 py-1 text-[11px] font-medium text-ink-700 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 ${mode !== "connecting" ? "animate-ping" : ""}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </span>
      {label}
    </span>
  );
}

/** Toast host — shows the newest event as a transient card, bottom-right. */
export function ToastHost() {
  const { latest } = useLive();
  const [toasts, setToasts] = useState<LiveEvent[]>([]);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!latest || latest.type === "connected") return;
    if (seen.current.has(latest.id)) return;
    seen.current.add(latest.id);
    setToasts((prev) => [latest, ...prev].slice(0, 3));
    const id = latest.id;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5_500);
    return () => clearTimeout(timer);
  }, [latest]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-14 right-3 z-50 flex flex-col gap-2 w-72 no-print">
      {toasts.map((t) => {
        const Icon = ICON[t.type];
        return (
          <div
            key={t.id}
            className="flex items-start gap-2.5 rounded-xl border border-ink-200 bg-white shadow-ministry-lg px-3 py-2.5 animate-[slidein_.2s_ease-out]"
          >
            <span className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${TONE[t.type]}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink-900 leading-tight">{t.title}</div>
              <div className="text-[11px] text-ink-500 mt-0.5">
                {t.constituency} · {t.detail}
              </div>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-ink-400 hover:text-ink-700 flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Live activity feed card — for the dashboard. */
export function LiveFeed() {
  const { events, mode } = useLive();
  const [, force] = useState(0);

  // tick every 15s so relative timestamps refresh
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-xl border border-ink-200 bg-white shadow-ministry p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-semibold tracking-[.18em] uppercase text-ministry-600">
            Real-time
          </span>
          <h2 className="font-serif text-lg text-ink-900 leading-tight">Live activity feed</h2>
        </div>
        <LiveBadge />
      </div>

      {events.length === 0 ? (
        <div className="text-sm text-ink-500 py-6 text-center">
          Waiting for activity…
        </div>
      ) : (
        <ol className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {events.map((e) => {
            const Icon = ICON[e.type];
            return (
              <li key={e.id} className="flex items-start gap-2.5">
                <span className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${TONE[e.type]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-900 leading-tight">{e.title}</div>
                  <div className="text-[11px] text-ink-500">
                    {e.constituency} · {e.detail}
                  </div>
                </div>
                <span className="text-[10px] text-ink-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                  {relTime(e.ts)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="text-[10px] text-ink-400 mt-3 pt-2 border-t border-ink-100">
        {mode === "live"
          ? "Streaming live from the CEFANET CDF-MS API via Server-Sent Events."
          : "Demo stream — connect the API for live field events."}
      </div>
    </div>
  );
}
