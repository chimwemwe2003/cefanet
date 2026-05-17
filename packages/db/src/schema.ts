import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  date,
  doublePrecision,
  pgEnum,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- ENUMS ----------

export const projectCategoryEnum = pgEnum("project_category", [
  "infrastructure",
  "education",
  "health",
  "empowerment",
  "bursaries",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planned",
  "ongoing",
  "complete",
  "stalled",
]);

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "district_officer",
  "public",
]);

export const beneficiaryLevelEnum = pgEnum("beneficiary_level", [
  "primary",
  "secondary",
  "tertiary",
]);

export const beneficiaryStatusEnum = pgEnum("beneficiary_status", [
  "active",
  "completed",
]);

export const genderEnum = pgEnum("gender", ["female", "male"]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
]);

// ---------- TABLES ----------

export const constituencies = pgTable("constituencies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  province: varchar("province", { length: 80 }).notNull(),
  district: varchar("district", { length: 80 }).notNull(),
  population: integer("population").notNull(),
  centerLat: doublePrecision("center_lat").notNull(),
  centerLng: doublePrecision("center_lng").notNull(),
  allocationZmw: numeric("allocation_zmw", { precision: 14, scale: 2 })
    .notNull()
    .default("40000000.00"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 200 }).notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  role: userRoleEnum("role").notNull().default("public"),
  constituencyId: integer("constituency_id").references(() => constituencies.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- CDF-MS application users (7-role RBAC model) ----------
// Separate from the legacy `users` table so the role set can evolve freely.
// `role` is a plain string validated by the API against the RBAC role list.
export const appUsers = pgTable("app_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 200 }).notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  role: varchar("role", { length: 40 }).notNull(),
  constituencyId: integer("constituency_id"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 160 }).notNull().default("System"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  constituencyId: integer("constituency_id")
    .notNull()
    .references(() => constituencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  category: projectCategoryEnum("category").notNull(),
  status: projectStatusEnum("status").notNull().default("planned"),
  budgetZmw: numeric("budget_zmw", { precision: 14, scale: 2 }).notNull(),
  expenditureZmw: numeric("expenditure_zmw", { precision: 14, scale: 2 })
    .notNull()
    .default("0.00"),
  completionPct: integer("completion_pct").notNull().default(0),
  contractor: varchar("contractor", { length: 160 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectUpdates = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  note: text("note").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
  postedBy: varchar("posted_by", { length: 120 }).notNull().default("CEFANET Officer"),
});

export const fundDisbursements = pgTable("fund_disbursements", {
  id: serial("id").primaryKey(),
  constituencyId: integer("constituency_id")
    .notNull()
    .references(() => constituencies.id, { onDelete: "cascade" }),
  tranche: varchar("tranche", { length: 40 }).notNull(),
  amountZmw: numeric("amount_zmw", { precision: 14, scale: 2 }).notNull(),
  disbursedAt: date("disbursed_at").notNull(),
  source: varchar("source", { length: 120 }).notNull().default("Ministry of Finance"),
});

export const expenditureLines = pgTable("expenditure_lines", {
  id: serial("id").primaryKey(),
  constituencyId: integer("constituency_id")
    .notNull()
    .references(() => constituencies.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  category: projectCategoryEnum("category").notNull(),
  amountZmw: numeric("amount_zmw", { precision: 14, scale: 2 }).notNull(),
  month: date("month").notNull(),
  description: varchar("description", { length: 240 }).notNull().default(""),
});

export const bursaries = pgTable("bursaries", {
  id: serial("id").primaryKey(),
  constituencyId: integer("constituency_id")
    .notNull()
    .references(() => constituencies.id, { onDelete: "cascade" }),
  programName: varchar("program_name", { length: 160 }).notNull(),
  academicYear: varchar("academic_year", { length: 16 }).notNull(),
  totalAllocatedZmw: numeric("total_allocated_zmw", { precision: 14, scale: 2 }).notNull(),
});

export const beneficiaries = pgTable("beneficiaries", {
  id: serial("id").primaryKey(),
  bursaryId: integer("bursary_id")
    .notNull()
    .references(() => bursaries.id, { onDelete: "cascade" }),
  constituencyId: integer("constituency_id")
    .notNull()
    .references(() => constituencies.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 32 }).notNull().unique(),
  level: beneficiaryLevelEnum("level").notNull(),
  gender: genderEnum("gender").notNull(),
  amountZmw: numeric("amount_zmw", { precision: 12, scale: 2 }).notNull(),
  status: beneficiaryStatusEnum("status").notNull().default("active"),
  institution: varchar("institution", { length: 160 }).notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  constituencyId: integer("constituency_id").references(() => constituencies.id, {
    onDelete: "cascade",
  }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  severity: alertSeverityEnum("severity").notNull().default("warning"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  daysOverdue: integer("days_overdue").notNull().default(0),
  budgetAtRiskZmw: numeric("budget_at_risk_zmw", { precision: 14, scale: 2 })
    .notNull()
    .default("0.00"),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- RELATIONS ----------

export const constituenciesRelations = relations(constituencies, ({ many }) => ({
  projects: many(projects),
  disbursements: many(fundDisbursements),
  expenditures: many(expenditureLines),
  bursaries: many(bursaries),
  beneficiaries: many(beneficiaries),
  alerts: many(alerts),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  constituency: one(constituencies, {
    fields: [projects.constituencyId],
    references: [constituencies.id],
  }),
  updates: many(projectUpdates),
  expenditures: many(expenditureLines),
  alerts: many(alerts),
}));

export const projectUpdatesRelations = relations(projectUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [projectUpdates.projectId],
    references: [projects.id],
  }),
}));

export const bursariesRelations = relations(bursaries, ({ one, many }) => ({
  constituency: one(constituencies, {
    fields: [bursaries.constituencyId],
    references: [constituencies.id],
  }),
  beneficiaries: many(beneficiaries),
}));

export const beneficiariesRelations = relations(beneficiaries, ({ one }) => ({
  bursary: one(bursaries, {
    fields: [beneficiaries.bursaryId],
    references: [bursaries.id],
  }),
  constituency: one(constituencies, {
    fields: [beneficiaries.constituencyId],
    references: [constituencies.id],
  }),
}));

// ---------- INFERRED TYPES ----------

export type Constituency = typeof constituencies.$inferSelect;
export type NewConstituency = typeof constituencies.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type NewProjectUpdate = typeof projectUpdates.$inferInsert;
export type FundDisbursement = typeof fundDisbursements.$inferSelect;
export type NewFundDisbursement = typeof fundDisbursements.$inferInsert;
export type ExpenditureLine = typeof expenditureLines.$inferSelect;
export type NewExpenditureLine = typeof expenditureLines.$inferInsert;
export type Bursary = typeof bursaries.$inferSelect;
export type NewBursary = typeof bursaries.$inferInsert;
export type Beneficiary = typeof beneficiaries.$inferSelect;
export type NewBeneficiary = typeof beneficiaries.$inferInsert;
export type User = typeof users.$inferSelect;
export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
