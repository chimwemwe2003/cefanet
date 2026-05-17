"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, FolderOpen, X, CheckCircle2, RefreshCw } from "lucide-react";
import { useCdfmsAuth } from "@/lib/cdfms/store";
import {
  useFieldProjects,
  FIELD_STATUSES,
  type FieldProject,
  type FieldStatus,
} from "@/lib/cdfms/field-store";
import { ConnectionStatus } from "@/components/cdfms/connection-status";
import {
  SectorChip,
  StatusChip,
  BigProgress,
  BigButton,
  FieldLabel,
  ChoicePicker,
  TextArea,
  STATUS_META,
} from "@/components/cdfms/field-ui";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-ZM", { day: "numeric", month: "short" });
}

export default function FieldHome() {
  const { fullName } = useCdfmsAuth();
  const projects = useFieldProjects((s) => s.projects);
  const recordUpdate = useFieldProjects((s) => s.recordUpdate);

  const [updating, setUpdating] = useState<FieldProject | null>(null);

  const firstName = (fullName ?? "Officer").split(" ").filter((w) => !w.includes("."))[0] ?? "Officer";

  const sorted = useMemo(
    () => [...projects].sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt)),
    [projects]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting */}
      <div>
        <h1 className="font-serif text-2xl text-ink-900">
          {greeting()}, {firstName}
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          Here are the projects you are monitoring in your ward.
        </p>
      </div>

      <ConnectionStatus />

      {/* Big add button */}
      <Link href="/field/new" className="block">
        <div className="flex items-center gap-3 rounded-2xl bg-ministry-700 text-white px-4 py-4 shadow-ministry-lg hover:bg-ministry-800 transition-colors">
          <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base">Add a new project</div>
            <div className="text-xs text-white/80">Record a CDF project in your ward</div>
          </div>
        </div>
      </Link>

      {/* Projects list */}
      <div className="flex items-center justify-between mt-1">
        <h2 className="font-semibold text-ink-900">
          My ward&apos;s projects{" "}
          <span className="text-ink-400 font-normal">({sorted.length})</span>
        </h2>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-white px-4 py-10 text-center">
          <FolderOpen className="h-10 w-10 text-ink-300 mx-auto" />
          <div className="font-semibold text-ink-900 mt-3">No projects yet</div>
          <p className="text-sm text-ink-500 mt-1">
            Tap &ldquo;Add a new project&rdquo; above to record your first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((p) => (
            <div key={p.id} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-ministry">
              <div className="flex items-start gap-2 flex-wrap">
                <SectorChip sector={p.sector} />
                <StatusChip status={p.status} />
              </div>
              <div className="font-semibold text-ink-900 mt-2 leading-snug">
                {p.projectName}
              </div>
              <div className="mt-3">
                <BigProgress value={p.percentComplete} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-ink-400">
                  Updated {relTime(p.lastUpdatedAt)}
                </span>
                <button
                  onClick={() => setUpdating(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ministry-50 text-ministry-700 font-semibold text-sm px-3 py-2 min-h-[44px] hover:bg-ministry-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  Update progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update sheet */}
      {updating ? (
        <UpdateSheet
          project={updating}
          onClose={() => setUpdating(null)}
          onSave={(patch) => {
            recordUpdate(updating.id, patch);
            setUpdating(null);
          }}
        />
      ) : null}
    </div>
  );
}

function UpdateSheet({
  project,
  onClose,
  onSave,
}: {
  project: FieldProject;
  onClose: () => void;
  onSave: (patch: { status: FieldStatus; percentComplete: number; note: string }) => void;
}) {
  const [status, setStatus] = useState<FieldStatus | "">(project.status || "Ongoing");
  const [percent, setPercent] = useState<number>(project.percentComplete);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  function handleSave() {
    if (!status) return;
    onSave({ status, percentComplete: percent, note });
    setDone(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-ink-200 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-ink-900">Update progress</div>
          <button onClick={onClose} className="p-2 -mr-2 text-ink-500" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="font-serif text-xl text-ink-900 mt-3">Progress saved</div>
            <p className="text-sm text-ink-500 mt-1">
              {project.projectName} has been updated.
            </p>
            <div className="mt-5">
              <BigButton onClick={onClose}>Back to my projects</BigButton>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4">
            <div className="text-sm text-ink-500">{project.projectName}</div>

            <div>
              <FieldLabel required>What is the current status?</FieldLabel>
              <ChoicePicker
                options={FIELD_STATUSES}
                value={status}
                onChange={setStatus}
                columns={2}
                renderOption={(s) => (
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                    {s}
                  </span>
                )}
              />
            </div>

            <div>
              <FieldLabel hint="Slide to set how much of the work is finished.">
                How far along is the work? — {percent}%
              </FieldLabel>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full h-3 accent-ministry-600"
              />
              <div className="mt-2">
                <BigProgress value={percent} />
              </div>
            </div>

            <div>
              <FieldLabel hint="Optional — note anything important since your last visit.">
                Add a progress note
              </FieldLabel>
              <TextArea
                value={note}
                onChange={setNote}
                placeholder="e.g. Roofing completed this week. Awaiting window frames."
              />
            </div>

            <BigButton onClick={handleSave} disabled={!status}>
              Save progress update
            </BigButton>
          </div>
        )}
      </div>
    </div>
  );
}
