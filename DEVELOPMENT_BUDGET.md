# CEFANET CDF-MS — Development Plan & Resource Breakdown

What it actually takes to move from the current demo to a production system serving all 156 constituencies. All figures in **USD** (with K equivalents at K~25/USD where useful). Numbers are estimates with a +/- 25% honest range — refine after vendor quotes.

---

## Executive Summary

| Phase | Duration | Cost range (USD) | Cost range (ZMW) |
|---|---|---|---|
| **Phase 0** — Foundation (MoU, requirements, DPIA, hires) | 6 weeks | $25k – $45k | K625k – K1.1M |
| **Phase 1** — MVP build (Sprints 1-6) | 12 weeks | $85k – $135k | K2.1M – K3.4M |
| **Phase 2** — Pilot in 5-10 constituencies | 12 weeks | $60k – $100k | K1.5M – K2.5M |
| **Phase 3** — Hardening + national rollout prep | 12 weeks | $70k – $110k | K1.75M – K2.75M |
| **Phase 4** — National rollout (158 constituencies) | 6 months | $250k – $480k | K6.25M – K12M |
| **Year 1 total** | ~12 months | **$490k – $870k** | **K12.25M – K21.75M** |
| Year 2 steady-state (operations + iteration) | 12 months | $220k – $340k | K5.5M – K8.5M |

**The lean reading: ~$490k year 1, ~$220k year 2 ongoing.**
**The robust reading: ~$870k year 1, ~$340k year 2 ongoing.**

Both assume MLGRD provides ICDFMIS access and Ministry of Health provides DHIS2/HMIS access without licensing fees. Both assume CEFANET secures donor funding for at least Phase 0 + Phase 1.

---

## 1. Team Composition

The blueprint specifies 6 people. In practice you need 7 core + 2 part-time + field staff. Salaries are blended Zambia/SADC rates with senior roles paying closer to international remote rates where the talent pool requires it.

### Core build team (Phases 1-3)

| Role | FTE | Mo. cost (USD) | Why this person matters |
|---|---|---|---|
| Tech Lead / Product Architect | 1.0 | $4,000 – $6,000 | Owns architecture decisions, code-reviews, blocks scope creep, interfaces with MLGRD |
| Senior Full-Stack Developer × 2 | 2.0 | $3,000 – $4,500 each | Next.js + Node.js + Postgres. Build velocity comes from these two. |
| UI/UX Designer | 0.5 – 1.0 | $1,500 – $2,800 | Wireframes, design system, citizen-facing UX testing |
| DevOps Engineer | 0.5 – 1.0 | $2,500 – $4,000 | AWS infrastructure, CI/CD, monitoring, security baseline |
| QA Engineer | 0.5 – 1.0 | $1,000 – $1,800 | Test automation, manual UAT, regression. Indispensable before pilot launch. |
| Mobile Developer (Phase 2+) | 0.5 – 1.0 | $2,500 – $4,000 | Flutter or React Native for WDC mobile data collection |

### Domain & coordination

| Role | FTE | Mo. cost (USD) | Notes |
|---|---|---|---|
| Product / Programme Manager | 1.0 | $2,500 – $4,000 | Often the CEFANET ED's deputy. Owns the roadmap, sprint reviews, MoU compliance. |
| M&E Specialist (CEFANET in-house) | 0.5 | $1,500 – $2,500 | Operationalises the MfDR indicator framework; validates that KPIs match policy |
| Field Coordinator (per pilot district) | 1.0 each | $800 – $1,500 each | Trains WDCs, runs scorecard sessions, escalates grievances |

### Approximate monthly labour cost

- **MVP build (Phase 1, no field coord yet):** $13k – $22k/mo
- **Pilot phase (1-2 field coords):** $15k – $26k/mo
- **Full national rollout (10 regional coords):** $25k – $42k/mo

> **K equivalents:** $13k ≈ K325k/mo; $42k ≈ K1.05M/mo

---

## 2. Technology Stack — Final Recommendation

Refined from the demo. Some items differ from the blueprint where the demo experience proved a better choice.

### Frontend
- **Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui** — kept as is
- **TanStack Query v5 + Zustand** — kept as is
- **Recharts + react-leaflet** — Recharts proven sufficient. **Skip Power BI/Tableau** — too expensive at the team's scale, and licensing creates a dependency on Microsoft. Revisit only if MLGRD already pays for it.
- **next-pwa + Workbox** for offline (Phase 2 addition)
- **next-intl** for English + Nyanja + Bemba

