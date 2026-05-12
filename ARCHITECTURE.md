# CEFANET Digital Notice Board — Architecture

End-to-end documentation of the demo system: what every piece does, how data flows, what's deliberately simple, and what should harden before production.

---

## 1. System overview

The platform is a **transparency dashboard** for Zambia's Constituency Development Fund (CDF). Citizens, district officers and CEFANET staff all view the same underlying data; **role-based authentication** controls who can modify it.

```
                        ┌─────────────────────────────┐
                        │  Browser (Desktop / Mobile) │
                        └──────────────┬──────────────┘
                                       │ HTTPS
                                       │ (NEXT_PUBLIC_API_URL)
                          ┌────────────▼──────────────┐
                          │   Next.js 14 (App Router) │
                          │   • Server-rendered pages │
                          │   • Client-side data via  │
                          │     TanStack Query        │
                          │   • Zustand for auth +    │
                          │     constituency state    │
                          └────────────┬──────────────┘
                                       │ fetch + JWT bearer
                          ┌────────────▼──────────────┐
                          │   Express 4 API           │
                          │   • CORS (env-driven)     │
                          │   • JWT auth middleware   │
                          │   • Zod request validation│
                          │   • Drizzle ORM queries   │
                          └────────────┬──────────────┘
                                       │ SQL over TLS
                          ┌────────────▼──────────────┐
                          │   PostgreSQL 16 (Neon)    │
                          │   • 9 tables, 4 enums     │
                          │   • Seeded with realistic │
                          │     Zambian CDF data      │
                          └───────────────────────────┘
```

---

## 2. Monorepo layout

```
cefanet-dnb/
├── apps/
│   ├── web/                   Next.js 14 frontend
│   │   └── src/
│   │       ├── app/            8 pages (App Router)
│   │       ├── components/     Nav, cards, charts, drawers
│   │       └── lib/            API client, Zustand stores, helpers
│   └── api/                   Express API
│       └── src/
│           ├── middleware/     JWT auth
│           └── routes/         6 route files
├── packages/
│   ├── db/                    Drizzle schema + lazy Postgres client
│   └── shared/                Zod schemas, types, constants (used by BOTH web and api)
├── scripts/
│   └── seed.ts                Realistic CDF seed for 5 constituencies
├── render.yaml                Deploy blueprint for Render
├── docker-compose.yml         Local Postgres+Redis (optional alternative to Neon)
├── .env.example               Required env variables
├── README.md                  10-minute local setup
├── DEPLOYMENT.md              25-minute production setup
└── ARCHITECTURE.md            This file
```

**Why a monorepo:** the Zod schemas in `packages/shared` are imported by **both** the API (for request validation) and the web (for typed fetches). One source of truth for every entity.

---

## 3. Authentication & authorisation

### Roles

Three roles, defined as a Postgres enum and a Zod enum mirroring it:

| Role | What they can do | Demo account |
|---|---|---|
| `super_admin` | Full read/write across all constituencies. Shows "Admin" badge in nav. | `admin@cefanet.org` |
| `district_officer` | Read all data, write scoped to their own `constituencyId`. | `officer@lusaka.gov.zm` |
| `public` | Read-only access to the public dashboard. No login required. | (no login) |

### Flow

1. **Login** — `POST /auth/login` with email/password (Zod-validated body).
2. **Password check** — bcrypt compare against `users.password_hash` (cost factor 8 for demo speed; raise to 12 for production).
3. **JWT issued** — signed with `JWT_SECRET`, contains `{sub, email, fullName, role, constituencyId}`, expires in 12 hours.
4. **Storage** — Next.js Zustand store persists the token in `localStorage` under key `cefanet_token`.
5. **Subsequent requests** — `apps/web/src/lib/api.ts` injects `Authorization: Bearer <token>` on every fetch.
6. **API middleware** — `apps/api/src/middleware/auth.ts` decodes the token into `req.user`. Optional by default; routes that need it call `requireRole(...)`.

### Why mock JWT for the demo

The full prompt asked to skip Cognito for the demo. The auth code is **structured to swap in Cognito (or any OIDC IdP) by replacing two functions in `middleware/auth.ts`** — the JWT verification call, and the user-lookup on first login. The shape of `req.user` doesn't need to change.

### What's NOT yet hardened for production

