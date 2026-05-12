"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useConstituency } from "@/lib/store";
import { useEffect } from "react";

export function ConstituencySelect() {
  const { constituencyId, setConstituencyId } = useConstituency();
  const { data, isLoading } = useQuery({
    queryKey: ["constituencies"],
    queryFn: () => api.listConstituencies(),
  });

  useEffect(() => {
    if (data && data.length > 0 && !data.find((c) => c.id === constituencyId)) {
      setConstituencyId(data[0].id);
    }
  }, [data, constituencyId, setConstituencyId]);

  if (isLoading || !data) {
    return <div className="skeleton h-10 w-full md:w-72" />;
  }

  return (
    <select
      className="select w-full md:w-72"
      value={constituencyId}
      onChange={(e) => setConstituencyId(Number(e.target.value))}
    >
      {data.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
