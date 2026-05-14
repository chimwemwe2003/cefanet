"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Sprout,
  Coins,
  HardHat,
  Users,
  ShieldAlert,
  FileText,
  HeartPulse,
  GraduationCap,
  ClipboardList,
  MessageSquareWarning,
  Camera,
  ScrollText,
  FormInput,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCdfmsAuth } from "@/lib/cdfms/store";
import { can, ROLE_LABEL, type Capability } from "@/lib/cdfms/rbac";
import { cn, normalizePathname } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  capability?: Capability;
};

type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { href: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/funds", label: "Fund Management", icon: Wallet },
      { href: "/projects", label: "Infrastructure", icon: HardHat },
      { href: "/grants", label: "Grants", icon: Sprout },
      { href: "/loans", label: "Loans", icon: Coins, capability: "view:loans" },
    ],
  },
  {
    title: "Beneficiaries & Services",
    items: [
      { href: "/bursaries", label: "School Bursaries", icon: GraduationCap },
      { href: "/health", label: "Health Initiatives", icon: HeartPulse },
      { href: "/beneficiaries", label: "Beneficiaries", icon: Users, capability: "view:beneficiaries" },
    ],
  },
  {
    title: "Social Accountability",
    items: [
      { href: "/forms", label: "Field Forms (Kobo)", icon: FormInput },
      { href: "/scorecards", label: "Community Scorecards", icon: ClipboardList },
      { href: "/grievances", label: "Grievances", icon: MessageSquareWarning },
      { href: "/compliance", label: "Compliance & Alerts", icon: ShieldAlert },
      { href: "/evidence", label: "Evidence Hub", icon: Camera },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/audit", label: "Audit Trail", icon: ScrollText, capability: "view:audit" },
      { href: "/reports", label: "Reports", icon: FileText, capability: "export:reports" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const router = useRouter();
  const { role, fullName, signOut } = useCdfmsAuth();
  const [openMobile, setOpenMobile] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href);

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  const visibleGroups: NavGroup[] = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((n) => !n.capability || can(role, n.capability)),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <button
        onClick={() => setOpenMobile(true)}
        aria-label="Open menu"
        className="md:hidden fixed top-3 left-3 z-30 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-ministry-600 text-white shadow-ministry-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {openMobile ? (
        <div
          className="md:hidden fixed inset-0 z-40 bg-ink-900/50"
          onClick={() => setOpenMobile(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed md:sticky md:top-0 z-50 inset-y-0 left-0 w-72 bg-ministry-700 text-white flex flex-col",
          "h-screen transition-transform duration-200",
          openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-5 pt-5 pb-4 border-b border-ministry-600/60 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gold-500 text-ministry-900 flex items-center justify-center font-bold text-lg shadow-ministry">
            C
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="font-serif text-base">CEFANET</div>
            <div className="text-[10px] uppercase tracking-[.18em] text-gold-200">
              CDF-MS · Republic of Zambia
            </div>
          </div>
          <button
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setOpenMobile(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {visibleGroups.map((group, gi) => (
            <div key={group.title} className={gi === 0 ? "" : "mt-4"}>
              <div className="px-3 mt-1 mb-1 text-[9px] font-semibold tracking-[.2em] uppercase text-ministry-300/80">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMobile(false)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-ministry-600 text-white font-semibold shadow-inner"
                        : "text-ministry-100 hover:bg-ministry-600/60 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        active ? "text-gold-300" : "text-ministry-300 group-hover:text-gold-200"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-ministry-600/60 px-3 py-3">
          {role && role !== "public" ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gold-400/20 text-gold-200 flex items-center justify-center text-xs font-bold">
                {(fullName ?? "U")
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-sm font-semibold truncate">{fullName}</div>
                <div className="text-[10px] uppercase tracking-wider text-gold-200">
                  {ROLE_LABEL[role]}
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Sign out"
                className="text-ministry-200 hover:text-white p-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-gold-200">Public view</span>
              <Link href="/login" className="text-xs text-gold-200 hover:text-white underline">
                Sign in →
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
