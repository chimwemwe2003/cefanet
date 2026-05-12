import { z } from "zod";

// ---------- ENUM SCHEMAS ----------

export const ProjectCategory = z.enum([
  "infrastructure",
  "education",
  "health",
  "empowerment",
  "bursaries",
]);
export type ProjectCategory = z.infer<typeof ProjectCategory>;

export const ProjectStatus = z.enum(["planned", "ongoing", "complete", "stalled"]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const UserRole = z.enum(["super_admin", "district_officer", "public"]);
export type UserRole = z.infer<typeof UserRole>;

export const BeneficiaryLevel = z.enum(["primary", "secondary", "tertiary"]);
export type BeneficiaryLevel = z.infer<typeof BeneficiaryLevel>;

export const BeneficiaryStatus = z.enum(["active", "completed"]);
export type BeneficiaryStatus = z.infer<typeof BeneficiaryStatus>;

export const Gender = z.enum(["female", "male"]);
export type Gender = z.infer<typeof Gender>;

export const AlertSeverity = z.enum(["info", "warning", "critical"]);
export type AlertSeverity = z.infer<typeof AlertSeverity>;

// ---------- ENTITY SCHEMAS ----------

export const ConstituencySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  province: z.string(),
  district: z.string(),
  population: z.number().int(),
  centerLat: z.number(),
  centerLng: z.number(),
  allocationZmw: z.string(),
  createdAt: z.string().or(z.date()),
});
export type Constituency = z.infer<typeof ConstituencySchema>;

export const ProjectUpdateSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  title: z.string(),
  note: z.string(),
  postedAt: z.string().or(z.date()),
  postedBy: z.string(),
});
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

export const ProjectSchema = z.object({
  id: z.number().int(),
  constituencyId: z.number().int(),
  name: z.string(),
  description: z.string(),
  category: ProjectCategory,
  status: ProjectStatus,
  budgetZmw: z.string(),
  expenditureZmw: z.string(),
  completionPct: z.number().int().min(0).max(100),
  contractor: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectDetailSchema = ProjectSchema.extend({
  updates: z.array(ProjectUpdateSchema),
});
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;

export const ExpenditureLineSchema = z.object({
  id: z.number().int(),
  constituencyId: z.number().int(),
  projectId: z.number().int().nullable(),
  category: ProjectCategory,
  amountZmw: z.string(),
  month: z.string(),
  description: z.string(),
});
export type ExpenditureLine = z.infer<typeof ExpenditureLineSchema>;

export const FundDisbursementSchema = z.object({
  id: z.number().int(),
  constituencyId: z.number().int(),
  tranche: z.string(),
  amountZmw: z.string(),
  disbursedAt: z.string(),
  source: z.string(),
});
export type FundDisbursement = z.infer<typeof FundDisbursementSchema>;

export const BursarySchema = z.object({
  id: z.number().int(),
  constituencyId: z.number().int(),
  programName: z.string(),
  academicYear: z.string(),
  totalAllocatedZmw: z.string(),
});
export type Bursary = z.infer<typeof BursarySchema>;

export const BeneficiarySchema = z.object({
  id: z.number().int(),
  bursaryId: z.number().int(),
  constituencyId: z.number().int(),
  code: z.string(),
  level: BeneficiaryLevel,
  gender: Gender,
  amountZmw: z.string(),
  status: BeneficiaryStatus,
  institution: z.string(),
});
export type Beneficiary = z.infer<typeof BeneficiarySchema>;

export const AlertSchema = z.object({
  id: z.number().int(),
  constituencyId: z.number().int().nullable(),
  projectId: z.number().int().nullable(),
  severity: AlertSeverity,
  title: z.string(),
  message: z.string(),
  daysOverdue: z.number().int(),
  budgetAtRiskZmw: z.string(),
  resolved: z.boolean(),
  createdAt: z.string().or(z.date()),
  projectName: z.string().optional(),
  constituencyName: z.string().optional(),
});
export type Alert = z.infer<typeof AlertSchema>;

// ---------- API REQUEST/RESPONSE SCHEMAS ----------

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    role: UserRole,
    constituencyId: z.number().int().nullable(),
  }),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const DashboardSummarySchema = z.object({
  constituencyId: z.number().int(),
  constituencyName: z.string(),
  totalProjects: z.number().int(),
  totalBudget: z.number(),
  totalExpenditure: z.number(),
  completionPct: z.number(),
  activeAlerts: z.number().int(),
  byCategory: z.array(
    z.object({
      category: ProjectCategory,
      budget: z.number(),
      expenditure: z.number(),
    })
  ),
});
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

export const FinancialOverviewSchema = z.object({
  constituencyId: z.number().int(),
  totalAllocated: z.number(),
  totalSpent: z.number(),
  variance: z.number(),
  utilisationRate: z.number(),
  byCategory: z.array(
    z.object({
      category: ProjectCategory,
      amount: z.number(),
    })
  ),
  monthlyTrend: z.array(
    z.object({
      month: z.string(),
      amount: z.number(),
    })
  ),
});
export type FinancialOverview = z.infer<typeof FinancialOverviewSchema>;

export const BursaryStatsSchema = z.object({
  constituencyId: z.number().int(),
  totalBeneficiaries: z.number().int(),
  totalDisbursed: z.number(),
  byGender: z.array(
    z.object({
      gender: Gender,
      count: z.number().int(),
    })
  ),
  byLevel: z.array(
    z.object({
      level: BeneficiaryLevel,
      count: z.number().int(),
    })
  ),
});
export type BursaryStats = z.infer<typeof BursaryStatsSchema>;

// ---------- CONSTANTS ----------

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  infrastructure: "Infrastructure",
  education: "Education",
  health: "Health",
  empowerment: "Empowerment",
  bursaries: "Bursaries",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  ongoing: "Ongoing",
  complete: "Complete",
  stalled: "Stalled",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  planned: "#9ca3af",
  ongoing: "#3b82f6",
  complete: "#10b981",
  stalled: "#ef4444",
};

export const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  infrastructure: "#3b82f6",
  education: "#8b5cf6",
  health: "#ec4899",
  empowerment: "#f59e0b",
  bursaries: "#10b981",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  district_officer: "District Officer",
  public: "Public",
};

export const ZMW = (n: number | string): string => {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (!isFinite(v)) return "K0";
  return `K${v.toLocaleString("en-ZM", { maximumFractionDigits: 0 })}`;
};
