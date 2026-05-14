"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { RoleGate } from "./role-gate";
import { ErrorBoundary } from "../error-boundary";
import { ScopeBadge } from "./scope-badge";
import { normalizePathname } from "@/lib/utils";

export function CdfmsChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const isLogin = path === "/login";
  const isPrint = path.startsWith("/print");

  // Login is full-screen, print pages are bare canvas
  if (isLogin) return <ErrorBoundary>{children}</ErrorBoundary>;
  if (isPrint) {
    return (
      <div className="bg-white text-ink-900">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    );
  }

  return (
    <RoleGate>
      <div className="min-h-screen bg-ink-50 flex">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="md:hidden h-14 border-b border-ink-200 bg-white flex items-center justify-center px-3">
            <span className="font-serif text-base text-ink-900">CEFANET CDF-MS</span>
          </header>
          <ScopeBadge />
          <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1400px] w-full mx-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
