# CEFANET Hybrid CDF Monitoring Dashboard — Blueprint v1.0 (May 2026) Gap Analysis

Audit of the current demo (Firebase deploy, unified app under `/`) against the **CEFANET Complementary Hybrid CDF Monitoring Dashboard** blueprint, version 1.0.

Legend: ✅ done · ⚠️ partial · ❌ missing

---

## TL;DR

| Tier | Count |
|---|---|
| ✅ Fully met | 14 / 52 (27%) |
| ⚠️ Partially met | 15 / 52 (29%) |
| ❌ Missing | 23 / 52 (44%) |

**The demo is on-strategy but currently positioned more as a government operations system than a citizen-led complementary one.** The biggest structural gaps are: Health Initiatives module (entire pillar missing), School Bursaries (collapsed into Beneficiaries), Community Scorecards, Grievance Module, and the field-data layer (Kobo / USSD / SMS / paper). Several of these can be added to the demo in hours; others require real infrastructure that's out of scope for a static demo.

---

## Section 1 · Overview & Purpose

| Criterion | Status | Notes |
|---|---|---|
| Citizen-centric complementary system | ⚠️ | Public role exists, but framing is government-operational. Easy to reframe in copy. |
| Independence vs SMART Zambia | ⚠️ | We position alongside MLGRD; no explicit "complementary, not parallel" copy yet. |
| Covers Projects, Grants, Loans, Bursaries, Health | 3 / 5 | Projects ✅, Grants ✅, Loans ✅, Bursaries collapsed into Beneficiaries, **Health entirely missing** |
| Hybrid (digital + offline/paper) | ❌ | Web responsive only — no PWA, no offline, no paper digitisation |
| Ward → Constituency → National data flow | ⚠️ | We scope to constituency/province/national, but no ward-level submission exists |

## Section 2 · Objectives

| Objective | Status | Notes |
|---|---|---|
| Community participation in monitoring | ❌ | No submission flow for citizens / WDCs |
| Verify official data with ground evidence | ⚠️ | Photo evidence stages shown in project drawer (placeholder), no real upload |
| Inputs → outputs → outcomes → impact | ⚠️ | We track inputs (allocation) + outputs (disbursement, completion), no outcome / impact indicators |
| Actionable insights + red flags | ✅ | Compliance module + Top/Bottom performers + PAC report |
| Equity, efficiency, value-for-money | ⚠️ | Utilisation tracked; no formal equity index |
| Grievance redressal | ❌ | No grievance module |

## Section 3 · System Architecture

| Component | Blueprint | Demo |
|---|---|---|
| Frontend (responsive web) | ✅ React + responsive | ✅ Next.js 14 + Tailwind |
| Mobile app (Flutter/PWA) | Required | ❌ Responsive web only |
| Backend with RBAC | Node/Python + DB | ⚠️ Express + Neon exist but **not connected** to current demo (which is fully client-side static) |
| Data collection: Kobo / USSD / SMS / paper | Required | ❌ None of these |
| Analytics: Power BI / Metabase | Suggested | ❌ Recharts (functionally equivalent, different vendor) |
| Integration: pull from official CDF data | Required | ❌ Not yet |
| DHIS2 / HMIS integration (health) | Required | ❌ |
| Cloud storage with offline sync | Required | ⚠️ Cloud storage yes (Firebase + Neon); no sync |
| GIS / mapping | Required | ✅ Leaflet + OSM with province heat-bubbles |
| Scalable hosting | Required | ✅ Firebase + Render + Neon stack ready |

## Section 4 · User Roles

| Blueprint role | Demo equivalent | Status |
|---|---|---|
| Public (view-only) | `public` | ✅ |
| Community Monitor / WDC | — | ❌ Not implemented |
| Constituency Admin (CDFC/MP staff) | `mp` + `constituency_officer` | ✅ (split into two) |
| CEFANET / CSO Stakeholder | `auditor` partially fits | ⚠️ No explicit CSO role |
| System Admin | — | ❌ |

## Section 5 · Core Modules

### Dashboard Home
| Feature | Status |
|---|---|
| National/provincial overview | ✅ |
| Traffic-light KPIs (green/yellow/red) | ⚠️ Tone-coded but no formal traffic-light convention |
| Top / bottom constituencies | ✅ |
| Recent alerts surface on home | ⚠️ Listed on Compliance, not surfaced as a banner on Dashboard |

### Module 1 · Projects
| Feature | Status |
|---|---|
| Status tracking (planned/ongoing/complete/delayed) | ✅ |
| Infrastructure categories | ✅ |
| Schedule adherence | ⚠️ Start/end dates shown, no formal "behind schedule" calc |
| Cost variance | ⚠️ Budget vs spend shown |
| Quality compliance | ❌ |

### Module 2 · Grants & Loans
| Feature | Status |
|---|---|
| Disbursement & utilisation | ✅ |
| Repayment rate (loans) | ✅ |
| Beneficiary tracking | ✅ |
| Success / failure stories | ❌ |
| Risk prediction (repayment likelihood) | ❌ |

