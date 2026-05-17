# Wiring real KoboToolbox into CEFANET CDF-MS

Everything you need to graduate from the demo's mock Kobo data to a live, working field-data pipeline.

---

## Why KoboToolbox

KoboToolbox is the **canonical field-data tool** for humanitarian, NGO, and government M&E work. Used by UN OCHA, MSF, WFP, World Bank, GIZ and most African civil-society programmes.

### What you get out of the box

| Feature | What it does for CEFANET |
|---|---|
| **Offline-first Android app (KoboCollect)** | WDC monitors collect data in low-connectivity rural wards; submissions sync when phone gets signal |
| **Multilingual forms** | Same form in EN + Nyanja + Bemba + Tonga + Lozi — one source of truth per language |
| **Built-in GPS capture** | Every submission can be auto-geotagged with phone GPS |
| **Photo capture + compression** | Photos are taken in-app, compressed to ~150KB, attached to submission |
| **Validation rules in form** | Required fields, ranges (0-100), skip logic, regex — no need to build any of this |
| **USSD + SMS integration** | Africa's Talking can post into Kobo for feature-phone users |
| **REST API** | Pull submissions live; push form definitions; check submission counts |
| **Web (Enketo) forms** | For staff filling on a laptop or digitising paper forms |
| **CSV/XLSX/JSON export** | Direct download of all submissions |

### What it costs

- **Free tier (Humanitarian Server `kobo.humanitarianresponse.info`)** — eligible for CSOs working on humanitarian / development causes. Up to ~10,000 submissions / month effective limit.
- **Standard hosted (`kf.kobotoolbox.org`)** — free for personal use, $200/mo for orgs at scale.
- **Self-hosted on AWS** — Docker image, ~$50/mo VM costs + 0.5 day/mo DevOps. Recommended at national scale.

For the pilot (5 constituencies × ~10 submissions/day = ~1,500/mo), **stay on the free Humanitarian Server**. Switch to self-hosted at national scale.

---

## What the demo shows today (`/forms`)

The Field Forms module already showcases the integration model:

- **5 mock forms** — Project Field Update, Community Scorecard, Grievance Intake, Bursary Verification, Health Facility Inspection
- **KPI strip** — total submissions, % captured offline, % with photos, # of languages, channel mix
- **Data-flow diagram** — phone → offline cache → Kobo server → sync worker → CDF-MS dashboard
- **Form library** — each form card shows category, question count, submissions, languages, supported channels, photo / GPS support, and a 30-day submission trendline
- **Click any form** → modal with sample questions, validation rules, QR code, link to Kobo
- **Live submissions feed** — most recent submissions across all forms, filtered by your role scope

This is exactly how the production system will look — the **only** difference is that the data is mocked. Replacing the mock with the live Kobo API is mechanical work.

---

## Three-stage integration plan

### Stage 1 — Set up Kobo and build the 5 forms (1 day)

1. **Create an account** on https://kf.kobotoolbox.org (or the humanitarian server)
2. **Create a project** called `CEFANET CDF-MS`
3. **Build 5 forms** — use the question previews in `apps/web/src/lib/cdfms/kobo-data.ts` as the spec:
   - `F-001 Project Field Update` — 14 questions, photo + GPS required
   - `F-002 Community Scorecard` — 22 questions, 4 rating dimensions
   - `F-003 Grievance Intake` — 9 questions, anonymous toggle
   - `F-004 Bursary Beneficiary Verification` — 11 questions, NRC validation
   - `F-005 Health Facility Inspection` — 18 questions, drug-availability rating
