"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---- Domain ----

export const SECTORS = [
  "Education",
  "Health",
  "Water",
  "Roads",
  "Agriculture",
  "Other",
] as const;
export type Sector = (typeof SECTORS)[number];

export const FIELD_STATUSES = ["Planned", "Ongoing", "Stalled", "Completed"] as const;
export type FieldStatus = (typeof FIELD_STATUSES)[number];

export const FUNDING_CYCLES = ["2024 CDF Cycle", "2025 CDF Cycle", "2026 CDF Cycle"] as const;

export interface FieldPhoto {
  id: string;
  name: string;
  dataUrl: string;
}

export interface FieldProject {
  id: string;
  projectName: string;
  sector: Sector | "";
  status: FieldStatus | "";
  fundingCycle: string;
  contractorName: string;
  contractValue: number | null;
  startDate: string;
  expectedEndDate: string;
  percentComplete: number;
  issues: string;
  photos: FieldPhoto[];
  wardLabel: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  status: FieldStatus;
  percentComplete: number;
  note: string;
  at: string;
}

// A draft is a partial project being filled in the wizard
export type ProjectDraft = Partial<Omit<FieldProject, "id" | "createdAt" | "lastUpdatedAt">>;

// ---- Sample seed (so the officer's list isn't empty on first run) ----

function nowIso() {
  return new Date().toISOString();
}

const SEED: FieldProject[] = [
  {
    id: "WP-SEED-1",
    projectName: "Ng'ombe Ward Borehole Rehabilitation",
    sector: "Water",
    status: "Ongoing",
    fundingCycle: "2026 CDF Cycle",
    contractorName: "Lusaka Water Works Ltd",
    contractValue: 480_000,
    startDate: "2026-02-10",
    expectedEndDate: "2026-07-30",
    percentComplete: 55,
    issues: "Awaiting delivery of submersible pump.",
    photos: [],
    wardLabel: "Your ward",
    createdAt: "2026-02-10T08:00:00Z",
    lastUpdatedAt: "2026-05-02T10:30:00Z",
  },
  {
    id: "WP-SEED-2",
    projectName: "Ward Health Post — Maternity Wing",
    sector: "Health",
    status: "Ongoing",
    fundingCycle: "2026 CDF Cycle",
    contractorName: "Mwamba Builders",
    contractValue: 1_250_000,
    startDate: "2026-01-15",
    expectedEndDate: "2026-09-30",
    percentComplete: 40,
    issues: "",
    photos: [],
    wardLabel: "Your ward",
    createdAt: "2026-01-15T09:00:00Z",
    lastUpdatedAt: "2026-04-28T14:10:00Z",
  },
  {
    id: "WP-SEED-3",
    projectName: "Community Secondary School — 1x3 Classroom Block",
    sector: "Education",
    status: "Stalled",
    fundingCycle: "2025 CDF Cycle",
    contractorName: "Northstar Construction",
    contractValue: 920_000,
    startDate: "2025-08-01",
    expectedEndDate: "2026-03-30",
    percentComplete: 30,
    issues: "Works paused — second payment tranche delayed.",
    photos: [],
    wardLabel: "Your ward",
    createdAt: "2025-08-01T08:00:00Z",
    lastUpdatedAt: "2026-03-12T11:00:00Z",
  },
];

// ---- Projects store ----

interface FieldState {
  projects: FieldProject[];
  updates: ProgressUpdate[];
  addProject: (draft: ProjectDraft) => FieldProject;
  recordUpdate: (
    projectId: string,
    patch: { status: FieldStatus; percentComplete: number; note: string }
  ) => void;
}

export const useFieldProjects = create<FieldState>()(
  persist(
    (set, get) => ({
      projects: SEED,
      updates: [],
      addProject: (draft) => {
        const project: FieldProject = {
          id: `WP-${Date.now().toString(36).toUpperCase()}`,
          projectName: draft.projectName ?? "Untitled project",
          sector: draft.sector ?? "",
          status: draft.status ?? "Planned",
          fundingCycle: draft.fundingCycle ?? "2026 CDF Cycle",
          contractorName: draft.contractorName ?? "",
          contractValue: draft.contractValue ?? null,
          startDate: draft.startDate ?? "",
          expectedEndDate: draft.expectedEndDate ?? "",
          percentComplete: draft.percentComplete ?? 0,
          issues: draft.issues ?? "",
          photos: draft.photos ?? [],
          wardLabel: draft.wardLabel ?? "Your ward",
          createdAt: nowIso(),
          lastUpdatedAt: nowIso(),
        };
        set({ projects: [project, ...get().projects] });
        return project;
      },
      recordUpdate: (projectId, patch) => {
        const update: ProgressUpdate = {
          id: `UP-${Date.now().toString(36).toUpperCase()}`,
          projectId,
          status: patch.status,
          percentComplete: patch.percentComplete,
          note: patch.note,
          at: nowIso(),
        };
        set({
          updates: [update, ...get().updates],
          projects: get().projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  status: patch.status,
                  percentComplete: patch.percentComplete,
                  lastUpdatedAt: nowIso(),
                }
              : p
          ),
        });
      },
    }),
    { name: "cefanet-field-projects" }
  )
);

// ---- Draft store (auto-save for the wizard) ----

interface DraftState {
  draft: ProjectDraft | null;
  savedAt: string | null;
  saveDraft: (draft: ProjectDraft) => void;
  clearDraft: () => void;
}

export const useProjectDraft = create<DraftState>()(
  persist(
    (set) => ({
      draft: null,
      savedAt: null,
      saveDraft: (draft) => set({ draft, savedAt: nowIso() }),
      clearDraft: () => set({ draft: null, savedAt: null }),
    }),
    { name: "cefanet-field-draft" }
  )
);
