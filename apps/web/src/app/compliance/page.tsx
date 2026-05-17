"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, Calendar, FileCheck2, ClipboardList, Download } from "lucide-react";
import { KPIcard, MCard, SectionTitle, DataTable } from "@/components/cdfms/ui";
import { ALERTS, constituencyById, type ComplianceAlert } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const CHECKLIST_DEFAULTS = [
  { id: "c1", item: "Quarterly synthesis report filed (Q1 2026)", done: true },
  { id: "c2", item: "Procurement variance ≤ 15% on all live tenders", done: true },
  { id: "c3", item: "All disbursements signed off by Constituency Officer", done: true },
  { id: "c4", item: "Photo evidence uploaded for all stalled projects", done: false },
  { id: "c5", item: "Bursary beneficiary NRC verification complete", done: true },
  { id: "c6", item: "PAC field-visit pack drafted", done: false },
  { id: "c7", item: "Tranche 2 reconciliation completed", done: true },
  { id: "c8", item: "Data Protection Officer monthly attestation", done: true },
];

const AUDIT_DEADLINES = [
  { id: "a1", title: "Q1 2026 quarterly report → MLGRD", due: "2026-05-20", daysLeft: 8 },
  { id: "a2", title: "PAC field visit – Lusaka Province", due: "2026-05-26", daysLeft: 14 },
  { id: "a3", title: "Annual transparency report → Auditor General", due: "2026-06-30", daysLeft: 49 },
  { id: "a4", title: "Mid-year MfDR review", due: "2026-07-15", daysLeft: 64 },
];

export default function CompliancePage() {
  const scope = useScope();
  const [checklist, setChecklist] = useState(CHECKLIST_DEFAULTS);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>(ALERTS);

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => visibleIds.has(a.constituencyId)),
    [alerts, visibleIds]
  );

  const critical = visibleAlerts.filter((a) => a.level === "critical").length;
  const warning = visibleAlerts.filter((a) => a.level === "warning").length;
  const totalOpen = visibleAlerts.length;
  const doneCount = checklist.filter((c) => c.done).length;
  const auditReadiness = Math.round((doneCount / checklist.length) * 100);

  const canResolve = can(scope?.role, "resolve:compliance");
  const canExport = can(scope?.role, "export:reports");
  const canAuditNotes = can(scope?.role, "audit:notes");

  function toggleCheck(id: string) {
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  }

  function resolveAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function handleExport() {
    downloadCsv("CDF-MS_compliance_alerts", visibleAlerts, [
      { header: "ID", cell: (a) => a.id },
      { header: "Severity", cell: (a) => a.level },
      { header: "Title", cell: (a) => a.title },
      { header: "Detail", cell: (a) => a.detail },
      { header: "Constituency", cell: (a) => constituencyById(a.constituencyId)?.name ?? "" },
      { header: "Raised", cell: (a) => a.raisedAt },
      { header: "Days open", cell: (a) => a.daysOpen },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Governance
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Compliance &amp; Audit Readiness</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Real-time alerts on overdue disbursements, compliance checklists, quarterly reporting
            deadlines and PAC audit readiness.
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
        <KPIcard label="Critical alerts" value={`${critical}`} tone="danger" icon={<ShieldAlert className="h-4 w-4" />} hint="Require immediate action" />
        <KPIcard label="Warnings" value={`${warning}`} tone="warning" hint="Action within 14 days" />
        <KPIcard label="Open total" value={`${totalOpen}`} hint="Across all severities" />
        <KPIcard
          label="Audit readiness"
          value={`${auditReadiness}%`}
          tone={auditReadiness >= 80 ? "positive" : "warning"}
          icon={<ShieldCheck className="h-4 w-4" />}
          hint={`${doneCount} / ${checklist.length} checks pass`}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MCard>
          <SectionTitle eyebrow="Operational" title="Compliance checklist" />
          <ul className="space-y-2.5">
            {checklist.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-2.5 rounded-lg border border-ink-200 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => (canResolve ? toggleCheck(c.id) : undefined)}
                  disabled={!canResolve}
                  className={`mt-0.5 inline-flex h-5 w-5 rounded-md items-center justify-center text-xs font-bold transition-colors ${
                    c.done
                      ? "bg-ministry-600 text-white"
                      : "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                  } ${canResolve ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-80"}`}
                  aria-label={c.done ? "Mark as not done" : "Mark as done"}
                >
                  {c.done ? "✓" : "!"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-900">{c.item}</div>
                </div>
              </li>
            ))}
          </ul>
          {!canResolve ? (
            <p className="text-[11px] text-ink-500 mt-2">
              Read-only checklist for your role. Constituency Officers / Ministry Officials can
              toggle.
            </p>
          ) : null}
        </MCard>

        <MCard>
          <SectionTitle eyebrow="Reporting calendar" title="Upcoming deadlines" />
          <ul className="space-y-2.5">
            {AUDIT_DEADLINES.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2.5"
              >
                <Calendar className="h-4 w-4 text-ministry-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900">{d.title}</div>
                  <div className="text-[11px] text-ink-500">Due {d.due}</div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                    d.daysLeft <= 14
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-ink-50 text-ink-700 ring-ink-200"
                  }`}
                >
                  {d.daysLeft}d
                </span>
              </li>
            ))}
          </ul>
        </MCard>
      </section>

      <div>
        <SectionTitle
          eyebrow="Real-time alerts"
          title={`Open compliance alerts · ${visibleAlerts.length}`}
          right={
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <FileCheck2 className="h-4 w-4 text-ministry-700" />
              All actions feed the audit trail
            </div>
          }
        />
        <DataTable
          rows={visibleAlerts}
          empty="No open alerts in your scope. All clear."
          columns={[
            {
              header: "Severity",
              cell: (a) => {
                const tone =
                  a.level === "critical"
                    ? "bg-red-50 text-red-700 ring-red-200"
                    : a.level === "warning"
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : "bg-blue-50 text-blue-700 ring-blue-200";
                return (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${tone}`}>
                    {a.level}
                  </span>
                );
              },
            },
            {
              header: "Issue",
              cell: (a) => (
                <div>
                  <div className="font-medium text-ink-900">{a.title}</div>
                  <div className="text-[11px] text-ink-500">{a.detail}</div>
                </div>
              ),
            },
            { header: "Constituency", cell: (a) => <span className="text-ink-700">{constituencyById(a.constituencyId)?.name}</span> },
            { header: "Raised", cell: (a) => <span className="text-xs text-ink-500">{a.raisedAt}</span> },
            {
              header: "Days open",
              cell: (a) => (
                <span className={`font-semibold ${a.daysOpen > 14 ? "text-red-600" : "text-ink-900"}`}>
                  {a.daysOpen}
                </span>
              ),
            },
            {
              header: "Action",
              cell: (a) => {
                if (canResolve) {
                  return (
                    <button
                      onClick={() => resolveAlert(a.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ministry-700 hover:underline"
                    >
                      <ClipboardList className="h-3 w-3" /> Resolve
                    </button>
                  );
                }
                if (canAuditNotes) {
                  return (
                    <button className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline">
                      Add audit note
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
