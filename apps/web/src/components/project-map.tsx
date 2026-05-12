"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  ZMW,
  type Project,
} from "@cefanet/shared";

export function ProjectMap() {
  const { constituencyId } = useConstituency();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: constituencies } = useQuery({
    queryKey: ["constituencies"],
    queryFn: () => api.listConstituencies(),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-map", constituencyId],
    queryFn: () => api.listProjects(constituencyId),
    enabled: !!constituencyId,
  });

  const constituency = constituencies?.find((c) => c.id === constituencyId);

  const center: [number, number] = useMemo(() => {
    if (constituency) return [constituency.centerLat, constituency.centerLng];
    return [-15.4167, 28.2833];
  }, [constituency]);

  return (
    <>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(projects ?? []).map((p: Project) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={10}
            pathOptions={{
              color: STATUS_COLORS[p.status],
              fillColor: STATUS_COLORS[p.status],
              fillOpacity: 0.8,
              weight: 2,
            }}
            eventHandlers={{ click: () => setSelectedId(p.id) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{p.name}</div>
                <div>
                  <strong>Status:</strong> {STATUS_LABELS[p.status]}
                </div>
                <div>
                  <strong>Budget:</strong> {ZMW(p.budgetZmw)}
                </div>
                <div>
                  <strong>Spent:</strong> {ZMW(p.expenditureZmw)}
                </div>
                <Link
                  href={`/projects?focus=${p.id}`}
                  className="text-brand-600 underline mt-1 inline-block"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {/* The popup link goes to the registry; on demo we can also use the drawer pattern. */}
      <div className="hidden">{selectedId}</div>
    </>
  );
}
