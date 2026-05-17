"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "./rbac";
import { CONSTITUENCIES } from "./constituencies";

// Roles a System Administrator can assign (every functional role; not "public").
export const ASSIGNABLE_ROLES: Role[] = [
  "constituency_officer",
  "wdc_agent",
  "ministry_official",
  "auditor",
  "cso_stakeholder",
  "system_admin",
];

// Roles that must be tied to a constituency / ward scope.
export const SCOPED_ROLES: Role[] = ["constituency_officer", "wdc_agent"];

export type AccountStatus = "invited" | "active" | "deactivated";

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  constituencyId: number | null; // required for scoped roles, null otherwise
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
  createdBy: string;
}

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

function constId(name: string): number {
  return CONSTITUENCIES.find((c) => c.name === name)?.id ?? 1;
}

// Seed: the accounts that would already exist when the System Admin signs in.
const SEED: UserAccount[] = [
  {
    id: "USR-00001",
    fullName: "Dr. P. Phiri",
    email: "p.phiri@mlgrd.gov.zm",
    role: "ministry_official",
    constituencyId: null,
    status: "active",
    createdAt: iso(180),
    lastLoginAt: iso(0),
    createdBy: "System",
  },
  {
    id: "USR-00002",
    fullName: "S. Tembo",
    email: "s.tembo@ago.gov.zm",
    role: "auditor",
    constituencyId: null,
    status: "active",
    createdAt: iso(150),
    lastLoginAt: iso(2),
    createdBy: "Dr. P. Phiri",
  },
  {
    id: "USR-00003",
    fullName: "C. Mwape",
    email: "c.mwape@cefanet.org",
    role: "constituency_officer",
    constituencyId: constId("Lusaka Central"),
    status: "active",
    createdAt: iso(120),
    lastLoginAt: iso(1),
    createdBy: "Dr. P. Phiri",
  },
  {
    id: "USR-00004",
    fullName: "G. Sakala",
    email: "g.sakala@cefanet.org",
    role: "wdc_agent",
    constituencyId: constId("Lusaka Central"),
    status: "active",
    createdAt: iso(95),
    lastLoginAt: iso(0),
    createdBy: "C. Mwape",
  },
  {
    id: "USR-00005",
    fullName: "K. Mwila",
    email: "k.mwila@cefanet.org",
    role: "cso_stakeholder",
    constituencyId: null,
    status: "active",
    createdAt: iso(88),
    lastLoginAt: iso(4),
    createdBy: "Dr. P. Phiri",
  },
  {
    id: "USR-00006",
    fullName: "B. Lungu",
    email: "b.lungu@cefanet.org",
    role: "wdc_agent",
    constituencyId: constId("Mandevu"),
    status: "invited",
    createdAt: iso(3),
    lastLoginAt: null,
    createdBy: "C. Mwape",
  },
  {
    id: "USR-00007",
    fullName: "M. Daka",
    email: "m.daka@cefanet.org",
    role: "constituency_officer",
    constituencyId: constId("Kabwe Central"),
    status: "deactivated",
    createdAt: iso(210),
    lastLoginAt: iso(64),
    createdBy: "Dr. P. Phiri",
  },
];

interface UserAccountState {
  accounts: UserAccount[];
  createAccount: (input: {
    fullName: string;
    email: string;
    role: Role;
    constituencyId: number | null;
    createdBy: string;
  }) => UserAccount;
  setStatus: (id: string, status: AccountStatus) => void;
  emailExists: (email: string) => boolean;
}

export const useUserAccounts = create<UserAccountState>()(
  persist(
    (set, get) => ({
      accounts: SEED,
      emailExists: (email) =>
        get().accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase()),
      createAccount: (input) => {
        const seq = get().accounts.length + 1;
        const account: UserAccount = {
          id: `USR-${String(seq).padStart(5, "0")}`,
          fullName: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          role: input.role,
          constituencyId: input.constituencyId,
          status: "invited", // a new account is invited until the user signs in
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
          createdBy: input.createdBy,
        };
        set({ accounts: [account, ...get().accounts] });
        return account;
      },
      setStatus: (id, status) =>
        set({
          accounts: get().accounts.map((a) => (a.id === id ? { ...a, status } : a)),
        }),
    }),
    { name: "cefanet-user-accounts" }
  )
);
