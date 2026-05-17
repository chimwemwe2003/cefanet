"use client";

import { useMemo } from "react";
import { GraduationCap, Trophy, UserX, Sparkles, Download } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill } from "@/components/cdfms/ui";
import { BURSARIES } from "@/lib/cdfms/extra-data";
import { constituencyById, ZMW } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can, maskPii } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const STATUS_PILL_MAP: Record<string, "ongoing" | "complete" | "stalled" | "active"> = {
  enrolled: "ongoing",
  retained: "active",
  graduated: "complete",
  dropped_out: "stalled",
};

const STATUS_LABEL: Record<string, string> = {
  enrolled: "Enrolled",
  retained: "Retained",
  graduated: "Graduated",
  dropped_out: "Dropped out",
};

const LEVEL_COLORS: Record<string, string> = {
  primary: "#86efac",
  secondary: "#22c55e",
  tertiary: "#15803d",
};

export default function BursariesPage() {
  const scope = useScope();
  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visible = useMemo(
    () => BURSARIES.filter((b) => visibleIds.has(b.constituencyId)),
    [visibleIds]
  );

  const total = visible.length;
  const enrolled = visible.filter((b) => ["enrolled", "retained"].includes(b.status)).length;
  const graduated = visible.filter((b) => b.status === "graduated").length;
  const dropped = visible.filter((b) => b.status === "dropped_out").length;
  const retention = total ? ((total - dropped) / total) * 100 : 0;
  const graduationPct = total ? (graduated / total) * 100 : 0;
  const totalDisbursed = visible.reduce((a, b) => a + b.amount, 0);
  const femalePct = total ? (visible.filter((b) => b.gender === "F").length / total) * 100 : 0;
  const vulnPct = total ? (visible.filter((b) => b.vulnerable).length / total) * 100 : 0;

  const tlFor = (pct: number): "green" | "yellow" | "red" => (pct >= 80 ? "green" : pct >= 60 ? "yellow" : "red");

  const byLevel = ["primary", "secondary", "tertiary"].map((lvl) => ({
    name: lvl.charAt(0).toUpperCase() + lvl.slice(1),
    value: visible.filter((b) => b.level === lvl).length,
    color: LEVEL_COLORS[lvl],
  }));

  const outcomeData = ["enrolled", "retained", "graduated", "dropped_out"].map((s) => ({
    name: STATUS_LABEL[s],
    value: visible.filter((b) => b.status === s).length,
    color:
      s === "graduated"
        ? "#15803d"
        : s === "retained"
        ? "#22c55e"
        : s === "enrolled"
        ? "#86efac"
        : "#dc2626",
  }));

  const canExport = can(scope?.role, "export:reports");
  const canSeePii = can(scope?.role, "view:pii");

  function handleExport() {
    downloadCsv("CEFANET_bursaries", visible, [
      { header: "ID", cell: (b) => b.id },
      { header: "Beneficiary code", cell: (b) => b.beneficiary },
      { header: "Level", cell: (b) => b.level },
      { header: "Gender", cell: (b) => b.gender },
      { header: "Vulnerable", cell: (b) => (b.vulnerable ? "Yes" : "No") },
      { header: "Constituency", cell: (b) => constituencyById(b.constituencyId)?.name ?? "" },
      { header: "School", cell: (b) => maskPii(b.school, scope?.role ?? null) },
      { header: "Amount (ZMW)", cell: (b) => b.amount },
      { header: "Status", cell: (b) => b.status },
      { header: "Attendance %", cell: (b) => b.attendancePct },
      { header: "Grade avg", cell: (b) => b.gradeAverage },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Education <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 normal-case tracking-normal"><Sparkles className="h-3 w-3" /> SDG 4</span>
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">School Bursaries Programme</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Bursary awards across primary, secondary and tertiary education. Tracking enrollment,
            retention, graduation and equity for vulnerable learners.
          </p>
        </div>
        {canExport ? (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50 shadow-sm"
          >
            <Download className="h-4 w-4 text-ministry-700" /> Export Excel
          </button>
        ) : null}
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Total awards" value={`${total}`} hint={`${enrolled} currently enrolled`} icon={<GraduationCap className="h-4 w-4" />} />
        <KPIcard label="Retention rate" value={`${retention.toFixed(0)}%`} trafficLight={tlFor(retention)} hint="Of all bursaries awarded" />
        <KPIcard label="Graduation rate" value={`${graduationPct.toFixed(0)}%`} trafficLight={tlFor(graduationPct + 20)} hint={`${graduated} graduated`} icon={<Trophy className="h-4 w-4" />} />
        <KPIcard label="Drop-out rate" value={`${total ? ((dropped / total) * 100).toFixed(0) : 0}%`} trafficLight={dropped / Math.max(1, total) > 0.15 ? "red" : dropped / Math.max(1, total) > 0.08 ? "yellow" : "green"} hint={`${dropped} dropped out`} icon={<UserX className="h-4 w-4" />} />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KPIcard label="Disbursed" value={ZMW(totalDisbursed)} tone="gold" />
        <KPIcard label="Female" value={`${femalePct.toFixed(0)}%`} trafficLight={tlFor(femalePct + 10)} hint="Gender equity target ≥50%" tone="positive" />
        <KPIcard label="Vulnerable groups" value={`${vulnPct.toFixed(0)}%`} hint="Reached" tone="gold" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MCard>
          <SectionTitle eyebrow="Mix" title="Awards by level" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byLevel} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} label>
                  {byLevel.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MCard>
        <MCard>
          <SectionTitle eyebrow="Outcomes" title="Status progression" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {outcomeData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MCard>
      </section>

      <div>
        <SectionTitle eyebrow="Registry" title={`Bursary awards · ${visible.length}`} />
        <DataTable
          rows={visible.slice(0, 60)}
          columns={[
            { header: "ID", cell: (b) => <span className="font-mono text-xs text-ink-700">{b.id}</span> },
            { header: "Beneficiary", cell: (b) => <span className="font-mono text-xs">{b.beneficiary}</span> },
            { header: "Level", cell: (b) => <span className="capitalize text-ink-700">{b.level}</span> },
            { header: "Gender", cell: (b) => <span className="text-ink-700">{b.gender}</span> },
            { header: "School / Institution", cell: (b) => <span className="text-ink-700">{maskPii(b.school, scope?.role ?? null)}</span> },
            { header: "Amount", cell: (b) => <span className="text-ink-900 font-semibold">{ZMW(b.amount)}</span> },
            { header: "Attendance", cell: (b) => <span className={b.attendancePct >= 85 ? "text-emerald-700" : "text-amber-700"}>{b.attendancePct}%</span> },
            { header: "Avg grade", cell: (b) => <span className="text-ink-700">{b.gradeAverage}%</span> },
            { header: "Status", cell: (b) => <StatusPill status={STATUS_PILL_MAP[b.status]} /> },
            {
              header: "Vulnerable",
              cell: (b) =>
                b.vulnerable ? (
                  <span className="inline-flex items-center rounded-full bg-gold-50 text-gold-700 text-[10px] font-semibold px-2 py-0.5 ring-1 ring-gold-200">
                    Yes
                  </span>
                ) : (
                  <span className="text-xs text-ink-400">—</span>
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}
