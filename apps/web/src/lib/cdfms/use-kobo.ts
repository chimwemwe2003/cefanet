"use client";

import { useQuery } from "@tanstack/react-query";
import { KOBO_FORMS, KOBO_SUBMISSIONS, type KoboForm, type KoboSubmission } from "./kobo-data";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const LIVE = process.env.NEXT_PUBLIC_KOBO_LIVE === "true";

/**
 * Returns either the live forms from the API or the mocked catalogue, depending
 * on whether NEXT_PUBLIC_KOBO_LIVE is set. The mock data is shaped identically
 * so the UI does not need to branch.
 */
export function useKoboForms() {
  return useQuery({
    queryKey: ["kobo-forms", LIVE],
    queryFn: async (): Promise<{ live: boolean; forms: KoboForm[] }> => {
      if (!LIVE || !API_URL) return { live: false, forms: KOBO_FORMS };
      try {
        const res = await fetch(`${API_URL}/kobo/forms`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = (await res.json()) as { configured: boolean; forms: Array<Record<string, unknown>> };
        if (!json.configured || json.forms.length === 0) {
          return { live: false, forms: KOBO_FORMS };
        }
        // Marry live metadata into the rich mock structure so we keep
        // preview/validations/trend without re-fetching the form definition.
        const liveById = new Map<string, Record<string, unknown>>();
        json.forms.forEach((f) => liveById.set(String(f.id), f));
        const merged: KoboForm[] = KOBO_FORMS.map((mock) => {
          const live = liveById.get(mock.id);
          if (!live) return mock;
          return {
            ...mock,
            uid: String(live.uid ?? mock.uid),
            title: String(live.title ?? mock.title),
            questionCount: typeof live.questionCount === "number" ? live.questionCount : mock.questionCount,
            submissions: typeof live.submissions === "number" ? live.submissions : mock.submissions,
            languages: Array.isArray(live.languages) ? (live.languages as string[]) : mock.languages,
            hasGps: typeof live.hasGps === "boolean" ? live.hasGps : mock.hasGps,
            hasPhotoCapture: typeof live.hasPhotoCapture === "boolean" ? live.hasPhotoCapture : mock.hasPhotoCapture,
          };
        });
        return { live: true, forms: merged };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[useKoboForms] live fetch failed; falling back to mock", err);
        return { live: false, forms: KOBO_FORMS };
      }
    },
    staleTime: 60_000,
  });
}

export function useKoboSubmissions(limit = 100) {
  return useQuery({
    queryKey: ["kobo-submissions", LIVE, limit],
    queryFn: async (): Promise<{ live: boolean; submissions: KoboSubmission[] }> => {
      if (!LIVE || !API_URL) return { live: false, submissions: KOBO_SUBMISSIONS };
      try {
        const res = await fetch(`${API_URL}/kobo/submissions?limit=${limit}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = (await res.json()) as {
          configured: boolean;
          submissions: Array<Record<string, unknown>>;
        };
        if (!json.configured || json.submissions.length === 0) {
          return { live: false, submissions: KOBO_SUBMISSIONS };
        }
        const submissions: KoboSubmission[] = json.submissions.map((s) => ({
          id: String(s.id ?? ""),
          formId: String(s.formId ?? ""),
          formTitle: String(s.formTitle ?? ""),
          formCategory: String(s.formCategory ?? "") as KoboSubmission["formCategory"],
          submittedBy: String(s.submittedBy ?? ""),
          channel: (s.channel as KoboSubmission["channel"]) ?? "mobile",
          constituencyId: typeof s.constituencyId === "number" ? s.constituencyId : 1,
          submittedAt: String(s.submittedAt ?? ""),
          hasPhoto: Boolean(s.hasPhoto),
          hasGps: Boolean(s.hasGps),
          validated: Boolean(s.validated),
          language: String(s.language ?? "English (en)"),
        }));
        return { live: true, submissions };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[useKoboSubmissions] live fetch failed; falling back to mock", err);
        return { live: false, submissions: KOBO_SUBMISSIONS };
      }
    },
    staleTime: 60_000,
    refetchInterval: LIVE ? 60_000 : false, // poll every minute when live
  });
}
