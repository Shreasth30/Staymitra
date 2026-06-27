"use client";

import { useState } from "react";
import { Map, LayoutGrid, Compass } from "lucide-react";
import { toast } from "sonner";

type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  slug: string;
  price?: string | number;
};

type Props = {
  markers: MarkerData[];
  children: React.ReactNode;
};

export function SearchResultsWithMap({ markers, children }: Props) {
  const [view, setView] = useState<"list" | "map">("list");
  const hasGeoMarkers = markers.length > 0;

  return (
    <div className="min-w-0 flex-1">
      {hasGeoMarkers && (
        <div className="mb-8 flex items-center justify-end">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                view === "list"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              onClick={() => {
                setView("map");
                toast.error("Map view is currently unavailable! 💸🛌", {
                  description: "Our developer got too lazy and we ran out of API budget.",
                  position: "top-center",
                });
              }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                view === "map"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              Map
            </button>
          </div>
        </div>
      )}

      {view === "map" && hasGeoMarkers ? (
        <div className="animate-fade-in flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 backdrop-blur-xl p-12 text-center my-4 min-h-[400px]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
            <Compass className="h-10 w-10" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">Lost in Space (and Budget) 🚀</h3>
          <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
            We wanted to build a state-of-the-art interactive map with real-time route tracing, 
            but the developer got too lazy, fell asleep, and we ran out of API budget. 
          </p>
          <p className="mt-2 text-xs font-semibold text-primary uppercase tracking-wider">
            🚨 Error 402: Coffee & Funds Depleted ☕💸
          </p>
          <button
            onClick={() => setView("list")}
            className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
          >
            Take me back to safety (Grid View)
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">{children}</div>
      )}
    </div>
  );
}
