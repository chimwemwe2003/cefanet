"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Users, MessageSquareQuote, Download, PlusCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, RadarChart, PolarAngleAxis, PolarGrid, Radar, PolarRadiusAxis } from "recharts";
import { KPIcard, MCard, SectionTitle, DataTable } from "@/components/cdfms/ui";
import { SCORECARDS, type Scorecard } from "@/lib/cdfms/extra-data";
import { constituencyById } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

export default function ScorecardsPage() {
  const scope = useScope();
  const [selected, setSelected] = useState<Scorecard | null>(null);

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visible = useMemo(() => SCORECARDS.filter((s) => visibleIds.has(s.constituencyId)), [visibleIds]);

  const totalScorecards = visible.length;
  const totalParticipants = visible.reduce((a, s) => a + s.participants, 0);
  const avgComposite = totalScorecards ? visible.reduce((a, s) => a + s.composite, 0) / totalScorecards : 0;
  const lowScore = visible.filter((s) => s.composite < 60).length;

  const tlFor = (pct: number): "green" | "yellow" | "red" => (pct >= 75 ? "green" : pct >= 60 ? "yellow" : "red");

  // Dimensional averages
  const dimAverages = {
    access: visible.reduce((a, s) => a + s.scores.access, 0) / Math.max(1, totalScorecards),
    quality: visible.reduce((a, s) => a + s.scores.quality, 0) / Math.max(1, totalScorecards),
    provider_behaviour: visible.reduce((a, s) => a + s.scores.provider_behaviour, 0) / Math.max(1, totalScorecards),
    satisfaction: visible.reduce((a, s) => a + s.scores.satisfaction, 0) / Math.max(1, totalScorecards),
  };

  const radarData = [
    { dimension: "Access", value: Math.round(dimAverages.access) },
    { dimension: "Quality", value: Math.round(dimAverages.quality) },
    { dimension: "Provider behaviour", value: Math.round(dimAverages.provider_behaviour) },
    { dimension: "Satisfaction", value: Math.round(dimAverages.satisfaction) },
  ];

  const byCategory = ["health", "education", "infrastructure"].map((c) => ({
    name: c.charAt(0).toUpperCase() + c.slice(1),
    avg: Math.round(
      visible.filter((s) => s.category === c).reduce((a, s) => a + s.composite, 0) /
        Math.max(1, visible.filter((s) => s.category === c).length)
    ),
    count: visible.filter((s) => s.category === c).length,
  }));

  const canExport = can(scope?.role, "export:reports");
  const canSubmit = can(scope?.role, "submit:scorecard");

  function handleExport() {
    downloadCsv("CEFANET_scorecards", visible, [
      { header: "ID", cell: (s) => s.id },
      { header: "Facility", cell: (s) => s.facilityName },
      { header: "Category", cell: (s) => s.category },
      { header: "Constituency", cell: (s) => constituencyById(s.constituencyId)?.name ?? "" },
      { header: "Submitted by", cell: (s) => s.submittedBy },
      { header: "Submitted at", cell: (s) => s.submittedAt },
      { header: "Participants", cell: (s) => s.participants },
      { header: "Access", cell: (s) => s.scores.access },
      { header: "Quality", cell: (s) => s.scores.quality },
      { header: "Provider behaviour", cell: (s) => s.scores.provider_behaviour },
      { header: "Satisfaction", cell: (s) => s.scores.satisfaction },
      { header: "Composite", cell: (s) => s.composite },
      { header: "Narrative", cell: (s) => s.narrative },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Social Accountability
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Community Scorecards</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Ward-level community assessments of CDF-funded facilities along four dimensions:
            access, quality, provider behaviour and satisfaction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canSubmit ? (
            <button className="inline-flex items-center gap-2 rounded-lg border border-ministry-300 bg-ministry-50 text-ministry-700 px-3 py-2 text-sm hover:bg-ministry-100 font-semibold">
              <PlusCircle className="h-4 w-4" />
              Submit scorecard
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
        <KPIcard label="Scorecards filed" value={`${totalScorecards}`} icon={<ClipboardList className="h-4 w-4" />} />
        <KPIcard label="Community participants" value={totalParticipants.toLocaleString("en-ZM")} icon={<Users className="h-4 w-4" />} tone="positive" hint="Across all sessions" />
        <KPIcard label="Avg composite" value={`${avgComposite.toFixed(0)}/100`} trafficLight={tlFor(avgComposite)} hint="All dimensions" />
        <KPIcard label="Below threshold" value={`${lowScore}`} tone={lowScore > 0 ? "warning" : "neutral"} hint="< 60 composite" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MCard>
          <SectionTitle eyebrow="Dimensions" title="Average score across all scorecards" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={90}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Score" dataKey="value" stroke="#15803d" fill="#22c55e" fillOpacity={0.45} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </MCard>
        <MCard>
          <SectionTitle eyebrow="By sector" title="Composite score per category" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {byCategory.map((d, i) => (
                    <Cell key={i} fill={d.avg >= 75 ? "#15803d" : d.avg >= 60 ? "#f59e0b" : "#dc2626"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MCard>
      </section>

      <div>
        <SectionTitle eyebrow="Recent submissions" title={`Community scorecards · ${visible.length}`} />
        <DataTable
          rows={visible.slice(0, 40)}
          onRowClick={(s) => setSelected(s)}
          columns={[
            { header: "ID", cell: (s) => <span className="font-mono text-xs">{s.id}</span> },
            {
              header: "Facility",
              cell: (s) => (
                <div>
                  <div className="font-medium text-ink-900">{s.facilityName}</div>
                  <div className="text-[11px] text-ink-500">{constituencyById(s.constituencyId)?.name}</div>
                </div>
              ),
            },
            { header: "Category", cell: (s) => <span className="capitalize text-ink-700">{s.category}</span> },
            { header: "Filed by", cell: (s) => <span className="text-ink-700 text-xs">{s.submittedBy} · {s.submittedAt}</span> },
            { header: "Participants", cell: (s) => <span className="text-ink-700">{s.participants}</span> },
            {
              header: "Composite",
              cell: (s) => (
                <span className={`text-sm font-semibold ${s.composite >= 75 ? "text-emerald-700" : s.composite >= 60 ? "text-amber-700" : "text-red-700"}`}>
                  {s.composite}
                </span>
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
            className="bg-white rounded-2xl w-full max-w-xl max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-ink-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ministry-700 font-semibold">Scorecard detail</div>
                <div className="font-serif text-lg text-ink-900">{selected.facilityName}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-ink-500 hover:text-ink-900">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(selected.scores) as Array<keyof typeof selected.scores>).map((dim) => {
                  const v = selected.scores[dim];
                  return (
                    <div key={dim} className="rounded-lg border border-ink-200 p-3">
                      <div className="text-[11px] uppercase tracking-wider text-ink-500 capitalize">
                        {dim.replace("_", " ")}
                      </div>
                      <div className={`font-serif text-2xl mt-1 ${v >= 75 ? "text-emerald-700" : v >= 60 ? "text-amber-700" : "text-red-700"}`}>
                        {v}
                      </div>
                      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mt-1.5">
                        <div className="h-full bg-ministry-600 rounded-full" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-500 mb-1">
                  <MessageSquareQuote className="h-3.5 w-3.5" /> Community narrative
                </div>
                <p className="text-sm text-ink-700 italic">"{selected.narrative}"</p>
              </div>
              <div className="text-xs text-ink-500">
                Filed by <strong>{selected.submittedBy}</strong> on {selected.submittedAt} · {selected.participants} community participants
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
