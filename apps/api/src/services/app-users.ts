// Neon-backed user-account service for CDF-MS real authentication.

import bcrypt from "bcryptjs";
import { eq, asc, sql } from "drizzle-orm";
import { db, appUsers, type AppUser, type NewAppUser } from "@cefanet/db";
import type { AppRole } from "../middleware/auth.js";

export const APP_ROLES: AppRole[] = [
  "constituency_officer",
  "ministry_official",
  "auditor",
  "wdc_agent",
  "cso_stakeholder",
  "system_admin",
];

export const MAX_SYSTEM_ADMINS = 3;

const BCRYPT_COST = 10;

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  constituencyId: number | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  createdBy: string;
}

function toPublic(u: AppUser): PublicUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role as AppRole,
    constituencyId: u.constituencyId,
    status: u.status,
    createdAt: (u.createdAt as Date).toISOString(),
    lastLoginAt: u.lastLoginAt ? (u.lastLoginAt as Date).toISOString() : null,
    createdBy: u.createdBy,
  };
}

export async function findByEmail(email: string): Promise<AppUser | undefined> {
  const rows = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email.trim().toLowerCase()))
    .limit(1);
  return rows[0];
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function touchLastLogin(id: string): Promise<void> {
  await db.update(appUsers).set({ lastLoginAt: new Date() }).where(eq(appUsers.id, id));
}

export async function listUsers(): Promise<PublicUser[]> {
  const rows = await db.select().from(appUsers).orderBy(asc(appUsers.createdAt));
  return rows.map(toPublic);
}

export async function activeSysAdminCount(): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(appUsers)
    .where(sql`${appUsers.role} = 'system_admin' and ${appUsers.status} <> 'deactivated'`);
  return rows[0]?.n ?? 0;
}

/** Generate a readable temporary password, e.g. "Cdf-7421-Kp". */
export function generateTempPassword(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const a = letters[Math.floor(Math.random() * letters.length)];
  const b = "abcdefghijkmnpqrstuvwxyz"[Math.floor(Math.random() * 24)];
  return `Cdf-${digits}-${a}${b}`;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  role: AppRole;
  constituencyId: number | null;
  createdBy: string;
}

export interface CreateUserResult {
  user: PublicUser;
  tempPassword: string;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_COST);
  const row: NewAppUser = {
    email: input.email.trim().toLowerCase(),
    passwordHash,
    fullName: input.fullName.trim(),
    role: input.role,
    constituencyId: input.constituencyId,
    status: "active",
    createdBy: input.createdBy,
  };
  const inserted = await db.insert(appUsers).values(row).returning();
  return { user: toPublic(inserted[0]), tempPassword };
}

export async function setStatus(id: string, status: string): Promise<PublicUser | undefined> {
  const rows = await db
    .update(appUsers)
    .set({ status })
    .where(eq(appUsers.id, id))
    .returning();
  return rows[0] ? toPublic(rows[0]) : undefined;
}

export { toPublic };

/**
 * Idempotent bootstrap. If the app_users table is empty, seed one account per
 * role so the platform is usable on first run. Demo password is shared below.
 */
const SEED_PASSWORD = "demo1234";

const SEED: Array<Omit<NewAppUser, "passwordHash">> = [
  { email: "admin@cefanet.org", fullName: "System Administrator", role: "system_admin", constituencyId: null, status: "active", createdBy: "System" },
  { email: "ps@mlgrd.gov.zm", fullName: "Dr. P. Phiri", role: "ministry_official", constituencyId: null, status: "active", createdBy: "System" },
  { email: "auditor@ago.gov.zm", fullName: "S. Tembo", role: "auditor", constituencyId: null, status: "active", createdBy: "System" },
  { email: "officer@cefanet.org", fullName: "C. Mwape", role: "constituency_officer", constituencyId: 1, status: "active", createdBy: "System" },
  { email: "ward@cefanet.org", fullName: "G. Sakala", role: "wdc_agent", constituencyId: 1, status: "active", createdBy: "System" },
  { email: "cso@cefanet.org", fullName: "K. Mwila", role: "cso_stakeholder", constituencyId: null, status: "active", createdBy: "System" },
];

export async function seedAppUsersIfEmpty(): Promise<void> {
  try {
    const existing = await db.select({ n: sql<number>`count(*)::int` }).from(appUsers);
    if ((existing[0]?.n ?? 0) > 0) {
      console.log("[app-users] table already has accounts — skipping seed");
      return;
    }
    const hash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_COST);
    await db.insert(appUsers).values(SEED.map((s) => ({ ...s, passwordHash: hash })));
    console.log(`[app-users] seeded ${SEED.length} accounts (demo password: ${SEED_PASSWORD})`);
  } catch (err) {
    console.error("[app-users] seed failed:", err);
  }
}
