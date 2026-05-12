"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";
import { ConstituencySelect } from "@/components/constituency-select";
import { Card, PageHeader, Skeleton, StatusBadge } from "@/components/ui";
import {
  CATEGORY_LABELS,
  ProjectCategory,
  ProjectStatus,
  STATUS_LABELS,
  ZMW,
  type Project,
} from "@cefanet/shared";
import { ProjectDrawer } from "@/components/project-drawer";

type SortKey = "name" | "category" | "status" | "budgetZmw" | "expenditureZmw" | "completionPct";

const CATEGORIES = ProjectCategory.options;
const STATUSES = ProjectStatus.options;

export default function ProjectsPage() {
  const { constituencyId } = useConstituency();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["projects", constituencyId],
    queryFn: () => api.listProjects(constituencyId),
    enabled: !!constituencyId,
  });

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows
      .filter((r) =>
        search ? r.name.toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((r) => (category ? r.category === category : true))
      .filter((r) => (status ? r.status === status : true))
      .sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const av = a[sort.key];
        const bv = b[sort.key];
        if (typeof av === "string" && typeof bv === "string") {
          return av.localeCompare(bv) * dir;
        }
        const an = parseFloat(av as string);
        const bn = parseFloat(bv as string);
        return (an - bn) * dir;
      });
  }, [data, search, category, status, sort]);

  const toggleSort = (k: SortKey) => {
    setSort((s) =>
      s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Project Registry"
        subtitle="Every CDF project for the selected constituency"
      >
        <ConstituencySelect />
      </PageHeader>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by project name…"
            className="input md:col-span-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <ThButton onClick={() => toggleSort("name")} label="Project" />
                <ThButton onClick={() => toggleSort("category")} label="Category" />
                <ThButton onClick={() => toggleSort("status")} label="Status" />
                <ThButton onClick={() => toggleSort("budgetZmw")} label="Budget" />
                <ThButton onClick={() => toggleSort("expenditureZmw")} label="Spent" />
                <ThButton onClick={() => toggleSort("completionPct")} label="%" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-2">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No matching projects.
                  </td>
                </tr>
              ) : (
                filtered.map((p: Project) => (
                  <tr key={p.id} onClick={() => setSelectedId(p.id)}>
                    <td className="font-medium">{p.name}</td>
                    <td>{CATEGORY_LABELS[p.category]}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>{ZMW(p.budgetZmw)}</td>
                    <td>{ZMW(p.expenditureZmw)}</td>
                    <td className="font-semibold">{p.completionPct}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ProjectDrawer projectId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function ThButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <th>
      <button onClick={onClick} className="hover:text-brand-700">
        {label}
      </button>
    </th>
  );
}
