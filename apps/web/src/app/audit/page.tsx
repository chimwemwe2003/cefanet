"use client";

import { useMemo, useState } from "react";
import { ScrollText, Lock, Search, Download } from "lucide-react";
import { KPIcard, MCard, SectionTitle, DataTable } from "@/components/cdfms/ui";
import { AUDIT_ENTRIES } from "@/lib/cdfms/extra-data";
import { useScope } from "@/lib/cdfms/store";
import { can, ROLE_LABEL } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const ROLE_COLOR: Record<string, string> = {
  constituency_officer: "bg-blue-50 text-blue-700 ring-blue-200",
  ministry_official: "bg-ministry-50 text-ministry-700 ring-ministry-200",
  auditor: "bg-gold-50 text-gold-700 ring-gold-200",
  system_admin: "bg-slate-100 text-slate-700 ring-slate-200",
  system: "bg-ink-100 text-ink-700 ring-ink-200",
};

export default function AuditPage() {
  const scope = useScope();
  const [search, setSearch] = useState("");

  if (!can(scope?.role, "view:audit")) {
    return (
      <MCard>
        <SectionTitle title="Audit Trail" description="You don't have permission to view the audit trail." />
        <p className="text-sm text-ink-500 inline-flex items-center gap-1.5">
          <Lock className="h-4 w-4" /> This module requires a privileged role (Ministry Official,
          Auditor, CSO Stakeholder or System Administrator).
        </p>
      </MCard>
    );
  }

  const filtered = useMemo(
    () =>
      AUDIT_ENTRIES.filter((a) =>
        search
          ? a.actor.toLowerCase().includes(search.toLowerCase()) ||
            a.action.toLowerCase().includes(search.toLowerCase()) ||
            a.target.toLowerCase().includes(search.toLowerCase())
          : true
      ),
    [search]
  );

  const total = AUDIT_ENTRIES.length;
  const last24h = AUDIT_ENTRIES.filter((a) => a.ts.startsWith("2026-05-13") || a.ts.startsWith("2026-05-12")).length;
  const writes = AUDIT_ENTRIES.filter((a) => !a.action.startsWith("Viewed")).length;
  const piiAccess = AUDIT_ENTRIES.filter((a) => a.action.includes("PII")).length;

  function handleExport() {
    downloadCsv("CEFANET_audit_trail", filtered, [
      { header: "ID", cell: (a) => a.id },
      { header: "Timestamp", cell: (a) => a.ts },
      { header: "Actor", cell: (a) => a.actor },
      { header: "Role", cell: (a) => ROLE_LABEL[a.role as keyof typeof ROLE_LABEL] ?? a.role },
      { header: "Action", cell: (a) => a.action },
      { header: "Target", cell: (a) => a.target },
      { header: "Chain hash", cell: (a) => a.hash },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Governance
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Audit Trail</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Tamper-evident chronological log of every consequential action on CEFANET CDF-MS. Each
            entry carries a chain hash that links to the previous record.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50 shadow-sm"
        >
          <Download className="h-4 w-4 text-ministry-700" /> Export Excel
        </button>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Entries (all-time)" value={`${total}`} icon={<ScrollText className="h-4 w-4" />} />
        <KPIcard label="Last 24 hours" value={`${last24h}`} hint="Recent activity" />
        <KPIcard label="Write actions" value={`${writes}`} tone="gold" hint="State-changing" />
        <KPIcard label="PII accesses" value={`${piiAccess}`} tone="warning" hint="Audit-logged" />
      </section>

      <MCard className="bg-ministry-700 text-white">
        <div className="text-[11px] tracking-[.2em] uppercase text-gold-200 font-semibold">
          Tamper detection
        </div>
        <div className="font-serif text-lg mt-1 leading-snug">
          Every entry links to the previous via a SHA-style chain hash. Any retroactive change
          breaks the chain and is detected on the next reconciliation cycle.
        </div>
        <div className="text-xs text-ministry-100/80 mt-2">
          Append-only · cryptographically chained · backed up nightly
        </div>
      </MCard>

      <div>
        <SectionTitle
          eyebrow="Recent activity"
          title={`Audit log · ${filtered.length}`}
          right={
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actor, action, target..."
                className="rounded-lg border border-ink-200 pl-7 pr-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ministry-300"
              />
            </div>
          }
        />
        <DataTable
          rows={filtered}
          columns={[
            {
              header: "Timestamp",
              cell: (a) => <span className="font-mono text-[11px] text-ink-700">{a.ts.replace("T", " ").replace("Z", " UTC")}</span>,
            },
            {
              header: "Actor",
              cell: (a) => (
                <div>
                  <div className="text-ink-900 font-medium">{a.actor}</div>
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${ROLE_COLOR[a.role]}`}>
                    {a.role === "system" ? "system" : ROLE_LABEL[a.role as keyof typeof ROLE_LABEL] ?? a.role}
                  </span>
                </div>
              ),
            },
            { header: "Action", cell: (a) => <span className="text-ink-900">{a.action}</span> },
            { header: "Target", cell: (a) => <span className="text-ink-700 font-mono text-xs">{a.target}</span> },
            { header: "Chain hash", cell: (a) => <span className="font-mono text-[10px] text-ink-500">{a.hash}</span> },
          ]}
        />
      </div>
    </div>
  );
}
