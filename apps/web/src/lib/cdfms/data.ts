// Deterministic mock dataset for the CDF-MS Ministry demo.
// Everything is generated from constituency seeds so it stays stable across page loads.

import { CONSTITUENCIES, PROVINCES, type ConstituencyRow, type ProvinceKey } from "./constituencies";

// ---------- Deterministic PRNG ----------
function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

const range = (rnd: () => number, lo: number, hi: number): number =>
  Math.floor(lo + rnd() * (hi - lo + 1));

// ---------- Constituency-level fund summary ----------
export interface FundSummary {
  constituencyId: number;
  allocated: number; // ZMW
  disbursed: number;
  committed: number;
  utilisationPct: number; // disbursed / allocated
  status: "on-track" | "watch" | "at-risk";
}

const PER_CONSTITUENCY_ALLOC = 40_000_000; // K40M per constituency in 2026

export function fundSummary(c: ConstituencyRow): FundSummary {
  const rnd = seeded(c.id * 31);
  const utilPct = 0.35 + rnd() * 0.6; // 35 - 95%
  const disbursed = Math.round(PER_CONSTITUENCY_ALLOC * utilPct);
  const committed = Math.round(disbursed * (0.85 + rnd() * 0.12));
  const status: FundSummary["status"] =
    utilPct >= 0.75 ? "on-track" : utilPct >= 0.55 ? "watch" : "at-risk";
  return {
    constituencyId: c.id,
    allocated: PER_CONSTITUENCY_ALLOC,
    disbursed,
    committed,
    utilisationPct: utilPct * 100,
    status,
  };
}

export const ALL_FUND_SUMMARIES: FundSummary[] = CONSTITUENCIES.map(fundSummary);

// ---------- National roll-up ----------
export const NATIONAL = (() => {
  const totalAllocated = CONSTITUENCIES.length * PER_CONSTITUENCY_ALLOC;
  const totalDisbursed = ALL_FUND_SUMMARIES.reduce((a, f) => a + f.disbursed, 0);
  const totalCommitted = ALL_FUND_SUMMARIES.reduce((a, f) => a + f.committed, 0);
  return {
    constituencyCount: CONSTITUENCIES.length,
    totalAllocated,
    totalDisbursed,
    totalCommitted,
    utilisationPct: (totalDisbursed / totalAllocated) * 100,
    onTrackCount: ALL_FUND_SUMMARIES.filter((f) => f.status === "on-track").length,
    watchCount: ALL_FUND_SUMMARIES.filter((f) => f.status === "watch").length,
    atRiskCount: ALL_FUND_SUMMARIES.filter((f) => f.status === "at-risk").length,
  };
})();

// ---------- Province roll-ups ----------
export interface ProvinceRollup {
  province: ProvinceKey;
  constituencyCount: number;
  allocated: number;
  disbursed: number;
  utilisationPct: number;
}

export const PROVINCE_ROLLUPS: ProvinceRollup[] = PROVINCES.map((p) => {
  const rows = CONSTITUENCIES.filter((c) => c.province === p);
  const sums = rows.map(fundSummary);
  const allocated = rows.length * PER_CONSTITUENCY_ALLOC;
  const disbursed = sums.reduce((a, s) => a + s.disbursed, 0);
  return {
    province: p,
    constituencyCount: rows.length,
    allocated,
    disbursed,
    utilisationPct: (disbursed / allocated) * 100,
  };
});

// ---------- Year-over-year trend (2022-2025) ----------
export const YOY_TREND = [
  { year: 2022, allocation: 1_600_000, disbursement: 1_420_000, projects: 4_280 },
  { year: 2023, allocation: 28_300_000, disbursement: 24_120_000, projects: 11_640 },
  { year: 2024, allocation: 30_600_000, disbursement: 27_850_000, projects: 14_320 },
  { year: 2025, allocation: 36_100_000, disbursement: 33_410_000, projects: 16_980 },
  { year: 2026, allocation: 40_000_000, disbursement: 21_280_000, projects: 8_420 }, // partial year
];