- No refresh tokens (12-hour JWT means re-login daily)
- No rate limiting on `/auth/login` (vulnerable to brute force)
- No password reset / email verification
- `JWT_SECRET` rotation invalidates all sessions (intentional simplicity)
- bcrypt cost is 8, not 12

---

## 4. Database schema

Defined in `packages/db/src/schema.ts` using Drizzle ORM. Nine tables:

```
constituencies          5 rows   (Lusaka Central, Mandevu, Kabulonga, Kabwe Central, Livingstone)
├─ users                2 rows   (admin@cefanet.org, officer@lusaka.gov.zm)
├─ projects             50 rows  (10 per constituency, mixed categories/statuses)
│  ├─ project_updates   ~150     (2-4 timeline entries per project)
│  └─ alerts            ~10      (auto-generated for stalled projects)
├─ fund_disbursements   15 rows  (3 tranches × 5 constituencies)
├─ expenditure_lines    150 rows (6 months × 5 categories × 5 constituencies)
├─ bursaries            5 rows   (1 programme per constituency)
└─ beneficiaries        90 rows  (18 per constituency, ~55% female / 45% male)
```

### Key design choices

| Decision | Why |
|---|---|
| `numeric(14,2)` for money | Exact ZMW math; no float drift |
| `pgEnum` for status/category | Cheap referential integrity, no extra lookup tables |
| `doublePrecision` for lat/lng | Standard GIS precision, no PostGIS dependency for demo |
| Beneficiaries anonymised by `code` (BEN-0001…) | SDG-4 reporting without revealing identities |
| Cascade deletes on `constituency_id` | Drop a constituency → its history goes with it |

### How seed data is built

`scripts/seed.ts` writes deterministic but realistic data:

