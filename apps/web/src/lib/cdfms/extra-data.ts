// Mock datasets for the new CEFANET-pillar modules:
// Health Initiatives, Bursaries (outcome-focused), Community Scorecards,
// Grievances, Evidence Hub, Audit Trail, plus the Composite CDF Score and
// the Geographic Equity Index.

import { CONSTITUENCIES, type ConstituencyRow } from "./constituencies";
import { ALL_FUND_SUMMARIES, fundSummary } from "./data";

function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}
const range = (rnd: () => number, lo: number, hi: number) => Math.floor(lo + rnd() * (hi - lo + 1));

// ===================== HEALTH INITIATIVES =====================

export type HealthFacilityType = "clinic" | "health_post" | "maternity_shelter" | "borehole" | "staff_housing";
export type HealthFacilityStatus = "operational" | "partial" | "non_operational" | "under_construction";

export interface HealthFacility {
  id: string;
  name: string;
  type: HealthFacilityType;
  constituencyId: number;
  status: HealthFacilityStatus;
  hasWater: boolean;
  hasElectricity: boolean;
  drugAvailabilityPct: number;
  staffOnPost: number;
  staffEstablished: number;
  patientsServedYTD: number;
  ancCoveragePct: number;
  immunisationPct: number;
  satisfactionScore: number; // 0-100
}

const FACILITY_PREFIXES = [
  "Ng'ombe", "Matero", "Kalingalinga", "Chibolya", "Bauleni", "Kamwala",
  "Bwana Mkubwa", "Maramba", "Bwacha", "Garden", "Chipata", "Choma",
  "Mongu", "Kasama", "Solwezi", "Mansa", "Petauke", "Chinsali"
];

export const HEALTH_FACILITIES: HealthFacility[] = CONSTITUENCIES.flatMap((c, i) => {
  const rnd = seeded(c.id * 211 + 13);
  const count = i % 4 === 0 ? 4 : 3;
  return Array.from({ length: count }).map((_, j) => {
    const types: HealthFacilityType[] = ["clinic", "health_post", "maternity_shelter", "borehole", "staff_housing"];
    const type = types[(c.id + j) % types.length];
    const stat: HealthFacilityStatus = (["operational", "operational", "operational", "partial", "non_operational", "under_construction"][(c.id + j) % 6]) as HealthFacilityStatus;
    return {
      id: `HF-${String(c.id).padStart(3, "0")}-${j}`,
      name: `${FACILITY_PREFIXES[(c.id + j) % FACILITY_PREFIXES.length]} ${type.replace("_", " ")} ${j + 1}`,
      type,
      constituencyId: c.id,
      status: stat,
      hasWater: (c.id + j) % 7 !== 0,
      hasElectricity: (c.id + j) % 5 !== 0,
      drugAvailabilityPct: stat === "operational" ? range(rnd, 60, 95) : stat === "partial" ? range(rnd, 30, 60) : range(rnd, 0, 30),
      staffOnPost: stat === "non_operational" ? 0 : range(rnd, 2, 12),
      staffEstablished: range(rnd, 8, 14),
      patientsServedYTD: stat === "operational" ? range(rnd, 1200, 9800) : range(rnd, 0, 1200),
      ancCoveragePct: type === "clinic" || type === "maternity_shelter" ? range(rnd, 35, 92) : 0,
      immunisationPct: type === "clinic" || type === "health_post" ? range(rnd, 55, 96) : 0,
      satisfactionScore: range(rnd, 55, 92),
    };
  });
});

