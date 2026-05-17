import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-ink-200 bg-white shadow-ministry",
        "px-4 py-4 md:px-5 md:py-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between mb-4 md:mb-5">
      <div>
        {eyebrow ? (
          <span className="text-[11px] font-semibold tracking-[.18em] uppercase text-ministry-600">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="font-serif text-2xl md:text-[28px] leading-tight text-ink-900 mt-0.5">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-ink-500 mt-1 max-w-prose">{description}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function KPIcard({
  label,
  value,
  delta,
  hint,
  tone = "neutral",
  icon,
  trafficLight,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "danger" | "gold";
  icon?: ReactNode;
  trafficLight?: "green" | "yellow" | "red";
}) {
  const toneRing: Record<string, string> = {
    neutral: "bg-ministry-50 text-ministry-700 ring-ministry-100",
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    danger: "bg-red-50 text-red-700 ring-red-100",
    gold: "bg-gold-50 text-gold-700 ring-gold-100",
  };
  const lightColor: Record<string, string> = {
    green: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]",
    yellow: "bg-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]",
    red: "bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.18)]",
  };
  return (
    <MCard className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className={cn("text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1", toneRing[tone])}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {trafficLight ? (
            <span className={cn("h-2.5 w-2.5 rounded-full", lightColor[trafficLight])} aria-label={`Traffic light: ${trafficLight}`} />
          ) : null}
          {icon ? <span className="text-ministry-600">{icon}</span> : null}
        </div>
      </div>
      <div className="mt-3 font-serif text-2xl md:text-[28px] font-semibold text-ink-900 leading-tight break-all">
        {value}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-ink-500">
        {hint ? <span>{hint}</span> : <span />}
        {delta ? (
          <span className="font-medium text-ministry-700">{delta}</span>
        ) : null}
      </div>
    </MCard>
  );
}

export function AlertBanner({
  level = "warning",
  title,
  message,
  href,
}: {
  level?: "info" | "warning" | "critical";
  title: string;
  message?: string;
  href?: string;
}) {
  const tone: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    critical: "bg-red-50 border-red-300 text-red-900",
  };
  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-ministry",
        tone[level]
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex items-center justify-center rounded-full h-6 w-6 flex-shrink-0 text-xs font-bold",
          level === "critical"
            ? "bg-red-600 text-white"
            : level === "warning"
            ? "bg-amber-500 text-white"
            : "bg-blue-600 text-white"
        )}
      >
        !
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold leading-tight">{title}</div>
        {message ? <div className="text-sm mt-0.5 opacity-90">{message}</div> : null}
      </div>
      {href ? <span className="text-xs underline self-center flex-shrink-0">View →</span> : null}
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-95 transition-opacity">
      {content}
    </a>
  ) : (
    content
  );
}

export function StatusPill({
  status,
}: {
  status: "on-track" | "watch" | "at-risk" | "active" | "paused" | "onboarding" | "performing" | "delinquent" | "defaulted" | "repaid" | "planned" | "ongoing" | "complete" | "stalled" | "submitted" | "under_review" | "approved" | "disbursed" | "rejected" | "committee_review" | "constituency_office" | "treasury";
}) {
  const map: Record<string, string> = {
    "on-track": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    watch: "bg-amber-50 text-amber-700 ring-amber-200",
    "at-risk": "bg-red-50 text-red-700 ring-red-200",
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    onboarding: "bg-blue-50 text-blue-700 ring-blue-200",
    paused: "bg-slate-100 text-slate-600 ring-slate-200",
    performing: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    delinquent: "bg-amber-50 text-amber-700 ring-amber-200",
    defaulted: "bg-red-50 text-red-700 ring-red-200",
    repaid: "bg-ministry-50 text-ministry-700 ring-ministry-200",
    planned: "bg-slate-100 text-slate-600 ring-slate-200",
    ongoing: "bg-blue-50 text-blue-700 ring-blue-200",
    complete: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    stalled: "bg-red-50 text-red-700 ring-red-200",
    submitted: "bg-slate-100 text-slate-700 ring-slate-200",
    under_review: "bg-amber-50 text-amber-700 ring-amber-200",
    approved: "bg-blue-50 text-blue-700 ring-blue-200",
    disbursed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    committee_review: "bg-violet-50 text-violet-700 ring-violet-200",
    constituency_office: "bg-blue-50 text-blue-700 ring-blue-200",
    treasury: "bg-gold-50 text-gold-700 ring-gold-200",
  };
  const label: Record<string, string> = {
    "on-track": "On track",
    watch: "Watch",
    "at-risk": "At risk",
    onboarding: "Onboarding",
    under_review: "Under review",
    committee_review: "Committee review",
    constituency_office: "Constituency office",
  };
  const pretty = label[status] ?? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
        map[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      )}
    >
      {pretty}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "ministry",
}: {
  value: number; // 0-100
  tone?: "ministry" | "gold" | "danger";
}) {
  const toneClass = {
    ministry: "bg-ministry-600",
    gold: "bg-gold-500",
    danger: "bg-red-500",
  }[tone];
  return (
    <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", toneClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function DataTable<T>({
  rows,
  columns,
  empty = "No records to display.",
  onRowClick,
}: {
  rows: T[];
  columns: Array<{ header: string; cell: (row: T) => ReactNode; className?: string; width?: string }>;
  empty?: string;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-ministry">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50/60">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  "text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500",
                  c.className
                )}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-ink-500">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  "border-b border-ink-100/70 last:border-0 transition-colors",
                  onRowClick ? "hover:bg-ministry-50/40 cursor-pointer" : "hover:bg-ink-50/60"
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c, i) => (
                  <td key={i} className={cn("px-3 py-2.5 text-ink-700", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
