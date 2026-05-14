"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCdfmsAuth } from "@/lib/cdfms/store";
import { normalizePathname } from "@/lib/utils";

/**
 * Mounted at the root chrome. If the user isn't signed in (no role) and is
 * not already on /login, redirect them to /login. Public role IS signed in.
 */
export function RoleGate({ children }: { children: ReactNode }) {
  const { role } = useCdfmsAuth();
  const router = useRouter();
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const isPrintRoute = path.startsWith("/print");
    if (!role && path !== "/login" && !isPrintRoute) {
      router.replace("/login");
    }
  }, [hydrated, role, path, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-500 text-sm">
        Loading…
      </div>
    );
  }
  const isPrintRoute = path.startsWith("/print");
  if (!role && path !== "/login" && !isPrintRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-500 text-sm">
        Redirecting…
      </div>
    );
  }
  return <>{children}</>;
}
