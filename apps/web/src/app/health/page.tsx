"use client";

import { useMemo } from "react";
import { HeartPulse, Droplet, Zap, Pill, Stethoscope, Baby, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Legend } from "recharts";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill } from "@/components/cdfms/ui";
import { HEALTH_FACILITIES, HEALTH_TOTALS } from "@/lib/cdfms/extra-data";
import { constituencyById } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const STATUS_PILL_MAP: Record<string, "complete" | "ongoing" | "stalled" | "planned"> = {
  operational: "complete",
  partial: "ongoing",
  non_operational: "stalled",
  under_construction: "planned",
};

const STATUS_LABEL: Record<string, string> = {
  operational: "Operational",
  partial: "Partially operational",
  non_operational: "Non-operational",
  under_construction: "Under construction",
};

export default function HealthPage() {
  const scope = useScope();
  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visible = useMemo(
    () => HEALTH_FACILITIES.filter((f) => visibleIds.has(f.constituencyId)),
    [visibleIds]
  );

  const operational = visible.filter((f) => f.status === "operational").length;
  const operationalPct = visible.length ? (operational / visible.length) * 100 : 0;
  const avgDrug = visible.length ? visible.reduce((a, f) => a + f.drugAvailabilityPct, 0) / visible.length : 0;
  const totalPatients = visible.reduce((a, f) => a + f.patientsServedYTD, 0);
  const ancFacilities = visible.filter((f) => f.ancCoveragePct > 0);
  const avgANC = ancFacilities.length ? ancFacilities.reduce((a, f) => a + f.ancCoveragePct, 0) / ancFacilities.length : 0;
  const immunFacilities = visible.filter((f) => f.immunisationPct > 0);
  const avgImmun = immunFacilities.length ? immunFacilities.reduce((a, f) => a + f.immunisationPct, 0) / immunFacilities.length : 0;
  const waterPct = visible.length ? (visible.filter((f) => f.hasWater).length / visible.length) * 100 : 0;
  const elecPct = visible.length ? (visible.filter((f) => f.hasElectricity).length / visible.length) * 100 : 0;

  const tlFor = (pct: number): "green" | "yellow" | "red" => (pct >= 75 ? "green" : pct >= 50 ? "yellow" : "red");

  const byTypeData = ["clinic", "health_post", "maternity_shelter", "borehole", "staff_housing"].map((t) => ({
    name: t.replace("_", " "),
    value: visible.filter((f) => f.type === t).length,
  }));

  const facilityStatusData = ["operational", "partial", "non_operational", "under_construction"].map((s) => ({
    name: STATUS_LABEL[s],
    value: visible.filter((f) => f.status === s).length,
    color:
      s === "operational"
        ? "#15803d"
        : s === "partial"
        ? "#f59e0b"
        : s === "non_operational"
        ? "#dc2626"
        : "#94a3b8",
  }));

  const canExport = can(scope?.role, "export:reports");

  function handleExport() {
    downloadCsv("CEFANET_health_facilities", visible, [
      { header: "ID", cell: (f) => f.id },
      { header: "Facility", cell: (f) => f.name },
      { header: "Type", cell: (f) => f.type },
      { header: "Constituency", cell: (f) => constituencyById(f.constituencyId)?.name ?? "" },
      { header: "Status", cell: (f) => f.status },
      { header: "Water", cell: (f) => (f.hasWater ? "Yes" : "No") },
      { header: "Electricity", cell: (f) => (f.hasElectricity ? "Yes" : "No") },
      { header: "Drug availability %", cell: (f) => f.drugAvailabilityPct },
      { header: "Staff on post", cell: (f) => f.staffOnPost },
      { header: "Staff established", cell: (f) => f.staffEstablished },
      { header: "Patients served YTD", cell: (f) => f.patientsServedYTD },
      { header: "ANC coverage %", cell: (f) => f.ancCoveragePct },
      { header: "Immunisation %", cell: (f) => f.immunisationPct },
      { header: "Satisfaction (0-100)", cell: (f) => f.satisfactionScore },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Health Initiatives
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Health Initiatives Monitoring</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Clinics, health posts, boreholes, maternity shelters and staff housing funded under
            CDF. Functionality, drug availability, service delivery and equity tracked monthly.
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
        <KPIcard
          label="Facilities tracked"
          value={`${visible.length}`}
          hint={`${visibleConsts.length} constituencies`}
          icon={<HeartPulse className="h-4 w-4" />}
        />
        <KPIcard
          label="Operational"
          value={`${operationalPct.toFixed(0)}%`}
          hint={`${operational} of ${visible.length}`}
          trafficLight={tlFor(operationalPct)}
          icon={<Stethoscope className="h-4 w-4" />}
        />
        <KPIcard
          label="Drug availability"
          value={`${avgDrug.toFixed(0)}%`}
          hint="Avg across facilities"
          trafficLight={tlFor(avgDrug)}
          icon={<Pill className="h-4 w-4" />}
        />
        <KPIcard
          label="Patients served YTD"
          value={totalPatients.toLocaleString("en-ZM")}
          hint="OPD + maternal + child"
          tone="positive"
        />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="ANC coverage" value={`${avgANC.toFixed(0)}%`} trafficLight={tlFor(avgANC)} hint="Antenatal care visits" icon={<Baby className="h-4 w-4" />} />
        <KPIcard label="Immunisation" value={`${avgImmun.toFixed(0)}%`} trafficLight={tlFor(avgImmun)} hint="Under-5 coverage" />
        <KPIcard label="Water access" value={`${waterPct.toFixed(0)}%`} trafficLight={tlFor(waterPct)} hint="Facilities with water" icon={<Droplet className="h-4 w-4" />} />
        <KPIcard label="Electrified" value={`${elecPct.toFixed(0)}%`} trafficLight={tlFor(elecPct)} hint="Facilities on grid / solar" icon={<Zap className="h-4 w-4" />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MCard>
          <SectionTitle eyebrow="Mix" title="Facility status" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={facilityStatusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {facilityStatusData.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MCard>
        <MCard>
          <SectionTitle eyebrow="Coverage" title="Facilities by type" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MCard>
      </section>

      <div>
        <SectionTitle eyebrow="Registry" title={`Health facilities · ${visible.length}`} />
        <DataTable
          rows={visible.slice(0, 60)}
          columns={[
            {
              header: "Facility",
              cell: (f) => (
                <div>
                  <div className="font-medium text-ink-900">{f.name}</div>
                  <div className="text-[11px] text-ink-500">{constituencyById(f.constituencyId)?.name}</div>
                </div>
              ),
            },
            { header: "Type", cell: (f) => <span className="capitalize text-ink-700">{f.type.replace("_", " ")}</span> },
            { header: "Status", cell: (f) => <StatusPill status={STATUS_PILL_MAP[f.status]} /> },
            {
              header: "Utilities",
              cell: (f) => (
                <span className="text-xs text-ink-700">
                  {f.hasWater ? "💧 " : "—  "}
                  {f.hasElectricity ? "⚡" : "—"}
                </span>
              ),
            },
            { header: "Drugs", cell: (f) => <span className={f.drugAvailabilityPct >= 75 ? "text-emerald-700 font-semibold" : f.drugAvailabilityPct >= 50 ? "text-amber-700 font-semibold" : "text-red-700 font-semibold"}>{f.drugAvailabilityPct}%</span> },
            { header: "Staff", cell: (f) => <span className="text-ink-700 text-xs">{f.staffOnPost}/{f.staffEstablished}</span> },
            { header: "Patients YTD", cell: (f) => <span className="text-ink-700">{f.patientsServedYTD.toLocaleString("en-ZM")}</span>, className: "text-right" },
            { header: "Satisfaction", cell: (f) => <span className="text-ministry-700 font-semibold">{f.satisfactionScore}</span> },
          ]}
        />
      </div>
    </div>
  );
}
