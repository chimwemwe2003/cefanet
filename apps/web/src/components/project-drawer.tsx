"use client";

import { useQuery } from "@tanstack/react-query";
import { X, MapPin, Calendar, Building2, FileText } from "lucide-react";
import { api } from "@/lib/api";
import {
  CATEGORY_LABELS,
  ZMW,
} from "@cefanet/shared";
import { StatusBadge, Skeleton } from "./ui";

export function ProjectDrawer({
  projectId,
  onClose,
}: {
  projectId: number | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.getProject(projectId!),
    enabled: projectId !== null,
  });

  if (projectId === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex justify-end"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="bg-white w-full md:w-[480px] h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Project details</span>
          <button onClick={onClose} aria-label="Close" className="btn btn-ghost p-1">
            <X className="h-5 w-5" />
          </button>
        </header>

        {isLoading || !data ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="p-4 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={data.status} />
                <span className="badge bg-slate-100 text-slate-700">
                  {CATEGORY_LABELS[data.category]}
                </span>
              </div>
              <h2 className="text-lg font-semibold leading-tight">{data.name}</h2>
              <p className="text-sm text-slate-600 mt-1">{data.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Budget" value={ZMW(data.budgetZmw)} />
              <Metric label="Spent" value={ZMW(data.expenditureZmw)} />
              <Metric label="Completion" value={`${data.completionPct}%`} />
              <Metric
                label="Contractor"
                value={data.contractor ?? "TBD"}
                icon={<Building2 className="h-3 w-3" />}
              />
              <Metric
                label="Start date"
                value={data.startDate ?? "—"}
                icon={<Calendar className="h-3 w-3" />}
              />
              <Metric
                label="End date"
                value={data.endDate ?? "—"}
                icon={<Calendar className="h-3 w-3" />}
              />
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1">
                <MapPin className="h-3 w-3" /> GPS coordinates
              </div>
              <span className="text-sm font-mono">
                {data.lat.toFixed(5)}, {data.lng.toFixed(5)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1 text-sm font-semibold mb-2">
                <FileText className="h-4 w-4" /> Update history
              </div>
              <ol className="border-l-2 border-brand-200 pl-4 space-y-3">
                {data.updates.map((u) => (
                  <li key={u.id}>
                    <div className="text-sm font-semibold">{u.title}</div>
                    <div className="text-xs text-slate-500 mb-0.5">
                      {new Date(u.postedAt as string).toLocaleDateString()} ·{" "}
                      {u.postedBy}
                    </div>
                    <div className="text-sm text-slate-700">{u.note}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="font-semibold text-slate-900 mt-1 text-sm break-words">{value}</div>
    </div>
  );
}
