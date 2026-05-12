"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  MapPin,
  GraduationCap,
  AlertTriangle,
  ShieldCheck,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { ROLE_LABELS } from "@cefanet/shared";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/financials", label: "Financials", icon: Wallet },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/bursaries", label: "Bursaries", icon: GraduationCap },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
] as const;

const MOBILE_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/bursaries", label: "Bursary", icon: GraduationCap },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 md:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
            C
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">CEFANET</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">
              Digital Notice Board
            </span>
          </div>
        </Link>

        <nav className="ml-4 hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
                  active
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {user?.role === "super_admin" ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-amber-50 text-amber-700 font-semibold">
              <ShieldCheck className="h-4 w-4" /> Admin
            </span>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-xs font-semibold text-slate-900">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-slate-500">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              <LogIn className="h-4 w-4" /> Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white">
      <div className="grid grid-cols-5">
        {MOBILE_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 text-[10px]",
                active ? "text-brand-700" : "text-slate-500"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
