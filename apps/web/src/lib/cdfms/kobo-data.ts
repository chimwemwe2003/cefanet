// Mock catalogue of KoboToolbox forms + recent submissions.
// In production these would be pulled live from the Kobo REST API.

import { CONSTITUENCIES } from "./constituencies";

export type FormChannel = "mobile" | "web" | "ussd" | "sms" | "paper";

export interface KoboForm {
  id: string;
  uid: string; // Kobo asset UID
  title: string;
  description: string;
  category: "project" | "scorecard" | "grievance" | "bursary" | "health" | "audit";
  questionCount: number;
  languages: string[]; // e.g. ["EN", "Nyanja", "Bemba"]
  channels: FormChannel[];
  submissions: number;
  validations: string[];
  hasPhotoCapture: boolean;
  hasGps: boolean;
  // sample preview of the first 6-8 questions
  preview: Array<{ label: string; type: "select" | "text" | "number" | "photo" | "rating" | "gps" }>;
  // last 30-day trend
  trend: number[];
}

export const KOBO_FORMS: KoboForm[] = [
  {
    id: "F-001",
    uid: "aXrFt7HsM9zG3kQv2bN8cV",
    title: "Project Field Update",
    description:
      "Submitted by CDFC officers and WDC field monitors to report on-site progress, blockers, and photo evidence.",
    category: "project",
    questionCount: 14,
    languages: ["EN", "Nyanja", "Bemba"],
    channels: ["mobile", "web", "paper"],
    submissions: 1842,
    validations: ["Required photo", "GPS within constituency", "Completion 0-100%"],
    hasPhotoCapture: true,
    hasGps: true,
    preview: [
      { label: "Select project (autocomplete)", type: "select" },
      { label: "Current status", type: "select" },
      { label: "Completion percentage", type: "number" },
      { label: "Issues encountered (narrative)", type: "text" },
      { label: "Site photo — current state", type: "photo" },
      { label: "Site photo — close-up of works", type: "photo" },
      { label: "GPS location", type: "gps" },
      { label: "Supervisor signature", type: "text" },
    ],
    trend: [12, 18, 22, 31, 28, 35, 42, 38, 45, 51, 48, 56, 62, 71, 68, 74, 81, 79, 85, 92, 88, 95, 102, 98, 110, 115, 122, 130, 128, 134],
  },
  {
    id: "F-002",
    uid: "bYsGu8ItN0aH4lRw3cO9dW",
    title: "Community Scorecard",
    description:
      "WDC-led community assessment of CDF-funded facilities. Captures the four dimensions of CEFANET's scorecard methodology.",
    category: "scorecard",
    questionCount: 22,
    languages: ["EN", "Nyanja", "Bemba", "Tonga"],
    channels: ["mobile", "web", "paper"],
    submissions: 468,
    validations: ["Min 10 participants", "All 4 dimensions required", "Photo of session optional but recommended"],
    hasPhotoCapture: true,
    hasGps: true,
    preview: [
      { label: "Facility being scored", type: "select" },
      { label: "Number of community participants", type: "number" },
      { label: "Access score (0-100)", type: "rating" },
      { label: "Quality score (0-100)", type: "rating" },
      { label: "Provider behaviour score (0-100)", type: "rating" },
      { label: "Satisfaction score (0-100)", type: "rating" },
      { label: "Community narrative", type: "text" },
      { label: "Photo of scorecard session", type: "photo" },
    ],
    trend: [3, 5, 4, 6, 8, 7, 9, 12, 10, 14, 16, 15, 18, 22, 19, 24, 28, 25, 31, 34, 30, 36, 41, 38, 44, 48, 45, 52, 56, 58],
  },
  {
    id: "F-003",
    uid: "cZtHv9JuO1bI5mSx4dP0eX",
    title: "Grievance Intake",
    description:
      "Citizens log grievances via mobile, USSD, SMS short-code or in-person at the WDC office. Sensitive cases can be anonymous.",
    category: "grievance",
    questionCount: 9,
    languages: ["EN", "Nyanja", "Bemba", "Tonga", "Lozi"],
    channels: ["mobile", "ussd", "sms", "paper"],
    submissions: 627,
    validations: ["Category required", "Constituency required", "Anonymous toggle hides phone field"],
    hasPhotoCapture: true,
    hasGps: false,
    preview: [
      { label: "Submit anonymously?", type: "select" },
      { label: "Grievance category", type: "select" },
      { label: "Constituency", type: "select" },
      { label: "Describe the issue", type: "text" },
      { label: "Phone number (if not anonymous)", type: "number" },
      { label: "Photo evidence (optional)", type: "photo" },
      { label: "Witness name (optional)", type: "text" },
    ],
    trend: [4, 6, 8, 5, 9, 11, 14, 12, 16, 18, 22, 19, 24, 28, 26, 31, 34, 30, 36, 41, 38, 44, 48, 45, 52, 56, 58, 64, 67, 72],
  },
  {
    id: "F-004",
    uid: "dAuIw0KvP2cJ6nTy5eQ1fY",
    title: "Bursary Beneficiary Verification",
    description:
      "Quarterly verification that bursary holders are enrolled, attending, and progressing. Reduces ghost-beneficiary fraud.",
    category: "bursary",
    questionCount: 11,
    languages: ["EN", "Nyanja", "Bemba"],
    channels: ["mobile", "web"],
    submissions: 312,
    validations: ["NRC required", "School validation against MoE list", "Photo of report card encouraged"],
    hasPhotoCapture: true,
    hasGps: false,
    preview: [
      { label: "Beneficiary code (auto-fills)", type: "text" },
      { label: "NRC last 4 digits", type: "number" },
      { label: "Currently enrolled?", type: "select" },
      { label: "Attendance percentage (Term 1)", type: "number" },
      { label: "Grade average", type: "number" },
      { label: "Photo of report card / acceptance letter", type: "photo" },
      { label: "Verifier signature", type: "text" },
    ],
    trend: [2, 4, 3, 5, 7, 6, 8, 11, 9, 13, 15, 14, 17, 20, 18, 22, 26, 24, 28, 31, 28, 33, 37, 35, 40, 44, 41, 47, 50, 52],
  },
  {
    id: "F-005",
    uid: "eBvJx1LwQ3dK7oUz6fR2gZ",
    title: "Health Facility Inspection",
    description:
      "Monthly inspection of CDF-funded health posts and clinics. Captures functionality, drugs, water, electricity, staff on post.",
    category: "health",
    questionCount: 18,
    languages: ["EN", "Nyanja", "Bemba"],
    channels: ["mobile", "web"],
    submissions: 274,
    validations: ["GPS required", "Photo of pharmacy required", "Drug count validated against stock-card"],
    hasPhotoCapture: true,
    hasGps: true,
    preview: [
      { label: "Facility (auto-fills)", type: "select" },
      { label: "Is the facility operational today?", type: "select" },
      { label: "Drug availability (0-100)", type: "rating" },
      { label: "Has running water?", type: "select" },
      { label: "Has electricity right now?", type: "select" },
      { label: "Staff on post / established", type: "number" },
      { label: "Photo — pharmacy shelves", type: "photo" },
      { label: "Photo — outpatient register", type: "photo" },
      { label: "GPS location", type: "gps" },
    ],
    trend: [1, 3, 2, 4, 6, 5, 7, 10, 8, 12, 14, 13, 16, 19, 17, 21, 25, 23, 27, 30, 27, 32, 36, 34, 39, 43, 40, 46, 49, 51],
  },
];