- Project names match real Zambian compounds (Matero, Ng'ombe, Kabwe, Mosi-oa-Tunya, etc.)
- GPS coordinates offset within ±0.02° of the constituency centre — markers land inside the right area
- Stalled projects get auto-generated **alert rows** with `days_overdue` calculated from `start_date`
- Expenditure totals match the completion percentage roughly (so the dashboards look coherent)

To re-seed, run `npm run seed` — it **DELETEs** everything first, then re-inserts.

---

## 5. The 8 screens

| Screen | Path | Data sources | Notable libs |
|---|---|---|---|
| Public Dashboard | `/` | `/constituencies/:id/summary` | Recharts (bar) |
| Project Registry | `/projects` | `/projects?constituencyId=` + `/projects/:id` for drawer | Filterable client-side table |
| Financial Overview | `/financials` | `/financials/overview?constituencyId=` | Recharts (bar + line) |
| GPS Project Map | `/map` | Same as registry | react-leaflet, dynamic import (SSR off — leaflet needs `window`) |
| Login | `/login` | `/auth/login` | React Hook Form + Zod |
| Alert Engine | `/alerts` + global banner | `/alerts?constituencyId=` | — |
| Bursary Tracker | `/bursaries` | `/bursaries/stats` + `/bursaries/beneficiaries` | Recharts (pie) |
| Mobile Layout | All of the above at <768px | — | Tailwind responsive utilities + bottom-nav component |

**Loading state** — every fetching component renders a `<Skeleton />` while pending. No layout shift, no white-screen flashes.

**Error state** — every page is wrapped in `ErrorBoundary` (in `apps/web/src/components/error-boundary.tsx`). If anything throws, the user sees a friendly "Something went wrong" card with a retry button — never a white screen.

---

## 6. State management

### Server state — TanStack Query v5

Used for **anything that lives on the server**: constituencies, projects, financial overviews, beneficiaries, alerts.

- Default `staleTime: 30s` so quickly tabbing between pages doesn't refetch.
- No optimistic mutations in the demo (read-only). Easy to add later.
- Each query keyed by the entity name + constituencyId, e.g. `["projects", 1]`.

### Client state — Zustand with `persist` middleware

Used for **what the UI cares about across sessions**: which constituency the user picked, and whether they're logged in.

- `useConstituency` → `{ constituencyId, setConstituencyId }`
- `useAuth` → `{ token, user, setAuth, logout }`

Both persist to `localStorage`. Token + user info survives a page reload.

---

## 7. API surface

All endpoints under the Render API URL.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | Liveness probe |
| POST | `/auth/login` | none | Exchange email+password for JWT |
| GET | `/auth/me` | bearer | Return the decoded user |
| GET | `/constituencies` | none | List all 5 constituencies |
| GET | `/constituencies/:id/summary` | none | Dashboard summary (totals + byCategory) |
| GET | `/projects?constituencyId=` | none | Project list for one constituency |
| GET | `/projects/:id` | none | One project + its update timeline |
| GET | `/financials/overview?constituencyId=` | none | Variance, utilisation, monthly trend |
| GET | `/financials/stacked?constituencyId=` | none | Month × category breakdown |
| GET | `/bursaries/stats?constituencyId=` | none | Gender + level pie data |
| GET | `/bursaries/beneficiaries?constituencyId=` | none | Anonymised beneficiary table |
| GET | `/alerts?constituencyId=` | none | Open alerts for the banner + page |

### What's NOT yet exposed

Write endpoints — the demo is **read-only**. The schema supports it (every table has `*Insert` types), but routes weren't added because the demo doesn't ask for it. Adding `POST /projects` is ~15 lines: a Zod body schema, `requireRole("super_admin", "district_officer")`, and one Drizzle `.insert()`.

---

## 8. Deployment topology

| Concern | Local dev | Production |
|---|---|---|
| DB | Docker Postgres OR Neon | Neon Postgres |
| API | `tsx watch` on :4000 | Render Node service |
| Web | `next dev` on :3000 | Vercel |
| Env vars | `.env` at repo root | Render + Vercel dashboards |
| CORS | All localhost origins allowed | `CORS_ORIGIN` env var lists exact Vercel URL |
| HTTPS | Off (localhost) | Auto-provisioned by Render and Vercel |

See **DEPLOYMENT.md** for the click-by-click setup.

---

## 9. Things I deliberately kept simple

| Simplification | Production change |
|---|---|
| Drizzle `push` instead of generated migrations | Switch to `drizzle-kit generate` + commit migration files |
| `tsx` at runtime instead of compiled `dist/` | `tsc` build step before `node dist/index.js` |
| `origin: true` CORS in dev | `CORS_ORIGIN` allow-list in prod (already wired) |
| Bcrypt cost 8 | Raise to 12 |
| No request rate limiting | `express-rate-limit` on `/auth/login` |
| No HTTPS locally | Render/Vercel auto-handle in prod |
| Mock JWT auth | Swap to AWS Cognito / Auth0 / Clerk |
| In-process JWT secret | Rotate via secret manager (AWS SSM, Doppler) |
| Public read endpoints | Optional Cloudflare in front for caching + WAF |

---

## 10. Performance budget (demo numbers)

Measured locally on a recent laptop against Neon free tier (us-east-1):

| Page | First-load JS | Dashboard query latency |
|---|---|---|
| `/` (dashboard) | ~180 KB gzipped | ~120 ms (cold Neon, ~30 ms warm) |
| `/projects` | ~190 KB | ~80 ms |
| `/map` | ~340 KB (Leaflet adds weight) | — |
| `/bursaries` | ~210 KB | ~70 ms |

Bottleneck is the Neon free-tier cold start (sleeps after a few min idle). For a live demo, warm it with a `/health` call before walking to the projector.

---

## 11. Where to look for what

| If you want to … | Open … |
|---|---|
| Change a chart's colour or label | `apps/web/src/components/ui.tsx` and the page that uses it |
| Add a new screen | New folder under `apps/web/src/app/<name>/page.tsx` + add to `NAV_ITEMS` in `nav.tsx` |
| Add a new API endpoint | New route file under `apps/api/src/routes/`, register in `apps/api/src/index.ts` |
| Add a column to a table | Edit `packages/db/src/schema.ts`, then run `npm run db:push` |
| Add a shared type | Add a Zod schema + inferred type in `packages/shared/src/types.ts` |
| Tighten an existing role check | `apps/api/src/middleware/auth.ts` → use `requireRole(...)` in the route |
| Change seed data | `scripts/seed.ts` → re-run `npm run seed` |

---

## 12. Acknowledgements

- **Zambia's CDF policy** — Constituency Development Fund Act, 2024
- **Population data** — Zambia Statistics Agency (ZSA), 2022 census
- **Place names** — verified against OpenStreetMap

Built for civic transparency. K6.24 billion deserves a notice board.
