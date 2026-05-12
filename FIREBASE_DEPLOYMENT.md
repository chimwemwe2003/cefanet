# Firebase Hosting Deployment Guide

Total time: **~30 minutes** end-to-end. Result: a live URL like `https://cefanet-dnb.web.app`.

## Architecture

```
┌────────────────────────────────┐
│  Browser                       │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐    ┌────────────────────────────┐
│  Firebase Hosting              │    │  Render                    │
│  (Next.js static export)       │───▶│  Express API               │
│  cefanet-dnb.web.app           │    │  cefanet-api.onrender.com  │
└────────────────────────────────┘    └───────────────┬────────────┘
                                                      │
                                                      ▼
                                          ┌──────────────────────┐
                                          │  Neon Postgres       │
                                          │  *.neon.tech         │
                                          └──────────────────────┘
```

**Why this split:** Firebase Hosting's free plan (Spark) hosts static sites only. Express needs Cloud Functions, which requires the paid Blaze plan (still free within quota, but a credit card is required). Render's free tier hosts Node services with no card. So the cleanest free setup is **web on Firebase, API on Render**.

If you want **everything** on Firebase (one project, one domain), see "Optional: Path B" at the end.

---

## Prerequisites

- **Google account** (for Firebase)
- **GitHub account** (for Render)
- **Node 20 64-bit** installed locally
- **Git** installed
- Your **Neon connection string** in `.env`
- A working `npm run dev` locally — confirm the demo loads at `http://localhost:3000` before continuing

---

## Step 1 — Install the Firebase CLI (2 min)

In PowerShell:

```powershell
npm install -g firebase-tools
firebase --version
```

You should see something like `13.x.x`. If you don't, close and reopen PowerShell.

---

## Step 2 — Deploy the API to Render (10 min)

Render hosts the Express API. Skip this if you've already done it from `DEPLOYMENT.md`.

### 2a — Push the repo to GitHub

```powershell
cd "C:\Users\Chipili4L\Desktop\CDF DEMO\.claude\worktrees\objective-pasteur-f06179\cefanet-dnb"
git init -b main
git add .
git status --ignored          # confirm .env is in the "Ignored" list
git commit -m "CEFANET DNB demo"
```

On https://github.com/new create a private repo `cefanet-dnb`, then:

```powershell
git remote add origin https://github.com/<your-username>/cefanet-dnb.git
git push -u origin main
```

### 2b — Spin up the API on Render

1. Go to https://render.com → **Get Started** with GitHub
2. **New** → **Blueprint** → connect the `cefanet-dnb` repo
3. Render auto-detects `render.yaml` and proposes service **cefanet-api**
4. When prompted, fill in:
   - `DATABASE_URL` — paste your full Neon string ending in `?sslmode=require`
   - `CORS_ORIGIN` — **leave empty for now**
5. Click **Apply**, wait ~3 minutes
6. Copy the service URL (e.g. `https://cefanet-api.onrender.com`)

Test it from any browser:
```
https://cefanet-api.onrender.com/health
```
Should return JSON. If you get a 404 / timeout, wait ~30 seconds (Render free-tier cold start) and refresh.

---

## Step 3 — Build the static web app pointing at your Render API (3 min)

```powershell
cd "C:\Users\Chipili4L\Desktop\CDF DEMO\.claude\worktrees\objective-pasteur-f06179\cefanet-dnb"

# Make sure cross-env is installed (one-time)
npm install

# Build the static export with the live API URL baked in
$env:NEXT_PUBLIC_API_URL = "https://cefanet-api.onrender.com"
npm run build:static --workspace=@cefanet/web
```

You should see:
```
✓ Generating static pages (8/8)
Route (app) ...
○ (Static)
```

After the build, confirm the output exists:
```powershell
dir apps\web\out
```
You should see `index.html`, `projects/`, `login/`, etc.

> 💡 **Important:** `NEXT_PUBLIC_API_URL` is baked into the JS at **build time**, not read at runtime. If you ever change the API URL, you must re-run `build:static` before deploying.

---

