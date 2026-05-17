"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Honest online/offline indicator for field officers. When offline, it
 * reassures the user their work is safe on the device (localStorage).
 */
export function ConnectionStatus({ compact = false }: { compact?: boolean }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
          online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
        }`}
      >
        {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {online ? "Online" : "Offline"}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
        online
          ? "bg-emerald-50 text-emerald-800"
          : "bg-amber-50 text-amber-900 border border-amber-200"
      }`}
    >
      {online ? (
        <Wifi className="h-4 w-4 flex-shrink-0" />
      ) : (
        <WifiOff className="h-4 w-4 flex-shrink-0" />
      )}
      <span>
        {online
          ? "You are online. Your work is being saved."
          : "You are offline. Your work is saved on this device and will sync when you reconnect."}
      </span>
    </div>
  );
}
