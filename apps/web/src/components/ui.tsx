import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, type ProjectStatus } from "@cefanet/shared";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("card p-4 md:p-5", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  accent = "brand",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "brand" | "green" | "red" | "amber";
}) {
  const accentBg: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <Card className="flex flex-col gap-1">
      <span className={cn("badge w-fit", accentBg[accent])}>{label}</span>
      <span className="text-2xl md:text-3xl font-semibold text-slate-900 mt-2 break-all">
        {value}
      </span>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </Card>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const bg: Record<ProjectStatus, string> = {
    planned: "bg-slate-100 text-slate-700",
    ongoing: "bg-blue-100 text-blue-700",
    complete: "bg-emerald-100 text-emerald-700",
    stalled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn("badge", bg[status])}
      style={{ borderLeft: `3px solid ${STATUS_COLORS[status]}`, paddingLeft: 8 }}
    >
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="text-center py-10">
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{message}</p>
    </Card>
  );
}
