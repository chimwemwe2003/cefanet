"use client";

import { Printer } from "lucide-react";
import { useMemo } from "react";
import {
  NATIONAL,
  PROVINCE_ROLLUPS,
  YOY_TREND,
  ALERTS,
  ALL_FUND_SUMMARIES,
  constituencyById,
  ZMW,
} from "@/lib/cdfms/data";
import { CONSTITUENCIES } from "@/lib/cdfms/constituencies";

export default function PacReport() {
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-ZM", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const topPerformers = [...ALL_FUND_SUMMARIES]
    .sort((a, b) => b.utilisationPct - a.utilisationPct)
    .slice(0, 10);
  const bottomPerformers = [...ALL_FUND_SUMMARIES]
    .sort((a, b) => a.utilisationPct - b.utilisationPct)
    .slice(0, 10);

  const criticalAlerts = ALERTS.filter((a) => a.level === "critical");

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Toolbar (no-print) */}
      <div className="no-print sticky top-0 z-30 bg-white border-b border-ink-200">
        <div className="max-w-[820px] mx-auto px-6 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[.18em] text-ministry-700 font-semibold">
              Printable Report
            </div>
            <div className="text-sm font-semibold text-ink-900">
              PAC Quarterly Synthesis — Q1 FY2026
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-ministry-700 text-white px-3 py-2 text-sm font-semibold hover:bg-ministry-800"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* The report itself */}
      <div className="max-w-[820px] mx-auto my-8 bg-white shadow-ministry rounded-2xl px-10 py-12 print-page">
        {/* Letterhead */}
        <div className="flex items-start gap-4 border-b-2 border-ministry-700 pb-4">
          <div className="h-14 w-14 rounded-lg bg-gold-500 text-ministry-900 flex items-center justify-center font-bold text-2xl">
            C
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[.18em] text-ministry-700 font-semibold">
              Republic of Zambia · Ministry of Local Government and Rural Development
            </div>
            <div className="font-serif text-xl text-ink-900 leading-tight">
              CEFANET Constituency Development Fund Management System (CEFANET CDF-MS)
            </div>
            <div className="text-[11px] text-ink-500 mt-0.5">
              In partnership with the Centre for African Network (CEFANET) ·{" "}
              <span className="font-mono">REF / CEFANET-CDF-MS / PAC-Q1 / 2026</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl text-ink-900 mt-6 leading-tight">
          Quarterly Synthesis Report to the Public Accounts Committee
        </h1>
        <div className="mt-1 text-sm text-ink-500">
          Q1 Financial Year 2026 · prepared {today}
        </div>

        {/* Executive summary */}
        <section className="mt-8">
          <h2 className="font-serif text-lg text-ink-900 border-b border-ink-200 pb-1 mb-3">
            1. Executive Summary
          </h2>
          <p className="text-sm text-ink-700 leading-relaxed">
            For the quarter ending 31 March 2026, the Constituency Development Fund (CDF) envelope
            stood at <strong>{ZMW(NATIONAL.totalAllocated)}</strong> across{" "}
            {NATIONAL.constituencyCount} constituencies (K40 million per constituency).
            Cumulative disbursement reached <strong>{ZMW(NATIONAL.totalDisbursed)}</strong>,
            representing <strong>{NATIONAL.utilisationPct.toFixed(1)}%</strong> utilisation. Of
            the {NATIONAL.constituencyCount} constituencies, {NATIONAL.onTrackCount} ({(
              (NATIONAL.onTrackCount / NATIONAL.constituencyCount) *
              100
            ).toFixed(0)}%) are <strong>on track</strong>, {NATIONAL.watchCount} are on the
            <strong> watch list</strong>, and {NATIONAL.atRiskCount} are <strong>at risk</strong>.
          </p>
          <p className="text-sm text-ink-700 leading-relaxed mt-3">
            This report is generated automatically by CEFANET CDF-MS from primary data sources
            reconciled daily with ICDFMIS, Treasury disbursement records and field-officer
            submissions. It is tabled for review by the Public Accounts Committee in accordance
            with the Public Finance Management Act No. 1 of 2018 §57(2). It covers Infrastructure,
            Grants, Loans, School Bursaries, Health Initiatives, Community Scorecards and the
            Grievance & Redress register.
          </p>
        </section>

        {/* Headline KPIs */}
        <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 print-avoid-break">
          {[
            { label: "Allocated", value: ZMW(NATIONAL.totalAllocated) },
            { label: "Disbursed", value: ZMW(NATIONAL.totalDisbursed) },
            { label: "Committed", value: ZMW(NATIONAL.totalCommitted) },
            { label: "Utilisation", value: `${NATIONAL.utilisationPct.toFixed(1)}%` },
          ].map((k) => (
            <div key={k.label} className="border border-ink-200 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-500">{k.label}</div>
              <div className="font-serif text-xl text-ink-900 mt-1">{k.value}</div>
            </div>
          ))}
        </section>

        {/* Provincial performance */}
        <section className="mt-8 print-avoid-break">
          <h2 className="font-serif text-lg text-ink-900 border-b border-ink-200 pb-1 mb-3">
            2. Provincial Performance
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-[11px] uppercase tracking-wider text-ink-500">
                <th className="py-2">Province</th>
                <th className="py-2 text-right">Constituencies</th>
                <th className="py-2 text-right">Allocated</th>
                <th className="py-2 text-right">Disbursed</th>
                <th className="py-2 text-right">Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {[...PROVINCE_ROLLUPS]
                .sort((a, b) => b.utilisationPct - a.utilisationPct)
                .map((p) => (
                  <tr key={p.province} className="border-b border-ink-100">
                    <td className="py-2 text-ink-900 font-medium">{p.province}</td>
                    <td className="py-2 text-right text-ink-700">{p.constituencyCount}</td>
                    <td className="py-2 text-right text-ink-700">{ZMW(p.allocated)}</td>
                    <td className="py-2 text-right font-semibold text-ministry-700">
                      {ZMW(p.disbursed)}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {p.utilisationPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Top / bottom */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 print-avoid-break">
          <div>
            <h3 className="font-serif text-base text-ministry-700 mb-2">
              3. Top 10 Performing Constituencies
            </h3>
            <ol className="text-sm space-y-1.5">
              {topPerformers.map((f, i) => {
                const c = constituencyById(f.constituencyId);
                return (
                  <li key={f.constituencyId} className="flex justify-between border-b border-ink-100 py-1">
                    <span>
                      <span className="text-ink-500 mr-2">{i + 1}.</span>
                      <span className="text-ink-900 font-medium">{c?.name}</span>
                      <span className="text-ink-500 text-xs ml-1">({c?.province})</span>
                    </span>
                    <span className="font-semibold text-ministry-700">
                      {f.utilisationPct.toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <h3 className="font-serif text-base text-red-700 mb-2">
              4. Bottom 10 — Requiring Intervention
            </h3>
            <ol className="text-sm space-y-1.5">
              {bottomPerformers.map((f, i) => {
                const c = constituencyById(f.constituencyId);
                return (
                  <li key={f.constituencyId} className="flex justify-between border-b border-ink-100 py-1">
                    <span>
                      <span className="text-ink-500 mr-2">{i + 1}.</span>
                      <span className="text-ink-900 font-medium">{c?.name}</span>
                      <span className="text-ink-500 text-xs ml-1">({c?.province})</span>
                    </span>
                    <span className="font-semibold text-red-700">
                      {f.utilisationPct.toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Critical alerts */}
        <section className="mt-8 print-avoid-break">
          <h2 className="font-serif text-lg text-ink-900 border-b border-ink-200 pb-1 mb-3">
            5. Critical Compliance Alerts ({criticalAlerts.length})
          </h2>
          {criticalAlerts.length === 0 ? (
            <p className="text-sm text-ink-700">
              No critical alerts open at the time of report generation.
            </p>
          ) : (
            <ul className="text-sm space-y-2">
              {criticalAlerts.slice(0, 8).map((a) => (
                <li key={a.id} className="border-l-4 border-red-500 pl-3 py-1">
                  <div className="font-semibold text-ink-900">{a.title}</div>
                  <div className="text-xs text-ink-500">
                    {constituencyById(a.constituencyId)?.name} · {a.daysOpen} days open ·
                    raised {a.raisedAt}
                  </div>
                  <div className="text-xs text-ink-700 mt-0.5">{a.detail}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Five-year trajectory */}
        <section className="mt-8 print-avoid-break">
          <h2 className="font-serif text-lg text-ink-900 border-b border-ink-200 pb-1 mb-3">
            6. Five-Year Allocation Growth
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-[11px] uppercase tracking-wider text-ink-500">
                <th className="py-2">Year</th>
                <th className="py-2 text-right">Allocation per Constituency</th>
                <th className="py-2 text-right">Disbursed per Constituency</th>
                <th className="py-2 text-right">Projects Funded</th>
              </tr>
            </thead>
            <tbody>
              {YOY_TREND.map((y) => (
                <tr key={y.year} className="border-b border-ink-100">
                  <td className="py-2 text-ink-900 font-medium">{y.year}</td>
                  <td className="py-2 text-right text-ink-700">{ZMW(y.allocation)}</td>
                  <td className="py-2 text-right text-ministry-700 font-semibold">
                    {ZMW(y.disbursement)}
                  </td>
                  <td className="py-2 text-right text-ink-700">{y.projects.toLocaleString("en-ZM")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-ink-500 mt-2">
            FY2026 figures are year-to-date as of generation. Allocations expanded from K1.6 million
            in 2021 to K40 million per constituency in 2026 — a 25× real-terms increase.
          </div>
        </section>

        {/* Conclusion */}
        <section className="mt-8 print-avoid-break">
          <h2 className="font-serif text-lg text-ink-900 border-b border-ink-200 pb-1 mb-3">
            7. Recommendations
          </h2>
          <ol className="text-sm text-ink-700 list-decimal pl-5 space-y-1.5">
            <li>
              Direct CDF Committees in the bottom-10 constituencies to file a corrective action
              plan within 14 working days, with quarterly follow-up.
            </li>
            <li>
              Accelerate Treasury reconciliation cycles from monthly to fortnightly to release the{" "}
              {ZMW(NATIONAL.totalAllocated - NATIONAL.totalDisbursed)} undisbursed balance.
            </li>
            <li>
              Direct the Permanent Secretary to convene a review of the {criticalAlerts.length}{" "}
              open critical compliance alerts before the next reporting cycle.
            </li>
            <li>
              Continue automated daily ICDFMIS reconciliation; expand to weekly publication of
              public-facing constituency dashboards.
            </li>
          </ol>
        </section>

        {/* Signatures */}
        <section className="mt-12 grid grid-cols-2 gap-8 print-avoid-break">
          <div>
            <div className="border-b border-ink-400 mb-1 h-12" />
            <div className="text-[11px] text-ink-500">
              <strong>Permanent Secretary</strong>
              <br />
              Ministry of Local Government and Rural Development
            </div>
          </div>
          <div>
            <div className="border-b border-ink-400 mb-1 h-12" />
            <div className="text-[11px] text-ink-500">
              <strong>Chairperson</strong>
              <br />
              Public Accounts Committee, National Assembly of Zambia
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-ink-200 text-[10px] text-ink-500 leading-relaxed">
          This report is generated automatically by CEFANET CDF-MS from primary data sources
          reconciled daily with ICDFMIS. Every figure cited above is traceable to the underlying
          ledger entry via the system's audit trail. Page generated {today}.{" "}
          {CONSTITUENCIES.length} constituencies in scope. — End of report —
        </div>
      </div>
    </div>
  );
}
