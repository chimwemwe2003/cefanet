"use client";

import { useMemo, useState } from "react";
import {
  FormInput,
  Smartphone,
  MessageSquare,
  Wifi,
  WifiOff,
  Camera,
  Languages,
  Image as ImageIcon,
  MapPin,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Download,
  TrendingUp,
  X,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { KPIcard, MCard, SectionTitle, DataTable, StatusPill } from "@/components/cdfms/ui";
import { KOBO_TOTALS, type KoboForm } from "@/lib/cdfms/kobo-data";
import { useKoboForms, useKoboSubmissions } from "@/lib/cdfms/use-kobo";
import { constituencyById } from "@/lib/cdfms/data";
import { useScope } from "@/lib/cdfms/store";
import { scopedConstituencies, can } from "@/lib/cdfms/rbac";
import { downloadCsv } from "@/lib/cdfms/export";

const CHANNEL_LABEL: Record<string, string> = {
  mobile: "Mobile",
  web: "Web",
  ussd: "USSD",
  sms: "SMS",
  paper: "Paper",
};

const CHANNEL_ICON: Record<string, typeof Smartphone> = {
  mobile: Smartphone,
  web: Wifi,
  ussd: MessageSquare,
  sms: MessageSquare,
  paper: FormInput,
};

const CATEGORY_TONE: Record<KoboForm["category"], string> = {
  project: "bg-blue-50 text-blue-700 ring-blue-200",
  scorecard: "bg-ministry-50 text-ministry-700 ring-ministry-200",
  grievance: "bg-amber-50 text-amber-700 ring-amber-200",
  bursary: "bg-violet-50 text-violet-700 ring-violet-200",
  health: "bg-pink-50 text-pink-700 ring-pink-200",
  audit: "bg-slate-100 text-slate-700 ring-slate-200",
};

function QrPlaceholder({ size = 64 }: { size?: number }) {
  // Deterministic pseudo-QR pattern (placeholder; real QR generated server-side in prod)
  const cells = 9;
  const c = Array.from({ length: cells * cells }, (_, i) => (((i * 7) ^ (i >> 1)) % 3) === 0);
  // ensure finder squares
  const finders = new Set([0, cells - 1, cells * (cells - 1)]);
  return (
    <div
      className="grid bg-white border border-ink-200 rounded-md p-1.5"
      style={{ gridTemplateColumns: `repeat(${cells}, 1fr)`, width: size, height: size }}
    >
      {c.map((on, i) => {
        const isFinder = finders.has(i);
        return (
          <div
            key={i}
            className={isFinder ? "bg-ink-900" : on ? "bg-ink-900" : "bg-transparent"}
            style={{ width: "100%", aspectRatio: "1" }}
          />
        );
      })}
    </div>
  );
}

export default function FormsPage() {
  const scope = useScope();
  const [selected, setSelected] = useState<KoboForm | null>(null);

  const formsQ = useKoboForms();
  const subsQ = useKoboSubmissions(100);

  const koboForms = formsQ.data?.forms ?? [];
  const koboSubs = subsQ.data?.submissions ?? [];
  const isLive = Boolean(formsQ.data?.live || subsQ.data?.live);

  const visibleConsts = useMemo(() => scopedConstituencies(scope), [scope]);
  const visibleIds = useMemo(() => new Set(visibleConsts.map((c) => c.id)), [visibleConsts]);

  const visibleSubs = useMemo(
    () => koboSubs.filter((s) => visibleIds.has(s.constituencyId)),
    [visibleIds, koboSubs]
  );

  const canSubmit = can(scope?.role, "submit:kobo_form");
  const canExport = can(scope?.role, "export:reports");

  function handleExport() {
    downloadCsv("CEFANET_kobo_submissions", visibleSubs, [
      { header: "ID", cell: (s) => s.id },
      { header: "Form", cell: (s) => s.formTitle },
      { header: "Category", cell: (s) => s.formCategory },
      { header: "Submitted by", cell: (s) => s.submittedBy },
      { header: "Channel", cell: (s) => s.channel },
      { header: "Language", cell: (s) => s.language },
      { header: "Constituency", cell: (s) => constituencyById(s.constituencyId)?.name ?? "" },
      { header: "Submitted at", cell: (s) => s.submittedAt },
      { header: "Photo attached", cell: (s) => (s.hasPhoto ? "Yes" : "No") },
      { header: "GPS captured", cell: (s) => (s.hasGps ? "Yes" : "No") },
      { header: "Validated", cell: (s) => (s.validated ? "Yes" : "No") },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Field Data Collection · KoboToolbox
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 normal-case tracking-normal text-[10px] font-semibold ring-1 ${
                isLive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isLive ? "Live Kobo data" : "Demo data"}
            </span>
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">Field Forms</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Standardised data-capture forms used by WDC monitors, CDFC officers and health
            inspectors. Forms work offline on Android, sync when connectivity returns, and capture
            geotagged photos for evidence.
          </p>
        </div>
        {canExport ? (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50 shadow-sm"
          >
            <Download className="h-4 w-4 text-ministry-700" /> Export submissions
          </button>
        ) : null}
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Forms deployed" value={`${KOBO_TOTALS.forms}`} icon={<FormInput className="h-4 w-4" />} />
        <KPIcard
          label="Total submissions"
          value={KOBO_TOTALS.totalSubmissions.toLocaleString("en-ZM")}
          tone="positive"
          hint="All-time across all forms"
          trafficLight="green"
        />
        <KPIcard
          label="Captured offline"
          value={`${((KOBO_TOTALS.offlineSubmissions / KOBO_TOTALS.totalSubmissions) * 100).toFixed(0)}%`}
          hint="Filled without connectivity"
          icon={<WifiOff className="h-4 w-4" />}
          tone="gold"
        />
        <KPIcard
          label="Languages"
          value={`${KOBO_TOTALS.languages}`}
          hint="EN + 4 local languages"
          icon={<Languages className="h-4 w-4" />}
        />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Field officers" value={KOBO_TOTALS.activeFieldOfficers.toLocaleString("en-ZM")} hint="Active in last 30 days" tone="neutral" />
        <KPIcard label="With photos" value={`${((KOBO_TOTALS.photoSubmissions / KOBO_TOTALS.totalSubmissions) * 100).toFixed(0)}%`} hint="Submissions with photo evidence" icon={<ImageIcon className="h-4 w-4" />} trafficLight="green" />
        <KPIcard label="Channels" value="5" hint="Mobile · Web · USSD · SMS · Paper" />
        <KPIcard label="Validation rate" value="94%" hint="Auto-validated on submit" trafficLight="green" />
      </section>

      {/* Integration architecture */}
      <MCard>
        <SectionTitle
          eyebrow="Data flow"
          title="From the field to the dashboard"
          description="Submissions flow through KoboToolbox into the CEFANET CDF-MS data warehouse, then surface in dashboards and reports within minutes."
        />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">
          {[
            { icon: Smartphone, label: "WDC tablet / phone", caption: "Kobo Collect app · offline-capable" },
            { icon: WifiOff, label: "Offline cache", caption: "Stores until connectivity returns" },
            { icon: Wifi, label: "Kobo server", caption: "Receives + validates + stores" },
            { icon: TrendingUp, label: "Sync worker", caption: "Pulls every 15 min via API" },
            { icon: CheckCircle2, label: "CDF-MS dashboard", caption: "Reflected in real-time" },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="relative rounded-xl border border-ink-200 bg-white p-3 text-center">
                <div className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-ministry-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <Icon className="h-6 w-6 text-ministry-700 mx-auto mt-1" />
                <div className="font-semibold text-sm text-ink-900 mt-2">{step.label}</div>
                <div className="text-[11px] text-ink-500 mt-0.5 leading-tight">{step.caption}</div>
              </div>
            );
          })}
        </div>
      </MCard>

      {/* Form library */}
      <div>
        <SectionTitle
          eyebrow="Form library"
          title={`${koboForms.length} active forms`}
          description="Click any form to preview its questions and scan QR for field deployment."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {koboForms.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className="text-left rounded-xl border border-ink-200 bg-white p-4 hover:border-ministry-300 hover:shadow-ministry-lg transition-all"
            >
              <div className="flex items-start gap-3">
                <QrPlaceholder size={64} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${CATEGORY_TONE[f.category]}`}>
                      {f.category}
                    </span>
                    <span className="text-[10px] text-ink-500 font-mono">{f.id}</span>
                  </div>
                  <div className="font-serif text-base text-ink-900 mt-1 leading-tight">
                    {f.title}
                  </div>
                  <div className="text-xs text-ink-500 mt-1 leading-snug">{f.description}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <div className="text-ink-500 uppercase tracking-wider text-[9px]">Questions</div>
                  <div className="font-semibold text-ink-900">{f.questionCount}</div>
                </div>
                <div>
                  <div className="text-ink-500 uppercase tracking-wider text-[9px]">Submissions</div>
                  <div className="font-semibold text-ministry-700">
                    {f.submissions.toLocaleString("en-ZM")}
                  </div>
                </div>
                <div>
                  <div className="text-ink-500 uppercase tracking-wider text-[9px]">Languages</div>
                  <div className="font-semibold text-ink-900">{f.languages.join(" · ")}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                {f.channels.map((c) => {
                  const Icon = CHANNEL_ICON[c];
                  return (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-ink-50 text-ink-700 text-[10px] font-medium px-2 py-0.5"
                    >
                      <Icon className="h-3 w-3" /> {CHANNEL_LABEL[c]}
                    </span>
                  );
                })}
                {f.hasPhotoCapture ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-200 text-[10px] font-medium px-2 py-0.5">
                    <Camera className="h-3 w-3" /> Photo
                  </span>
                ) : null}
                {f.hasGps ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 text-[10px] font-medium px-2 py-0.5">
                    <MapPin className="h-3 w-3" /> GPS
                  </span>
                ) : null}
              </div>

              {/* 30-day submission trend */}
              <div className="mt-3 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={f.trend.map((v, i) => ({ d: i + 1, v }))}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#15803d"
                      strokeWidth={1.8}
                      dot={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 11, padding: "4px 8px" }}
                      labelFormatter={(d) => `Day ${d}`}
                      formatter={(v: number) => [`${v} submissions`, ""]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      <div>
        <SectionTitle
          eyebrow="Live feed"
          title={`Recent submissions · ${visibleSubs.length}`}
          description="Most recent form submissions across your scope."
        />
        <DataTable
          rows={visibleSubs.slice(0, 30)}
          columns={[
            {
              header: "Form",
              cell: (s) => (
                <div>
                  <div className="font-medium text-ink-900">{s.formTitle}</div>
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider">{s.formCategory}</div>
                </div>
              ),
            },
            {
              header: "Submitted",
              cell: (s) => (
                <div>
                  <div className="text-ink-700 font-mono text-xs">{s.submittedAt.replace("T", " ").replace("Z", " UTC")}</div>
                  <div className="text-[11px] text-ink-500">by {s.submittedBy}</div>
                </div>
              ),
            },
            {
              header: "Channel",
              cell: (s) => {
                const Icon = CHANNEL_ICON[s.channel];
                return (
                  <span className="inline-flex items-center gap-1 text-xs text-ink-700">
                    <Icon className="h-3 w-3" /> {CHANNEL_LABEL[s.channel]}
                  </span>
                );
              },
            },
            { header: "Lang", cell: (s) => <span className="text-xs text-ink-700">{s.language}</span> },
            { header: "Constituency", cell: (s) => <span className="text-ink-700">{constituencyById(s.constituencyId)?.name}</span> },
            {
              header: "Evidence",
              cell: (s) => (
                <div className="flex gap-1.5">
                  {s.hasPhoto ? <Camera className="h-3.5 w-3.5 text-gold-600" /> : null}
                  {s.hasGps ? <MapPin className="h-3.5 w-3.5 text-blue-600" /> : null}
                </div>
              ),
            },
            {
              header: "Validated",
              cell: (s) =>
                s.validated ? (
                  <StatusPill status="complete" />
                ) : (
                  <StatusPill status="under_review" />
                ),
            },
          ]}
        />
      </div>

      {/* Form detail modal */}
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
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-ministry-700 font-semibold">
                  Field form preview
                </div>
                <div className="font-serif text-lg text-ink-900">{selected.title}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-ink-500 hover:text-ink-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-sm text-ink-700">{selected.description}</p>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-ink-200 p-2.5">
                  <div className="text-ink-500 uppercase tracking-wider text-[9px]">Asset UID</div>
                  <div className="font-mono text-[10px] text-ink-900 mt-0.5 break-all">{selected.uid}</div>
                </div>
                <div className="rounded-lg border border-ink-200 p-2.5">
                  <div className="text-ink-500 uppercase tracking-wider text-[9px]">Questions</div>
                  <div className="font-serif text-base text-ink-900 mt-0.5">{selected.questionCount}</div>
                </div>
                <div className="rounded-lg border border-ink-200 p-2.5">
                  <div className="text-ink-500 uppercase tracking-wider text-[9px]">Submissions</div>
                  <div className="font-serif text-base text-ministry-700 mt-0.5">{selected.submissions.toLocaleString("en-ZM")}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <QrPlaceholder size={96} />
                <div className="flex-1 text-xs">
                  <div className="text-[11px] uppercase tracking-wider text-ministry-700 font-semibold mb-1 flex items-center gap-1">
                    <QrCode className="h-3 w-3" /> Field deployment
                  </div>
                  <p className="text-ink-700 leading-snug">
                    Field officers scan this QR with the KoboCollect Android app to download the
                    form. Works once offline. Submissions sync when back online.
                  </p>
                  <a className="inline-flex items-center gap-1 text-ministry-700 underline font-medium mt-2">
                    <ExternalLink className="h-3 w-3" /> Open form on kf.kobotoolbox.org
                  </a>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                  Sample questions
                </div>
                <ol className="space-y-1.5">
                  {selected.preview.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="h-5 w-5 rounded bg-ministry-50 text-ministry-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-ink-900">{q.label}</div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-500">{q.type}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="text-[11px] text-ink-500 mt-2">
                  Showing {selected.preview.length} of {selected.questionCount} questions.
                </div>
              </div>

              <div className="rounded-lg border border-ink-200 bg-ink-50 p-3 text-xs">
                <div className="text-[11px] uppercase tracking-wider text-ministry-700 font-semibold mb-1">
                  Validation rules
                </div>
                <ul className="space-y-0.5 text-ink-700">
                  {selected.validations.map((v) => (
                    <li key={v}>· {v}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="text-ink-500 mr-1">Channels:</span>
                {selected.channels.map((c) => {
                  const Icon = CHANNEL_ICON[c];
                  return (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-ink-50 text-ink-700 text-[10px] font-medium px-2 py-0.5"
                    >
                      <Icon className="h-3 w-3" /> {CHANNEL_LABEL[c]}
                    </span>
                  );
                })}
              </div>

              {canSubmit ? (
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-ministry-700 text-white text-sm font-semibold py-2.5 hover:bg-ministry-800">
                  Open form to submit a response
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
