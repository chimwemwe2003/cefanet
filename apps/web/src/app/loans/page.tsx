"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Coins, TrendingDown, Wallet, Download } from "lucide-react";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill, ProgressBar } from "@/components/cdfms/ui";
import { LOAN_RECORDS, constituencyById, ZMW, ZMW_FULL } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const STATUS_COLORS: Record<string, string> = {
  performing: "#15803d",
  delinquent: "#f59e0b",
  defaulted: "#dc2626",
  repaid: "#2196f3",
  active: "#15803d",
};

export default function LoansPage() {
  const scope = useScope();
  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visibleLoans = useMemo(
    () => LOAN_RECORDS.filter((l) => visibleIds.has(l.constituencyId)),
    [visibleIds]
  );

  const totalPrincipal = visibleLoans.reduce((a, l) => a + l.principal, 0);
  const totalOutstanding = visibleLoans.reduce((a, l) => a + l.outstanding, 0);
  const totalDefaulted = visibleLoans.filter((l) => l.status === "defaulted").reduce((a, l) => a + l.outstanding, 0);
  const defaultRate =
    visibleLoans.length === 0
      ? 0
      : (visibleLoans.filter((l) => l.status === "defaulted").length / visibleLoans.length) * 100;

  const portfolio = ["performing", "delinquent", "defaulted", "repaid"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: visibleLoans.filter((l) => l.status === s).length,
    color: STATUS_COLORS[s],
  }));

  const canExport = can(scope?.role, "export:reports");

  function handleExport() {
    downloadCsv("CDF-MS_loans", visibleLoans, [
      { header: "ID", cell: (l) => l.id },
      { header: "Borrower", cell: (l) => l.borrower },
      { header: "Constituency", cell: (l) => constituencyById(l.constituencyId)?.name ?? "" },
      { header: "Principal (ZMW)", cell: (l) => l.principal },
      { header: "Outstanding (ZMW)", cell: (l) => l.outstanding },
      { header: "Monthly instalment", cell: (l) => l.monthlyInstalment },
      { header: "Term (months)", cell: (l) => l.termMonths },
      { header: "Status", cell: (l) => l.status },
      { header: "Days past due", cell: (l) => l.daysPastDue },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Empowerment
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Revolving Loan Fund</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Community-level revolving loans. Repayment performance feeds back into the next-cycle
            disbursement pool.
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
        <KPIcard label="Active loans" value={`${visibleLoans.filter((l) => l.status !== "repaid").length}`} icon={<Coins className="h-4 w-4" />} />
        <KPIcard label="Total principal" value={ZMW(totalPrincipal)} tone="gold" icon={<Wallet className="h-4 w-4" />} />
        <KPIcard
          label="Outstanding"
          value={ZMW(totalOutstanding)}
          tone="positive"
          hint={totalPrincipal ? `${((totalOutstanding / totalPrincipal) * 100).toFixed(1)}% of book` : "—"}
        />
        <KPIcard
          label="Default rate"
          value={`${defaultRate.toFixed(1)}%`}
          hint={`${ZMW(totalDefaulted)} at loss`}
          tone={defaultRate > 8 ? "danger" : "warning"}
          icon={<TrendingDown className="h-4 w-4" />}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MCard className="lg:col-span-1">
          <SectionTitle eyebrow="Health" title="Portfolio status" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={portfolio} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {portfolio.map((p, i) => (
                    <Cell key={i} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MCard>

        <MCard className="lg:col-span-2">
          <SectionTitle eyebrow="Risk" title="Top delinquent / defaulted loans" />
          <DataTable
            rows={visibleLoans.filter((l) => ["delinquent", "defaulted"].includes(l.status)).slice(0, 6)}
            empty="No delinquent or defaulted loans in your scope."
            columns={[
              { header: "ID", cell: (l) => <span className="font-mono text-xs">{l.id}</span> },
              {
                header: "Borrower",
                cell: (l) => (
                  <div>
                    <div className="text-ink-900">{l.borrower}</div>
                    <div className="text-[11px] text-ink-500">{constituencyById(l.constituencyId)?.name}</div>
                  </div>
                ),
              },
              { header: "Outstanding", cell: (l) => <span className="font-semibold text-ink-900">{ZMW_FULL(l.outstanding)}</span> },
              { header: "Days past due", cell: (l) => <span className="text-red-600 font-semibold">{l.daysPastDue}d</span> },
              { header: "Status", cell: (l) => <StatusPill status={l.status} /> },
            ]}
          />
        </MCard>
      </section>

      <div>
        <SectionTitle eyebrow="Portfolio" title={`All loans · ${visibleLoans.length}`} />
        <DataTable
          rows={visibleLoans.slice(0, 40)}
          columns={[
            { header: "ID", cell: (l) => <span className="font-mono text-xs">{l.id}</span> },
            {
              header: "Borrower",
              cell: (l) => (
                <div>
                  <div className="text-ink-900">{l.borrower}</div>
                  <div className="text-[11px] text-ink-500">{constituencyById(l.constituencyId)?.name}</div>
                </div>
              ),
            },
            { header: "Principal", cell: (l) => <span className="text-ink-700">{ZMW(l.principal)}</span> },
            { header: "Outstanding", cell: (l) => <span className="font-semibold text-ministry-700">{ZMW(l.outstanding)}</span> },
            {
              header: "Repayment",
              cell: (l) => {
                const pct = ((l.principal - l.outstanding) / l.principal) * 100;
                return (
                  <div className="w-28">
                    <ProgressBar value={pct} tone={l.status === "defaulted" ? "danger" : "ministry"} />
                  </div>
                );
              },
            },
            { header: "Term", cell: (l) => <span className="text-ink-500 text-xs">{l.termMonths}m</span> },
            { header: "Status", cell: (l) => <StatusPill status={l.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