// ---------- Disbursement workflow records ----------
export type WorkflowStage =
  | "submitted"
  | "committee_review"
  | "constituency_office"
  | "treasury"
  | "disbursed"
  | "rejected";

export interface DisbursementRequest {
  id: string;
  ref: string;
  constituencyId: number;
  category: "infrastructure" | "education" | "health" | "empowerment" | "feeding" | "grants" | "loans";
  amount: number;
  purpose: string;
  requestedBy: string;
  stage: WorkflowStage;
  submittedAt: string;
  daysInStage: number;
}

const PURPOSES = [
  "Phase 2 milestone payment — feeder road resurfacing",
  "Classroom block roofing materials",
  "Hospital wing equipment procurement",
  "School feeding programme Q2 supplier payment",
  "Women's cooperative startup grant disbursement",
  "Bridge construction milestone 3",
  "Solar electrification — health post",
  "Vocational training equipment",
];

export const DISBURSEMENT_REQUESTS: DisbursementRequest[] = CONSTITUENCIES.slice(0, 24).map(
  (c, i) => {
    const rnd = seeded(c.id * 73 + 11);
    const stages: WorkflowStage[] = [
      "submitted",
      "committee_review",
      "constituency_office",
      "treasury",
      "disbursed",
      "submitted",
      "committee_review",
      "treasury",
    ];
    return {
      id: `REQ-${String(i + 1).padStart(5, "0")}`,
      ref: `CDF/${c.province.slice(0, 2).toUpperCase()}/${c.id}/${2026}/${String(i + 1).padStart(3, "0")}`,
      constituencyId: c.id,
      category: (["infrastructure", "education", "health", "empowerment", "feeding"][i % 5] ?? "infrastructure") as DisbursementRequest["category"],
      amount: 250_000 + Math.round(rnd() * 4_750_000),
      purpose: PURPOSES[i % PURPOSES.length],
      requestedBy: ["CDFC Secretary", "MP Office", "District Coordinator"][i % 3],
      stage: stages[i % stages.length],
      submittedAt: `2026-0${(i % 5) + 1}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
      daysInStage: range(rnd, 1, 28),
    };
  }
);

// ---------- School Feeding ----------
export interface FeedingSchool {
  id: number;
  name: string;
  constituencyId: number;
  pupils: number;
  mealsPerDay: number;
  costPerMeal: number;
  supplier: string;
  status: "active" | "paused" | "onboarding";
  monthsRunning: number;
}

const SCHOOL_PREFIXES = [
  "Lusaka Basic",
  "Matero Primary",
  "Ng'ombe Community",
  "Kabwe Combined",
  "Livingstone Township",
  "Chongwe Day",
  "Kanyama Primary",
  "Mufulira North",
  "Solwezi Basic",
  "Mansa Primary",
  "Choma Township",
  "Mongu Day",
  "Petauke Primary",
  "Chinsali Day",
  "Kasama Township",
];

const SUPPLIERS = [
  "ZamFoods Catering Co",
  "Maluti Supplies Ltd",
  "Pamodzi Catering",
  "Chitalu Foods",
  "Mwamba Nutrition Co",
  "Kafue Catering Services",
];

export const FEEDING_SCHOOLS: FeedingSchool[] = CONSTITUENCIES.flatMap((c, i) => {
  const rnd = seeded(c.id * 41 + 7);
  const n = i % 3 === 0 ? 3 : 2;
  return Array.from({ length: n }).map((_, j) => ({
    id: c.id * 100 + j,
    name: `${SCHOOL_PREFIXES[(c.id + j) % SCHOOL_PREFIXES.length]} #${j + 1}`,
    constituencyId: c.id,
    pupils: range(rnd, 180, 1200),
    mealsPerDay: 1,
    costPerMeal: 6 + Math.round(rnd() * 4),
    supplier: SUPPLIERS[(c.id + j) % SUPPLIERS.length],
    status: (["active", "active", "active", "onboarding", "paused"][(c.id + j) % 5] ?? "active") as FeedingSchool["status"],
    monthsRunning: range(rnd, 2, 18),
  }));
});

