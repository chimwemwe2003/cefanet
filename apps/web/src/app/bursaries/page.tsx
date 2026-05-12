"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { GraduationCap, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";
import { ConstituencySelect } from "@/components/constituency-select";
import { Card, PageHeader, Skeleton, StatCard } from "@/components/ui";
import {
  BeneficiaryLevel,
  Gender,
  ZMW,
  type Beneficiary,
} from "@cefanet/shared";

const LEVEL_LABEL: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Tertiary",
};
const GENDER_LABEL: Record<string, string> = {
  female: "Female",
  male: "Male",
};
const GENDER_COLORS: Record<string, string> = {
  female: "#ec4899",
  male: "#0369a1",
};

export default function BursariesPage() {
  const { constituencyId } = useConstituency();
  const [level, setLevel] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["bursary-stats", constituencyId],
    queryFn: () => api.bursaryStats(constituencyId),
    enabled: !!constituencyId,
  });

  const { data: rows, isLoading: rowsLoading } = useQuery({
    queryKey: ["beneficiaries", constituencyId],
    queryFn: () => api.listBeneficiaries(constituencyId),
    enabled: !!constituencyId,
  });

  const filtered = useMemo(() => {
    return (rows ?? [])
      .filter((b: Beneficiary) => (level ? b.level === level : true))
      .filter((b: Beneficiary) => (gender ? b.gender === gender : true));
  }, [rows, level, gender]);

  const genderData = (stats?.byGender ?? []).map((g) => ({
    name: GENDER_LABEL[g.gender],
    gender: g.gender,
    value: g.count,
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" /> Bursary Tracker
          </span>
        }
        subtitle="Anonymised CDF bursary beneficiaries"
      >
        <ConstituencySelect />
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> SDG 4 — Quality Education
        </span>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statsLoading || !stats ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              label="Beneficiaries"
              value={String(stats.totalBeneficiaries)}
              hint="Currently on programme"
            />
            <StatCard
              label="Disbursed"
              value={ZMW(stats.totalDisbursed)}
              accent="green"
              hint="To beneficiaries"
            />
            <StatCard
              label="Levels"
              value={String(stats.byLevel.length)}
              accent="brand"
              hint="Primary, Secondary, Tertiary"
            />
          </>
        )}
      </section>

      <Card>
        <h2 className="text-base font-semibold mb-1">
          Gender disaggregation
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          CEFANET tracks gender equity in CDF bursary distribution
        </p>
        <div className="h-64">
          {statsLoading || !stats ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  label={(d: { name: string; value: number }) => `${d.name}: ${d.value}`}
                >
                  {genderData.map((entry) => (
                    <Cell
                      key={entry.gender}
                      fill={GENDER_COLORS[entry.gender] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <select className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            {BeneficiaryLevel.options.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </select>
          <select className="select" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">All genders</option>
            {Gender.options.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABEL[g]}
              </option>
            ))}
          </select>
          <div className="text-sm text-slate-500 flex items-center">
            Showing <strong className="mx-1">{filtered.length}</strong> beneficiaries
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Level</th>
                <th>Gender</th>
                <th>Institution</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rowsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-2">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No beneficiaries match those filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono">{b.code}</td>
                    <td>{LEVEL_LABEL[b.level]}</td>
                    <td>{GENDER_LABEL[b.gender]}</td>
                    <td>{b.institution}</td>
                    <td>{ZMW(b.amountZmw)}</td>
                    <td>
                      <span
                        className={
                          b.status === "active"
                            ? "badge bg-blue-100 text-blue-700"
                            : "badge bg-emerald-100 text-emerald-700"
                        }
                      >
                        {b.status === "active" ? "Active" : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
