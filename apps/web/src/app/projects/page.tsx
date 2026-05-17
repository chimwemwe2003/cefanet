"use client";

import { useState, useMemo } from "react";
import { HardHat, MapPin, CircleCheckBig, AlertOctagon, Camera, ExternalLink, Download } from "lucide-react";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill, ProgressBar } from "@/components/cdfms/ui";
import { INFRA_PROJECTS, constituencyById, ZMW, ZMW_FULL, type InfraProject } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

export default function ProjectsPage() {
  const scope = useScope();
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<InfraProject | null>(null);

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visibleProjects = useMemo(
    () => INFRA_PROJECTS.filter((p) => visibleIds.has(p.constituencyId)),
    [visibleIds]
  );

  const filtered = useMemo(
    () =>
      visibleProjects
        .filter((p) => (category ? p.category === category : true))
        .filter((p) => (status ? p.status === status : true)),
    [visibleProjects, category, status]
  );

  const completeCount = visibleProjects.filter((p) => p.status === "complete").length;
  const stalledCount = visibleProjects.filter((p) => p.status === "stalled").length;
  const totalBudget = visibleProjects.reduce((a, p) => a + p.budget, 0);
  const totalSpend = visibleProjects.reduce((a, p) => a + p.spend, 0);

  const canExport = can(scope?.role, "export:reports");
  const canEdit = can(scope?.role, "edit:projects");

  function handleExport() {
    downloadCsv("CDF-MS_projects", visibleProjects, [
      { header: "ID", cell: (p) => p.id },
      { header: "Project", cell: (p) => p.name },
      { header: "Constituency", cell: (p) => constituencyById(p.constituencyId)?.name ?? "" },
      { header: "Province", cell: (p) => constituencyById(p.constituencyId)?.province ?? "" },
      { header: "Category", cell: (p) => p.category },
      { header: "Status", cell: (p) => p.status },
      { header: "Budget (ZMW)", cell: (p) => p.budget },
      { header: "Spend (ZMW)", cell: (p) => p.spend },
      { header: "Completion %", cell: (p) => p.completionPct },
      { header: "Contractor", cell: (p) => p.contractor },
      { header: "Start date", cell: (p) => p.startDate },
      { header: "End date", cell: (p) => p.endDate },
      { header: "Milestones done", cell: (p) => p.milestonesDone },
      { header: "Milestones total", cell: (p) => p.milestonesTotal },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Public Works
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Infrastructure &amp; Community Projects</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Project registry with GPS, contractor management, milestone payments and on-site photo
            verification.
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
        <KPIcard label="Projects" value={`${visibleProjects.length}`} icon={<HardHat className="h-4 w-4" />} hint="All categories" />
        <KPIcard label="Completed" value={`${completeCount}`} tone="positive" icon={<CircleCheckBig className="h-4 w-4" />} hint="100% delivered" />
        <KPIcard label="Stalled" value={`${stalledCount}`} tone="danger" icon={<AlertOctagon className="h-4 w-4" />} hint="Needs intervention" />
        <KPIcard label="Spend / budget" value={`${ZMW(totalSpend)} / ${ZMW(totalBudget)}`} tone="gold" hint={`${totalBudget ? ((totalSpend / totalBudget) * 100).toFixed(0) : "—"}% drawn`} />
      </section>

      <MCard>
        <SectionTitle eyebrow="Filter" title="Find projects" />
        <div className="flex flex-wrap gap-2">
          {["", "infrastructure", "education", "health", "water"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                category === c
                  ? "border-ministry-600 bg-ministry-50 text-ministry-700"
                  : "border-ink-200 hover:bg-ink-50 text-ink-700"
              }`}
            >
              {c === "" ? "All categories" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
          <div className="w-px bg-ink-200 mx-1" />
          {["", "planned", "ongoing", "complete", "stalled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                status === s
                  ? "border-ministry-600 bg-ministry-50 text-ministry-700"
                  : "border-ink-200 hover:bg-ink-50 text-ink-700"
              }`}
            >
              {s === "" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </MCard>

      <div>
        <SectionTitle eyebrow="Registry" title={`Projects · ${filtered.length}`} />
        <DataTable
          rows={filtered.slice(0, 50)}
          onRowClick={(p) => setSelected(p)}
          columns={[
            {
              header: "Project",
              cell: (p) => (
                <div>
                  <div className="font-medium text-ink-900">{p.name}</div>
                  <div className="text-[11px] text-ink-500">
                    {constituencyById(p.constituencyId)?.province} · {p.contractor}
                  </div>
                </div>
              ),
            },
            { header: "Category", cell: (p) => <span className="text-ink-700 capitalize">{p.category}</span> },
            { header: "Status", cell: (p) => <StatusPill status={p.status} /> },
            { header: "Budget", cell: (p) => <span className="text-ink-700">{ZMW(p.budget)}</span> },
            { header: "Spend", cell: (p) => <span className="font-semibold text-ministry-700">{ZMW(p.spend)}</span> },
            { header: "Milestones", cell: (p) => <span className="text-xs text-ink-700">{p.milestonesDone}/{p.milestonesTotal}</span> },
            {
              header: "Progress",
              cell: (p) => (
                <div className="w-28">
                  <ProgressBar value={p.completionPct} tone={p.status === "stalled" ? "danger" : "ministry"} />
                </div>
              ),
            },
          ]}
        />
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 bg-ink-900/60 flex items-end md:items-center justify-center p-3"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-ink-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ministry-700 font-semibold">Project detail</div>
                <div className="font-serif text-lg text-ink-900">{selected.name}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-ink-500 hover:text-ink-900">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-2">
                <StatusPill status={selected.status} />
                <span className="text-xs text-ink-500">
                  {constituencyById(selected.constituencyId)?.name},{" "}
                  {constituencyById(selected.constituencyId)?.province}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-ink-200 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">Budget</div>
                  <div className="font-serif text-lg text-ink-900">{ZMW_FULL(selected.budget)}</div>
                </div>
                <div className="rounded-lg border border-ink-200 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">Spent</div>
                  <div className="font-serif text-lg text-ministry-700">{ZMW_FULL(selected.spend)}</div>
                </div>
                <div className="rounded-lg border border-ink-200 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">Contractor</div>
                  <div className="text-sm text-ink-900">{selected.contractor}</div>
                </div>
                <div className="rounded-lg border border-ink-200 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">Window</div>
                  <div className="text-sm text-ink-900">
                    {selected.startDate} → {selected.endDate}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Milestone progress</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: selected.milestonesTotal }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full ${
                        i < selected.milestonesDone ? "bg-ministry-600" : "bg-ink-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  {selected.milestonesDone} of {selected.milestonesTotal} milestones signed off ·{" "}
                  {selected.completionPct}% physical completion
                </div>
              </div>

              <div className="rounded-lg border border-ink-200 bg-ink-50 p-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-500 mb-2">
                  <Camera className="h-3.5 w-3.5" /> Photo evidence
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["before", "during", "current"].map((stage) => (
                    <div
                      key={stage}
                      className="aspect-square bg-gradient-to-br from-ministry-200 to-ministry-400 rounded-lg flex items-center justify-center text-white text-xs font-semibold uppercase shadow"
                    >
                      {stage}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-ink-500 mt-2">
                  Photos are geotagged and timestamped — captured on site by accredited field officers.
                </div>
              </div>

              <div className="rounded-lg border border-ink-200 p-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-500 mb-1">
                  <MapPin className="h-3.5 w-3.5" /> GPS
                </div>
                <div className="text-sm font-mono text-ink-900">
                  {(constituencyById(selected.constituencyId)?.population ?? 0).toLocaleString()} residents in{" "}
                  {constituencyById(selected.constituencyId)?.district} District
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 text-sm text-ministry-700 font-semibold underline">
                  <ExternalLink className="h-3.5 w-3.5" /> Open full project file
                </button>
                {canEdit ? (
                  <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-ministry-700 text-white text-xs px-3 py-1.5 hover:bg-ministry-800">
                    Edit project
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
