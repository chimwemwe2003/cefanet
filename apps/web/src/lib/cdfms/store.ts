"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProvinceKey } from "./constituencies";
import type { Role, RoleScope } from "./rbac";

export { ROLE_LABEL, ROLE_DESCRIPTION } from "./rbac";
export type CdfmsRole = Role;

export interface LiveUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  constituencyId: number | null;
}

interface CdfmsAuthState {
  // Session
  mode: "live" | "demo" | null;
  token: string | null; // JWT — present only in live mode
  role: Role | null;
  fullName: string | null;
  email: string | null;
  homeProvince?: ProvinceKey;
  homeConstituencyId?: number;

  // Real authentication (JWT from the API)
  signInLive: (token: string, user: LiveUser) => void;
  // Offline demo mode (no server) — the role-picker fallback
  signInDemo: (
    role: Role,
    fullName: string,
    opts?: { homeProvince?: ProvinceKey; homeConstituencyId?: number }
  ) => void;
  signOut: () => void;
}

export const useCdfmsAuth = create<CdfmsAuthState>()(
  persist(
    (set) => ({
      mode: null,
      token: null,
      role: null,
      fullName: null,
      email: null,
      homeProvince: undefined,
      homeConstituencyId: undefined,

      signInLive: (token, user) =>
        set({
          mode: "live",
          token,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
          homeProvince: undefined,
          homeConstituencyId: user.constituencyId ?? undefined,
        }),

      signInDemo: (role, fullName, opts) =>
        set({
          mode: "demo",
          token: null,
          role,
          fullName,
          email: null,
          homeProvince: opts?.homeProvince,
          homeConstituencyId: opts?.homeConstituencyId,
        }),

      signOut: () =>
        set({
          mode: null,
          token: null,
          role: null,
          fullName: null,
          email: null,
          homeProvince: undefined,
          homeConstituencyId: undefined,
        }),
    }),
    { name: "cdfms-auth" }
  )
);

/** Stable RoleScope object for the current session. */
export function useScope(): RoleScope | null {
  const state = useCdfmsAuth();
  if (!state.role) return null;
  return {
    role: state.role,
    fullName: state.fullName ?? "",
    homeProvince: state.homeProvince,
    homeConstituencyId: state.homeConstituencyId,
  };
}