4. **Translate each form** into Nyanja, Bemba, Tonga, Lozi where applicable (Kobo's UI makes this a one-tab-per-language operation)
5. **Deploy** each form. Kobo gives you an **asset UID** like `aXrFt7HsM9zG3kQv2bN8cV` and a public collect URL.

### Stage 2 — Replace the mock data layer (½ day)

Two files change. Both are already structured for it:

**`apps/web/src/lib/cdfms/kobo-data.ts`** — replace the hardcoded `KOBO_FORMS` array with the real asset UIDs from Kobo. The shape stays identical:

```ts
export const KOBO_FORMS: KoboForm[] = [
  {
    id: "F-001",
    uid: "<paste-real-uid>",   // ← only this changes
    title: "Project Field Update",
    // ... rest unchanged
  },
];
```

**Add a tiny Kobo client** at `apps/api/src/services/kobo.ts`:

```ts
import { request } from "undici";

const KOBO_BASE = process.env.KOBO_BASE ?? "https://kf.kobotoolbox.org";
const KOBO_TOKEN = process.env.KOBO_TOKEN!; // store in Render env

export async function fetchSubmissions(assetUid: string, since?: string) {
  const url = `${KOBO_BASE}/api/v2/assets/${assetUid}/data/?format=json` +
    (since ? `&query={"_submission_time":{"$gt":"${since}"}}` : "");
  const { body } = await request(url, {
    headers: { Authorization: `Token ${KOBO_TOKEN}` },
  });
  return body.json();
}
```

**Schedule a sync job** — add to `apps/api/src/jobs/kobo-sync.ts` running every 15 minutes via BullMQ. It calls `fetchSubmissions` per form, transforms each row into the canonical CDFMS shape, and upserts to Postgres.

### Stage 3 — Expose submissions to the dashboard (½ day)

Add an Express route the web app calls:

```ts
// apps/api/src/routes/kobo.ts
router.get("/submissions", async (req, res) => {
  const subs = await db.query.koboSubmissions.findMany({
    orderBy: desc(koboSubmissions.submittedAt),
    limit: 100,
  });
  res.json(subs);
});
```

In the web app, replace the import of `KOBO_SUBMISSIONS` from the mock module with a TanStack Query call:

```ts
const { data: submissions } = useQuery({
  queryKey: ["kobo-submissions"],
  queryFn: () => api.koboSubmissions(),
  refetchInterval: 60_000, // 1 min
});
```

That's it. The whole `/forms` page now reflects live field data.

---

## Form design tips (from organisations that have done this)

1. **Keep mandatory questions ≤ 8.** Beyond that, completion rate drops sharply on Android in rural areas.
2. **GPS auto-capture, not manual.** Don't ask "what's your GPS?" — let the device fill it.
3. **Photo compression to 150 KB.** Kobo's default is too large for low-bandwidth syncs.
4. **Avoid open-ended text.** Use multi-select where you can. Free-text is hard to analyse and slow to type on a tablet.
5. **Use cascading selects** for hierarchies (Province → District → Constituency → Ward).
6. **Skip logic** to hide irrelevant questions (e.g., hide "phone number" when "Submit anonymously" = Yes).
7. **Pre-populate from the device.** Officer ID, ward, today's date — all fillable via Kobo's `${variable}` defaults.
8. **Group questions into screens of 3-5.** A 22-question wall of fields scares people off.

---

## SMS / USSD pathway (Africa's Talking)

For feature-phone users, KoboToolbox **cannot directly receive SMS / USSD**. The pattern is:

```
Citizen → Africa's Talking → Webhook (your API) → Kobo API submission
```

1. Rent a shortcode on Africa's Talking (typically a 4-5 digit number for Zambia)
2. Configure the inbound SMS webhook to point at `https://api.cefanet.org/sms/intake`
3. Your API parses the SMS / USSD interaction tree, builds the Kobo submission payload, posts it to Kobo
4. The submission shows up in CDF-MS just like a mobile submission did

USSD code rental is ~$50/mo in Zambia. SMS receive is ~K0.10 (~$0.004) per message; sending is ~K0.45 ($0.018).

---

## Paper-to-digital pipeline

For the lowest-connectivity wards, paper forms remain the fallback:

1. CEFANET prints standard scorecard / grievance forms in 3-4 local languages
2. WDCs collect on paper during community sessions
3. Once per month, a CDFC officer or CEFANET field coordinator opens the **Enketo web form** (the same Kobo form, but in a browser) and types the data in
4. The submission then flows through the same pipeline

Critically — even with paper, the data lives in **one canonical place**, not in a separate Excel file.

---

## What this unlocks for CEFANET

| Pillar | What Kobo enables |
|---|---|
| **Pillar 1 — Digital Notice Board** | GPS-tagged field photos automatically attached to project records. No more "we'll add the photos later." |
| **Pillar 2 — MfDR** | Indicator values get captured at source by field officers. Outputs and outcomes finally show up in the dashboard. |
| **Pillar 3 — Citizen Engagement** | Community scorecards, grievances, and beneficiary verification — the entire Pillar 3 needs Kobo to function. There is no Pillar 3 without it. |

The current demo's `/scorecards`, `/grievances`, `/beneficiaries` modules already *show* what data looks like in the dashboard. **Kobo is what gets that data in the door in the first place.**

---

## Budget impact

Adding Kobo to the production system:

| Item | Cost |
|---|---|
| Hosted Kobo (Standard or free Humanitarian) | $0 - $200 / mo |
| Kobo Android app | Free |
| Form-builder time (5 forms × ~3 hrs each) | ~$1,500 one-time at $100/hr blended rate |
| Translation into 4 local languages | $800-2,000 one-time |
| WDC training (already in budget) | included |
| Tablets (already in budget) | included |
| Sync worker development | ~3 days dev time, included in MVP budget |

**Net new operational cost: $0-$200/mo. Net build cost: ~$3-5k one-time.**

For roughly the price of one office printer, you get a national field-data layer covering 156 constituencies in 4 languages, working offline, with photo evidence and GPS. There is no faster way to bridge the field-to-dashboard gap.

---

## When you're ready

1. Build the 5 forms on `kf.kobotoolbox.org`
2. Tell me the asset UIDs
3. I'll wire the sync worker and the real API endpoint
4. We deploy and `/forms` page shows live submissions

Estimated effort from "I have a Kobo account" → "live submissions appear in CDF-MS": **about 2 days of focused work**.