export const HEALTH_TOTALS = (() => {
  const operational = HEALTH_FACILITIES.filter((f) => f.status === "operational").length;
  const total = HEALTH_FACILITIES.length;
  return {
    facilities: total,
    operational,
    operationalPct: (operational / total) * 100,
    avgDrugAvail: HEALTH_FACILITIES.reduce((a, f) => a + f.drugAvailabilityPct, 0) / total,
    patientsServed: HEALTH_FACILITIES.reduce((a, f) => a + f.patientsServedYTD, 0),
    avgANC: HEALTH_FACILITIES.filter((f) => f.ancCoveragePct > 0).reduce((a, f) => a + f.ancCoveragePct, 0) /
      Math.max(1, HEALTH_FACILITIES.filter((f) => f.ancCoveragePct > 0).length),
    avgImmunisation: HEALTH_FACILITIES.filter((f) => f.immunisationPct > 0).reduce((a, f) => a + f.immunisationPct, 0) /
      Math.max(1, HEALTH_FACILITIES.filter((f) => f.immunisationPct > 0).length),
    avgSatisfaction: HEALTH_FACILITIES.reduce((a, f) => a + f.satisfactionScore, 0) / total,
    waterPct: (HEALTH_FACILITIES.filter((f) => f.hasWater).length / total) * 100,
    electricityPct: (HEALTH_FACILITIES.filter((f) => f.hasElectricity).length / total) * 100,
  };
})();

// ===================== BURSARIES (outcomes) =====================

export type BursaryLevel = "primary" | "secondary" | "tertiary";
export type BursaryStatus = "enrolled" | "retained" | "graduated" | "dropped_out";

export interface BursaryAward {
  id: string;
  beneficiary: string; // anonymised code
  level: BursaryLevel;
  gender: "F" | "M";
  vulnerable: boolean;
  amount: number;
  constituencyId: number;
  school: string;
  academicYear: string;
  status: BursaryStatus;
  attendancePct: number;
  gradeAverage: number;
}

const SCHOOLS = [
  "Lusaka Girls Sec", "Matero Boys Sec", "Hillside Secondary", "Kabulonga Boys",
  "David Livingstone Sec", "Petauke High", "Choma Sec", "Mongu Sec",
  "Kasama Sec", "Solwezi Combined", "University of Zambia", "Copperbelt University",
  "Mulungushi University", "Evelyn Hone College", "Northern Tech College",
];

export const BURSARIES: BursaryAward[] = CONSTITUENCIES.flatMap((c, ci) =>
  Array.from({ length: 8 }).map((_, j) => {
    const rnd = seeded(c.id * 47 + j * 11);
    const level: BursaryLevel = (["primary", "secondary", "secondary", "tertiary"][(c.id + j) % 4]) as BursaryLevel;
    const amount = level === "tertiary" ? range(rnd, 18000, 35000) : level === "secondary" ? range(rnd, 6000, 12000) : range(rnd, 2400, 5000);
    const statuses: BursaryStatus[] = ["enrolled", "enrolled", "retained", "retained", "graduated", "dropped_out"];
    const status = statuses[(c.id + j * 3) % statuses.length];
    const female = (c.id + j) % 5 < 3;
    return {
      id: `BR-${String(c.id).padStart(3, "0")}-${j}`,
      beneficiary: `BEN-${String(c.id * 8 + j).padStart(4, "0")}`,
      level,
      gender: female ? "F" : "M",
      vulnerable: (c.id + j) % 4 === 0,
      amount,
      constituencyId: c.id,
      school: SCHOOLS[(c.id + j) % SCHOOLS.length],
      academicYear: "2026",
      status,
      attendancePct: status === "dropped_out" ? range(rnd, 0, 50) : range(rnd, 78, 99),
      gradeAverage: status === "dropped_out" ? range(rnd, 25, 50) : range(rnd, 55, 92),
    };
  })
);

export const BURSARY_TOTALS = (() => {
  const total = BURSARIES.length;
  const enrolled = BURSARIES.filter((b) => ["enrolled", "retained"].includes(b.status)).length;
  const graduated = BURSARIES.filter((b) => b.status === "graduated").length;
  const dropped = BURSARIES.filter((b) => b.status === "dropped_out").length;
  return {
    total,
    enrolled,
    graduated,
    dropped,
    retentionPct: ((total - dropped) / total) * 100,
    graduationPct: (graduated / total) * 100,
    totalDisbursed: BURSARIES.reduce((a, b) => a + b.amount, 0),
    femalePct: (BURSARIES.filter((b) => b.gender === "F").length / total) * 100,
    vulnerablePct: (BURSARIES.filter((b) => b.vulnerable).length / total) * 100,
  };
})();

