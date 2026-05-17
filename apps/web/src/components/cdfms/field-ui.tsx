"use client";

import type { ReactNode } from "react";
import { BookOpen, HeartPulse, Droplet, Route, Sprout, Boxes } from "lucide-react";
import type { Sector, FieldStatus } from "@/lib/cdfms/field-store";
import { cn } from "@/lib/utils";

// ---- Sector visuals ----

export const SECTOR_META: Record<Sector, { icon: typeof BookOpen; color: string; bg: string }> = {
  Education: { icon: BookOpen, color: "#2563eb", bg: "bg-blue-50 text-blue-700" },
  Health: { icon: HeartPulse, color: "#db2777", bg: "bg-pink-50 text-pink-700" },
  Water: { icon: Droplet, color: "#0891b2", bg: "bg-cyan-50 text-cyan-700" },
  Roads: { icon: Route, color: "#475569", bg: "bg-slate-100 text-slate-700" },
  Agriculture: { icon: Sprout, color: "#15803d", bg: "bg-ministry-50 text-ministry-700" },
  Other: { icon: Boxes, color: "#64748b", bg: "bg-ink-100 text-ink-700" },
};

export function SectorChip({ sector }: { sector: Sector | "" }) {
  if (!sector) return null;
  const meta = SECTOR_META[sector];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", meta.bg)}>
      <Icon className="h-3 w-3" />
      {sector}
    </span>
  );
}

// ---- Status visuals ----

export const STATUS_META: Record<FieldStatus, { label: string; bg: string; dot: string }> = {
  Planned: { label: "Planned", bg: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  Ongoing: { label: "Ongoing", bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  Stalled: { label: "Stalled", bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
  Completed: { label: "Completed", bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

export function StatusChip({ status }: { status: FieldStatus | "" }) {
  if (!status) return null;
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", meta.bg)}>
      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

// ---- Big, friendly form controls (min 48px tap targets) ----

export function FieldLabel({
  children,
  hint,
  required,
}: {
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-1.5">
      <span className="text-sm font-semibold text-ink-900">
        {children}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {hint ? <div className="text-xs text-ink-500 mt-0.5">{hint}</div> : null}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mt-1.5 flex items-start gap-1.5 text-sm text-red-600">
      <span className="font-bold leading-none">!</span>
      <span>{message}</span>
    </div>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full min-h-[52px] rounded-xl border bg-white px-4 text-base text-ink-900 placeholder:text-ink-400",
          "focus:outline-none focus:ring-2 focus:ring-ministry-300",
          error ? "border-red-300 focus:ring-red-200" : "border-ink-300 focus:border-ministry-500"
        )}
      />
      <FieldError message={error} />
    </>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <>
      <textarea
        value={value}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-ministry-300",
          error ? "border-red-300" : "border-ink-300 focus:border-ministry-500"
        )}
      />
      <FieldError message={error} />
    </>
  );
}

/** Big picker — renders options as tappable cards, not a tiny native dropdown. */
export function ChoicePicker<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  renderOption,
  error,
}: {
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
  renderOption?: (opt: T) => ReactNode;
  error?: string;
}) {
  const colClass = columns === 1 ? "grid-cols-1" : columns === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <>
      <div className={cn("grid gap-2", colClass)}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "min-h-[52px] rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2",
                active
                  ? "border-ministry-600 bg-ministry-50 text-ministry-800 ring-2 ring-ministry-200"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ministry-300"
              )}
            >
              {renderOption ? renderOption(opt) : opt}
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </>
  );
}

/** Native dropdown styled large — for longer option lists. */
export function SelectField<T extends string>({
  options,
  value,
  onChange,
  placeholder = "Choose one…",
  error,
}: {
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "w-full min-h-[52px] rounded-xl border bg-white px-4 text-base appearance-none",
          value ? "text-ink-900" : "text-ink-400",
          error ? "border-red-300" : "border-ink-300 focus:border-ministry-500",
          "focus:outline-none focus:ring-2 focus:ring-ministry-300"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="text-ink-900">
            {o}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </>
  );
}

/** Big primary / secondary buttons. */
export function BigButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-ministry-700 text-white hover:bg-ministry-800 shadow-ministry",
    secondary: "bg-white text-ink-800 border-2 border-ink-200 hover:border-ministry-300",
    ghost: "text-ministry-700 hover:bg-ministry-50",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-h-[52px] w-full rounded-xl px-4 text-base font-semibold transition-colors",
        "disabled:opacity-50 disabled:pointer-events-none",
        styles
      )}
    >
      {children}
    </button>
  );
}

/** Progress bar with big visible % */
export function BigProgress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const tone = v >= 75 ? "bg-emerald-500" : v >= 35 ? "bg-ministry-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 rounded-full bg-ink-100 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${v}%` }} />
      </div>
      <span className="text-sm font-semibold text-ink-700 w-10 text-right">{v}%</span>
    </div>
  );
}
