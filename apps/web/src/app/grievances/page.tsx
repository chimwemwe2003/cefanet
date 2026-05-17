"use client";

import { useMemo, useState } from "react";
import { MessageSquareWarning, CheckCircle2, AlertOctagon, Clock, Download, PlusCircle } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill } from "@/components/cdfms/ui";
import { GRIEVANCES, type Grievance, type GrievanceStatus } from "@/lib/cdfms/extra-data";
import { constituencyById } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const STATUS_PILL_MAP: Record<GrievanceStatus, "submitted" | "under_review" | "ongoing" | "complete" | "stalled"> = {
  logged: "submitted",
  in_review: "under_review",
  in_resolution: "ongoing",
  resolved: "complete",
  escalated: "stalled",
};

const STATUS_LABEL: Record<GrievanceStatus, string> = {
  logged: "Logged",
  in_review: "In review",
  in_resolution: "In resolution",
  resolved: "Resolved",
  escalated: "Escalated",
};

const CATEGORY_COLORS: Record<string, string> = {
  service_quality: "#15803d",
  fund_misuse: "#dc2626",
  missing_beneficiary: "#f59e0b",
  delay: "#94a3b8",
  procurement: "#22c55e",
};

const CATEGORY_LABEL: Record<string, string> = {
  service_quality: "Service quality",
  fund_misuse: "Fund misuse",
  missing_beneficiary: "Missing beneficiary",
  delay: "Project delay",
  procurement: "Procurement",
};

export default function GrievancesPage() {
  const scope = useScope();
  const [grievances, setGrievances] = useState<Grievance[]>(GRIEVANCES);

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visible = useMemo(
    () => grievances.filter((g) => visibleIds.has(g.constituencyId)),
    [grievances, visibleIds]
  );

  const total = visible.length;
  const resolved = visible.filter((g) => g.status === "resolved").length;
  const open = total - resolved;
  const escalated = visible.filter((g) => g.status === "escalated").length;
  const resolutionRate = total ? (resolved / total) * 100 : 0;
  const avgDaysOpen = open
    ? visible.filter((g) => g.status !== "resolved").reduce((a, g) => a + g.daysOpen, 0) / open
    : 0;

  const tlFor = (pct: number): "green" | "yellow" | "red" => (pct >= 75 ? "green" : pct >= 50 ? "yellow" : "red");

  const byCategory = Object.keys(CATEGORY_LABEL).map((c) => ({
    name: CATEGORY_LABEL[c],
    value: visible.filter((g) => g.category === c).length,
    color: CATEGORY_COLORS[c],
  }));

  const byChannel = ["sms", "ussd", "in_person", "phone"].map((c) => ({
    name: c.charAt(0).toUpperCase() + c.slice(1).replace("_", " "),
    value: visible.filter((g) => g.channel === c).length,
  }));

  const canResolve = can(scope?.role, "resolve:grievance");
  const canLog = can(scope?.role, "log:grievance");
  const canExport = can(scope?.role, "export:reports");

  function resolveGrievance(id: string) {
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, status: "resolved", resolvedNote: "Resolved by officer action.", daysOpen: 0 }
          : g
      )
    );
  }

  function handleExport() {
    downloadCsv("CEFANET_grievances", visible, [
      { header: "ID", cell: (g) => g.id },
      { header: "Reference", cell: (g) => g.reference },
      { header: "Category", cell: (g) => CATEGORY_LABEL[g.category] },
      { header: "Constituency", cell: (g) => constituencyById(g.constituencyId)?.name ?? "" },
      { header: "Channel", cell: (g) => g.channel },
      { header: "Logged", cell: (g) => g.loggedAt },
      { header: "Status", cell: (g) => STATUS_LABEL[g.status] },
      { header: "Days open", cell: (g) => g.daysOpen },
      { header: "Summary", cell: (g) => g.summary },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Social Accountability
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Grievance & Redress Module</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Citizen grievances logged via SMS, USSD, phone or in person. Tracked end-to-end from
            intake to resolution with public status updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canLog ? (
            <button className="inline-flex items-center gap-2 rounded-lg border border-ministry-300 bg-ministry-50 text-ministry-700 px-3 py-2 text-sm hover:bg-ministry-100 font-semibold">
              <PlusCircle className="h-4 w-4" />
              Log grievance
            </button>
          ) : null}
          {canExport ? (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50 shadow-sm"
            >
              <Download className="h-4 w-4 text-ministry-700" /> Export Excel
            </button>
          ) : null}
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Total grievances" value={`${total}`} icon={<MessageSquareWarning className="h-4 w-4" />} />
        <KPIcard label="Resolution rate" value={`${resolutionRate.toFixed(0)}%`} trafficLight={tlFor(resolutionRate)} hint={`${resolved} of ${total} resolved`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <KPIcard label="Avg days open" value={`${avgDaysOpen.toFixed(0)}d`} trafficLight={avgDaysOpen <= 14 ? "green" : avgDaysOpen <= 30 ? "yellow" : "red"} hint="Of unresolved cases" icon={<Clock className="h-4 w-4" />} />
        <KPIcard label="Escalated" value={`${escalated}`} tone={escalated > 0 ? "danger" : "neutral"} hint="Awaiting senior review" icon={<AlertOctagon className="h-4 w-4" />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MCard>
          <SectionTitle eyebrow="Mix" title="By category" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {byCategory.map((d, i) => (
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
          <SectionTitle eyebrow="Intake" title="Submission channels" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byChannel}>
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
        <SectionTitle eyebrow="Cases" title={`Grievances · ${visible.length}`} />
        <DataTable
          rows={visible}
          columns={[
            { header: "Reference", cell: (g) => <span className="font-mono text-xs text-ink-700">{g.reference}</span> },
            { header: "Category", cell: (g) => <span className="inline-flex items-center gap-1.5 text-xs text-ink-700"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[g.category] }} />{CATEGORY_LABEL[g.category]}</span> },
            {
              header: "Summary",
              cell: (g) => (
                <div>
                  <div className="font-medium text-ink-900">{g.summary}</div>
                  <div className="text-[11px] text-ink-500">{constituencyById(g.constituencyId)?.name} · via {g.channel}</div>
                </div>
              ),
            },
            { header: "Logged", cell: (g) => <span className="text-xs text-ink-500">{g.loggedAt}</span> },
            { header: "Days open", cell: (g) => <span className={g.daysOpen > 21 ? "text-red-600 font-semibold" : "text-ink-700"}>{g.daysOpen === 0 && g.status === "resolved" ? "—" : g.daysOpen + "d"}</span> },
            { header: "Status", cell: (g) => <StatusPill status={STATUS_PILL_MAP[g.status]} /> },
            {
              header: "Action",
              cell: (g) =>
                g.status !== "resolved" && canResolve ? (
                  <button
                    onClick={() => resolveGrievance(g.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-ministry-600 text-white text-xs px-2 py-1 hover:bg-ministry-700"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Resolve
                  </button>
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
