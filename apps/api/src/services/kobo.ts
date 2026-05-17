// KoboToolbox API client.
//
// Reads from KoboToolbox via its REST API and normalises submissions into the
// shape the CDF-MS web app already understands. Falls back to a 200 with an
// empty-but-clearly-flagged response when env vars are missing, so the
// frontend can render a friendly "configure Kobo to see live data" message.

export interface NormalisedSubmission {
  id: string;
  formId: string;
  formTitle: string;
  formCategory: string;
  submittedBy: string;
  channel: "mobile" | "web" | "ussd" | "sms" | "paper";
  constituencyId: number | null;
  submittedAt: string;
  hasPhoto: boolean;
  hasGps: boolean;
  validated: boolean;
  language: string;
  // Raw payload for debugging
  raw?: unknown;
}

export interface NormalisedForm {
  id: string;
  uid: string;
  title: string;
  category: string;
  questionCount: number;
  submissions: number;
  languages: string[];
  hasGps: boolean;
  hasPhotoCapture: boolean;
}

interface FormRef {
  id: string; // local id, e.g. "F-001"
  category: NormalisedForm["category"];
  envVar: string; // env var name holding the UID
}

const FORM_REGISTRY: FormRef[] = [
  { id: "F-001", category: "project",    envVar: "KOBO_UID_PROJECT_UPDATE" },
  { id: "F-002", category: "scorecard",  envVar: "KOBO_UID_SCORECARD" },
  { id: "F-003", category: "grievance",  envVar: "KOBO_UID_GRIEVANCE" },
  { id: "F-004", category: "bursary",    envVar: "KOBO_UID_BURSARY" },
  { id: "F-005", category: "health",     envVar: "KOBO_UID_HEALTH" },
];

export function isKoboConfigured(): boolean {
  return Boolean(process.env.KOBO_BASE && process.env.KOBO_TOKEN);
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Token ${process.env.KOBO_TOKEN}`,
    Accept: "application/json",
  };
}

/** Fetch every configured form's metadata + submission count from Kobo. */
export async function listForms(): Promise<NormalisedForm[]> {
  if (!isKoboConfigured()) return [];
  const base = (process.env.KOBO_BASE ?? "https://kf.kobotoolbox.org").replace(/\/$/, "");
  const out: NormalisedForm[] = [];

  for (const ref of FORM_REGISTRY) {
    const uid = process.env[ref.envVar];
    if (!uid) continue;
    try {
      const res = await fetch(`${base}/api/v2/assets/${uid}/?format=json`, {
        headers: authHeaders(),
      });
      if (!res.ok) continue;
      const a = (await res.json()) as KoboAsset;
      const langs: string[] = Array.isArray(a.summary?.languages) ? a.summary.languages : ["English (en)"];
      const types: string[] = Array.isArray(a.content?.survey)
        ? a.content.survey.map((q: { type?: string }) => q.type ?? "").filter(Boolean)
        : [];
      out.push({
        id: ref.id,
        uid,
        title: a.name ?? "Untitled form",
        category: ref.category,
        questionCount: types.filter((t) => !["start", "end", "today", "deviceid"].includes(t)).length,
        submissions: a.deployment__submission_count ?? 0,
        languages: langs,
        hasGps: types.includes("geopoint"),
        hasPhotoCapture: types.includes("image"),
      });
    } catch (err) {
      console.warn(`[kobo] failed to fetch form ${uid}:`, err);
    }
  }
  return out;
}

/** Pull recent submissions across every configured form. */
export async function listSubmissions(opts: { limit?: number } = {}): Promise<NormalisedSubmission[]> {
  if (!isKoboConfigured()) return [];
  const limit = opts.limit ?? 100;
  const base = (process.env.KOBO_BASE ?? "https://kf.kobotoolbox.org").replace(/\/$/, "");
  const all: NormalisedSubmission[] = [];

  for (const ref of FORM_REGISTRY) {
    const uid = process.env[ref.envVar];
    if (!uid) continue;
    try {
      const url = `${base}/api/v2/assets/${uid}/data/?format=json&limit=${limit}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) continue;
      const json = (await res.json()) as { results?: KoboSubmissionRaw[] };
      const results = json.results ?? [];
      for (const row of results) {
        all.push(normalise(row, ref));
      }
    } catch (err) {
      console.warn(`[kobo] failed to fetch submissions for ${uid}:`, err);
    }
  }

  all.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return all.slice(0, limit);
}

function normalise(raw: KoboSubmissionRaw, ref: FormRef): NormalisedSubmission {
  // Heuristic mapping. Kobo submission keys are arbitrary (set in XLSForm).
  // We do our best to detect common patterns.
  const id = String(raw._id ?? raw["meta/instanceID"] ?? "");
  const ts = String(raw._submission_time ?? raw.start_time ?? new Date().toISOString());
  const hasGps = Object.values(raw).some(
    (v) => typeof v === "string" && /^-?\d+\.\d+\s+-?\d+\.\d+/.test(v)
  );
  const hasPhoto = (raw._attachments?.length ?? 0) > 0;
  const submittedBy = String(raw._submitted_by ?? raw.officer_name ?? raw.submitted_by ?? raw.inspector ?? "field officer");
  const language = String(raw._language ?? "English (en)");

  return {
    id,
    formId: ref.id,
    formTitle: ref.category,
    formCategory: ref.category,
    submittedBy,
    channel: "mobile", // KoboCollect is mobile; Enketo is web — could distinguish via _xform_id_string in future
    constituencyId: typeof raw.constituency_id === "number" ? raw.constituency_id : null,
    submittedAt: ts,
    hasPhoto,
    hasGps,
    validated: raw._validation_status?.uid === "validation_status_approved",
    language,
    raw,
  };
}

// ----- Internal Kobo types (subset) -----
interface KoboAsset {
  name?: string;
  deployment__submission_count?: number;
  summary?: { languages?: string[] };
  content?: { survey?: Array<{ type?: string }> };
}

interface KoboSubmissionRaw {
  _id?: number | string;
  _submission_time?: string;
  _submitted_by?: string;
  _attachments?: Array<{ filename: string }>;
  _validation_status?: { uid?: string };
  _language?: string;
  [key: string]: unknown;
}
