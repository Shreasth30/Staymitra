"use client";

import { useState } from "react";
import { GoogleMap } from "@/components/google-map-lazy";
import { Map as MapIcon, Globe } from "lucide-react";

export function StayMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const [viewMode, setViewMode] = useState<"2d" | "360">("2d");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="relative group">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setViewMode("2d")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
            viewMode === "2d"
              ? "bg-primary text-primary-foreground"
              : "bg-card/90 text-foreground hover:bg-card backdrop-blur-md"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          Map
        </button>
        <button
          onClick={() => setViewMode("360")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
            viewMode === "360"
              ? "bg-primary text-primary-foreground"
              : "bg-card/90 text-foreground hover:bg-card backdrop-blur-md"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          Street View
        </button>
      </div>

      {viewMode === "2d" ? (
        <GoogleMap
          markers={[{ id: "property", lat, lng, title: name, slug: "" }]}
          center={[lat, lng]}
          zoom={16}
          height="400px"
          showBorder={false}
        />
      ) : (
        <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-muted">
          <iframe
            src={`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=210&pitch=10&fov=80`}
            className="h-full w-full border-0"
            title={`${name} Street View`}
            allowFullScreen
          />
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/60 p-2 text-center text-[10px] font-medium text-white backdrop-blur-md">
            Google Street View 360°
          </div>
        </div>
      )}
    </div>
  );
}

