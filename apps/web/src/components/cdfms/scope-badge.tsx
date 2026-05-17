"use client";

import { useScope } from "@/lib/cdfms/store";
import { scopeLabel, ROLE_LABEL } from "@/lib/cdfms/rbac";
import { ShieldCheck, Globe2, Building2 } from "lucide-react";

export function ScopeBadge() {
  const scope = useScope();
  if (!scope) return null;

  const icon =
    scope.role === "constituency_officer" ? (
      <Building2 className="h-3.5 w-3.5" />
    ) : scope.role === "ministry_official" ||
      scope.role === "auditor" ||
      scope.role === "cso_stakeholder" ||
      scope.role === "system_admin" ? (
      <Globe2 className="h-3.5 w-3.5" />
    ) : (
      <ShieldCheck className="h-3.5 w-3.5" />
    );

  return (
    <div className="hidden md:flex items-center gap-2 px-8 pt-4">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink-200 px-2.5 py-1 text-[11px] font-medium text-ink-700 shadow-sm">
        <span className="text-ministry-700">{icon}</span>
        <span className="text-ink-500">Signed in as</span>
        <span className="font-semibold text-ink-900">{ROLE_LABEL[scope.role]}</span>
        <span className="text-ink-300">·</span>
        <span>{scopeLabel(scope)}</span>
      </div>
    </div>
  );
}