export const FEEDING_TOTALS = {
  schools: FEEDING_SCHOOLS.length,
  pupils: FEEDING_SCHOOLS.reduce((a, s) => a + s.pupils, 0),
  mealsThisMonth: FEEDING_SCHOOLS.reduce((a, s) => a + s.pupils * 20, 0),
  monthlyCost: FEEDING_SCHOOLS.reduce((a, s) => a + s.pupils * 20 * s.costPerMeal, 0),
};

// ---------- Grants ----------
export type GrantCategory = "agriculture" | "small_business" | "women" | "youth";
export type GrantStatus = "submitted" | "under_review" | "approved" | "disbursed" | "rejected";

export interface GrantApplication {
  id: string;
  applicant: string;
  category: GrantCategory;
  amount: number;
  constituencyId: number;
  status: GrantStatus;
  score: number;
  submittedAt: string;
  progressPct: number;
}

const APPLICANT_NAMES = [
  "Mwape Co-op", "Bwalya Tailoring", "Chanda Hatcheries", "Kabwe Maize Out-growers",
  "Mutinta Honey", "Munali Youth Welders", "Ng'ombe Mothers' Bakery", "Choolwe Catfish Pond",
  "Lukundo Photography", "Inonge Pottery", "Kapasa Brick Co.", "Mainza Carpentry",
  "Towela Tomato Out-growers", "Patience Bakery", "Kasonde Hatcheries",
];

export const GRANT_APPLICATIONS: GrantApplication[] = Array.from({ length: 64 }).map((_, i) => {
  const rnd = seeded(i * 13 + 91);
  const cats: GrantCategory[] = ["agriculture", "small_business", "women", "youth"];
  const statuses: GrantStatus[] = ["submitted", "under_review", "approved", "disbursed", "rejected", "approved", "disbursed"];
  return {
    id: `GR-${String(i + 1).padStart(5, "0")}`,
    applicant: `${APPLICANT_NAMES[i % APPLICANT_NAMES.length]} ${i % 9 === 0 ? "II" : ""}`.trim(),
    category: cats[i % 4],
    amount: 45_000 + Math.round(rnd() * 455_000),
    constituencyId: CONSTITUENCIES[i % CONSTITUENCIES.length].id,
    status: statuses[i % statuses.length],
    score: range(rnd, 52, 96),
    submittedAt: `2026-0${(i % 5) + 1}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`,
    progressPct: ["disbursed", "approved"].includes(statuses[i % statuses.length]) ? range(rnd, 35, 95) : 0,
  };
});

// ---------- Loans ----------
export type LoanStatus = "active" | "performing" | "delinquent" | "defaulted" | "repaid";

export interface LoanRecord {
  id: string;
  borrower: string;
  constituencyId: number;
  principal: number;
  outstanding: number;
  monthlyInstalment: number;
  termMonths: number;
  status: LoanStatus;
  daysPastDue: number;
}

export const LOAN_RECORDS: LoanRecord[] = Array.from({ length: 78 }).map((_, i) => {
  const rnd = seeded(i * 17 + 53);
  const principal = 80_000 + Math.round(rnd() * 920_000);
  const term = [12, 18, 24, 36][i % 4];
  const monthsPaid = i % term;
  const repaidShare = monthsPaid / term;
  const outstanding = Math.round(principal * (1 - repaidShare * (0.85 + rnd() * 0.15)));
  let status: LoanStatus = "active";
  if (outstanding <= principal * 0.05) status = "repaid";
  else if (i % 13 === 0) status = "defaulted";
  else if (i % 11 === 0) status = "delinquent";
  else status = "performing";
  return {
    id: `LN-${String(i + 1).padStart(5, "0")}`,
    borrower: `${APPLICANT_NAMES[(i + 3) % APPLICANT_NAMES.length]} Loan ${i + 1}`,
    constituencyId: CONSTITUENCIES[(i * 5) % CONSTITUENCIES.length].id,
    principal,
    outstanding,
    monthlyInstalment: Math.round(principal / term),
    termMonths: term,
    status,
    daysPastDue: status === "delinquent" ? range(rnd, 35, 89) : status === "defaulted" ? range(rnd, 90, 240) : 0,
  };
});

