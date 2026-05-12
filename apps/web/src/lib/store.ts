"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@cefanet/shared";

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    constituencyId: number | null;
  } | null;
  setAuth: (token: string, user: NonNullable<AuthState["user"]>) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cefanet_token", token);
        }
        set({ token, user });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("cefanet_token");
        }
        set({ token: null, user: null });
      },
    }),
    { name: "cefanet-auth" }
  )
);

interface ConstituencyState {
  constituencyId: number;
  setConstituencyId: (id: number) => void;
}

export const useConstituency = create<ConstituencyState>()(
  persist(
    (set) => ({
      constituencyId: 1,
      setConstituencyId: (id) => set({ constituencyId: id }),
    }),
    { name: "cefanet-constituency" }
  )
);
