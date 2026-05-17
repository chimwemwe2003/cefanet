"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type LiveEventType =
  | "submission"
  | "alert"
  | "approval"
  | "grievance"
  | "scorecard"
  | "evidence"
  | "connected";

export interface LiveEvent {
  id: string;
  type: LiveEventType;
  title: string;
  detail: string;
  constituency: string;
  ts: string;
}

type LiveMode = "connecting" | "live" | "simulated";

interface LiveContextValue {
  mode: LiveMode;
  events: LiveEvent[];
  latest: LiveEvent | null;
}

const LiveContext = createContext<LiveContextValue>({
  mode: "connecting",
  events: [],
  latest: null,
});

export function useLive(): LiveContextValue {
  return useContext(LiveContext);
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// --- client-side simulation (used when no API / SSE drops) ---
const SIM_CONSTITUENCIES = [
  "Lusaka Central", "Mandevu", "Kabulonga", "Kabwe Central", "Livingstone",
  "Kitwe Central", "Chipata Central", "Mongu Central", "Solwezi Central", "Kasama Central",
];
const SIM_TEMPLATES: Array<Pick<LiveEvent, "type" | "title" | "detail">> = [
  { type: "submission", title: "Project field update submitted", detail: "Kobo · Project Field Update form" },
  { type: "scorecard", title: "Community scorecard filed", detail: "WDC session · 4 dimensions scored" },
  { type: "grievance", title: "New grievance logged", detail: "Citizen report via USSD" },
  { type: "approval", title: "Disbursement approved", detail: "MP-review stage cleared" },
  { type: "evidence", title: "Photo evidence uploaded", detail: "Geotagged · awaiting verification" },
  { type: "alert", title: "Project flagged stalled", detail: "Auto red-flag · >30 days dormant" },
  { type: "submission", title: "Health facility inspection submitted", detail: "Kobo · drug availability recorded" },
];

function simEvent(): LiveEvent {
  const t = SIM_TEMPLATES[Math.floor(Math.random() * SIM_TEMPLATES.length)];
  return {
    id: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...t,
    constituency: SIM_CONSTITUENCIES[Math.floor(Math.random() * SIM_CONSTITUENCIES.length)],
    ts: new Date().toISOString(),
  };
}

const MAX_EVENTS = 40;

export function LiveProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LiveMode>("connecting");
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const simRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const push = (ev: LiveEvent) => {
      if (cancelled) return;
      if (ev.type === "connected") return;
      setEvents((prev) => [ev, ...prev].slice(0, MAX_EVENTS));
    };

    const startSimulation = () => {
      if (cancelled) return;
      setMode("simulated");
      const tick = () => {
        push(simEvent());
        simRef.current = setTimeout(tick, 6_000 + Math.random() * 6_000);
      };
      simRef.current = setTimeout(tick, 2_500);
    };

    // Try real SSE first
    if (API_URL) {
      try {
        const es = new EventSource(`${API_URL}/events`);
        esRef.current = es;
        let gotData = false;

        es.onmessage = (e) => {
          gotData = true;
          if (cancelled) return;
          setMode("live");
          try {
            const ev = JSON.parse(e.data) as LiveEvent;
            push(ev);
          } catch {
            /* ignore malformed */
          }
        };
        es.onerror = () => {
          es.close();
          esRef.current = null;
          if (!cancelled && !gotData) startSimulation();
          else if (!cancelled) {
            // connection dropped after working — degrade to simulation
            startSimulation();
          }
        };

        // If SSE hasn't produced anything within 4s, fall back
        setTimeout(() => {
          if (!cancelled && !gotData) {
            es.close();
            esRef.current = null;
            startSimulation();
          }
        }, 4_000);
      } catch {
        startSimulation();
      }
    } else {
      startSimulation();
    }

    return () => {
      cancelled = true;
      if (esRef.current) esRef.current.close();
      if (simRef.current) clearTimeout(simRef.current);
    };
  }, []);

  return (
    <LiveContext.Provider value={{ mode, events, latest: events[0] ?? null }}>
      {children}
    </LiveContext.Provider>
  );
}