// ---------- Infrastructure projects ----------
export type ProjectStatus = "planned" | "ongoing" | "complete" | "stalled";

export interface InfraProject {
  id: string;
  name: string;
  constituencyId: number;
  category: "infrastructure" | "education" | "health" | "water";
  budget: number;
  spend: number;
  status: ProjectStatus;
  completionPct: number;
  contractor: string;
  startDate: string;
  endDate: string;
  milestonesDone: number;
  milestonesTotal: number;
}

const PROJECT_TEMPLATES = [
  "Feeder Road Rehabilitation",
  "Classroom Block Construction",
  "Health Post Expansion",
  "Solar Power Installation",
  "Borehole Drilling",
  "Market Roofing",
  "Bridge Approach Works",
  "ICT Lab Refurbishment",
  "Drainage Improvement",
  "Police Post Construction",
];

const CONTRACTORS = [
  "Zambezi Construction Ltd",
  "Kafue Civils",
  "Heritage Builders",
  "Mwamba Engineering",
  "Lusaka Public Works",
  "Premier Roads",
  "Mining Heritage Zm",
];

export const INFRA_PROJECTS: InfraProject[] = CONSTITUENCIES.flatMap((c, i) =>
  Array.from({ length: 4 }).map((_, j) => {
    const rnd = seeded(c.id * 91 + j * 13);
    const statuses: ProjectStatus[] = ["ongoing", "complete", "stalled", "planned", "ongoing"];
    const status = statuses[(c.id + j) % statuses.length];
    const budget = 500_000 + Math.round(rnd() * 7_500_000);
    const completion =
      status === "complete" ? 100 : status === "stalled" ? range(rnd, 15, 35) : status === "planned" ? 0 : range(rnd, 35, 85);
    const milestonesTotal = 5;
    return {
      id: `PR-${String(c.id).padStart(3, "0")}-${j}`,
      name: `${PROJECT_TEMPLATES[(c.id + j) % PROJECT_TEMPLATES.length]} — ${c.name}`,
      constituencyId: c.id,
      category: (["infrastructure", "education", "health", "water"][(c.id + j) % 4]) as InfraProject["category"],
      budget,
      spend: Math.round(budget * (completion / 100)),
      status,
      completionPct: completion,
      contractor: CONTRACTORS[(c.id + j) % CONTRACTORS.length],
      startDate: `2025-0${((c.id + j) % 9) + 1}-15`,
      endDate: `2026-${String(((c.id + j) % 10) + 1).padStart(2, "0")}-30`,
      milestonesDone: Math.round((completion / 100) * milestonesTotal),
      milestonesTotal,
    };
  })
);

// ---------- Beneficiaries ----------
export type VulnerabilityScore = "low" | "medium" | "high" | "critical";

export interface Beneficiary {
  id: string;
  nrc: string; // National Registration Card (synthetic)
  name: string;
  constituencyId: number;
  ward: string;
  gender: "F" | "M";
  age: number;
  programmes: string[];
  vulnerability: VulnerabilityScore;
  totalReceived: number;
  duplicateFlag: boolean;
}

const FIRST_NAMES_F = ["Chanda", "Mwape", "Bupe", "Mutinta", "Inonge", "Towela", "Namakau", "Mwila", "Chipo", "Memory"];
const FIRST_NAMES_M = ["Mwansa", "Kapasa", "Mubita", "Choolwe", "Lukundo", "Mukuka", "Kasonde", "Bwembya", "Mainza", "Felix"];
const SURNAMES = ["Banda", "Phiri", "Tembo", "Mwale", "Chanda", "Lungu", "Kasonde", "Mwanza", "Sakala", "Zulu"];

