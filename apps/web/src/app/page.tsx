"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";
import { ConstituencySelect } from "@/components/constituency-select";
import { AlertBanner } from "@/components/alert-banner";
import { Card, PageHeader, Skeleton, StatCard } from "@/components/ui";
import { CATEGORY_LABELS, ZMW, type ProjectCategory } from "@cefanet/shared";

export default function DashboardPage() {
  const { constituencyId } = useConstituency();
  const { data, isLoading } = useQuery({
    queryKey: ["summary", constituencyId],
    queryFn: () => api.dashboardSummary(constituencyId),
    enabled: !!constituencyId,
  });

  const chartData = (data?.byCategory ?? []).map((row) => ({
    category: CATEGORY_LABELS[row.category as ProjectCategory],
    Budget: row.budget,
    Expenditure: row.expenditure,
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Public Dashboard"
        subtitle="Live view of Constituency Development Fund (CDF) activity"
      >
        <ConstituencySelect />
      </PageHeader>

      <AlertBanner />

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {isLoading || !data ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              label="Projects"
              value={String(data.totalProjects)}
              hint="Tracked in registry"
            />
            <StatCard
              label="Budget"
              value={ZMW(data.totalBudget)}
              accent="brand"
              hint="Allocated by parliament"
            />
            <StatCard
              label="Spent"
              value={ZMW(data.totalExpenditure)}
              accent="green"
              hint="Across all projects"
            />
            <StatCard
              label="Avg Completion"
              value={`${data.completionPct.toFixed(0)}%`}
              accent="amber"
              hint="Weighted average"
            />
            <StatCard
              label="Active Alerts"
              value={String(data.activeAlerts)}
              accent="red"
              hint="Open at this moment"
            />
          </>
        )}
      </section>

      <Card>
        <h2 className="text-base font-semibold mb-1">
          Budget vs Expenditure by Category
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Compares allocated budget against spend in {data?.constituencyName ?? "…"}
        </p>
        <div className="h-72 md:h-80">
          {isLoading || !data ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v: number) => `K${(v / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v: number) => ZMW(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Budget" fill="#0369a1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenditure" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
