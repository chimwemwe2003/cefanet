# CEFANET Digital Notice Board

Civic-technology platform for monitoring Zambia's **Constituency Development Fund (CDF)** — K40 million per constituency, K6.24 billion nationally across 158 constituencies. The platform tracks projects, spending, GPS locations, bursaries, and citizen-relevant alerts.

This repository contains a working **demo** built for a Thursday presentation to CEFANET leadership and government partners.

---

## Stack

- **Frontend** — Next.js 14 (App Router), TypeScript strict, Tailwind CSS, shadcn-style primitives, TanStack Query v5, Zustand, Recharts, react-leaflet, React Hook Form + Zod.
- **Backend** — Node.js 20 + Express + Drizzle ORM.
- **Database** — PostgreSQL 15 (Docker), Redis 7 (Docker, available for caching).
- **Auth** — Mock JWT signed locally; bcrypt-hashed demo passwords; role-aware middleware.

---

## 10-minute setup

### Prerequisites

- **Node.js 20+** (check with `node -v`)
- **Docker Desktop** (for Postgres + Redis)
- **npm 10+** (ships with Node 20)

### Steps

```bash
# 1. Clone & install (single npm workspaces install at the repo root)
cd cefanet-dnb
cp .env.example .env
npm install

# 2. Start the database
npm run db:up                # Postgres + Redis via Docker Compose

# 3. Create the schema
npm run db:push              # Drizzle "push" — direct schema sync (demo-fast)

# 4. Seed with realistic CDF data for 5 Zambian constituencies
npm run seed

# 5. Start API + Web together
npm run dev                  # api on :4000, web on :3000
```

Open **http://localhost:3000** in your browser.

### Run them separately (optional)

```bash
npm run dev:api              # http://localhost:4000
npm run dev:web              # http://localhost:3000
```

---

## Demo accounts

| Email                       | Password | Role             | Scope                |
| --------------------------- | -------- | ---------------- | -------------------- |
| `admin@cefanet.org`         | `demo123` | Super Admin     | Full access          |
| `officer@lusaka.gov.zm`     | `demo123` | District Officer | Lusaka Central       |
| _(no login)_                | —        | Public           | Read-only dashboard  |

The login page has a one-click "Use" button for each demo account.

---

## The eight demo screens

1. **Public Dashboard** (`/`) — summary cards, budget-vs-expenditure chart, constituency switch.
2. **Project Registry** (`/projects`) — sortable filtered table; click any row to open the detail drawer with GPS, contractor, timeline.
3. **Financial Overview** (`/financials`) — utilisation, variance, monthly trend.
4. **GPS Project Map** (`/map`) — react-leaflet with project markers coloured by status.
5. **Login** (`/login`) — role-based login + RBAC nav.
6. **Alert Engine** — persistent banner on every page + full alerts page at `/alerts`.
7. **Bursary Tracker** (`/bursaries`) — SDG-4 badge, gender pie chart, beneficiary table.
8. **Mobile Layout** — every screen above is fully usable at 375px; bottom navigation appears under 768px.

---

## Seed data

For each of these 5 constituencies, 10 realistic projects across infrastructure / education / health / empowerment / bursaries:

- Lusaka Central
- Mandevu
- Kabulonga
- Kabwe Central
- Livingstone

Plus 18 anonymised bursary beneficiaries per constituency (~55% female / 45% male), 3 fund disbursement tranches, 6 months of monthly expenditure records per constituency, and pre-configured stalled projects so the alert engine fires automatically.

---

## Repo structure

```
cefanet-dnb/
├── apps/
│   ├── web/                 # Next.js 14 frontend (8 screens)
│   └── api/                 # Express backend
├── packages/
│   ├── db/                  # Drizzle schema + Postgres client
│   └── shared/              # Zod schemas + TypeScript types
├── scripts/
│   └── seed.ts              # Full demo seed
├── docker-compose.yml
└── README.md
```

---

## Resetting the demo

```bash
npm run db:down              # tear down containers
docker volume rm cefanet-dnb_cefanet_pgdata   # wipe data
npm run db:up && npm run db:push && npm run seed
```

---

## Production hardening (post-demo)

- Replace mock JWT with AWS Cognito (or another IdP); rotate `JWT_SECRET`.
- Switch from `drizzle-kit push` to generated migrations under version control.
- Add rate limiting + request validation on all mutating endpoints.
- Run API behind TLS via your reverse proxy; CORS allowlist.
- Add caching via Redis for hot read paths (constituency summaries, alerts).
- Set up CI to run `tsc --noEmit` and `next build` on every PR.

---

Built for civic transparency. **K6.24 billion deserves a notice board.**
