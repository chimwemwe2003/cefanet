"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FolderOpen, PlusCircle, CircleHelp, LogOut } from "lucide-react";
import { useCdfmsAuth } from "@/lib/cdfms/store";
import { ConnectionStatus } from "./connection-status";
import { ErrorBoundary } from "../error-boundary";
import { normalizePathname } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/field", label: "My Projects", icon: FolderOpen, exact: true },
  { href: "/field/new", label: "Add Project", icon: PlusCircle },
  { href: "/field/help", label: "Help", icon: CircleHelp },
];

/**
 * The Field Officer chrome — a calm, phone-app-style shell with just a top bar
 * and a 3-item bottom navigation. No dense sidebar, no analytics, no jargon.
 */
export function FieldChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const router = useRouter();
  const { fullName, signOut } = useCdfmsAuth();

  // Keep ward officers inside their lane
  useEffect(() => {
    if (!path.startsWith("/field")) {
      router.replace("/field");
    }
  }, [path, router]);

  const firstName = (fullName ?? "Officer").split(" ")[0].replace(/[.,]/g, "");

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-ministry-700 text-white">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gold-500 text-ministry-900 flex items-center justify-center font-bold flex-shrink-0">
            C
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-sm font-semibold truncate">CEFANET Field</div>
            <div className="text-[10px] text-gold-200 uppercase tracking-wider">
              Ward Officer
            </div>
          </div>
          <ConnectionStatus compact />
          <button
            onClick={() => {
              signOut();
              router.push("/login");
            }}
            aria-label="Sign out"
            className="text-white/80 hover:text-white p-2 -mr-2"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 pb-28">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* Bottom navigation — big tap targets */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-200">
        <div className="max-w-xl mx-auto grid grid-cols-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.exact ? path === tab.href : path.startsWith(tab.href);
            const isAdd = tab.href === "/field/new";
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 min-h-[60px] text-[11px] font-medium transition-colors",
                  active
                    ? "text-ministry-700"
                    : "text-ink-500 hover:text-ink-900"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full transition-colors",
                    isAdd ? "h-10 w-10 -mt-4 shadow-ministry-lg" : "h-7 w-7",
                    isAdd
                      ? "bg-ministry-600 text-white"
                      : active
                      ? "bg-ministry-50 text-ministry-700"
                      : "text-ink-500"
                  )}
                >
                  <Icon className={isAdd ? "h-5 w-5" : "h-5 w-5"} />
                </span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
