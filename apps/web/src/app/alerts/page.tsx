"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";
import { ConstituencySelect } from "@/components/constituency-select";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { ZMW } from "@cefanet/shared";

const ICON: Record<string, typeof AlertTriangle> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

const TONE: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  critical: "bg-red-50 border-red-200 text-red-700",
};

export default function AlertsPage() {
  const { constituencyId } = useConstituency();
  const { data, isLoading } = useQuery({
    queryKey: ["alerts-page", constituencyId],
    queryFn: () => api.listAlerts(constituencyId),
    enabled: !!constituencyId,
  });

  const totalAtRisk =
    data?.reduce((acc, a) => acc + parseFloat(a.budgetAtRiskZmw), 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Alert Engine"
        subtitle="Stalled and overdue CDF projects flagged automatically"
      >
        <ConstituencySelect />
      </PageHeader>

      <Card className="bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-amber-900">
              {(data?.length ?? 0) > 0
                ? `${data?.length} project${data?.length === 1 ? "" : "s"} require attention`
                : "All projects on track"}
            </div>
            <div className="text-sm text-amber-800 mt-0.5">
              Total budget at risk: <strong>{ZMW(totalAtRisk)}</strong>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No open alerts"
          message="All projects in this constituency are progressing normally."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data!.map((a) => {
            const Icon = ICON[a.severity] ?? AlertTriangle;
            return (
              <Card key={a.id} className={TONE[a.severity]}>
                <div className="flex items-start gap-2">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-tight">{a.title}</div>
                    <div className="text-xs mt-0.5 opacity-80">
                      {a.constituencyName ?? "—"}
                    </div>
                    <p className="text-sm mt-2">{a.message}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="rounded bg-white/60 px-2 py-1">
                        <div className="uppercase tracking-wide opacity-60">
                          Days overdue
                        </div>
                        <div className="font-semibold">{a.daysOverdue}</div>
                      </div>
                      <div className="rounded bg-white/60 px-2 py-1">
                        <div className="uppercase tracking-wide opacity-60">
                          Budget at risk
                        </div>
                        <div className="font-semibold">{ZMW(a.budgetAtRiskZmw)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
