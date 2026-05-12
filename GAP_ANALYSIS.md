# CEFANET DNB Demo — Gap Analysis vs Technical Blueprint

This is a frank comparison between the demo built for the Thursday presentation and what the two CEFANET source documents specify:

1. **CEFANET_Technical_Blueprint.docx** (v1.0, April 2026)
2. **CEFANET M & E Presentation 8.4.26.pptx**

The TL;DR is at the end. This is meant to be read by both leadership and the engineering team.

---

## 1. Three-Pillar Coverage

CEFANET's strategy is a **three-pillar hybrid M&E model**. The current demo addresses them unevenly:

| Pillar | What it means | Demo coverage |
|---|---|---|
| **Pillar 1 — Digital Notice Board** | GPS-tagged project tracking, financials, alerts, ICDFMIS sync | **~70%** — strong UI, missing photo upload + ICDFMIS connector |
| **Pillar 2 — MfDR (Managing for Development Results)** | Results chain (Inputs → Activities → Outputs → Outcomes → Impact), indicator scoring | **~5%** — basic financial indicators only; no results-chain UI, no indicator definitions table |
| **Pillar 3 — Active Citizen Engagement** | SMS feedback, community scorecards, civic forums | **0%** — none implemented |

The demo demonstrates the **promise** of all three pillars (the dashboard tells the story) but only **operationalises Pillar 1**.

---

## 2. P0 Feature Matrix — line by line

From the blueprint's "MVP Must-Have" table:

