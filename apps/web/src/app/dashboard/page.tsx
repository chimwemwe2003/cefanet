"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  CircleCheckBig,
  AlertOctagon,
  ChevronRight,
  Download,
  FileText,
} from "lucide-react";
import dynamic from "next/dynamic";
import { AlertBanner, KPIcard, MCard, ProgressBar, SectionTitle } from "@/components/cdfms/ui";
import { compositeScore, trafficLightForScore, EQUITY_INDEX } from "@/lib/cdfms/extra-data";
import { LiveFeed } from "@/components/cdfms/live-ui";
import { Gauge, Scale } from "lucide-react";

const ZambiaMap = dynamic(
  () => import("@/components/cdfms/zambia-map").then((m) => m.ZambiaMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] w-full rounded-xl bg-ink-100 animate-pulse" />
    ),
  }
);
import {
  ALL_FUND_SUMMARIES,
  PROVINCE_ROLLUPS,
  YOY_TREND,
  ALERTS,
  constituencyById,
  fundSummary,
  ZMW,
} from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can, scopeLabel } from "@/lib/cdfms/rbac";
import { downloadCsv, openPrintReport } from "@/lib/cdfms/export";
import { useMemo } from "react";

export default function ExecutiveDashboard() {
  const scope = useScope();
  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  // Compute headline numbers in scope
  const visibleSummaries = ALL_FUND_SUMMARIES.filter((s) => visibleIds.has(s.constituencyId));
  const totalAllocated = visibleSummaries.reduce((a, s) => a + s.allocated, 0);
  const totalDisbursed = visibleSummaries.reduce((a, s) => a + s.disbursed, 0);
  const onTrack = visibleSummaries.filter((s) => s.status === "on-track").length;
  const atRisk = visibleSummaries.filter((s) => s.status === "at-risk").length;
  const watch = visibleSummaries.filter((s) => s.status === "watch").length;

  const topPerformers = [...visibleSummaries]
    .sort((a, b) => b.utilisationPct - a.utilisationPct)
    .slice(0, 5);
  const bottomPerformers = [...visibleSummaries]
    .sort((a, b) => a.utilisationPct - b.utilisationPct)
    .slice(0, 5);

  const visibleAlerts = ALERTS.filter((a) => visibleIds.has(a.constituencyId));
  const criticalAlerts = visibleAlerts.filter((a) => a.level === "critical");

  // Composite score = weighted average across all in-scope constituencies
  const avgComposite =
    visibleConsts.length > 0
      ? visibleConsts.reduce((a, c) => a + compositeScore(c), 0) / visibleConsts.length
      : 0;
  const compositeLight = trafficLightForScore(avgComposite);

  const statusPie = [
    { name: "On track", value: onTrack, color: "#15803d" }, // ministry-700
    { name: "Watch", value: watch, color: "#f59e0b" }, // gold-500
    { name: "At risk", value: atRisk, color: "#dc2626" },
  ];

  function handleExportCsv() {
    downloadCsv(
      `CDF-MS_utilisation_${new Date().toISOString().slice(0, 10)}`,
      visibleConsts,
      [
        { header: "Constituency", cell: (c) => c.name },
        { header: "District", cell: (c) => c.district },
        { header: "Province", cell: (c) => c.province },
        { header: "Population", cell: (c) => c.population },
        { header: "Allocated (ZMW)", cell: (c) => fundSummary(c).allocated },
        { header: "Disbursed (ZMW)", cell: (c) => fundSummary(c).disbursed },
        { header: "Utilisation %", cell: (c) => fundSummary(c).utilisationPct.toFixed(2) },
        { header: "Status", cell: (c) => fundSummary(c).status },
      ]
    );
  }

  function handleOpenPacReport() {
    openPrintReport("/reports/pac");
  }

  const canExport = can(scope?.role, "export:reports");

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold tracking-[.2em] uppercase text-ministry-700">
            Executive Dashboard · FY 2026
          </div>
          <h1 className="font-serif text-3xl md:text-[36px] leading-tight text-ink-900 mt-1">
            CDF National Performance Overview
          </h1>
          <p className="text-sm text-ink-500 mt-2 max-w-2xl">
            {scopeLabel(scope)} · Real-time monitoring of K{(totalAllocated / 1_000_000_000).toFixed(2)} billion
            across {visibleConsts.length} constituencies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canExport ? (
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50 shadow-sm"
            >
              <Download className="h-4 w-4 text-ministry-700" />
              Export Excel
            </button>
          ) : null}
          <button
            onClick={handleOpenPacReport}
            className="inline-flex items-center gap-2 rounded-lg bg-ministry-700 text-white px-3 py-2 text-sm hover:bg-ministry-800 shadow-ministry"
          >
            <FileText className="h-4 w-4" />
            View PAC Report
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Critical-alerts banner */}
      {criticalAlerts.length > 0 ? (
        <AlertBanner
          level="critical"
          title={`${criticalAlerts.length} critical compliance alert${criticalAlerts.length === 1 ? "" : "s"} require immediate attention`}
          message={`Across ${new Set(criticalAlerts.map((a) => a.constituencyId)).size} constituencies. Open the Compliance module to review.`}
          href="/compliance"
        />
      ) : null}

      {/* KPIs — top row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard
          label="Allocated FY26"
          value={ZMW(totalAllocated)}
          hint={`${visibleConsts.length} constituencies`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <KPIcard
          label="Disbursed"
          value={ZMW(totalDisbursed)}
          delta={`${((totalDisbursed / Math.max(1, totalAllocated)) * 100).toFixed(1)}%`}
          tone="positive"
          hint="Year-to-date"
          icon={<TrendingUp className="h-4 w-4" />}
          trafficLight={
            (totalDisbursed / Math.max(1, totalAllocated)) * 100 >= 75
              ? "green"
              : (totalDisbursed / Math.max(1, totalAllocated)) * 100 >= 55
              ? "yellow"
              : "red"
          }
        />
        <KPIcard
          label="On Track"
          value={`${onTrack}`}
          hint="≥ 75% utilisation"
          tone="positive"
          icon={<CircleCheckBig className="h-4 w-4" />}
        />
        <KPIcard
          label="At Risk"
          value={`${atRisk}`}
          hint="< 55% utilisation"
          tone="danger"
          icon={<AlertOctagon className="h-4 w-4" />}
        />
      </section>

      {/* Composite + equity row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KPIcard
          label="Composite CDF Score"
          value={`${avgComposite.toFixed(0)} / 100`}
          trafficLight={compositeLight}
          hint="Utilisation 40% · Completion 30% · Grievance 15% · Health 15%"
          icon={<Gauge className="h-4 w-4" />}
        />
        <KPIcard
          label="Geographic Equity Index"
          value={`${EQUITY_INDEX}`}
          hint="Higher = more even distribution"
          trafficLight={EQUITY_INDEX >= 70 ? "green" : EQUITY_INDEX >= 50 ? "yellow" : "red"}
          icon={<Scale className="h-4 w-4" />}
        />
        <KPIcard
          label="Open Alerts"
          value={`${visibleAlerts.length}`}
          hint={`${criticalAlerts.length} critical · ${visibleAlerts.filter((a) => a.level === "warning").length} warning`}
          tone={criticalAlerts.length > 0 ? "danger" : "warning"}
          icon={<AlertOctagon className="h-4 w-4" />}
        />
      </section>

      {/* Map + status pie (only for national/province roles) */}
      {scope?.role !== "constituency_officer" ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MCard className="lg:col-span-2">
            <SectionTitle
              eyebrow="Geographic distribution"
              title="National Utilisation Heatmap"
              description="Colour intensity reflects disbursement performance per province. Hover for breakdown."
            />
            <ZambiaMap />
          </MCard>

          <div className="flex flex-col gap-4">
            <MCard>
              <SectionTitle eyebrow="Portfolio Health" title="Status mix" />
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {statusPie.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                {statusPie.map((s) => (
                  <div key={s.name}>
                    <div className="font-serif text-lg text-ink-900">{s.value}</div>
                    <div className="text-ink-500">{s.name}</div>
                  </div>
                ))}
              </div>
            </MCard>

            <MCard className="bg-ministry-700 text-white">
              <div className="text-[11px] tracking-[.2em] uppercase text-gold-200">
                Key insight
              </div>
              <div className="font-serif text-lg mt-1 leading-snug">
                {((onTrack / Math.max(1, visibleConsts.length)) * 100).toFixed(0)}% on track.{" "}
                {ZMW(totalAllocated - totalDisbursed)} undisbursed in scope.
              </div>
              <div className="text-xs text-ministry-100/80 mt-2">
                Source · CEFANET CDF-MS reconciliation · {new Date().toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </MCard>
          </div>
        </section>
      ) : null}

      {/* YoY trend */}
      <MCard>
        <SectionTitle
          eyebrow="Five-year trajectory"
          title="Year-over-Year fund growth"
          description="Allocation per constituency grew from K1.6M (2021) to K40M (2026). 2026 figures are year-to-date."
        />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={YOY_TREND} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `K${(v / 1_000_000).toFixed(0)}M` : `K${(v / 1000).toFixed(0)}K`
                }
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v: number) => ZMW(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="allocation" name="Allocation per const." fill="#15803d" radius={[6, 6, 0, 0]} />
              <Bar dataKey="disbursement" name="Disbursed per const." fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MCard>

      {/* Province leaderboard + project pipeline */}
      {can(scope?.role, "view:national") ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MCard className="lg:col-span-2">
            <SectionTitle eyebrow="Provincial ranking" title="Province utilisation" />
            <div className="space-y-2.5">
              {[...PROVINCE_ROLLUPS]
                .sort((a, b) => b.utilisationPct - a.utilisationPct)
                .map((p) => (
                  <div key={p.province} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-ink-700">{p.province}</div>
                    <div className="flex-1">
                      <ProgressBar value={p.utilisationPct} tone={p.utilisationPct >= 70 ? "ministry" : "gold"} />
                    </div>
                    <div className="w-12 text-right text-sm font-semibold text-ink-900">
                      {p.utilisationPct.toFixed(0)}%
                    </div>
                    <div className="w-20 text-right text-xs text-ink-500 hidden md:block">
                      {p.constituencyCount} const.
                    </div>
                  </div>
                ))}
            </div>
          </MCard>

          <MCard>
            <SectionTitle eyebrow="Projects funded" title="Pipeline volume" />
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={YOY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="projects" stroke="#15803d" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="text-ink-500">Total projects (cumulative)</div>
              <div className="font-serif text-base text-ink-900">
                {YOY_TREND.reduce((a, y) => a + y.projects, 0).toLocaleString("en-ZM")}
              </div>
            </div>
          </MCard>
        </section>
      ) : null}

      {/* Top / bottom / alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MCard>
          <SectionTitle eyebrow="Top performers" title="Highest utilisation" />
          <ol className="space-y-2.5">
            {topPerformers.map((f, i) => {
              const c = constituencyById(f.constituencyId);
              return (
                <li key={f.constituencyId} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-ministry-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{c?.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-500">{c?.province}</div>
                  </div>
                  <div className="text-sm font-semibold text-ministry-700">
                    {f.utilisationPct.toFixed(1)}%
                  </div>
                </li>
              );
            })}
          </ol>
        </MCard>

        <MCard>
          <SectionTitle eyebrow="Needs attention" title="Lowest utilisation" />
          <ol className="space-y-2.5">
            {bottomPerformers.map((f, i) => {
              const c = constituencyById(f.constituencyId);
              return (
                <li key={f.constituencyId} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{c?.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-500">{c?.province}</div>
                  </div>
                  <div className="text-sm font-semibold text-red-600">
                    {f.utilisationPct.toFixed(1)}%
                  </div>
                </li>
              );
            })}
          </ol>
        </MCard>

        <MCard>
          <SectionTitle eyebrow="Compliance" title="Top open alerts" />
          <ul className="space-y-2.5">
            {visibleAlerts.slice(0, 5).map((a) => {
              const c = constituencyById(a.constituencyId);
              const tone =
                a.level === "critical"
                  ? "bg-red-50 text-red-700 ring-red-200"
                  : a.level === "warning"
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : "bg-blue-50 text-blue-700 ring-blue-200";
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <span className={`inline-flex items-center rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${tone}`}>
                    {a.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-900 leading-tight">{a.title}</div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {c?.name} · {a.daysOpen}d open
                    </div>
                  </div>
                </li>
              );
            })}
            {visibleAlerts.length === 0 ? (
              <li className="text-sm text-ink-500">No open alerts in your scope.</li>
            ) : null}
          </ul>
        </MCard>
      </section>

      {/* Real-time activity feed */}
      <LiveFeed />
    </div>
  );
}
