"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";
import { ConstituencySelect } from "@/components/constituency-select";
import { Card, PageHeader, Skeleton, StatCard } from "@/components/ui";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  ZMW,
  type ProjectCategory,
} from "@cefanet/shared";

export default function FinancialsPage() {
  const { constituencyId } = useConstituency();
  const { data, isLoading } = useQuery({
    queryKey: ["financials", constituencyId],
    queryFn: () => api.financialOverview(constituencyId),
    enabled: !!constituencyId,
  });

  const categoryData = (data?.byCategory ?? []).map((r) => ({
    name: CATEGORY_LABELS[r.category as ProjectCategory],
    category: r.category,
    amount: r.amount,
  }));

  const monthlyData = (data?.monthlyTrend ?? []).map((m) => ({
    name: m.month,
    amount: m.amount,
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Financial Overview"
        subtitle="CDF disbursement and expenditure analytics"
      >
        <ConstituencySelect />
      </PageHeader>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isLoading || !data ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Allocated"
              value={ZMW(data.totalAllocated)}
              hint="Cumulative disbursements"
            />
            <StatCard
              label="Total Spent"
              value={ZMW(data.totalSpent)}
              accent="green"
              hint="Against ongoing projects"
            />
            <StatCard
              label="Variance"
              value={ZMW(data.variance)}
              accent={data.variance < 0 ? "red" : "amber"}
              hint="Allocated minus spent"
            />
            <StatCard
              label="Utilisation"
              value={`${data.utilisationRate.toFixed(1)}%`}
              accent="brand"
              hint="Spent / allocated"
            />
          </>
        )}
      </section>

      <Card>
        <h2 className="text-base font-semibold mb-1">
          Expenditure by Category
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Aggregated spend per category over the last 6 months
        </p>
        <div className="h-72 md:h-80">
          {isLoading || !data ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v: number) => `K${(v / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v: number) => ZMW(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="amount" name="Expenditure" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category as ProjectCategory]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold mb-1">
          Monthly Expenditure Trend
        </h2>
        <p className="text-xs text-slate-500 mb-3">Last 6 months</p>
        <div className="h-64 md:h-72">
          {isLoading || !data ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v: number) => `K${(v / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v: number) => ZMW(v)} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0369a1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0369a1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
