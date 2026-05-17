# KoboToolbox · Going live in 10 minutes

Everything that *I* could pre-build is already pre-built. Below is the exact 10-minute checklist for the parts that need *your* hands.

## Prerequisites

- The 5 XLSForm files in `kobo-forms/` (already generated)
- An email address you'll use as the CEFANET Kobo admin

---

## Step 1 — Sign up for Kobo (3 min)

1. Go to https://kf.kobotoolbox.org
2. Click **Create an account**
3. Use your CEFANET admin email
4. Confirm via the email Kobo sends you

> Eligible for the free **Humanitarian Server** (https://kobo.humanitarianresponse.info/) if CEFANET is registered as an NGO — apply there instead, same workflow.

---

## Step 2 — Upload the 5 XLSForms (5 min total · 1 min each)

For each file in `kobo-forms/`:

1. From the Kobo dashboard, click **+ NEW** → **Upload an XLSForm**
2. Pick the file (e.g. `01_project_field_update.xlsx`)
3. Click **Create**
4. On the next screen, click **DEPLOY** (top right). This makes the form receivable.
5. Open the deployed form, click the **⋮ More** menu → **Settings** → copy the **Asset UID**

Repeat for all 5 files. You'll end up with 5 UIDs that look like `aXrFt7HsM9zG3kQv2bN8cV`.

> **Tip:** Once one form is uploaded and you've copied its UID, paste it into a notepad before moving to the next file. Keep them labelled.

---

## Step 3 — Get your Kobo API token (1 min)

1. While still signed into Kobo, open https://kf.kobotoolbox.org/token/?format=json in the same browser
2. Copy the value of `token` (a 40-character hex string)

---

## Step 4 — Paste into Render (2 min)

In the Render dashboard → your `cefanet-api` service → **Environment** tab:

| Variable | Value |
|---|---|
| `KOBO_BASE` | `https://kf.kobotoolbox.org` |
| `KOBO_TOKEN` | the token from Step 3 |
| `KOBO_UID_PROJECT_UPDATE` | UID of `01_project_field_update` |
| `KOBO_UID_SCORECARD` | UID of `02_community_scorecard` |
| `KOBO_UID_GRIEVANCE` | UID of `03_grievance_intake` |
| `KOBO_UID_BURSARY` | UID of `04_bursary_verification` |
| `KOBO_UID_HEALTH` | UID of `05_health_facility_inspection` |

Save. Render redeploys the API automatically (~2 min).

### Verify the API can see your Kobo

In a browser:

```
https://YOUR-RENDER-URL.onrender.com/kobo/status
```

You should get JSON like:
```json
{ "configured": true, "base": "https://kf.kobotoolbox.org",
  "forms": { "project_update": true, "scorecard": true, "grievance": true, "bursary": true, "health": true } }
```

If any of the booleans is `false`, that UID env var isn't set. Recheck Render.

---

## Step 5 — Flip the frontend to live (1 min)

In your local PowerShell:

```powershell
cd "C:\Users\Chipili4L\Desktop\CDF DEMO\.claude\worktrees\objective-pasteur-f06179\cefanet-dnb"
$env:NEXT_PUBLIC_API_URL = "https://YOUR-RENDER-URL.onrender.com"
$env:NEXT_PUBLIC_KOBO_LIVE = "true"
npm run build:hosting
firebase deploy --only hosting
```

Open the live site → **/forms** → the banner at top should now say **"Live Kobo data"** instead of "Demo data".

---

## Step 6 — Submit a test from a phone (optional, 2 min)

1. Install **KoboCollect** from the Play Store on any Android device
2. In the app: **General Settings** → **Server** → paste `https://kf.kobotoolbox.org` and your Kobo username/password
3. **Get Blank Form** → tick all 5 forms → **Get Selected**
4. **Fill Blank Form** → choose `Project Field Update` → fill 4-5 fields → finalize → send
5. Within 1 minute, that submission shows up in `/forms` on the live site

You now have a working field-data pipeline.

---

## What you've actually wired up

```
KoboCollect Android app
        ▼ (offline cache + sync on signal)
KoboToolbox server (kf.kobotoolbox.org)
        ▼ (REST API · authenticated with KOBO_TOKEN)
CEFANET CDF-MS API (Render)
        │  GET /kobo/forms
        │  GET /kobo/submissions
        ▼
CEFANET CDF-MS web (Firebase)
   /forms page · "Live Kobo data" badge
```

Refetch interval is 60 seconds, so submissions appear within a minute. Adjust in `apps/web/src/lib/cdfms/use-kobo.ts` if you want faster polling — or wire a WebSocket later for true real-time.

---

## What broke and how to fix it

| Symptom | Fix |
|---|---|
| `/kobo/status` returns `{"configured": false}` | `KOBO_TOKEN` not set in Render Environment |
| `/kobo/status` shows token configured but `forms` all `false` | UIDs not set; double-check spelling on Render env var names |
| `/kobo/forms` returns 500 with "Token failed" | API token wrong or revoked — regenerate at https://kf.kobotoolbox.org/token/?format=json |
| Live site still says "Demo data" after rebuild | `NEXT_PUBLIC_KOBO_LIVE` env var wasn't set during build. Re-run `npm run build:hosting` with both env vars set. |
| Forms appear but no submissions | Nobody's submitted yet — use Step 6 to test |
| Browser console: `CORS policy` blocked | Your Firebase URL isn't in `CORS_ORIGIN` on Render. Add it (comma-separated) and Render redeploys. |

---

## What the demo gains by going live

| Before (demo data) | After (live Kobo) |
|---|---|
| Fake 30-day submission trends | Real submissions appear within 60 seconds of being captured in the field |
| QR codes are decorative | Scanning the QR opens the real form in KoboCollect |
| "Recent submissions" list is hardcoded | Real submissions from real WDC monitors |
| Total submission counter is static | Updates every minute as field officers submit |
| Form preview is design-only | Form preview matches the actual deployed form |
| Validation rules are descriptive | Real validation enforced at submission time by Kobo |

Same UI. Real data underneath.

---

That's it. **Total of your time: ~10 minutes.** The rest is already in the repo and deployed.