// ===================== COMMUNITY SCORECARDS =====================

export type ScorecardDimension = "access" | "quality" | "provider_behaviour" | "satisfaction";

export interface Scorecard {
  id: string;
  facilityName: string;
  constituencyId: number;
  category: "health" | "education" | "infrastructure";
  submittedBy: string;
  submittedAt: string;
  participants: number;
  scores: Record<ScorecardDimension, number>; // each 0-100
  composite: number; // 0-100
  narrative: string;
}

const NARRATIVES = [
  "Community reported delayed staff arrival; drug stock noted as adequate.",
  "Reported broken solar pump for two weeks; reagents missing for HIV testing.",
  "Praised teacher punctuality; lab equipment overdue.",
  "Maternity wing welcomed, but no ambulance available for referrals.",
  "Borehole functional, water clean; community satisfaction high.",
  "Classroom block complete, but no desks delivered yet.",
  "Long waiting times reported; staff courteous and knowledgeable.",
];

export const SCORECARDS: Scorecard[] = CONSTITUENCIES.flatMap((c, ci) =>
  Array.from({ length: 3 }).map((_, j) => {
    const rnd = seeded(c.id * 67 + j * 23);
    const access = range(rnd, 45, 92);
    const quality = range(rnd, 40, 88);
    const provider = range(rnd, 50, 95);
    const satisfaction = range(rnd, 42, 90);
    return {
      id: `SC-${String(c.id).padStart(3, "0")}-${j}`,
      facilityName: `${FACILITY_PREFIXES[(c.id + j) % FACILITY_PREFIXES.length]} ${["Clinic", "Primary", "Health Post"][(c.id + j) % 3]}`,
      constituencyId: c.id,
      category: (["health", "education", "infrastructure"][(c.id + j) % 3]) as Scorecard["category"],
      submittedBy: `WDC ${((c.id + j) % 9) + 1}`,
      submittedAt: `2026-0${(j % 4) + 1}-${String(((c.id + j) % 27) + 1).padStart(2, "0")}`,
      participants: range(rnd, 14, 64),
      scores: { access, quality, provider_behaviour: provider, satisfaction },
      composite: Math.round((access + quality + provider + satisfaction) / 4),
      narrative: NARRATIVES[(c.id + j) % NARRATIVES.length],
    };
  })
);

// ===================== GRIEVANCES =====================

export type GrievanceStatus = "logged" | "in_review" | "in_resolution" | "resolved" | "escalated";
export type GrievanceCategory = "service_quality" | "fund_misuse" | "missing_beneficiary" | "delay" | "procurement";

export interface Grievance {
  id: string;
  reference: string;
  category: GrievanceCategory;
  constituencyId: number;
  channel: "sms" | "ussd" | "in_person" | "phone";
  loggedAt: string;
  status: GrievanceStatus;
  daysOpen: number;
  summary: string;
  resolvedNote?: string;
}

const GRIEVANCE_SUMMARIES: Record<GrievanceCategory, string[]> = {
  service_quality: ["Drug stockouts at local clinic", "Teacher absenteeism reported", "No ambulance for emergency referrals"],
  fund_misuse: ["Suspected inflated procurement invoice", "Contractor billed for work not done", "Grant disbursed to non-existing co-op"],
  missing_beneficiary: ["Vulnerable child not on bursary list", "Pregnant women excluded from maternity transport"],
  delay: ["Classroom block 6 months behind schedule", "Borehole drilling tender stalled"],
  procurement: ["Single-source procurement raised concerns", "Bid evaluation report not published"],
};

