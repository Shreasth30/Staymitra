"use client";

import dynamic from "next/dynamic";

const MapplsMap = dynamic(() => import("@/components/mappls-map").then(m => ({ default: m.MapplsMap })), {
  ssr: false,
  loading: () => (
    <div className="flex w-full items-center justify-center rounded-xl border border-border bg-muted animate-pulse-soft" style={{ minHeight: "300px", height: "100%" }}>
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  ),
});

export { MapplsMap };
