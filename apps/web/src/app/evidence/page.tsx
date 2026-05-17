"use client";

import { useMemo, useState } from "react";
import { Camera, MapPin, CalendarDays, ShieldCheck, X, BadgeCheck, Upload } from "lucide-react";
import { KPIcard, MCard, SectionTitle } from "@/components/cdfms/ui";
import { EVIDENCE, type EvidenceItem } from "@/lib/cdfms/extra-data";
import { constituencyById } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { UploadZone, type UploadedItem } from "@/components/cdfms/upload-zone";

const STAGE_LABEL: Record<string, string> = {
  before: "Before",
  during: "During",
  current: "Current state",
  completion: "Completion",
};

export default function EvidencePage() {
  const scope = useScope();
  const [stageFilter, setStageFilter] = useState<string>("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<EvidenceItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedItem[]>([]);

  const canUpload = can(scope?.role, "submit:evidence") || can(scope?.role, "edit:projects");

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const filtered = useMemo(
    () =>
      EVIDENCE.filter((e) => visibleIds.has(e.constituencyId))
        .filter((e) => (stageFilter ? e.stage === stageFilter : true))
        .filter((e) => (verifiedOnly ? e.verified : true)),
    [visibleIds, stageFilter, verifiedOnly]
  );

  const total = filtered.length;
  const verified = filtered.filter((e) => e.verified).length;
  const verifiedPct = total ? (verified / total) * 100 : 0;
  const stages = ["before", "during", "current", "completion"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Social Accountability
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Evidence Hub</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Geotagged, timestamped photo evidence from CDFC officers and WDC field monitors.
            Verified samples feed into PAC reports and grievance investigations.
          </p>
        </div>
        {canUpload ? (
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-ministry-700 text-white px-3 py-2 text-sm font-semibold hover:bg-ministry-800 shadow-ministry"
          >
            <Upload className="h-4 w-4" />
            Upload evidence
          </button>
        ) : null}
      </div>

      {/* Freshly uploaded items */}
      {uploaded.length > 0 ? (
        <MCard>
          <SectionTitle eyebrow="Just uploaded" title={`New evidence this session · ${uploaded.length}`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {uploaded.map((u) => (
              <div key={u.id} className="rounded-xl overflow-hidden border border-ministry-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.dataUrl} alt={u.name} className="aspect-square w-full object-cover" />
                <div className="p-2 text-[10px] text-ink-500">
                  <div className="truncate text-ink-900 font-medium">{u.name}</div>
                  <div>
                    {u.width}×{u.height} ·{" "}
                    {u.storage === "firebase" ? (
                      <span className="text-emerald-700">stored</span>
                    ) : (
                      <span className="text-amber-700">demo only</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MCard>
      ) : null}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Photos in hub" value={`${total}`} icon={<Camera className="h-4 w-4" />} />
        <KPIcard label="Verified" value={`${verifiedPct.toFixed(0)}%`} trafficLight={verifiedPct >= 80 ? "green" : verifiedPct >= 60 ? "yellow" : "red"} hint={`${verified} of ${total}`} icon={<ShieldCheck className="h-4 w-4" />} />
        <KPIcard label="Constituencies" value={`${new Set(filtered.map((e) => e.constituencyId)).size}`} hint="With at least one photo" />
        <KPIcard label="Most recent" value={filtered.length ? filtered[0].capturedAt : "—"} hint="Last captured" />
      </section>

      <MCard>
        <SectionTitle eyebrow="Filter" title="Browse evidence" />
        <div className="flex flex-wrap gap-2">
          {["", ...stages].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStageFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                stageFilter === s
                  ? "border-ministry-600 bg-ministry-50 text-ministry-700"
                  : "border-ink-200 hover:bg-ink-50 text-ink-700"
              }`}
            >
              {s === "" ? "All stages" : STAGE_LABEL[s]}
            </button>
          ))}
          <div className="w-px bg-ink-200 mx-1" />
          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
              verifiedOnly
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-ink-200 hover:bg-ink-50 text-ink-700"
            }`}
          >
            {verifiedOnly ? "Verified only ✓" : "Show all"}
          </button>
        </div>
      </MCard>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.slice(0, 40).map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className="text-left group relative aspect-square rounded-xl overflow-hidden border border-ink-200 hover:ring-2 hover:ring-ministry-300 transition-all"
            style={{ background: `linear-gradient(135deg, ${e.tint}, #fff)` }}
          >
            <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent">
              <div className="text-white text-xs font-semibold leading-tight">{e.caption}</div>
              <div className="text-white/85 text-[10px]">{STAGE_LABEL[e.stage]} · {e.capturedAt}</div>
            </div>
            {e.verified ? (
              <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5">
                <BadgeCheck className="h-2.5 w-2.5" /> Verified
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 bg-ink-900/70 flex items-center justify-center p-3"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="aspect-video relative"
              style={{ background: `linear-gradient(135deg, ${selected.tint}, #fff)` }}
            >
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 bg-white/90 rounded-full h-8 w-8 inline-flex items-center justify-center hover:bg-white">
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-xs uppercase tracking-wider opacity-80">{STAGE_LABEL[selected.stage]}</div>
                <div className="font-serif text-2xl leading-tight">{selected.caption}</div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-ink-200 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-500">
                    <MapPin className="h-3 w-3" /> GPS
                  </div>
                  <div className="font-mono text-xs text-ink-900 mt-1">
                    {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
                  </div>
                  <div className="text-[11px] text-ink-500">{constituencyById(selected.constituencyId)?.name}</div>
                </div>
                <div className="rounded-lg border border-ink-200 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-500">
                    <CalendarDays className="h-3 w-3" /> Captured
                  </div>
                  <div className="text-sm text-ink-900 mt-1">{selected.capturedAt}</div>
                  <div className="text-[11px] text-ink-500">by {selected.submittedBy}</div>
                </div>
              </div>
              <div className="rounded-lg border border-ink-200 p-3 flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full text-[11px] font-semibold uppercase tracking-wider px-2 py-1 ${
                    selected.verified
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  }`}
                >
                  {selected.verified ? <BadgeCheck className="h-3 w-3" /> : null}
                  {selected.verified ? "Verified by CDFC" : "Pending verification"}
                </span>
                <span className="text-xs text-ink-500">Project ref: <span className="font-mono">{selected.projectId}</span></span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Upload modal */}
      {uploadOpen ? (
        <div
          className="fixed inset-0 z-50 bg-ink-900/60 flex items-end md:items-center justify-center p-3"
          onClick={() => setUploadOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-ink-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ministry-700 font-semibold">
                  Field evidence
                </div>
                <div className="font-serif text-lg text-ink-900">Upload photo evidence</div>
              </div>
              <button onClick={() => setUploadOpen(false)} className="text-ink-500 hover:text-ink-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <UploadZone
                pathPrefix="evidence"
                onUploaded={(item) => setUploaded((prev) => [item, ...prev])}
              />
              <p className="text-[11px] text-ink-500 mt-4 leading-relaxed">
                Photos are compressed in your browser before upload to reduce mobile data use.
                When Firebase Storage is connected, files are stored and shared; otherwise this
                runs in demo mode (local preview only).
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
