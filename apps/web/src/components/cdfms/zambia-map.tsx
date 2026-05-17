"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from "react-leaflet";
import { useMemo } from "react";
import { PROVINCE_ROLLUPS, ZMW } from "@/lib/cdfms/data";
import type { ProvinceKey } from "@/lib/cdfms/constituencies";

// Real geographic centroids for each Zambian province (lat, lng).
// Hand-tuned from public administrative boundaries.
const PROVINCE_CENTROIDS: Record<ProvinceKey, { lat: number; lng: number; capital: string }> = {
  Lusaka: { lat: -15.42, lng: 28.28, capital: "Lusaka" },
  Central: { lat: -14.45, lng: 28.45, capital: "Kabwe" },
  Copperbelt: { lat: -12.97, lng: 28.63, capital: "Ndola" },
  Northern: { lat: -10.21, lng: 31.18, capital: "Kasama" },
  Muchinga: { lat: -11.78, lng: 31.97, capital: "Chinsali" },
  Luapula: { lat: -11.2, lng: 29.0, capital: "Mansa" },
  Eastern: { lat: -13.65, lng: 32.65, capital: "Chipata" },
  "North-Western": { lat: -12.5, lng: 25.5, capital: "Solwezi" },
  Southern: { lat: -16.83, lng: 26.97, capital: "Choma" },
  Western: { lat: -15.25, lng: 23.13, capital: "Mongu" },
};

// Refined heatmap gradient (cleaner emerald ramp)
function fillForUtilisation(pct: number): string {
  if (pct >= 80) return "#15803d"; // ministry-700
  if (pct >= 70) return "#16a34a"; // ministry-600
  if (pct >= 60) return "#22c55e"; // ministry-500
  if (pct >= 50) return "#4ade80"; // ministry-400
  if (pct >= 40) return "#86efac"; // ministry-300
  return "#dcfce7"; // ministry-100
}

// Radius scales with number of constituencies in the province (bubble map)
function radiusFor(constituencyCount: number): number {
  // 12 → 36 px
  const min = 12;
  const max = 36;
  const lo = 19; // fewest constituencies in a province
  const hi = 29; // most constituencies in a province
  const t = Math.max(0, Math.min(1, (constituencyCount - lo) / (hi - lo)));
  return min + t * (max - min);
}

export function ZambiaMap() {
  const rollupByKey = useMemo(() => {
    const m = new Map<ProvinceKey, (typeof PROVINCE_ROLLUPS)[number]>();
    PROVINCE_ROLLUPS.forEach((r) => m.set(r.province, r));
    return m;
  }, []);

  return (
    <div className="relative w-full">
      <div className="rounded-xl overflow-hidden border border-ink-200 shadow-sm">
        <MapContainer
          center={[-13.5, 28.0]}
          zoom={5}
          minZoom={4}
          maxZoom={8}
          scrollWheelZoom={false}
          style={{ height: "440px", width: "100%", background: "#f0fdf4" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {(Object.keys(PROVINCE_CENTROIDS) as ProvinceKey[]).map((p) => {
            const r = rollupByKey.get(p);
            const cap = PROVINCE_CENTROIDS[p];
            if (!r) return null;
            const fill = fillForUtilisation(r.utilisationPct);
            return (
              <CircleMarker
                key={p}
                center={[cap.lat, cap.lng]}
                radius={radiusFor(r.constituencyCount)}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: fill,
                  fillOpacity: 0.92,
                }}
              >
                <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95} sticky>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{p} · {r.utilisationPct.toFixed(1)}%</span>
                </LeafletTooltip>
                <Popup>
                  <div style={{ minWidth: 200, fontFamily: "Inter, system-ui, sans-serif" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#15803d", fontWeight: 600 }}>
                      {p} Province
                    </div>
                    <div style={{ fontFamily: '"Source Serif Pro", Georgia, serif', fontSize: 18, color: "#0f172a", marginTop: 2 }}>
                      {r.utilisationPct.toFixed(1)}% utilised
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {r.constituencyCount} constituencies · capital {cap.capital}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10, fontSize: 11 }}>
                      <div>
                        <div style={{ color: "#64748b" }}>Allocated</div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{ZMW(r.allocated)}</div>
                      </div>
                      <div>
                        <div style={{ color: "#64748b" }}>Disbursed</div>
                        <div style={{ fontWeight: 600, color: "#15803d" }}>{ZMW(r.disbursed)}</div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-3 mt-3 text-[11px] text-ink-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-ink-700">Utilisation</span>
          <div className="flex h-3 w-44 rounded-full overflow-hidden border border-ink-200">
            {["#dcfce7", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d"].map((c, i) => (
              <span key={i} className="flex-1" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>0%</span>
          <span>·</span>
          <span>100%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ministry-700" />
            Larger circle = more constituencies
          </span>
          <span className="text-ink-400">·</span>
          <span>Click any bubble for breakdown</span>
        </div>
      </div>
    </div>
  );
}