export const BENEFICIARIES: Beneficiary[] = CONSTITUENCIES.flatMap((c, i) =>
  Array.from({ length: 6 }).map((_, j) => {
    const rnd = seeded(c.id * 101 + j * 5);
    const female = (c.id + j) % 5 < 3;
    const first = female
      ? FIRST_NAMES_F[(c.id + j) % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[(c.id + j) % FIRST_NAMES_M.length];
    const surname = SURNAMES[(c.id * 3 + j) % SURNAMES.length];
    const nrcA = String(100_000 + range(rnd, 0, 899_999)).padStart(6, "0");
    const nrcB = String(range(rnd, 10, 99)).padStart(2, "0");
    const nrcC = "1";
    const vulnArr: VulnerabilityScore[] = ["medium", "high", "medium", "low", "critical", "high"];
    const programmes = ["Bursary", "Grant", "Feeding"].slice(0, ((c.id + j) % 3) + 1);
    return {
      id: `BEN-${String(c.id).padStart(3, "0")}-${j}`,
      nrc: `${nrcA}/${nrcB}/${nrcC}`,
      name: `${first} ${surname}`,
      constituencyId: c.id,
      ward: `Ward ${((c.id + j) % 12) + 1}`,
      gender: female ? "F" : "M",
      age: range(rnd, 7, 64),
      programmes,
      vulnerability: vulnArr[(c.id + j) % vulnArr.length],
      totalReceived: Math.round(rnd() * 28_000) + 1_200,
      duplicateFlag: (c.id + j) % 47 === 0,
    };
  })
);

// ---------- Compliance / alerts ----------
export interface ComplianceAlert {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  detail: string;
  constituencyId: number;
  raisedAt: string;
  daysOpen: number;
}

const ALERT_TEMPLATES: Array<Omit<ComplianceAlert, "id" | "constituencyId" | "raisedAt" | "daysOpen">> = [
  { level: "critical", title: "Tranche 2 disbursement overdue", detail: "Treasury has held tranche 2 for >30 days." },
  { level: "critical", title: "Stalled project — Phase 2 road works", detail: "Site dormant since 14 March 2026." },
  { level: "warning", title: "Quarterly report not yet filed", detail: "CDFC Q1 narrative is due in 5 days." },
  { level: "warning", title: "Procurement variance >15%", detail: "Bid winner exceeds engineering estimate." },
  { level: "info", title: "Audit window opens in 14 days", detail: "PAC field visit scheduled for 26 May." },
];

export const ALERTS: ComplianceAlert[] = CONSTITUENCIES.slice(0, 28).map((c, i) => {
  const t = ALERT_TEMPLATES[i % ALERT_TEMPLATES.length];
  return {
    ...t,
    id: `AL-${String(i + 1).padStart(4, "0")}`,
    constituencyId: c.id,
    raisedAt: `2026-0${(i % 5) + 1}-${String(((i * 4) % 27) + 1).padStart(2, "0")}`,
    daysOpen: 1 + (i % 28),
  };
});

// ---------- Top/bottom performers ----------
export const TOP_PERFORMERS = [...ALL_FUND_SUMMARIES]
  .sort((a, b) => b.utilisationPct - a.utilisationPct)
  .slice(0, 5);

export const BOTTOM_PERFORMERS = [...ALL_FUND_SUMMARIES]
  .sort((a, b) => a.utilisationPct - b.utilisationPct)
  .slice(0, 5);

// ---------- Helpers ----------
export function constituencyById(id: number): ConstituencyRow | undefined {
  return CONSTITUENCIES.find((c) => c.id === id);
}

export function ZMW(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `K${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `K${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `K${(n / 1_000).toFixed(0)}K`;
  return `K${Math.round(n).toLocaleString("en-ZM")}`;
}

export function ZMW_FULL(n: number): string {
  return `K${Math.round(n).toLocaleString("en-ZM")}`;
}