### Backend
- **Node.js 20 LTS + Express** for the Core API
- **Python 3.12 + FastAPI** for the Analytics Service (MfDR computations, indicator scoring)
- **Drizzle ORM** for type-safe Postgres access
- **BullMQ + Redis** for background jobs (ICDFMIS sync, report generation, SMS dispatch)
- **AWS Cognito** for identity (mandatory swap from the demo's mock JWT)

### Mobile (Phase 2)
- **Flutter** for the WDC field app — single codebase covering Android + iOS, native performance, offline-first via SQLite + sync service
- **Alternative**: React Native Expo if the dev team is JS-native; equivalent capability

### Database & storage
- **PostgreSQL 16 + PostGIS** managed on AWS RDS (Multi-AZ)
- **Redis 7** managed on AWS ElastiCache
- **AWS S3** for photo evidence + generated reports
- **AWS CloudFront** as CDN

### Field data collection
- **KoboToolbox** (free tier for NGOs; paid hosting ~$200/mo at scale)
- **Africa's Talking** for USSD + SMS in Zambia
- **Twilio** as redundancy partner for SMS (optional)

### Cloud & infra
- **AWS af-south-1 (Cape Town)** for data residency under Zambia Data Protection Act 2021
- **AWS ECS Fargate** for containerised API + workers
- **AWS Cognito + Secrets Manager + KMS** for auth + secrets + encryption
- **GitHub + GitHub Actions** for CI/CD
- **Terraform** for Infrastructure-as-Code (mandatory — no clicking around AWS console in production)

### Observability
- **Sentry** for error tracking
- **AWS CloudWatch** for logs, metrics, alarms
- **Better Stack** (formerly Logtail) or **Datadog** if budget allows — better dashboards than CloudWatch alone

---

## 3. Infrastructure Cost — Monthly

These are running costs once you've deployed. Year 1 should plan for them from Sprint 1, not after launch.

| Service | MVP (5 const.) | Pilot (10 const.) | National (158 const.) |
|---|---|---|---|
| AWS ECS Fargate (API + workers) | $80 | $150 | $400 – $600 |
| AWS RDS Postgres (Multi-AZ) | $90 | $140 | $350 – $500 |
| AWS ElastiCache Redis | $30 | $50 | $120 – $200 |
| AWS S3 + CloudFront (photos) | $20 | $60 | $250 – $500 |
| AWS Cognito | $0 (free tier) | $0 | $50 – $150 |
| AWS Secrets Manager + KMS | $5 | $10 | $30 |
| AWS Route 53 + ACM + WAF | $25 | $30 | $80 |
| AWS SES (email) | $5 | $10 | $40 – $100 |
| AWS CloudWatch + X-Ray | $20 | $40 | $120 – $200 |
| Sentry (error tracking) | $26 | $26 | $80 – $150 |
| KoboToolbox hosted | $0 | $200 | $200 – $500 |
| Africa's Talking SMS (variable) | $10 | $80 | $400 – $1,200 |
| Africa's Talking USSD code rental | $0 | $50 | $50 – $100 |
| GitHub Team plan | $4 | $4 | $4 |
| Domain + monitoring | $30 | $40 | $80 |
| **Total monthly** | **~$345** | **~$890** | **~$2,250 – $4,290** |
| **Annualised** | $4,140 | $10,680 | $27,000 – $51,500 |

> **K equivalent at national scale:** ~K56k – K107k/mo. Real, but well within MLGRD's annual operational envelope.

### Cost levers
- **AWS Reserved Instances** (1-year commit) → 30-40% savings on compute and RDS
- **CloudFront free tier** + S3 lifecycle policies (move 2-year-old photos to Glacier) → ~50% storage savings at scale
- **Africa's Talking volume discount** when you commit > 500k SMS/year

---

## 4. One-Time / Project-Phase Costs

| Item | Cost (USD) | Phase |
|---|---|---|
| Domain registration (cefanet.org, dnb.cefanet.org) | $20 / yr | Phase 0 |
| SSL certificates | $0 (AWS ACM free) | Phase 0 |
| Data Protection Impact Assessment (DPIA) | $3,000 – $8,000 | Phase 0 |
| Legal review of MoU + terms of service | $2,000 – $5,000 | Phase 0 |
| Brand / logo / style guide finalisation | $1,500 – $3,500 | Phase 0 |
| Penetration test (pre-pilot) | $5,000 – $15,000 | End of Phase 1 |
| Code security audit (third-party) | $3,000 – $10,000 | End of Phase 1 |
| Performance / load testing | $2,000 – $5,000 | End of Phase 2 |
| Annual pen-test (recurring) | $5,000 – $12,000 | Year 2+ |
| External M&E evaluation of pilot | $8,000 – $15,000 | End of Phase 2 |
| Training video production (5 short modules) | $2,500 – $6,000 | Phase 2 |

---

## 5. Field Operations & Training

The blueprint hinges on WDCs and CDFCs actually using the platform. This is the budget line most overlooked by tech-only estimates.

### Training rounds

Assumptions (Zambian rates):
- Per-diem for community participants: ~K600/day (~$25)
- Per-diem for trainers / facilitators: ~K1,200/day (~$50)
- Venue + tea/lunch: ~K2,500/day (~$100)
- Materials + printing: ~$300 per cohort
- Local transport reimbursement: ~K200 (~$8) per participant per day

**Per cohort of 30 WDC + CDFC members, 3-day training:**
- Per-diems: 30 × $25 × 3 = $2,250
- Trainers (2): 2 × $50 × 3 = $300
- Venue: 3 × $100 = $300
- Materials: $300
- Transport: 30 × $8 × 3 = $720
- **Subtotal per cohort: ~$3,870 (~K96k)**

**Pilot (5 constituencies, 3 cohorts in total): ~$12,000 (~K300k)**
**National rollout (158 constituencies, ~50 cohorts): ~$200,000 (~K5M)**

### Hardware for field officers

- Mid-range Android tablets (10"): $250 each
- Solar power banks: $30 each
- Tablet protective cases: $20 each
- Per-field-officer kit: ~$300
- 50 field officers for pilot: $15,000
- 250 officers for national rollout: $75,000

### Connectivity allowance
- Monthly data bundles for field officers: ~K200/mo (~$8) each
- 50 officers × 12 months: ~$4,800
- 250 officers × 12 months: ~$24,000

### Travel for technical team
- Local in-country travel during pilot: $3,000 – $6,000
- National rollout regional visits: $15,000 – $30,000

---

## 6. Communications & Citizen Adoption

Often forgotten — without communications, citizens don't know the platform exists.

| Item | Pilot | National |
|---|---|---|
| Community radio sponsorships | $2,000 | $15,000 |
| WhatsApp broadcast lists / Twitter / X presence | $500 (mgmt time) | $4,000 |
| Press releases + media days | $2,000 | $8,000 |
| Print materials (posters, flyers in Bemba/Nyanja/English) | $1,500 | $12,000 |
| Citizen onboarding campaign | $0 | $20,000 |

---

## 7. Phase-by-Phase Plan

### Phase 0 — Foundation (Weeks 1-6, $25k-$45k)

**Goal:** Get the foundations in place so engineering doesn't waste sprints on blockers.

- MoU finalisation with MLGRD (legal review)
- DPIA + register with the Data Protection Commissioner
- Hire Tech Lead + 1 Senior Developer + Designer
- Set up AWS account (Cape Town), GitHub org, Terraform skeleton
- Finalise Kobo form templates (in EN, Nyanja, Bemba)
- Confirm ICDFMIS API availability (this is your biggest risk — if there's no API, plan a CSV-import workflow)
- Identify pilot constituencies (recommend Lusaka Central + Mandevu + one rural in Eastern + one in Western)

### Phase 1 — MVP build (Weeks 7-18, $85k-$135k)

**Goal:** Working system that the team can deploy with confidence.

Per blueprint's 12-week sprint plan:
- Sprint 1: Foundation + Auth (Cognito wired, RBAC enforced server-side)
- Sprint 2: Core data models + Admin
- Sprint 3: Financial monitoring + GPS photo upload + Alert engine
- Sprint 4: Bursaries + Grants + Loans modules
- Sprint 5: Public dashboard + ICDFMIS sync + SMS gateway + PWA basics
- Sprint 6: Reports + Community Scorecards + Grievance module + Pilot launch

By end of Phase 1: Pen-test complete, all P0 features in production, ready for pilot.

### Phase 2 — Pilot (Weeks 19-30, $60k-$100k)

**Goal:** Validate the platform with real users on real CDF cycles.

- Onboard 5 pilot constituencies
- Train ~150 WDC + CDFC members
- Deploy 50 tablets to field officers
- Daily standups on observed issues
- Bi-weekly retrospectives with pilot users
- Quarterly synthesis report tabled with MLGRD
- External M&E evaluator engaged

### Phase 3 — Hardening (Weeks 31-42, $70k-$110k)

**Goal:** Production-grade for 158 constituencies.

- Add mobile app (Flutter) for WDC offline data collection
- Health module deepens (DHIS2/HMIS integration if approved)
- Performance optimisation for the bigger dataset
- Annual pen-test, full security audit
- Comprehensive training materials
- Internal CEFANET helpdesk set up

### Phase 4 — National rollout (Months 13-18, $250k-$480k)

**Goal:** 158 constituencies live.

- Regional rollouts in tranches of ~30 constituencies/month
- 10 regional field coordinators hired
- Training cohorts running in parallel across provinces
- Public launch + citizen comms campaign
- National Transparency Report tabled with PAC + Auditor General

---

## 8. Year 2 Steady-State (Months 19-30, $220k-$340k)

Post-rollout, the system needs ongoing operation:

- Smaller core team (Tech Lead, 1.5 devs, 0.5 DevOps, QA)
- Field coordinators rotating across regions
- Infrastructure costs at national scale (~$3k/mo)
- Annual pen-test, training refreshers
- New feature delivery (Phase 2 backlog from blueprint: AI anomaly detection, WhatsApp bot, predictive analytics)

---

## 9. Funding Sources to Pursue

CEFANET likely cannot self-fund this. Realistic donor + partnership candidates:

| Source | Typical award size | Why a fit |
|---|---|---|
| **MLGRD direct contribution** (post-MoU) | $50k – $200k | If they want it, they'll fund some of it |
| **GIZ** (German cooperation) | $100k – $500k | Active in Zambia decentralisation; loves M&E platforms |
| **DFID / FCDO** | $200k – $800k | Transparency + accountability mandates |
| **USAID** (when programmes resume) | $150k – $1M | Anti-corruption + civic-tech grants |
| **Open Society Foundations** | $50k – $300k | Civic tech, governance |
| **Hivos / Indigo Trust** | $30k – $150k | Smaller civic-tech grants |
| **World Bank STAR** | $200k – $1M | Statistics + transparency programmes |
| **Bill & Melinda Gates Foundation** | $200k – $2M | If you frame it as health + education outcomes |
| **Local foundations (Stanbic Foundation, FNB Foundation Zambia)** | $20k – $80k | Corporate social investment in civic infra |

**Recommendation:** Apply to 3-4 in parallel during Phase 0 with a clear pitch (the demo + this budget doc + the gap analysis). Don't depend on any single source. Aim to close $400k+ before Phase 1 starts.

---

## 10. Risk-Adjusted Contingency

| Risk | Likelihood | Cost impact | Mitigation |
|---|---|---|---|
| ICDFMIS API doesn't exist / unreliable | High | +$15k (build CSV import workflow) | Confirm in Phase 0; design for fallback |
| Cognito + MLGRD identity integration is hard | Medium | +$8k | Allocate 1.5 sprints in Phase 1 |
| Penetration test surfaces critical findings | Medium | +$10k + 2 weeks | Run pen-test by Sprint 5, not Sprint 6 |
| Field training takes longer than 3 days per cohort | Medium | +30% on training line | Pilot first; recalibrate before national |
| Donor commits delayed by 6 months | High | Phase 2 pushed back | Stage spend gates; don't hire Phase 2 coordinators until Phase 1 funded |
| MoU signing delayed | High | Phases 0-1 slide | Don't start hiring until MoU draft is approved by both sides |

**Recommended contingency line:** Add **15% on labour** and **20% on field operations** to the lean-end estimates.

---

## 11. What you can show the Ministry

Going into the MoU meeting with three documents in hand:

1. **The live demo** — at `cefanet-2f71f.web.app` covering 15-module unified system, real maps, real exports, working RBAC.
2. **The blueprint** — Technical Architecture Blueprint v1.0 + Hybrid Monitoring Dashboard v1.0.
3. **This budget** — phase-by-phase cost ranges, team plan, infra estimate, funding sources.

The pitch to leadership becomes:

> "We've built and deployed a working demo that already covers ~55% of the blueprint at $0 marginal cost. To turn it into the production system that monitors K6.24 billion across 156 constituencies, we need roughly **$490k-$870k for Year 1** spread across foundation, build, pilot and rollout. Year 2 ongoing is about **$220k-$340k**. CEFANET will lead implementation as a Complementary Partner under the CDF Act No. 1 of 2024; MLGRD provides ICDFMIS access and political cover; donors fund 70-80% of the cost; the Ministry funds 20-30% post-MoU. We're applying to GIZ, FCDO, OSF and the World Bank STAR programme in parallel. With your signature on the MoU, we can have a pilot operating in five Lusaka-area constituencies within five months."

That's a fundable, realistic, government-ready pitch.

---

## 12. Quick decisions to make in Phase 0

These five choices, decided in Phase 0, determine half the rest of the budget:

1. **Cloud region — Cape Town vs Frankfurt.** Cape Town is correct under Zambia DPA 2021. Frankfurt is cheaper. Default: Cape Town.
2. **Power BI vs Recharts.** Recharts is free and fast. Only switch to Power BI if MLGRD already uses it and wants integration. Default: keep Recharts.
3. **Cognito vs Auth0 vs Clerk.** Cognito for AWS integration. Auth0 for better DX (more $$). Clerk for fastest setup (paid). Default: Cognito.
4. **Mobile: Flutter vs React Native.** Both work; pick on team skills. Default: Flutter (better offline-first story).
5. **Hosted Kobo vs self-hosted ODK.** Self-hosting saves $200/mo but costs DevOps time. Default: hosted Kobo through pilot, reconsider at national scale.

Get these right early; the rest is execution.
