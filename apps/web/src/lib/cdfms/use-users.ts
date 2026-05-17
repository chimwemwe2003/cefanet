"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCdfmsAuth } from "./store";
import { useUserAccounts } from "./user-store";
import { apiListUsers, apiCreateUser, apiSetUserStatus, ApiError } from "./auth-api";
import type { Role } from "./rbac";

export const MAX_SYSTEM_ADMINS = 3;

/** Unified account shape (live API + demo store share these fields). */
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  constituencyId: number | null;
  status: "active" | "invited" | "deactivated";
  createdAt: string;
  lastLoginAt: string | null;
  createdBy: string;
}

export interface CreateInput {
  fullName: string;
  email: string;
  role: Role;
  constituencyId: number | null;
}

export interface CreateOutcome {
  ok: boolean;
  user?: AdminUser;
  tempPassword?: string;
  error?: string;
}

interface UserAdmin {
  isLive: boolean;
  loading: boolean;
  error: string | null;
  users: AdminUser[];
  sysAdminCount: number;
  maxSystemAdmins: number;
  emailExists: (email: string) => boolean;
  create: (input: CreateInput) => Promise<CreateOutcome>;
  setStatus: (id: string, status: "active" | "deactivated") => Promise<void>;
}

function demoTempPassword(): string {
  const d = Math.floor(1000 + Math.random() * 9000);
  return `Cdf-${d}-Dm`;
}

export function useUserAdmin(): UserAdmin {
  const mode = useCdfmsAuth((s) => s.mode);
  const token = useCdfmsAuth((s) => s.token);
  const isLive = mode === "live" && !!token;
  const qc = useQueryClient();

  // demo (localStorage) store
  const demoAccounts = useUserAccounts((s) => s.accounts);
  const demoCreate = useUserAccounts((s) => s.createAccount);
  const demoSetStatus = useUserAccounts((s) => s.setStatus);
  const demoEmailExists = useUserAccounts((s) => s.emailExists);

  // live (API) query
  const liveQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiListUsers(token as string),
    enabled: isLive,
    staleTime: 15_000,
  });

  if (isLive) {
    const data = liveQuery.data;
    return {
      isLive: true,
      loading: liveQuery.isLoading,
      error: liveQuery.error instanceof Error ? liveQuery.error.message : null,
      users: (data?.users ?? []) as AdminUser[],
      sysAdminCount: data?.sysAdminCount ?? 0,
      maxSystemAdmins: data?.maxSystemAdmins ?? MAX_SYSTEM_ADMINS,
      // Server is the source of truth; client check is a courtesy only.
      emailExists: () => false,
      create: async (input) => {
        try {
          const res = await apiCreateUser(token as string, input);
          await qc.invalidateQueries({ queryKey: ["admin-users"] });
          return { ok: true, user: res.user as AdminUser, tempPassword: res.tempPassword };
        } catch (err) {
          return {
            ok: false,
            error: err instanceof ApiError ? err.message : "Could not create the account.",
          };
        }
      },
      setStatus: async (id, status) => {
        await apiSetUserStatus(token as string, id, status);
        await qc.invalidateQueries({ queryKey: ["admin-users"] });
      },
    };
  }

  // ---- demo mode ----
  const sysAdminCount = demoAccounts.filter(
    (a) => a.role === "system_admin" && a.status !== "deactivated"
  ).length;

  return {
    isLive: false,
    loading: false,
    error: null,
    users: demoAccounts as AdminUser[],
    sysAdminCount,
    maxSystemAdmins: MAX_SYSTEM_ADMINS,
    emailExists: demoEmailExists,
    create: async (input) => {
      const acc = demoCreate({ ...input, createdBy: "System Administrator (demo)" });
      return { ok: true, user: acc as AdminUser, tempPassword: demoTempPassword() };
    },
    setStatus: async (id, status) => {
      demoSetStatus(id, status);
    },
  };
}
