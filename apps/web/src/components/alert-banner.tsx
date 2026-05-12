"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";

export function AlertBanner() {
  const { constituencyId } = useConstituency();
  const { data } = useQuery({
    queryKey: ["alerts", constituencyId],
    queryFn: () => api.listAlerts(constituencyId),
    enabled: !!constituencyId,
  });

  if (!data || data.length === 0) return null;

  return (
    <Link
      href="/alerts"
      className="flex items-center gap-2 rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 text-sm text-amber-900 hover:bg-amber-200 transition-colors"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span className="font-medium">
        ⚠ {data.length} project{data.length === 1 ? "" : "s"} require attention
      </span>
      <span className="ml-auto text-xs underline">View details</span>
    </Link>
  );
}
