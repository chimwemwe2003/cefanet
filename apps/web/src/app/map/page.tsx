"use client";

import dynamic from "next/dynamic";
import { ConstituencySelect } from "@/components/constituency-select";
import { Card, PageHeader, Skeleton } from "@/components/ui";

const ProjectMap = dynamic(() => import("@/components/project-map").then((m) => m.ProjectMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[60vh] w-full" />,
});

export default function MapPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="GPS Project Map"
        subtitle="Geolocated CDF projects, colour-coded by status"
      >
        <ConstituencySelect />
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        <div className="h-[60vh] md:h-[70vh]">
          <ProjectMap />
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-3 text-xs">
          <Legend dot="#10b981" label="Complete" />
          <Legend dot="#3b82f6" label="Ongoing" />
          <Legend dot="#ef4444" label="Stalled" />
          <Legend dot="#9ca3af" label="Planned" />
        </div>
      </Card>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dot }} />
      {label}
    </span>
  );
}