### Module 3 · School Bursaries
| Feature | Status |
|---|---|
| Dedicated module | ❌ — bursaries collapsed into Beneficiaries with a "Bursary" tag |
| Enrollment / completion verification | ❌ |
| Outcomes (graduation, retention, employment) | ❌ |
| Equity (vulnerable groups) | ⚠️ Vulnerability score on Beneficiaries |

### Module 4 · Health Initiatives
| Feature | Status |
|---|---|
| Dedicated module | ❌ |
| Infrastructure: clinics, posts, staff housing, boreholes, maternity shelters | ❌ |
| Functionality % (water, electricity, equipment, drugs) | ❌ |
| Service delivery (OPD, ANC, deliveries, immunisation, under-5) | ❌ |
| Prevention & equity metrics | ❌ |

### Cross-cutting
| Feature | Status |
|---|---|
| Community Scorecards (paper + Kobo) | ❌ |
| Evidence Hub (GPS-tagged photos, before/after, interviews) | ⚠️ Placeholder in project drawer only |
| Grievance Module (log, track, resolve, public status) | ❌ |
| Red Flags / Automated Alerts | ✅ |
| Mapping & visuals | ✅ |
| Reporting (monthly/quarterly/annual PDF/Excel) | ✅ PAC report + 4 CSV exports |

## Section 6 · KPIs (Input-Output-Outcome-Impact)

### Common
| KPI | Status |
|---|---|
| Utilisation rate (target ≥85%) | ✅ |
| On-time completion % | ⚠️ Completion % only, not deadline-based |
| Cost variance % | ⚠️ Implicit in budget-vs-spend |
| Geographic equity (wards covered) | ❌ |
| Community participation rate | ❌ |
| Grievance resolution rate | ❌ |

### By module
| Group | Status |
|---|---|
| Project schedule adherence / quality / safety | ⚠️ Partial |
| Grant repayment, business survival | Repayment ✅, Survival ❌ |
| Bursary completion, equity index | ❌ |
| Health (functionality, drug avail, OPD, ANC, water points, satisfaction) | ❌ |

### Composite indices
| Index | Status |
|---|---|
| Overall CDF Performance Score | ❌ |
| Health CDF Index | ❌ |

## Section 7 · Data Collection Tools

| Tool | Status |
|---|---|
| KoboToolbox / ODK | ❌ |
| USSD / SMS fallback | ❌ |
| Paper scorecard templates | ❌ |
| Double-entry / photo-evidence validation | ❌ |
| Multilingual forms (EN + local languages) | ❌ |

## Section 8 · UI/UX

| Criterion | Status |
|---|---|
| Mobile-first | ✅ |
| Visual-heavy (icons, charts, traffic lights, maps) | ✅ except formal traffic lights |
| Multilingual support | ❌ English only |
| Offline mode with sync indicators | ❌ |
| Accessibility (high contrast, voice-over hints) | ⚠️ Basic Tailwind defaults, no a11y audit |
| Low-literacy friendly | ⚠️ Visual hierarchy yes, no literacy testing |

## Section 9 · Technical Recommendations

| Recommendation | Demo |
|---|---|
| Frontend: React.js / Flutter | ✅ React (Next.js 14) |
| Backend: Node.js or Python | ⚠️ Express exists but not connected to current static demo |
| Database: PostgreSQL + PostGIS | ⚠️ Neon Postgres seeded but unused; no PostGIS |
| Analytics: Power BI / Metabase | ❌ Custom Recharts |
| Security: RBAC, audit logs, encryption, HTTPS | ⚠️ RBAC ✅, audit logs ❌, HTTPS ✅, encryption N/A in static demo |
| Scalability: pilot → national | ✅ Architecture supports this |
| Interoperability: REST APIs, CSV | ⚠️ CSV ✅, REST API exists but unused |

## Section 10 · Security, Privacy & Compliance

| Criterion | Status |
|---|---|
| Anonymise beneficiary data | ⚠️ `maskPii()` honours role capability |
| Full audit trail | ❌ |
| Zambia data laws compliance | ⚠️ Acknowledged in copy; not enforced technically |
| Regular backups | ⚠️ Neon auto-backups, Firebase versioning |
| Penetration testing | ❌ |

---

## What CAN be added to the demo (fast, no infrastructure)

These are entirely client-side, work with the current static build, and would move the gap analysis materially:

