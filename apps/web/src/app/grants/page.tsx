"use client";

import { useState, useMemo } from "react";
import { Sprout, Briefcase, Heart, GraduationCap, Download, CheckCircle2, XCircle, ClipboardEdit } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill, ProgressBar } from "@/components/cdfms/ui";
import { GRANT_APPLICATIONS, constituencyById, ZMW, ZMW_FULL, type GrantApplication } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const CATEGORY_META: Record<string, { label: string; color: string; icon: typeof Sprout }> = {
  agriculture: { label: "Agriculture", color: "#15803d", icon: Sprout },
  small_business: { label: "Small business", color: "#f59e0b", icon: Briefcase },
  women: { label: "Women empowerment", color: "#9c27b0", icon: Heart },
  youth: { label: "Youth", color: "#2196f3", icon: GraduationCap },
};

export default function GrantsPage() {
  const scope = useScope();
  const [filter, setFilter] = useState<string>("");
  const [apps, setApps] = useState<GrantApplication[]>(GRANT_APPLICATIONS);

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visible = useMemo(
    () =>
      apps
        .filter((g) => visibleIds.has(g.constituencyId))
        .filter((g) => (filter ? g.category === filter : true)),
    [apps, visibleIds, filter]
  );

  const allInScope = useMemo(
    () => apps.filter((g) => visibleIds.has(g.constituencyId)),
    [apps, visibleIds]
  );

  const byCategory = Object.keys(CATEGORY_META).map((cat) => ({
    name: CATEGORY_META[cat].label,
    value: allInScope.filter((g) => g.category === cat).length,
    color: CATEGORY_META[cat].color,
  }));

  const totalDisbursed = allInScope.filter((g) => g.status === "disbursed").reduce((a, g) => a + g.amount, 0);
  const canReview = can(scope?.role, "review:grants");
  const canApprove = can(scope?.role, "approve:constituency") || can(scope?.role, "approve:treasury");
  const canExport = can(scope?.role, "export:reports");

  function setStatus(g: GrantApplication, status: GrantApplication["status"]) {
    setApps((prev) => prev.map((x) => (x.id === g.id ? { ...x, status } : x)));
  }

  function handleExport() {
    downloadCsv("CDF-MS_grants", allInScope, [
      { header: "ID", cell: (g) => g.id },
      { header: "Applicant", cell: (g) => g.applicant },
      { header: "Category", cell: (g) => CATEGORY_META[g.category]?.label ?? g.category },
      { header: "Amount (ZMW)", cell: (g) => g.amount },
      { header: "Score", cell: (g) => g.score },
      { header: "Status", cell: (g) => g.status },
      { header: "Constituency", cell: (g) => constituencyById(g.constituencyId)?.name ?? "" },
      { header: "Submitted", cell: (g) => g.submittedAt },
      { header: "Progress %", cell: (g) => g.progressPct },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Empowerment
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Community Grants Portfolio</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Application portal, scoring, approval and progress tracking across agriculture, small
            business, women and youth empowerment.
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
        <KPIcard label="Applications" value={`${allInScope.length}`} hint="FY 2026" />
        <KPIcard label="Approved" value={`${allInScope.filter((g) => ["approved", "disbursed"].includes(g.status)).length}`} tone="positive" />
        <KPIcard label="Disbursed" value={ZMW(totalDisbursed)} tone="gold" hint="Released to grantees" />
        <KPIcard
          label="Avg. score"
          value={
            allInScope.length > 0
              ? (allInScope.reduce((a, g) => a + g.score, 0) / allInScope.length).toFixed(1)
              : "—"
          }
          hint="Out of 100"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MCard className="lg:col-span-1">
          <SectionTitle eyebrow="Mix" title="By category" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {byCategory.map((b, i) => (
                    <Cell key={i} fill={b.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(CATEGORY_META).map(([k, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={k}
                  onClick={() => setFilter(filter === k ? "" : k)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                    filter === k
                      ? "bg-ministry-50 border-ministry-300 text-ministry-700 font-semibold"
                      : "border-ink-200 hover:bg-ink-50 text-ink-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </MCard>

        <MCard className="lg:col-span-2">
          <SectionTitle eyebrow="Scoring rubric" title="How applications are evaluated" />
          <ul className="text-sm text-ink-700 space-y-1.5 list-disc pl-5">
            <li>Community impact (0-30): direct beneficiaries, sustainability</li>
            <li>Financial discipline (0-25): budget realism, co-funding</li>
            <li>Inclusion (0-20): women, youth, disability participation</li>
            <li>Track record (0-15): past grant performance, references</li>
            <li>Geographic priority (0-10): underserved ward weighting</li>
          </ul>
          <div className="mt-3 text-xs text-ink-500">
            Minimum score for approval: 60/100. Verified by the District Committee and randomly
            audited by CEFANET M&amp;E.
          </div>
        </MCard>
      </section>

      <div>
        <SectionTitle
          eyebrow="Live applications"
          title={`Grant applications${filter ? ` · ${CATEGORY_META[filter].label}` : ""} · ${visible.length}`}
          right={
            filter ? (
              <button onClick={() => setFilter("")} className="text-xs underline text-ministry-700">
                Clear filter
              </button>
            ) : null
          }
        />
        <DataTable
          rows={visible.slice(0, 40)}
          columns={[
            { header: "ID", cell: (g) => <span className="font-mono text-xs text-ink-700">{g.id}</span> },
            {
              header: "Applicant",
              cell: (g) => (
                <div>
                  <div className="font-medium text-ink-900">{g.applicant}</div>
                  <div className="text-[11px] text-ink-500">{constituencyById(g.constituencyId)?.name}</div>
                </div>
              ),
            },
            {
              header: "Category",
              cell: (g) => {
                const meta = CATEGORY_META[g.category];
                const Icon = meta.icon;
                return (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                    <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                    {meta.label}
                  </span>
                );
              },
            },
            {
              header: "Amount",
              cell: (g) => <span className="font-semibold text-ink-900">{ZMW_FULL(g.amount)}</span>,
              className: "text-right",
            },
            {
              header: "Score",
              cell: (g) => (
                <span
                  className={`text-sm font-semibold ${
                    g.score >= 80 ? "text-emerald-700" : g.score >= 65 ? "text-ministry-700" : "text-amber-700"
                  }`}
                >
                  {g.score}
                </span>
              ),
            },
            { header: "Status", cell: (g) => <StatusPill status={g.status} /> },
            {
              header: "Progress",
              cell: (g) =>
                ["disbursed", "approved"].includes(g.status) ? (
                  <div className="w-32">
                    <ProgressBar value={g.progressPct} tone="gold" />
                  </div>
                ) : (
                  <span className="text-xs text-ink-400">—</span>
                ),
            },
            {
              header: "Action",
              cell: (g) => {
                if (g.status === "submitted" && canReview) {
                  return (
                    <button
                      onClick={() => setStatus(g, "under_review")}
                      className="inline-flex items-center gap-1 rounded-md border border-ink-200 text-xs px-2 py-1 hover:bg-ink-50"
                    >
                      <ClipboardEdit className="h-3 w-3" /> Score
                    </button>
                  );
                }
                if (g.status === "under_review" && canApprove) {
                  return (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setStatus(g, "approved")}
                        className="inline-flex items-center gap-1 rounded-md bg-ministry-600 text-white text-xs px-2 py-1 hover:bg-ministry-700"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => setStatus(g, "rejected")}
                        className="inline-flex items-center gap-1 rounded-md border border-red-300 text-red-600 text-xs px-2 py-1 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  );
                }
                if (g.status === "approved" && canApprove) {
                  return (
                    <button
                      onClick={() => setStatus(g, "disbursed")}
                      className="inline-flex items-center gap-1 rounded-md bg-gold-500 text-ministry-900 font-semibold text-xs px-2 py-1 hover:bg-gold-600"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Disburse
                    </button>
                  );
                }
                return <span className="text-xs text-ink-400">—</span>;
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