export interface KoboSubmission {
  id: string;
  formId: string;
  formTitle: string;
  formCategory: KoboForm["category"];
  submittedBy: string;
  channel: FormChannel;
  constituencyId: number;
  submittedAt: string; // ISO
  hasPhoto: boolean;
  hasGps: boolean;
  validated: boolean;
  language: string;
}

function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

const SUBMITTERS = [
  "WDC Monitor · Ward 4", "CDFC Officer", "WDC Field Lead", "Community Volunteer",
  "WDC Monitor · Ward 7", "CDFC Secretary", "Health Inspector", "MP Office",
];

export const KOBO_SUBMISSIONS: KoboSubmission[] = (() => {
  const out: KoboSubmission[] = [];
  for (let i = 0; i < 40; i++) {
    const rnd = seeded(i * 19 + 3);
    const f = KOBO_FORMS[i % KOBO_FORMS.length];
    const c = CONSTITUENCIES[(i * 7) % CONSTITUENCIES.length];
    const day = String(((i * 3) % 27) + 1).padStart(2, "0");
    const hour = String((i * 5) % 24).padStart(2, "0");
    const minute = String((i * 11) % 60).padStart(2, "0");
    out.push({
      id: `SUB-${String(i + 1).padStart(5, "0")}`,
      formId: f.id,
      formTitle: f.title,
      formCategory: f.category,
      submittedBy: SUBMITTERS[i % SUBMITTERS.length],
      channel: f.channels[i % f.channels.length],
      constituencyId: c.id,
      submittedAt: `2026-05-${day}T${hour}:${minute}:00Z`,
      hasPhoto: f.hasPhotoCapture && i % 3 !== 0,
      hasGps: f.hasGps && i % 4 !== 0,
      validated: i % 9 !== 0,
      language: f.languages[i % f.languages.length],
    });
  }
  return out.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
})();

export const KOBO_TOTALS = (() => {
  const totalSubs = KOBO_FORMS.reduce((a, f) => a + f.submissions, 0);
  const photos = Math.round(totalSubs * 0.72);
  const offline = Math.round(totalSubs * 0.41);
  const langs = new Set<string>();
  KOBO_FORMS.forEach((f) => f.languages.forEach((l) => langs.add(l)));
  return {
    forms: KOBO_FORMS.length,
    totalSubmissions: totalSubs,
    photoSubmissions: photos,
    offlineSubmissions: offline,
    languages: langs.size,
    activeFieldOfficers: 142,
  };
})();