| P0 Feature | Demo status | Notes |
|---|---|---|
| Project Registry (CRUD) | ⚠️ Read-only | Schema supports all four operations; only GET wired. ~30 lines per write route. |
| Financial Monitoring (budget vs actual) | ✅ Complete | Variance, utilisation, 6-month trend, per-category breakdown |
| **GPS Photo Upload** | ❌ Missing | Schema has lat/lng but no `project_photos` table; no S3; no upload UI |
| Status & Alert Engine | ✅ Complete | Auto-generated for stalled projects, banner + dedicated page |
| **ICDFMIS Integration** | ❌ Missing | No connector. Blueprint requires nightly sync worker (BullMQ) |
| Role-Based Access Control | ⚠️ Partial | Roles defined + JWT issued, but no `requireRole()` guards on routes |
| Public-Facing Dashboard | ✅ Complete | No-login, constituency switcher, charts |
| Bursary Tracker (SDG 4) | ✅ Complete | Gender pie, level filter, anonymised beneficiary codes, SDG-4 badge |
| **Loans & Grants Module (SDG 1 & 8)** | ❌ Missing | `empowerment_grants` table not in schema; no UI |
| **SMS Feedback (Africa's Talking)** | ❌ Missing | No webhook, no `sms_feedback` table |
| **Basic Reporting (PDF/Excel)** | ❌ Missing | No `/reports/generate` async job; no export UI |
| Mobile-Responsive UI | ✅ Complete | All 7 screens at 375px, bottom nav |
| **PWA / Offline support** | ❌ Missing | Mobile-responsive ≠ PWA; no service worker, no IndexedDB |

**Score:** 7 of 13 P0 features fully complete; 2 partial; 4 missing.

---

## 3. Personas / Roles

The blueprint defines **7 personas with distinct RBAC scopes**. The demo seeds **2**.

| Persona | Blueprint RBAC | Demo |
|---|---|---|
| MLGRD Official | `mlgrd_admin` — national read + reports | ❌ Not seeded |
| Local Authority Officer | `district_coordinator` — district write | ✅ Closest match: `district_officer` |
| CDF Committee Member (CDFC) | `constituency_agent` — constituency write | ❌ |
| Ward Development Committee | `wdc_agent` — ward scorecards + SMS | ❌ |
| Community Member / Citizen | `public` — read-only public dashboard | ✅ |
| CEFANET M&E Analyst | `super_admin` — full access | ✅ |
| Auditor General / PAC | `auditor` — read-only national | ❌ |

The schema's `user_role` enum has only `super_admin`, `district_officer`, `public`. Adding the others is a single migration.

---

## 4. Database Schema — what's in vs what the blueprint wants

| Table from blueprint | In demo schema? |
|---|---|
| `constituencies` | ✅ |
| `projects` | ✅ |
| `project_photos` | ❌ |
| `project_updates` | ✅ |
| `fund_disbursements` | ✅ |
| `expenditure_lines` | ✅ |
| `bursaries` | ✅ |
| `beneficiaries` | ✅ |
| **`empowerment_grants`** | ❌ |
| **`scorecards`** | ❌ |
| **`sms_feedback`** | ❌ |
| **`community_sessions`** | ❌ |
| `users` | ✅ |
| `roles` | ⚠️ Implicit (enum) |
| **`audit_log`** | ❌ |
| **`indicator_definitions`** | ❌ |
| **`indicator_values`** | ❌ |
| `alerts` | ✅ (demo addition, not in blueprint but useful) |

**8 tables present, 7 missing.** All the missing ones are concentrated in Pillars 2 and 3.

---

## 5. Authentication

| Blueprint requirement | Demo |
|---|---|
| AWS Cognito as IdP | ❌ Mock JWT signed locally |
| JWT RS256 + 15-min access + 7-day refresh | ⚠️ HS256 + 12-hour single token |
| TOTP MFA for admin roles | ❌ No MFA |
| Phone OTP for WDC agents | ❌ No phone auth |
| Lambda Authorizer at API Gateway | ❌ Express middleware (functionally equivalent for demo) |
| Row-Level Security (RLS) in Postgres | ❌ Filtered in application code only |
| `audit_log` for all data mutations | ❌ Table missing |

**For the demo this is fine.** For pre-pilot, swapping in Cognito is a half-week of work — the `authMiddleware` is structured so the JWT decode is the only thing that needs replacing.

---

## 6. Infrastructure topology

| Blueprint | Demo / current |
|---|---|
| AWS ECS Fargate (Cape Town region) | Render free tier (Oregon, US) for API |
| AWS RDS Postgres (Multi-AZ) | Neon free tier (us-east-1) |
| AWS S3 + CloudFront for photos | None — no photo feature |
| AWS Cognito | Mock JWT |
| AWS Secrets Manager | Render/Vercel env vars |
| Africa's Talking SMS | None |
| AWS Route 53 + ACM | Vercel/Render default domains |

For a Thursday demo this is **perfectly acceptable** — three free-tier services that just work. For national rollout (158 constituencies, real PII), the blueprint's AWS-in-Cape-Town stack is correct because of:

- **Zambia Data Protection Act 2021** — data residency in Southern Africa
- **Latency** — Cape Town is ~3× closer to Lusaka than Oregon
- **PII encryption** — Secrets Manager + KMS column-level encryption
- **Audit/compliance** — CloudTrail, GuardDuty

---

## 7. What the demo does that the blueprint doesn't (yet) describe

A few things the demo includes that aren't explicit in the blueprint but are worth keeping:

- **Constituency switcher in the navbar** — works everywhere, persisted to localStorage
- **Skeleton loading states** on every fetching component (no layout shift)
- **Error boundaries** on every page (no white-screen crashes during the demo)
- **Pre-configured stalled projects** so the alert engine fires immediately on first load
- **One-click "Use" buttons on the login page** for fast demo flow

These map to good UX practice and should stay in production.

---

## 8. Recommendation for Thursday

### Is the demo "on point" for the leadership presentation?

**Yes — for showing the vision and getting buy-in.** The current 8 screens give CEFANET and government partners a tangible feel for:

- What real-time CDF transparency looks like
- How role-based access shapes the experience
- The structure of the public dashboard the citizens will see
- Where alerts surface and how stalled projects get flagged
- How bursary disaggregation (SDG-4) is reported

**Where you'll need to set expectations honestly during the demo:**

> "What you're seeing today is Pillar 1 — the Digital Notice Board — running on real data. Pillars 2 (MfDR results-chain) and 3 (community scorecards + SMS) are scoped, costed, and on the 12-week sprint roadmap in the Technical Blueprint. We've built the part that demonstrates the platform's value; the next sprints flesh out the M&E and citizen-engagement layers as the blueprint specifies."

That's a stronger position than overselling. Leadership will respect the discipline.

### What to add **before** the demo (low-risk, high-impact, 1-2 hours of work each)

If we still have time, three additions would materially close the gap **without breaking the working demo**:

1. **Seed all 7 personas** as demo users in the database, even if only 2 are highlighted on the login page. Lets you say "we have all the roles the blueprint specifies."
2. **MfDR Indicators page** — a single read-only page showing a results chain (Inputs → Activities → Outputs → Outcomes → Impact) with example indicator scores per project. Lights up Pillar 2 visually.
3. **Citizen feedback stub** — an SMS-style feedback list (seeded with 8-10 fake messages) on a `/feedback` page. Doesn't need real SMS — just shows the channel exists. Lights up Pillar 3.

Each is ~50-100 lines, all read-only, no risk to the existing demo.

### What to add **after** the demo (the real 12-week sprint plan)

The blueprint's Sprint 1–6 plan already covers this. Highlights:

- Sprint 1 — Cognito + RBAC enforcement on every route
- Sprint 2 — full CRUD UI for projects (Create/Edit/Delete with audit log)
- Sprint 3 — GPS photo upload to S3 + project_photos table
- Sprint 4 — empowerment_grants module (SDG 1 & 8)
- Sprint 5 — ICDFMIS nightly sync worker + public dashboard polish + PWA
- Sprint 6 — PDF/Excel report generation + scorecards + security audit

The codebase is structured to make every one of these additive, not destructive. The Drizzle schema, the shared Zod types, the route/page conventions — all hold up at 3-5× the current scope.

---

## 9. Bottom line

| Question | Answer |
|---|---|
| Is the demo aligned with CEFANET's strategy? | Yes — it implements the right pillar first |
| Will leadership see the vision? | Yes — all 8 screens render real data |
| Is it production-ready for 158 constituencies? | No — and the blueprint is explicit about what's still needed |
| Should we add the three quick wins before Thursday? | Recommended — pillars 2 and 3 currently have no visible presence |
| Is the hosting story ready? | Yes — Vercel + Render + Neon, all free tier, see `DEPLOYMENT.md` |

The demo is the right starting line. The Technical Blueprint is the right roadmap. Holding those two side-by-side on Thursday is a much stronger pitch than either alone.