export const GRIEVANCES: Grievance[] = CONSTITUENCIES.slice(0, 36).flatMap((c, i) => {
  const rnd = seeded(c.id * 89 + 7);
  const count = 1 + (i % 2);
  return Array.from({ length: count }).map((_, j) => {
    const cat: GrievanceCategory = (["service_quality", "fund_misuse", "missing_beneficiary", "delay", "procurement"][(c.id + j) % 5]) as GrievanceCategory;
    const statuses: GrievanceStatus[] = ["logged", "in_review", "in_resolution", "resolved", "resolved", "escalated"];
    const status = statuses[(c.id + j) % statuses.length];
    const summary = GRIEVANCE_SUMMARIES[cat][(c.id + j) % GRIEVANCE_SUMMARIES[cat].length];
    return {
      id: `GR-${String(c.id).padStart(3, "0")}-${j}`,
      reference: `CEFANET/G/${c.province.slice(0, 2).toUpperCase()}/${c.id}/${String(i + 1).padStart(3, "0")}`,
      category: cat,
      constituencyId: c.id,
      channel: (["sms", "ussd", "in_person", "phone"][(c.id + j) % 4]) as Grievance["channel"],
      loggedAt: `2026-0${(j % 5) + 1}-${String(((c.id + j) % 27) + 1).padStart(2, "0")}`,
      status,
      daysOpen: status === "resolved" ? 0 : range(rnd, 2, 42),
      summary,
      resolvedNote: status === "resolved" ? "Issue resolved; supplier replenished stocks within 7 days." : undefined,
    };
  });
});

export const GRIEVANCE_TOTALS = (() => {
  const total = GRIEVANCES.length;
  const resolved = GRIEVANCES.filter((g) => g.status === "resolved").length;
  const open = total - resolved;
  const escalated = GRIEVANCES.filter((g) => g.status === "escalated").length;
  return {
    total,
    open,
    resolved,
    escalated,
    resolutionRatePct: (resolved / total) * 100,
    avgDaysOpen:
      GRIEVANCES.filter((g) => g.status !== "resolved").reduce((a, g) => a + g.daysOpen, 0) / Math.max(1, open),
  };
})();

// ===================== EVIDENCE HUB =====================

export interface EvidenceItem {
  id: string;
  projectId?: string;
  caption: string;
  stage: "before" | "during" | "current" | "completion";
  constituencyId: number;
  lat: number;
  lng: number;
  capturedAt: string;
  submittedBy: string;
  verified: boolean;
  tint: string; // visual placeholder colour
}

const TINTS = ["#86efac", "#fde68a", "#f59e0b", "#22c55e", "#16a34a", "#a5d6a7", "#fcd34d", "#15803d"];

// Approximate Zambia centroid for synthesised GPS values
const ZM_LAT = -13.5;
const ZM_LNG = 28.0;

export const EVIDENCE: EvidenceItem[] = CONSTITUENCIES.flatMap((c, ci) =>
  Array.from({ length: 4 }).map((_, j) => {
    const rnd = seeded(c.id * 113 + j * 31);
    const stages: EvidenceItem["stage"][] = ["before", "during", "current", "completion"];
    return {
      id: `EV-${String(c.id).padStart(3, "0")}-${j}`,
      projectId: `PR-${String(c.id).padStart(3, "0")}-${j % 4}`,
      caption: ["Site mobilisation", "Mid-construction inspection", "Defect liability walk", "Handover ceremony"][j],
      stage: stages[j],
      constituencyId: c.id,
      lat: ZM_LAT + (rnd() - 0.5) * 4,
      lng: ZM_LNG + (rnd() - 0.5) * 6,
      capturedAt: `2026-0${(j % 5) + 1}-${String(((c.id + j) % 27) + 1).padStart(2, "0")}`,
      submittedBy: (c.id + j) % 3 === 0 ? "WDC monitor" : "CDFC officer",
      verified: (c.id + j) % 4 !== 0,
      tint: TINTS[(c.id + j) % TINTS.length],
    };
  })
);

// ===================== AUDIT TRAIL =====================

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  role: "constituency_officer" | "ministry_official" | "auditor" | "system_admin" | "system";
  action: string;
  target: string;
  constituencyId?: number;
  hash: string;
}

function pseudoHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, "0");
}

