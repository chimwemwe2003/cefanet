"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCdfmsAuth } from "@/lib/cdfms/store";

export default function HomeRedirect() {
  const { role } = useCdfmsAuth();
  const router = useRouter();

  useEffect(() => {
    if (!role) router.replace("/login");
    else if (role === "wdc_agent") router.replace("/field");
    else router.replace("/dashboard");
  }, [role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-ink-500 text-sm">
      Loading CDF-MS…
    </div>
  );
}
