"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Save,
  Pencil,
  ClipboardCheck,
} from "lucide-react";
import {
  useFieldProjects,
  useProjectDraft,
  SECTORS,
  FIELD_STATUSES,
  FUNDING_CYCLES,
  type ProjectDraft,
  type Sector,
  type FieldStatus,
  type FieldPhoto,
} from "@/lib/cdfms/field-store";
import {
  FieldLabel,
  TextField,
  TextArea,
  ChoicePicker,
  SelectField,
  BigButton,
  SectorChip,
  StatusChip,
  SECTOR_META,
  STATUS_META,
} from "@/components/cdfms/field-ui";
import { UploadZone, type UploadedItem } from "@/components/cdfms/upload-zone";

// --- form shape ---
interface FormState {
  projectName: string;
  sector: Sector | "";
  status: FieldStatus | "";
  fundingCycle: string;
  contractorName: string;
  contractValue: string; // kept as string for the input
  startDate: string;
  expectedEndDate: string;
  percentComplete: number;
  issues: string;
  photos: FieldPhoto[];
}

const EMPTY: FormState = {
  projectName: "",
  sector: "",
  status: "",
  fundingCycle: "",
  contractorName: "",
  contractValue: "",
  startDate: "",
  expectedEndDate: "",
  percentComplete: 0,
  issues: "",
  photos: [],
};

const STEPS = ["Project basics", "Funding", "Timeline & progress", "Photos", "Review"];

type Errors = Partial<Record<keyof FormState, string>>;

