"use client";

import dynamic from "next/dynamic";

export const GoogleMap = dynamic(
  () => import("./google-map").then((mod) => mod.GoogleMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-xl border border-border bg-muted animate-pulse-soft"
        style={{ height: "400px" }}
      >
        <p className="text-sm text-muted-foreground italic">Initializing Google Maps…</p>
      </div>
    ),
  }
);
