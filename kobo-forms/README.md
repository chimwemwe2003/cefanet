# CEFANET CDF-MS — Kobo Forms

Five XLSForm files ready for upload to KoboToolbox.

## How to upload

1. Open https://kf.kobotoolbox.org/ and sign in.
2. Top right → **+ NEW** → **Upload an XLSForm**.
3. Pick one of the five `.xlsx` files in this folder.
4. Click **Deploy** on the resulting project.
5. From the project's **Settings** → **Form** panel, copy the **Asset UID**
   (looks like `aXrFt7HsM9zG3kQv2bN8cV`).
6. Paste each UID into the repo's `.env`:

```
KOBO_BASE=https://kf.kobotoolbox.org
KOBO_TOKEN=<your-api-token>
KOBO_UID_PROJECT_UPDATE=<uid>
KOBO_UID_SCORECARD=<uid>
KOBO_UID_GRIEVANCE=<uid>
KOBO_UID_BURSARY=<uid>
KOBO_UID_HEALTH=<uid>
```

Then rebuild and redeploy. Live submissions flow into `/forms`.

## Files

| # | File | Purpose |
|---|------|---------|
| 1 | `01_project_field_update.xlsx`     | CDFC officer monthly project status check |
| 2 | `02_community_scorecard.xlsx`      | WDC-led 4-dimension community assessment |
| 3 | `03_grievance_intake.xlsx`         | Citizen grievance logging |
| 4 | `04_bursary_verification.xlsx`     | Quarterly bursary beneficiary check |
| 5 | `05_health_facility_inspection.xlsx` | Monthly CDF-funded health facility inspection |