export default function NewProjectWizard() {
  const router = useRouter();
  const addProject = useFieldProjects((s) => s.addProject);
  const { draft, savedAt, saveDraft, clearDraft } = useProjectDraft();

  const [step, setStep] = useState(0); // 0-4 wizard, 5 = success
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [showResume, setShowResume] = useState(false);
  const [savedProjectName, setSavedProjectName] = useState("");
  const [draftFlash, setDraftFlash] = useState(false);
  const hydrated = useRef(false);

  // On mount: offer to resume a saved draft
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (draft && Object.keys(draft).length > 0) setShowResume(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    const t = setInterval(() => {
      if (step >= 0 && step <= 4) persistDraft(form);
    }, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, step]);

  function persistDraft(f: FormState) {
    const d: ProjectDraft = {
      projectName: f.projectName,
      sector: f.sector,
      status: f.status,
      fundingCycle: f.fundingCycle,
      contractorName: f.contractorName,
      contractValue: f.contractValue ? Number(f.contractValue) : null,
      startDate: f.startDate,
      expectedEndDate: f.expectedEndDate,
      percentComplete: f.percentComplete,
      issues: f.issues,
      photos: f.photos,
    };
    saveDraft(d);
    setDraftFlash(true);
    window.setTimeout(() => setDraftFlash(false), 1500);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function resumeDraft() {
    if (!draft) return;
    setForm({
      projectName: draft.projectName ?? "",
      sector: draft.sector ?? "",
      status: draft.status ?? "",
      fundingCycle: draft.fundingCycle ?? "",
      contractorName: draft.contractorName ?? "",
      contractValue: draft.contractValue != null ? String(draft.contractValue) : "",
      startDate: draft.startDate ?? "",
      expectedEndDate: draft.expectedEndDate ?? "",
      percentComplete: draft.percentComplete ?? 0,
      issues: draft.issues ?? "",
      photos: draft.photos ?? [],
    });
    setShowResume(false);
  }

  function discardDraft() {
    clearDraft();
    setShowResume(false);
  }

  // --- validation per step ---
  function validateStep(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (!form.projectName.trim()) e.projectName = "Please enter the project name.";
      if (!form.sector) e.sector = "Please choose a sector.";
      if (!form.status) e.status = "Please choose the current status.";
    }
    if (s === 1) {
      if (!form.fundingCycle) e.fundingCycle = "Please choose the CDF funding cycle.";
      if (!form.contractorName.trim())
        e.contractorName = "Please enter the contractor's name. Type 'Not yet appointed' if there is none.";
      const val = Number(form.contractValue);
      if (!form.contractValue.trim()) e.contractValue = "Please enter the contract amount in Kwacha.";
      else if (Number.isNaN(val) || val <= 0)
        e.contractValue = "Please enter a valid amount, for example 480000.";
    }
    if (s === 2) {
      if (!form.startDate) e.startDate = "Please enter the start date.";
      if (!form.expectedEndDate) e.expectedEndDate = "Please enter the expected end date.";
      if (
        form.startDate &&
        form.expectedEndDate &&
        form.expectedEndDate < form.startDate
      )
        e.expectedEndDate = "The end date should be after the start date.";
    }
    return e;
  }

  function next() {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    persistDraft(form);
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0 });
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0 });
  }

  function submit() {
    // final guard — validate all data steps
    for (let i = 0; i <= 2; i++) {
      const e = validateStep(i);
      if (Object.keys(e).length > 0) {
        setErrors(e);
        setStep(i);
        return;
      }
    }
    const created = addProject({
      projectName: form.projectName.trim(),
      sector: form.sector,
      status: form.status,
      fundingCycle: form.fundingCycle,
      contractorName: form.contractorName.trim(),
      contractValue: Number(form.contractValue),
      startDate: form.startDate,
      expectedEndDate: form.expectedEndDate,
      percentComplete: form.percentComplete,
      issues: form.issues.trim(),
      photos: form.photos,
      wardLabel: "Your ward",
    });
    clearDraft();
    setSavedProjectName(created.projectName);
    setStep(5);
    window.scrollTo({ top: 0 });
  }

  function startAnother() {
    setForm(EMPTY);
    setErrors({});
    setStep(0);
    window.scrollTo({ top: 0 });
  }

  function onPhotoUploaded(item: UploadedItem) {
    set("photos", [
      ...form.photos,
      { id: item.id, name: item.name, dataUrl: item.dataUrl },
    ]);
  }

  const draftAge = useMemo(() => {
    if (!savedAt) return "";
    const mins = Math.round((Date.now() - new Date(savedAt).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 minute ago";
    return `${mins} minutes ago`;
  }, [savedAt]);

  // --- SUCCESS SCREEN ---
  if (step === 5) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-8">
        <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="font-serif text-2xl text-ink-900">Project saved</h1>
        <p className="text-sm text-ink-600 max-w-xs">
          <span className="font-semibold text-ink-900">{savedProjectName}</span> has been
          added to your ward&apos;s projects.
        </p>
        <div className="w-full max-w-sm flex flex-col gap-2 mt-4">
          <BigButton onClick={startAnother}>Add another project</BigButton>
          <BigButton variant="secondary" onClick={() => router.push("/field")}>
            Back to my projects
          </BigButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Resume-draft banner */}
      {showResume ? (
        <div className="rounded-xl border border-gold-300 bg-gold-50 p-3">
          <div className="font-semibold text-ink-900 text-sm">
            You have an unfinished project
          </div>
          <p className="text-xs text-ink-600 mt-0.5">
            Saved {draftAge}. Would you like to carry on where you stopped?
          </p>
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={resumeDraft}
              className="flex-1 min-h-[44px] rounded-lg bg-ministry-700 text-white text-sm font-semibold"
            >
              Resume
            </button>
            <button
              onClick={discardDraft}
              className="flex-1 min-h-[44px] rounded-lg border-2 border-ink-200 text-ink-700 text-sm font-semibold"
            >
              Start fresh
            </button>
          </div>
        </div>
      ) : null}

      {/* Header + step progress */}
      <div>
        <h1 className="font-serif text-xl text-ink-900">Add a new project</h1>
        <div className="flex items-center gap-1.5 mt-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-ministry-600" : "bg-ink-200"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs font-semibold text-ministry-700">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
          <span
            className={`text-[11px] inline-flex items-center gap-1 transition-opacity ${
              draftFlash ? "opacity-100 text-emerald-600" : "opacity-50 text-ink-400"
            }`}
          >
            <Save className="h-3 w-3" />
            {draftFlash ? "Draft saved" : "Auto-saving"}
          </span>
        </div>
      </div>

      {/* STEP 0 — basics */}
      {step === 0 ? (
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel required hint="The name people in the community know it by.">
              What is the project called?
            </FieldLabel>
            <TextField
              value={form.projectName}
              onChange={(v) => set("projectName", v)}
              placeholder="e.g. Ng'ombe Ward Borehole Rehabilitation"
              error={errors.projectName}
            />
          </div>
          <div>
            <FieldLabel required>Which sector does it belong to?</FieldLabel>
            <ChoicePicker
              options={SECTORS}
              value={form.sector}
              onChange={(v) => set("sector", v)}
              columns={2}
              error={errors.sector}
              renderOption={(s) => {
                const Icon = SECTOR_META[s].icon;
                return (
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: SECTOR_META[s].color }} />
                    {s}
                  </span>
                );
              }}
            />
          </div>
          <div>
            <FieldLabel required>What is the current status?</FieldLabel>
            <ChoicePicker
              options={FIELD_STATUSES}
              value={form.status}
              onChange={(v) => set("status", v)}
              columns={2}
              error={errors.status}
              renderOption={(s) => (
                <span className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                  {s}
                </span>
              )}
            />
          </div>
        </div>
      ) : null}

      {/* STEP 1 — funding */}
      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel required hint="The CDF cycle that paid for this project.">
              Which CDF funding cycle?
            </FieldLabel>
            <SelectField
              options={FUNDING_CYCLES}
              value={form.fundingCycle}
              onChange={(v) => set("fundingCycle", v)}
              placeholder="Choose the funding cycle…"
              error={errors.fundingCycle}
            />
          </div>
          <div>
            <FieldLabel required hint="The company or group doing the work.">
              Contractor name
            </FieldLabel>
            <TextField
              value={form.contractorName}
              onChange={(v) => set("contractorName", v)}
              placeholder="e.g. Lusaka Water Works Ltd"
              error={errors.contractorName}
            />
          </div>
          <div>
            <FieldLabel required hint="The total contract amount, in Zambian Kwacha.">
              Contract amount (ZMW)
            </FieldLabel>
            <TextField
              value={form.contractValue}
              onChange={(v) => set("contractValue", v.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 480000"
              inputMode="numeric"
              error={errors.contractValue}
            />
          </div>
        </div>
      ) : null}

      {/* STEP 2 — timeline & progress */}
      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel required>When did the work start?</FieldLabel>
            <TextField
              type="date"
              value={form.startDate}
              onChange={(v) => set("startDate", v)}
              error={errors.startDate}
            />
          </div>
          <div>
            <FieldLabel required>When is it expected to finish?</FieldLabel>
            <TextField
              type="date"
              value={form.expectedEndDate}
              onChange={(v) => set("expectedEndDate", v)}
              error={errors.expectedEndDate}
            />
          </div>
          <div>
            <FieldLabel hint="Slide to show how much of the work is done.">
              How far along is the work? — {form.percentComplete}%
            </FieldLabel>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.percentComplete}
              onChange={(e) => set("percentComplete", Number(e.target.value))}
              className="w-full h-3 accent-ministry-600"
            />
          </div>
          <div>
            <FieldLabel hint="Optional — note any problems or delays.">
              Any issues to report?
            </FieldLabel>
            <TextArea
              value={form.issues}
              onChange={(v) => set("issues", v)}
              placeholder="e.g. Cement delivery delayed by two weeks."
            />
          </div>
        </div>
      ) : null}

      {/* STEP 3 — photos */}
      {step === 3 ? (
        <div className="flex flex-col gap-3">
          <FieldLabel hint="Photos help the Ministry verify progress. This step is optional.">
            Add photos of the project
          </FieldLabel>
          <UploadZone pathPrefix="field-projects" onUploaded={onPhotoUploaded} />
          {form.photos.length > 0 ? (
            <div className="text-sm text-emerald-700 font-medium">
              {form.photos.length} photo{form.photos.length === 1 ? "" : "s"} added.
            </div>
          ) : null}
        </div>
      ) : null}

      {/* STEP 4 — review */}
      {step === 4 ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-ministry-50 border border-ministry-200 p-3 flex items-start gap-2">
            <ClipboardCheck className="h-5 w-5 text-ministry-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-ministry-800">
              Please check your entry before submitting. Tap any section to make a change.
            </p>
          </div>

          <ReviewRow label="Project name" value={form.projectName} onEdit={() => setStep(0)} />
          <ReviewRow
            label="Sector & status"
            value={
              <span className="flex gap-1.5 flex-wrap">
                <SectorChip sector={form.sector} />
                <StatusChip status={form.status} />
              </span>
            }
            onEdit={() => setStep(0)}
          />
          <ReviewRow label="Funding cycle" value={form.fundingCycle} onEdit={() => setStep(1)} />
          <ReviewRow label="Contractor" value={form.contractorName} onEdit={() => setStep(1)} />
          <ReviewRow
            label="Contract amount"
            value={`K${Number(form.contractValue || 0).toLocaleString("en-ZM")}`}
            onEdit={() => setStep(1)}
          />
          <ReviewRow
            label="Timeline"
            value={`${form.startDate || "—"}  →  ${form.expectedEndDate || "—"}`}
            onEdit={() => setStep(2)}
          />
          <ReviewRow
            label="Progress"
            value={`${form.percentComplete}% complete`}
            onEdit={() => setStep(2)}
          />
          {form.issues ? (
            <ReviewRow label="Issues reported" value={form.issues} onEdit={() => setStep(2)} />
          ) : null}
          <ReviewRow
            label="Photos"
            value={`${form.photos.length} attached`}
            onEdit={() => setStep(3)}
          />
        </div>
      ) : null}

      {/* Navigation */}
      <div className="flex gap-2 mt-2">
        {step > 0 ? (
          <button
            onClick={back}
            className="min-h-[52px] px-4 rounded-xl border-2 border-ink-200 text-ink-700 font-semibold inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
        ) : null}
        {step < 4 ? (
          <button
            onClick={next}
            className="flex-1 min-h-[52px] rounded-xl bg-ministry-700 text-white font-semibold inline-flex items-center justify-center gap-1 shadow-ministry"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={submit}
            className="flex-1 min-h-[52px] rounded-xl bg-ministry-700 text-white font-semibold inline-flex items-center justify-center gap-2 shadow-ministry-lg"
          >
            <CheckCircle2 className="h-5 w-5" />
            Submit project
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-4 py-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-ink-500">{label}</div>
        <div className="text-sm text-ink-900 mt-0.5 break-words">{value || "—"}</div>
      </div>
      <button
        onClick={onEdit}
        className="text-ministry-700 inline-flex items-center gap-1 text-sm font-semibold flex-shrink-0"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    </div>
  );
}
