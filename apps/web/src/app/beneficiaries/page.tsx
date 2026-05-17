"use client";

import { useState, useMemo } from "react";
import { Users, ShieldAlert, BadgeCheck, Search, Lock, Download } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { KPIcard, MCard, SectionTitle, DataTable } from "@/components/cdfms/ui";
import { BENEFICIARIES, constituencyById, ZMW } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can, maskPii } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const VULN_COLORS: Record<string, string> = {
  low: "#a5d6a7",
  medium: "#fbbf24",
  high: "#f9a825",
  critical: "#dc2626",
};

export default function BeneficiariesPage() {
  const scope = useScope();
  const [search, setSearch] = useState("");

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const inScopeBenefs = useMemo(
    () => BENEFICIARIES.filter((b) => visibleIds.has(b.constituencyId)),
    [visibleIds]
  );

  const filtered = useMemo(
    () =>
      inScopeBenefs.filter((b) =>
        search
          ? b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.nrc.includes(search) ||
            b.id.toLowerCase().includes(search.toLowerCase())
          : true
      ),
    [search, inScopeBenefs]
  );

  const total = inScopeBenefs.length;
  const flagged = inScopeBenefs.filter((b) => b.duplicateFlag).length;
  const female = inScopeBenefs.filter((b) => b.gender === "F").length;
  const critical = inScopeBenefs.filter((b) => b.vulnerability === "critical").length;

  const vulnData = ["low", "medium", "high", "critical"].map((v) => ({
    name: v.charAt(0).toUpperCase() + v.slice(1),
    value: inScopeBenefs.filter((b) => b.vulnerability === v).length,
    color: VULN_COLORS[v],
  }));

  const ageBuckets = [
    { name: "7-17", value: inScopeBenefs.filter((b) => b.age <= 17).length },
    { name: "18-30", value: inScopeBenefs.filter((b) => b.age >= 18 && b.age <= 30).length },
    { name: "31-45", value: inScopeBenefs.filter((b) => b.age >= 31 && b.age <= 45).length },
    { name: "46-60", value: inScopeBenefs.filter((b) => b.age >= 46 && b.age <= 60).length },
    { name: "60+", value: inScopeBenefs.filter((b) => b.age > 60).length },
  ];

  const canSeePii = can(scope?.role, "view:pii");
  const canExport = can(scope?.role, "export:reports");

  function handleExport() {
    downloadCsv("CDF-MS_beneficiaries", inScopeBenefs, [
      { header: "ID", cell: (b) => b.id },
      { header: "Name", cell: (b) => maskPii(b.name, scope?.role ?? null) },
      { header: "NRC", cell: (b) => (canSeePii ? b.nrc : "REDACTED") },
      { header: "Gender", cell: (b) => b.gender },
      { header: "Age", cell: (b) => b.age },
      { header: "Constituency", cell: (b) => constituencyById(b.constituencyId)?.name ?? "" },
      { header: "Ward", cell: (b) => b.ward },
      { header: "Programmes", cell: (b) => b.programmes.join("; ") },
      { header: "Vulnerability", cell: (b) => b.vulnerability },
      { header: "Total received (ZMW)", cell: (b) => b.totalReceived },
      { header: "Duplicate flag", cell: (b) => (b.duplicateFlag ? "YES" : "no") },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Inclusion
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Beneficiary Management</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Single registry linking NRC to bursaries, grants and feeding programmes. Vulnerability
            scoring + duplicate detection prevent double-dipping.
          </p>
          {!canSeePii ? (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-ink-500">
              <Lock className="h-3 w-3" /> PII is masked for your role. Use audit-trail-logged
              access to view full records.
            </div>
          ) : null}
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
        <KPIcard label="Registered" value={total.toLocaleString("en-ZM")} icon={<Users className="h-4 w-4" />} />
        <KPIcard
          label="Female"
          value={total ? `${((female / total) * 100).toFixed(0)}%` : "—"}
          tone="positive"
          hint={`${female.toLocaleString("en-ZM")} beneficiaries`}
        />
        <KPIcard label="Critical vulnerability" value={`${critical}`} tone="danger" icon={<ShieldAlert className="h-4 w-4" />} />
        <KPIcard label="Duplicate flags" value={`${flagged}`} tone="warning" hint="Pending review" icon={<BadgeCheck className="h-4 w-4" />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MCard>
          <SectionTitle eyebrow="Risk profile" title="Vulnerability distribution" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vulnData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} label>
                  {vulnData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MCard>
        <MCard>
          <SectionTitle eyebrow="Demographics" title="Age distribution" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MCard>
      </section>

      <div>
        <SectionTitle
          eyebrow="Registry"
          title={`All beneficiaries · ${filtered.length}`}
          right={
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, NRC or ID..."
                className="rounded-lg border border-ink-200 pl-7 pr-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-ministry-300"
              />
            </div>
          }
        />
        <DataTable
          rows={filtered.slice(0, 60)}
          columns={[
            { header: "ID", cell: (b) => <span className="font-mono text-xs text-ink-700">{b.id}</span> },
            {
              header: "Name",
              cell: (b) => (
                <div>
                  <div className="font-medium text-ink-900">{maskPii(b.name, scope?.role ?? null)}</div>
                  <div className="text-[11px] text-ink-500 font-mono">
                    {canSeePii ? b.nrc : "•••••• / •• / •"}
                  </div>
                </div>
              ),
            },
            { header: "Gender", cell: (b) => <span className="text-ink-700">{b.gender}</span> },
            { header: "Age", cell: (b) => <span className="text-ink-700">{b.age}</span> },
            {
              header: "Ward",
              cell: (b) => (
                <div>
                  <div className="text-ink-700">{b.ward}</div>
                  <div className="text-[11px] text-ink-500">{constituencyById(b.constituencyId)?.name}</div>
                </div>
              ),
            },
            {
              header: "Programmes",
              cell: (b) => (
                <div className="flex flex-wrap gap-1">
                  {b.programmes.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center rounded-full bg-ministry-50 text-ministry-700 ring-1 ring-ministry-100 text-[10px] font-medium px-2 py-0.5"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              header: "Vulnerability",
              cell: (b) => (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: `${VULN_COLORS[b.vulnerability]}22`,
                    color: VULN_COLORS[b.vulnerability],
                  }}
                >
                  {b.vulnerability}
                </span>
              ),
            },
            {
              header: "Received",
              cell: (b) => <span className="text-ministry-700 font-semibold">{ZMW(b.totalReceived)}</span>,
              className: "text-right",
            },
            {
              header: "Flag",
              cell: (b) =>
                b.duplicateFlag ? (
                  <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 ring-1 ring-red-200">
                    DUP?
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
