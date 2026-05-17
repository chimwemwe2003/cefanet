"use client";

import { useMemo, useState } from "react";
import { Search, ArrowRight, CheckCircle2, XCircle, Download, PlusCircle } from "lucide-react";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill, ProgressBar } from "@/components/cdfms/ui";
import {
  ALL_FUND_SUMMARIES,
  DISBURSEMENT_REQUESTS,
  constituencyById,
  ZMW,
  ZMW_FULL,
  type DisbursementRequest,
} from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, inScope, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const STAGE_ORDER = ["submitted", "committee_review", "constituency_office", "treasury", "disbursed"] as const;
const STAGE_LABEL: Record<string, string> = {
  submitted: "Submitted",
  committee_review: "Committee review",
  constituency_office: "Constituency office",
  treasury: "Treasury",
  disbursed: "Disbursed",
};

export default function FundsPage() {
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<DisbursementRequest[]>(DISBURSEMENT_REQUESTS);
  const scope = useScope();

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visibleRequests = useMemo(
    () => requests.filter((r) => visibleIds.has(r.constituencyId)),
    [requests, visibleIds]
  );

  const filteredConstituencies = useMemo(
    () =>
      visibleConsts
        .filter((c) => (search ? c.name.toLowerCase().includes(search.toLowerCase()) : true))
        .slice(0, 40),
    [search, visibleConsts]
  );

  const summariesById = useMemo(() => {
    const map = new Map<number, (typeof ALL_FUND_SUMMARIES)[number]>();
    ALL_FUND_SUMMARIES.forEach((f) => map.set(f.constituencyId, f));
    return map;
  }, []);

  const totalAllocated = visibleConsts.reduce(
    (a, c) => a + (summariesById.get(c.id)?.allocated ?? 0),
    0
  );
  const totalDisbursed = visibleConsts.reduce(
    (a, c) => a + (summariesById.get(c.id)?.disbursed ?? 0),
    0
  );
  const totalCommitted = visibleConsts.reduce(
    (a, c) => a + (summariesById.get(c.id)?.committed ?? 0),
    0
  );
  const pending = visibleRequests.filter((r) => r.stage !== "disbursed" && r.stage !== "rejected").length;

  function handleApprove(r: DisbursementRequest, nextStage: DisbursementRequest["stage"]) {
    setRequests((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, stage: nextStage, daysInStage: 0 } : x))
    );
  }

  function handleReject(r: DisbursementRequest) {
    setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, stage: "rejected" } : x)));
  }

  function handleExport() {
    downloadCsv("CDF-MS_funds_requests", visibleRequests, [
      { header: "Reference", cell: (r) => r.ref },
      { header: "ID", cell: (r) => r.id },
      { header: "Constituency", cell: (r) => constituencyById(r.constituencyId)?.name ?? "" },
      { header: "Purpose", cell: (r) => r.purpose },
      { header: "Category", cell: (r) => r.category },
      { header: "Amount (ZMW)", cell: (r) => r.amount },
      { header: "Stage", cell: (r) => STAGE_LABEL[r.stage] ?? r.stage },
      { header: "Days in stage", cell: (r) => r.daysInStage },
      { header: "Submitted", cell: (r) => r.submittedAt },
      { header: "Requested by", cell: (r) => r.requestedBy },
    ]);
  }

  const canCommitteeApprove = can(scope?.role, "approve:constituency");
  const canTreasuryApprove = can(scope?.role, "approve:treasury");
  const canInitiate = can(scope?.role, "initiate:request");
  const canExport = can(scope?.role, "export:reports");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Fund Management
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Core CDF Fund Management</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Allocation, commitment, disbursement and multi-tier approval workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canInitiate ? (
            <button className="inline-flex items-center gap-2 rounded-lg border border-ministry-300 bg-ministry-50 text-ministry-700 px-3 py-2 text-sm hover:bg-ministry-100 font-semibold">
              <PlusCircle className="h-4 w-4" />
              New request
            </button>
          ) : null}
          {canExport ? (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50 shadow-sm"
            >
              <Download className="h-4 w-4 text-ministry-700" />
              Export Excel
            </button>
          ) : null}
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Allocated" value={ZMW(totalAllocated)} hint={`${visibleConsts.length} const. in scope`} />
        <KPIcard label="Disbursed" value={ZMW(totalDisbursed)} hint={`${((totalDisbursed / Math.max(1, totalAllocated)) * 100).toFixed(1)}% utilised`} tone="positive" />
        <KPIcard label="Committed" value={ZMW(totalCommitted)} hint="Awaiting payment" tone="gold" />
        <KPIcard label="Pending requests" value={`${pending}`} hint="In workflow" tone="warning" />
      </section>

      <MCard>
        <SectionTitle
          eyebrow="Multi-tier authorisation"
          title="Disbursement workflow"
          description="MP → Constituency Office → Treasury. Every step is logged in the audit trail."
        />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STAGE_ORDER.map((stage, idx) => {
            const count = visibleRequests.filter((r) => r.stage === stage).length;
            return (
              <div key={stage} className="rounded-xl border border-ink-200 bg-white p-3 relative">
                <div className="text-[10px] uppercase tracking-wider text-ink-500">Step {idx + 1}</div>
                <div className="font-serif text-lg text-ink-900 mt-0.5 leading-tight">
                  {STAGE_LABEL[stage]}
                </div>
                <div className="mt-2 text-2xl font-serif font-bold text-ministry-700">{count}</div>
                {idx < STAGE_ORDER.length - 1 ? (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ministry-300" />
                ) : null}
              </div>
            );
          })}
        </div>
      </MCard>

      <div>
        <SectionTitle
          eyebrow="In-flight"
          title="Active disbursement requests"
          description={
            canCommitteeApprove
              ? "As Constituency Officer you can advance committee-review requests."
              : canTreasuryApprove
              ? "As Ministry Official you can release Treasury-stage requests."
              : "Read-only view of the workflow."
          }
        />
        <DataTable
          rows={visibleRequests}
          columns={[
            {
              header: "Reference",
              cell: (r) => (
                <div className="font-mono text-xs">
                  <div className="text-ink-900">{r.ref}</div>
                  <div className="text-ink-500 text-[10px]">{r.id}</div>
                </div>
              ),
              width: "18%",
            },
            {
              header: "Constituency",
              cell: (r) => (
                <div>
                  <div className="font-medium text-ink-900">{constituencyById(r.constituencyId)?.name}</div>
                  <div className="text-[11px] text-ink-500">{constituencyById(r.constituencyId)?.province}</div>
                </div>
              ),
            },
            { header: "Purpose", cell: (r) => <span className="text-ink-700">{r.purpose}</span> },
            {
              header: "Amount",
              cell: (r) => <span className="font-semibold text-ink-900">{ZMW_FULL(r.amount)}</span>,
              className: "text-right",
            },
            { header: "Stage", cell: (r) => <StatusPill status={r.stage} /> },
            {
              header: "Days",
              cell: (r) => (
                <span className={`text-xs ${r.daysInStage > 14 ? "text-red-600 font-semibold" : "text-ink-500"}`}>
                  {r.daysInStage}d
                </span>
              ),
            },
            {
              header: "Action",
              cell: (r) => {
                if (r.stage === "disbursed" || r.stage === "rejected") {
                  return <span className="text-xs text-ink-400">—</span>;
                }
                if (r.stage === "committee_review" && canCommitteeApprove && inScope(scope, r.constituencyId)) {
                  return (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleApprove(r, "constituency_office")}
                        className="inline-flex items-center gap-1 rounded-md bg-ministry-600 text-white text-xs px-2 py-1 hover:bg-ministry-700"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(r)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-300 text-red-600 text-xs px-2 py-1 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  );
                }
                if (r.stage === "treasury" && canTreasuryApprove) {
                  return (
                    <button
                      onClick={() => handleApprove(r, "disbursed")}
                      className="inline-flex items-center gap-1 rounded-md bg-gold-500 text-ministry-900 font-semibold text-xs px-2 py-1 hover:bg-gold-600"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Release
                    </button>
                  );
                }
                return <span className="text-[10px] uppercase tracking-wider text-ink-400">Not yours</span>;
              },
            },
          ]}
        />
      </div>

      <div>
        <SectionTitle
          eyebrow="Constituency view"
          title={`Constituency utilisation · ${visibleConsts.length}`}
          right={
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search constituency..."
                className="rounded-lg border border-ink-200 pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ministry-300"
              />
            </div>
          }
        />
        <DataTable
          rows={filteredConstituencies}
          columns={[
            {
              header: "Constituency",
              cell: (c) => (
                <div>
                  <div className="font-medium text-ink-900">{c.name}</div>
                  <div className="text-[11px] text-ink-500">
                    {c.district}, {c.province}
                  </div>
                </div>
              ),
              width: "26%",
            },
            {
              header: "Allocated",
              cell: (c) => <span className="text-ink-700">{ZMW(summariesById.get(c.id)?.allocated ?? 0)}</span>,
            },
            {
              header: "Disbursed",
              cell: (c) => (
                <span className="font-semibold text-ministry-700">
                  {ZMW(summariesById.get(c.id)?.disbursed ?? 0)}
                </span>
              ),
            },
            {
              header: "Utilisation",
              cell: (c) => {
                const f = summariesById.get(c.id);
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-[80px]">
                      <ProgressBar value={f?.utilisationPct ?? 0} />
                    </div>
                    <span className="text-xs w-10 text-right text-ink-700">
                      {(f?.utilisationPct ?? 0).toFixed(0)}%
                    </span>
                  </div>
                );
              },
              width: "20%",
            },
            { header: "Status", cell: (c) => <StatusPill status={summariesById.get(c.id)?.status ?? "watch"} /> },
          ]}
        />
      </div>
    </div>
  );
}