| Addition | Effort | Why feasible |
|---|---|---|
| **Health Initiatives module** (`/health`) — clinics, drug availability %, ANC coverage, immunisation, under-5 services, water points functional | 2-3 hrs | Mock data only; same patterns as existing modules |
| **School Bursaries module** (`/bursaries`) split out from Beneficiaries with enrollment/completion/retention/equity | 1-2 hrs | Reuses Beneficiaries data plus new outcome fields |
| **Community Scorecards** (`/scorecards`) — list of submitted scorecards + a form preview showing the 4 dimensions (access, quality, provider behaviour, satisfaction) | 2 hrs | Mock scorecards, paper-template preview as a print-ready page |
| **Grievance Module** (`/grievances`) — intake form, list, resolution timeline | 1-2 hrs | Pure CRUD on mock data with role-based actions |
| **Traffic-light KPI convention** — refactor all KPI cards to explicit green/yellow/red dots tied to thresholds | 30 min | Pure UI refactor |
| **Geographic equity index** on dashboard | 1 hr | Computed from existing constituency data |
| **Composite CDF Performance Score** — single 0-100 number per constituency | 1 hr | Weighted formula over existing KPIs |
| **Critical-alerts banner** on dashboard home | 30 min | Already have alerts data |
| **Audit trail viewer** (`/audit`) — mock list of recent actions tied to RBAC | 1 hr | Generate from in-memory event log |
| **Evidence Hub** (`/evidence`) — gallery view of mock geotagged photos | 1-2 hrs | CSS gallery + EXIF-style metadata cards |
| **WDC / Community Monitor role** in RBAC | 30 min | Add to enum + capabilities matrix |
| **CSO / CEFANET Stakeholder role** in RBAC | 30 min | Same |
| **System Admin role** | 30 min | Same |
| **Language switcher (EN + Nyanja stub)** for ~20 key UI strings | 2-3 hrs | i18n primitive with two dictionaries |
| **Success / failure story cards** on Grants/Loans | 1 hr | Mock content with photos and outcomes |
| **Recent-alerts surface on home** (banner) | 30 min | Pull existing alerts |
| **Outcomes tracking** on Projects/Bursaries — outcome fields like "students enrolled", "jobs created" | 1-2 hrs | Add fields + KPI tiles |

**Total feasible additions:** ~18 items, roughly **20-25 hours of focused work**, all stays client-side. After these, the gap analysis would flip from 27% met → ~60% met.

## What CANNOT be done in the demo (and why)

These items require **real production infrastructure** — not impossible, just out of scope for a static client-side demo:

| Item | Why it can't be done in this demo |
|---|---|
| **Real KoboToolbox / ODK forms** | Requires a Kobo server (hosted or self-hosted), form deployment, server-side processing of submissions, webhook back to our DB. The demo has no live backend wired to the frontend. |
| **USSD / SMS gateway (Africa's Talking)** | Needs an active Africa's Talking account, Zambian shortcode, paid SMS credits, webhook receiver. Cannot mock USSD interactively. |
| **Real photo uploads from field** | Requires Firebase Storage or S3 + auth-protected upload endpoint + image processing. Static export can't accept uploads. |
| **True offline / PWA sync** | Requires service worker, IndexedDB, conflict-resolution strategy, background-sync API. Several weeks of dev. |
| **DHIS2 / HMIS integration** | Needs API credentials from Ministry of Health, a DHIS2 instance to read, and field mapping work. Not something the Ministry will hand over for a demo. |
| **SMART Zambia API pull** | Public API may not exist; even if it does, requires MoU-level access and live backend infrastructure. |
| **Real authentication (Cognito / Auth0 / Firebase Auth)** | Demo uses a client-side role-picker. Real auth requires identity-provider setup, password reset flows, MFA configuration — production-only. |
| **Real audit log writes** | Requires a backing database the frontend writes to. Static demo can simulate display but can't persist actions. |
| **Power BI embedded** | Requires a paid Power BI tenant, dataset publishing, and embed tokens. Recharts is the demo-grade substitute. |
| **PostGIS spatial queries** | Database extension on a connected Postgres. Demo's geography is currently rendered via Leaflet without spatial DB queries. |
| **Encrypted PII column-level storage** | Real backend with pgcrypto + Secrets Manager. Demo data is hardcoded so encryption is moot. |
| **Verified backup + DR** | Operational requirement — Neon does have backups, but a real DR plan requires testing on live data. |
| **Penetration test** | Requires the system to be running in production with real data, a scope of work, and a paid penetration-testing partner. |
| **National-scale load testing** | Same — requires a live system to load-test against. |
| **Field photo verification with timestamps and tamper detection** | Needs camera SDK on phone, geotag integrity, on-device hashing — mobile-app territory. |

---

## Recommended next move

Pick **5-8 items** from the "Can be added" list above to bring demo coverage from 27% → ~55% **before Thursday**. My suggested shortlist, ordered by ROI:

1. **Health Initiatives module** — closes the biggest narrative gap from the blueprint
2. **School Bursaries module** — restores a pillar the blueprint highlights specifically
3. **Community Scorecards module** — the central CEFANET methodology differentiator
4. **Grievance module** — completes the social-accountability story
5. **Critical-alerts banner on dashboard home** — small but visually meaningful
6. **WDC + CSO + System Admin roles in RBAC** — round out the role matrix
7. **Composite CDF Performance Score** — gives leadership a single number to look at
8. **Traffic-light KPI convention** — formalises what's currently informal

Total: ~12-15 hours of focused work. After this, when the Ministry asks "what's not yet in the demo?", the honest answer becomes:

> "Field data collection — Kobo, USSD, SMS, paper — that's blueprint section 7 and the pilot phase. Real ICDFMIS and DHIS2 integrations require credentials and an MoU. Everything else you see on this blueprint, you're looking at right now."

That's a much stronger position than the current one.

---

*Audit date: 13 May 2026 · against Blueprint v1.0 (May 2026)*