export const AUDIT_ENTRIES: AuditEntry[] = (() => {
  const out: AuditEntry[] = [];
  const baseActions = [
    { role: "constituency_officer" as const, action: "Initiated disbursement request", target: "REQ-00012 · K1.2M" },
    { role: "constituency_officer" as const, action: "Approved committee review", target: "REQ-00012" },
    { role: "ministry_official" as const, action: "Released Treasury tranche", target: "REQ-00009 · K3.8M" },
    { role: "auditor" as const, action: "Viewed beneficiary PII", target: "BEN-0142 (audit-logged)" },
    { role: "constituency_officer" as const, action: "Uploaded photo evidence", target: "EV-024-1 · GPS verified" },
    { role: "system" as const, action: "Auto-generated red flag", target: "Project PR-018 stalled > 30d" },
    { role: "ministry_official" as const, action: "Resolved compliance alert", target: "AL-0014" },
    { role: "constituency_officer" as const, action: "Logged grievance", target: "GR-005-0 · service_quality" },
    { role: "ministry_official" as const, action: "Exported PAC Quarterly Report", target: "REF / CEFANET-CDF-MS / PAC-Q1 / 2026" },
    { role: "system_admin" as const, action: "Rotated JWT secret", target: "system credential" },
  ];
  for (let i = 0; i < 36; i++) {
    const template = baseActions[i % baseActions.length];
    const tsDay = String((i % 28) + 1).padStart(2, "0");
    const tsHour = String((i * 3) % 24).padStart(2, "0");
    const tsMin = String((i * 13) % 60).padStart(2, "0");
    const ts = `2026-05-${tsDay}T${tsHour}:${tsMin}:00Z`;
    const actor =
      template.role === "system" || template.role === "system_admin"
        ? template.role === "system"
          ? "CEFANET CDF-MS · automated"
          : "System Administrator"
        : ["G. Sakala", "C. Mwape", "Dr. P. Phiri", "S. Tembo"][i % 4];
    const seed = `${ts}|${actor}|${template.action}|${template.target}`;
    out.push({
      id: `AU-${String(i + 1).padStart(5, "0")}`,
      ts,
      actor,
      role: template.role,
      action: template.action,
      target: template.target,
      hash: pseudoHash(seed),
    });
  }
  return out;
})();

// ===================== COMPOSITE CDF PERFORMANCE SCORE =====================

/**
 * Single 0-100 score per constituency that blends:
 *  - Utilisation (40%)
 *  - Project completion (30%)
 *  - Grievance resolution (15%)
 *  - Health functionality (15%)
 */
export function compositeScore(c: ConstituencyRow): number {
  const fs = fundSummary(c);
  const util = fs.utilisationPct; // 0-100
  // Project completion proxy: count finished vs total in scope
  const projCompletion = 60 + ((c.id * 7) % 35); // pseudo, 60-95
  const grievanceRes = 50 + ((c.id * 11) % 45); // 50-95
  const healthFunc =
    HEALTH_FACILITIES.filter((f) => f.constituencyId === c.id && f.status === "operational").length /
    Math.max(1, HEALTH_FACILITIES.filter((f) => f.constituencyId === c.id).length);
  const healthScore = healthFunc * 100;
  const score = util * 0.4 + projCompletion * 0.3 + grievanceRes * 0.15 + healthScore * 0.15;
  return Math.round(score);
}

export function trafficLightForScore(score: number): "green" | "yellow" | "red" {
  if (score >= 75) return "green";
  if (score >= 55) return "yellow";
  return "red";
}

// ===================== GEOGRAPHIC EQUITY INDEX =====================

/**
 * Equity = 1 - (stddev of utilisation across constituencies / mean utilisation)
 * Result clamped to 0-1, expressed as 0-100.
 * Higher is more equitable.
 */
export const EQUITY_INDEX = (() => {
  const utils = ALL_FUND_SUMMARIES.map((s) => s.utilisationPct);
  const mean = utils.reduce((a, x) => a + x, 0) / utils.length;
  const variance = utils.reduce((a, x) => a + (x - mean) ** 2, 0) / utils.length;
  const stddev = Math.sqrt(variance);
  const coeff = stddev / Math.max(1, mean); // coefficient of variation
  const equity = Math.max(0, Math.min(1, 1 - coeff));
  return Math.round(equity * 100);
})();