## Step 4 — Create a Firebase project and connect this folder (5 min)

### 4a — Make the project

1. Go to https://console.firebase.google.com → **Add project**
2. Project name: `cefanet-dnb` (or anything)
3. **Disable Google Analytics** when prompted — not needed for this demo
4. Click **Create project**

### 4b — Log in and link the repo

In PowerShell, still inside the `cefanet-dnb` folder:

```powershell
firebase login
```

A browser opens. Sign in with the same Google account. After the success page, return to PowerShell.

Link the repo to your Firebase project:

```powershell
firebase use --add
```

You'll see a list of your Firebase projects. Pick `cefanet-dnb`. When asked for an alias, type `default`.

This creates a `.firebaserc` file (don't commit it if you'd rather not — already in `.gitignore` patterns, but if you push it later, Firebase doesn't store any secrets in it).

---

## Step 5 — Set the API CORS allow-list to your future Firebase URL (2 min)

You don't have the Firebase URL yet, but you can predict it. Firebase gives every project two free URLs:

```
https://<project-id>.web.app
https://<project-id>.firebaseapp.com
```

So if your project ID is `cefanet-dnb`, both URLs are:
```
https://cefanet-dnb.web.app
https://cefanet-dnb.firebaseapp.com
```

On Render dashboard → your `cefanet-api` service → **Environment**:

| Key | Value |
|---|---|
| `CORS_ORIGIN` | `https://cefanet-dnb.web.app,https://cefanet-dnb.firebaseapp.com` |

Save. Render redeploys automatically (~30 sec).

---

## Step 6 — Deploy to Firebase Hosting (2 min)

```powershell
firebase deploy --only hosting
```

You'll see:
```
=== Deploying to 'cefanet-dnb'...

i  deploying hosting
i  hosting[cefanet-dnb]: beginning deploy...
i  hosting[cefanet-dnb]: found 23 files in apps/web/out
✔  hosting[cefanet-dnb]: file upload complete
i  hosting[cefanet-dnb]: finalizing version...
✔  hosting[cefanet-dnb]: version finalized
i  hosting[cefanet-dnb]: releasing new version...
✔  hosting[cefanet-dnb]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/cefanet-dnb/overview
Hosting URL: https://cefanet-dnb.web.app
```

Open the **Hosting URL**. The dashboard should populate, and login with `admin@cefanet.org` / `demo123` should work.

---

## Step 7 — Verify everything works (3 min)

In the browser, open the **DevTools Network tab** and:

| Test | Expected result |
|---|---|
| Visit `https://cefanet-dnb.web.app/` | Dashboard renders with stat cards + bar chart |
| Click "Projects" | Table populates with 10 Lusaka Central projects |
| Click "Map" | Leaflet loads with green/blue/red/grey markers |
| Click "Login" | Form shows two demo accounts |
| Sign in as `admin@cefanet.org` / `demo123` | Redirects to dashboard, nav shows "Admin" badge |
| Network tab on dashboard load | `GET https://cefanet-api.onrender.com/constituencies/1/summary` returns 200 |

If anything returns a **CORS error** in the Network tab, the `CORS_ORIGIN` on Render doesn't match. Open your Vercel/Firebase URL → copy the full origin from the address bar → paste into Render's `CORS_ORIGIN` (comma-separated if multiple).

---

## Re-deploying after changes

After you change web code:

```powershell
$env:NEXT_PUBLIC_API_URL = "https://cefanet-api.onrender.com"
npm run build:static --workspace=@cefanet/web
firebase deploy --only hosting
```

After you change API code, just `git push` — Render auto-redeploys.

---

## Common issues

| Symptom | Cause | Fix |
|---|---|---|
| Firebase says "Error: Could not find project" | You skipped `firebase use --add` | Run it, pick your project, alias `default` |
| Deploy succeeds but page is blank | `apps/web/out` is empty | Re-run `npm run build:static --workspace=@cefanet/web` and check the output folder |
| Login form shows "Failed to fetch" | `CORS_ORIGIN` on Render doesn't match | Open the URL in your address bar, copy it exactly into Render → Environment → `CORS_ORIGIN` |
| Pages 404 on direct navigation (e.g. `/projects/` works but refreshing breaks) | Missing rewrite | Already handled in `firebase.json` — confirm the file matches the one in this repo |
| First API call slow (~30 sec) | Render free tier cold start | Hit `https://cefanet-api.onrender.com/health` once before your demo to wake it |
| `npm run build:static` errors with "image optimization" | Forgot `unoptimized: true` | Already handled in `next.config.mjs` — confirm `output: 'export'` block is present |

---

## Optional: rotate credentials before going public

If you're sharing this URL outside your demo:

1. Neon dashboard → **Roles** → reset `neondb_owner` password
2. Update `DATABASE_URL` in Render's Environment tab
3. Render redeploys automatically

---

# Optional: Path B — Move the API onto Firebase too (Cloud Functions)

This puts everything under a single Firebase project. Requires the **Blaze plan** (credit card on file). You still stay within Firebase's free quota for this demo.

### Why most people skip this

- Adds 30-45 minutes to setup
- Requires you to upgrade to Blaze
- Cold-start latency on the API (~3 sec on the first request after idle)
- More moving parts to debug

If you still want it:

### B-1: Upgrade to Blaze
Firebase console → **Settings (gear icon)** → **Usage and billing** → **Modify plan** → **Blaze (pay-as-you-go)** → add a billing account.

Set a **$1/month budget alert** so you're notified if anything unexpected happens. The demo will consume effectively $0.

### B-2: Refactor the API to be importable

The current `apps/api/src/index.ts` calls `app.listen(PORT)`. For Cloud Functions you need the Express **app** without listening. Split it:

```ts
// apps/api/src/app.ts
import express from "express";
import cors from "cors";
// ... all the middleware and route setup from index.ts ...
export const app = express();
// ... configure middleware and mount routes ...
```

```ts
// apps/api/src/index.ts
import { app } from "./app";
const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
app.listen(PORT, () => console.log(`[cefanet-api] listening on http://localhost:${PORT}`));
```

### B-3: Create a Firebase Functions workspace

```powershell
firebase init functions
```

When prompted:
- Language: **TypeScript**
- ESLint: No (skip for demo speed)
- Install dependencies: Yes

This creates a `functions/` directory. Replace `functions/src/index.ts` with:

```ts
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import { app as apiApp } from "../../apps/api/src/app";

const wrapped = express();
wrapped.use("/api", apiApp);

export const api = onRequest({ region: "us-central1", cors: true }, wrapped);
```

Update `functions/tsconfig.json` to include the API source:

```json
{
  "compilerOptions": { "rootDir": "../" },
  "include": ["src/**/*", "../apps/api/src/**/*", "../packages/**/src/**/*"]
}
```

### B-4: Configure rewrites in `firebase.json`

Edit `firebase.json` and add an API rewrite **before** the catch-all:

```json
"rewrites": [
  { "source": "/api/**", "function": "api" },
  { "source": "**", "destination": "/index.html" }
]
```

### B-5: Set the API URL to a relative path

The web app calls `${NEXT_PUBLIC_API_URL}${path}`. With the rewrite, it should call `/api/health` (same origin). Build with:

```powershell
$env:NEXT_PUBLIC_API_URL = "/api"
npm run build:static --workspace=@cefanet/web
```

### B-6: Add Cloud Function env vars

```powershell
firebase functions:secrets:set DATABASE_URL
# Paste your Neon string when prompted

firebase functions:secrets:set JWT_SECRET
# Paste a long random string
```

Then in `functions/src/index.ts`:
```ts
export const api = onRequest(
  { region: "us-central1", cors: true, secrets: ["DATABASE_URL", "JWT_SECRET"] },
  wrapped
);
```

### B-7: Deploy

```powershell
firebase deploy
```

Both hosting and the function deploy together. Done — everything is now under Firebase.

---

That's the full Firebase deploy. Path A is what I'd ship today; Path B is a clean follow-up if leadership asks "can we move it all to one Google project?"
