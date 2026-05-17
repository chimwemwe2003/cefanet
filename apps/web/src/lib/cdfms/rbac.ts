// CEFANET CDF-MS Role-Based Access Control
// One source of truth for every capability check in the app.

import { CONSTITUENCIES, type ConstituencyRow, type ProvinceKey } from "./constituencies";

export type Role =
  | "constituency_officer"
  | "ministry_official"
  | "auditor"
  | "wdc_agent"
  | "cso_stakeholder"
  | "system_admin"
  | "public";

export type Capability =
  // Data scope
  | "view:national"
  | "view:constituency"
  | "view:ward"
  // Workflow actions
  | "initiate:request"
  | "approve:constituency"
  | "approve:treasury"
  | "edit:projects"
  | "review:grants"
  | "resolve:compliance"
  | "submit:scorecard"
  | "submit:evidence"
  | "submit:kobo_form"
  | "log:grievance"
  | "resolve:grievance"
  // PII / sensitive
  | "view:pii"
  | "view:beneficiaries"
  | "view:loans"
  // Output
  | "export:reports"
  | "audit:notes"
  | "view:audit"
  // System
  | "admin:users"
  | "admin:config";

export const ROLE_LABEL: Record<Role, string> = {
  constituency_officer: "Constituency Officer",
  ministry_official: "Ministry Official",
  auditor: "Auditor General Office",
  wdc_agent: "Ward Officer (CEFANET)",
  cso_stakeholder: "CSO / CEFANET Stakeholder",
  system_admin: "System Administrator",
  public: "Public",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  constituency_officer: "Constituency-level fund operations & committee approvals",
  ministry_official: "National oversight, treasury approval & PAC reporting",
  auditor: "Read-only audit & compliance review",
  wdc_agent: "CEFANET official in a ward — records and updates project data",
  cso_stakeholder: "CSO partner — analytics, advocacy reports, full read",
  system_admin: "Platform administration, user management, configuration",
  public: "Public-facing transparency view (no login required)",
};

export const CAPS: Record<Role, ReadonlyArray<Capability>> = {
  constituency_officer: [
    "view:constituency",
    "initiate:request",
    "approve:constituency",
    "edit:projects",
    "review:grants",
    "resolve:compliance",
    "resolve:grievance",
    "submit:kobo_form",
    "view:beneficiaries",
    "view:pii",
    "view:loans",
    "export:reports",
  ],
  ministry_official: [
    "view:national",
    "approve:treasury",
    "resolve:compliance",
    "resolve:grievance",
    "view:beneficiaries",
    "view:loans",
    "view:audit",
    "export:reports",
  ],
  auditor: [
    "view:national",
    "view:beneficiaries",
    "view:pii",
    "view:loans",
    "view:audit",
    "audit:notes",
    "export:reports",
  ],
  wdc_agent: [
    "view:ward",
    "view:constituency",
    "submit:scorecard",
    "submit:evidence",
    "submit:kobo_form",
    "log:grievance",
  ],
  cso_stakeholder: [
    "view:national",
    "view:beneficiaries",
    "view:loans",
    "view:audit",
    "export:reports",
  ],
  system_admin: [
    "view:national",
    "view:audit",
    "admin:users",
    "admin:config",
    "export:reports",
  ],
  public: ["view:national"],
};

export function can(role: Role | null | undefined, capability: Capability): boolean {
  if (!role) return false;
  return CAPS[role].includes(capability);
}

export interface RoleScope {
  role: Role;
  fullName: string;
  homeProvince?: ProvinceKey;
  homeConstituencyId?: number;
}

export function scopedConstituencies(scope: RoleScope | null): ConstituencyRow[] {
  if (!scope) return CONSTITUENCIES;
  if (can(scope.role, "view:national")) return CONSTITUENCIES;
  if (
    (can(scope.role, "view:constituency") || can(scope.role, "view:ward")) &&
    scope.homeConstituencyId
  ) {
    return CONSTITUENCIES.filter((c) => c.id === scope.homeConstituencyId);
  }
  return CONSTITUENCIES;
}

export function inScope(scope: RoleScope | null, constituencyId: number): boolean {
  const allowed = scopedConstituencies(scope);
  return allowed.some((c) => c.id === constituencyId);
}

export function scopeLabel(scope: RoleScope | null): string {
  if (!scope) return "Public view · national";
  if (can(scope.role, "view:national"))
    return `National scope · all ${CONSTITUENCIES.length} constituencies`;
  if (
    (can(scope.role, "view:constituency") || can(scope.role, "view:ward")) &&
    scope.homeConstituencyId
  ) {
    const c = CONSTITUENCIES.find((x) => x.id === scope.homeConstituencyId);
    if (!c) return "Constituency scope";
    return can(scope.role, "view:ward") ? `${c.name} · ward scope` : `${c.name} · constituency scope`;
  }
  return "Public view";
}

export function maskPii(value: string, role: Role | null): string {
  if (!role || can(role, "view:pii")) return value;
  if (value.length <= 2) return "**";
  return value
    .split(" ")
    .map((token) => {
      if (token.length <= 2) return "**";
      return token[0] + "•••" + token[token.length - 1];
    })
    .join(" ");
}
