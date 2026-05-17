"use client";

import Link from "next/link";
import { FileText, FileSpreadsheet, Printer, Download } from "lucide-react";
import { MCard, SectionTitle } from "@/components/cdfms/ui";
import { useScope } from "@/lib/cdfms/store";
import { can, scopedConstituencies } from "@/lib/cdfms/rbac";
import { GRANT_APPLICATIONS, LOAN_RECORDS, INFRA_PROJECTS, constituencyById, fundSummary } from "@/lib/cdfms/data";
import { BURSARIES, HEALTH_FACILITIES, SCORECARDS, GRIEVANCES } from "@/lib/cdfms/extra-data";
import { downloadCsv, openPrintReport } from "@/lib/cdfms/export";
import { useMemo } from "react";

export default function ReportsPage() {
  const scope = useScope();
  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const canExport = can(scope?.role, "export:reports");

  if (!canExport) {
    return (
      <MCard>
        <SectionTitle title="Reports" description="You don't have permission to export reports." />
        <p className="text-sm text-ink-500">
          Contact your Ministry Official to request access.
        </p>
      </MCard>
    );
  }

  const utilCsv = () =>
    downloadCsv(
      `CDF-MS_utilisation_${new Date().toISOString().slice(0, 10)}`,
      visibleConsts,
      [
        { header: "Constituency", cell: (c) => c.name },
        { header: "Province", cell: (c) => c.province },
        { header: "Allocated (ZMW)", cell: (c) => fundSummary(c).allocated },
        { header: "Disbursed (ZMW)", cell: (c) => fundSummary(c).disbursed },
        { header: "Utilisation %", cell: (c) => fundSummary(c).utilisationPct.toFixed(2) },
        { header: "Status", cell: (c) => fundSummary(c).status },
      ]
    );

  const grantsCsv = () =>
    downloadCsv(
      "CDF-MS_grants",
      GRANT_APPLICATIONS.filter((g) => visibleIds.has(g.constituencyId)),
      [
        { header: "ID", cell: (g) => g.id },
        { header: "Applicant", cell: (g) => g.applicant },
        { header: "Category", cell: (g) => g.category },
        { header: "Amount (ZMW)", cell: (g) => g.amount },
        { header: "Score", cell: (g) => g.score },
        { header: "Status", cell: (g) => g.status },
      ]
    );

  const loansCsv = () =>
    downloadCsv(
      "CDF-MS_loans",
      LOAN_RECORDS.filter((l) => visibleIds.has(l.constituencyId)),
      [
        { header: "ID", cell: (l) => l.id },
        { header: "Borrower", cell: (l) => l.borrower },
        { header: "Principal", cell: (l) => l.principal },
        { header: "Outstanding", cell: (l) => l.outstanding },
        { header: "Status", cell: (l) => l.status },
      ]
    );

  const projectsCsv = () =>
    downloadCsv(
      "CDF-MS_projects",
      INFRA_PROJECTS.filter((p) => visibleIds.has(p.constituencyId)),
      [
        { header: "ID", cell: (p) => p.id },
        { header: "Project", cell: (p) => p.name },
        { header: "Status", cell: (p) => p.status },
        { header: "Budget", cell: (p) => p.budget },
        { header: "Spend", cell: (p) => p.spend },
        { header: "Completion %", cell: (p) => p.completionPct },
      ]
    );

  const bursariesCsv = () =>
    downloadCsv(
      "CEFANET_bursaries",
      BURSARIES.filter((b) => visibleIds.has(b.constituencyId)),
      [
        { header: "ID", cell: (b) => b.id },
        { header: "Beneficiary", cell: (b) => b.beneficiary },
        { header: "Level", cell: (b) => b.level },
        { header: "Gender", cell: (b) => b.gender },
        { header: "School", cell: (b) => b.school },
        { header: "Amount", cell: (b) => b.amount },
        { header: "Status", cell: (b) => b.status },
        { header: "Attendance %", cell: (b) => b.attendancePct },
        { header: "Grade avg", cell: (b) => b.gradeAverage },
      ]
    );

  const healthCsv = () =>
    downloadCsv(
      "CEFANET_health_facilities",
      HEALTH_FACILITIES.filter((f) => visibleIds.has(f.constituencyId)),
      [
        { header: "ID", cell: (f) => f.id },
        { header: "Facility", cell: (f) => f.name },
        { header: "Type", cell: (f) => f.type },
        { header: "Status", cell: (f) => f.status },
        { header: "Drug availability %", cell: (f) => f.drugAvailabilityPct },
        { header: "Patients YTD", cell: (f) => f.patientsServedYTD },
        { header: "Satisfaction", cell: (f) => f.satisfactionScore },
      ]
    );

  const scorecardsCsv = () =>
    downloadCsv(
      "CEFANET_scorecards",
      SCORECARDS.filter((s) => visibleIds.has(s.constituencyId)),
      [
        { header: "ID", cell: (s) => s.id },
        { header: "Facility", cell: (s) => s.facilityName },
        { header: "Category", cell: (s) => s.category },
        { header: "Composite", cell: (s) => s.composite },
        { header: "Access", cell: (s) => s.scores.access },
        { header: "Quality", cell: (s) => s.scores.quality },
        { header: "Provider behaviour", cell: (s) => s.scores.provider_behaviour },
        { header: "Satisfaction", cell: (s) => s.scores.satisfaction },
      ]
    );

  const grievancesCsv = () =>
    downloadCsv(
      "CEFANET_grievances",
      GRIEVANCES.filter((g) => visibleIds.has(g.constituencyId)),
      [
        { header: "ID", cell: (g) => g.id },
        { header: "Reference", cell: (g) => g.reference },
        { header: "Category", cell: (g) => g.category },
        { header: "Status", cell: (g) => g.status },
        { header: "Days open", cell: (g) => g.daysOpen },
        { header: "Summary", cell: (g) => g.summary },
      ]
    );

  const csvReports = [
    { id: "utilisation", name: "Constituency Utilisation", desc: "Allocation, disbursement and utilisation per constituency.", action: utilCsv },
    { id: "grants", name: "Grants Portfolio", desc: "All grant applications with scores and status.", action: grantsCsv },
    { id: "loans", name: "Loans Portfolio", desc: "Active, performing, delinquent, defaulted loans.", action: loansCsv },
    { id: "projects", name: "Infrastructure Projects", desc: "Project registry with budgets, spend and milestones.", action: projectsCsv },
    { id: "bursaries", name: "School Bursaries", desc: "Awards with retention, graduation and equity indicators.", action: bursariesCsv },
    { id: "health", name: "Health Facilities", desc: "Facility status, drug availability, services delivered.", action: healthCsv },
    { id: "scorecards", name: "Community Scorecards", desc: "Citizen-led ratings across access, quality, provider behaviour, satisfaction.", action: scorecardsCsv },
    { id: "grievances", name: "Grievances Register", desc: "Citizen grievances with resolution status.", action: grievancesCsv },
  ];

  const pdfReports = [
    {
      id: "pac",
      name: "PAC Quarterly Report",
      desc: "Public Accounts Committee summary report — print-ready, audit-trail signed.",
      path: "/reports/pac",
    },
    {
      id: "constituency",
      name: "Constituency Performance Brief",
      desc: "One-page summary of the current constituency. Prints to A4.",
      path: "/reports/constituency",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
          Module · Reports
        </div>
        <h1 className="font-serif text-3xl text-ink-900 mt-1">Reports &amp; Exports</h1>
        <p className="text-sm text-ink-500 mt-1 max-w-2xl">
          Generate Excel data dumps and print-ready PDF reports. Data is scoped to your role.
        </p>
      </div>

      <MCard>
        <SectionTitle
          eyebrow="Spreadsheet exports"
          title="Excel-compatible reports"
          description="CSV files open natively in Excel and Google Sheets. Includes only data in your scope."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {csvReports.map((r) => (
            <button
              key={r.id}
              onClick={r.action}
              className="text-left flex items-start gap-3 rounded-xl border border-ink-200 p-3 hover:border-ministry-300 hover:bg-ministry-50/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-ministry-50 text-ministry-700 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900">{r.name}</div>
                <div className="text-xs text-ink-500 mt-0.5">{r.desc}</div>
              </div>
              <Download className="h-4 w-4 text-ministry-700 mt-2" />
            </button>
          ))}
        </div>
      </MCard>

      <MCard>
        <SectionTitle
          eyebrow="Print-ready PDFs"
          title="Formal reports"
          description="Reports open in a new tab. Use your browser's Print → Save as PDF (Ctrl+P) for archive copies."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pdfReports.map((r) => (
            <button
              key={r.id}
              onClick={() => openPrintReport(r.path)}
              className="text-left flex items-start gap-3 rounded-xl border border-ink-200 p-3 hover:border-ministry-300 hover:bg-ministry-50/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900">{r.name}</div>
                <div className="text-xs text-ink-500 mt-0.5">{r.desc}</div>
              </div>
              <Printer className="h-4 w-4 text-gold-700 mt-2" />
            </button>
          ))}
        </div>
      </MCard>

      <div className="text-[11px] text-ink-500 leading-relaxed">
        Reports are generated client-side from current data. Every export is logged in the audit
        trail with the requesting role, scope, and timestamp.
      </div>
    </div>
  );
}
