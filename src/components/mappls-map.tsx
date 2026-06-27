"use client";
/* eslint-disable */

import { useEffect, useRef, useState } from "react";

type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  slug: string;
  price?: string;
};

type Props = {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  singleMarker?: boolean;
  showBorder?: boolean;
};

declare global {
  interface Window {
    mappls: any;
    MapmyIndia: any;
  }
}

export function MapplsMap({
  markers = [],
  center = [20.5937, 78.9629], // India center
  zoom = 5,
  height = "400px",
  singleMarker = false,
  showBorder = true,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MAPPLS_API_KEY;
    if (!key) {
      setError("Mappls API key not configured");
      return;
    }

    // Check if script is already fully loaded
    if (window.mappls && window.mappls.Map) {
      setLoaded(true);
      return;
    }

    const existingScript = document.getElementById("mappls-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => setLoaded(true));
      existingScript.addEventListener("error", () => setError("Failed to load Mappls SDK"));
      return;
    }

    const script = document.createElement("script");
    script.id = "mappls-sdk";
    script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${key}`;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError("Failed to load Mappls SDK");
    document.head.appendChild(script);
  }, []);

  const [mapId] = useState(() => `map-${Math.random().toString(36).slice(2, 9)}`);


  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const mappls = (window as any).mappls;
    if (!mappls || !mappls.Map) {
      setError("Mappls Map SDK not fully loaded");
      return;
    }

    try {
      // Initialize map using the ID string
      const map = new mappls.Map(mapId, {
        center: [center[0], center[1]],
        zoom,
        zoomControl: true,
        location: true,
      });

      mapInstance.current = map;

      // Check if .on exists before calling
      if (typeof map.on !== "function") {
        const addListener = map.addListener || map.on;
        if (typeof addListener === "function") {
          addListener.call(map, "load", () => {
            setupMarkers(map, mappls, markers, singleMarker);
          });
        } else {
          setupMarkers(map, mappls, markers, singleMarker);
        }
      } else {
        map.on("load", () => {
          setupMarkers(map, mappls, markers, singleMarker);
        });
      }
    } catch (e) {
      setError("Failed to initialize map");
      console.error(e);
    }

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove?.();
        } catch {
          // ignore cleanup
        }
        mapInstance.current = null;
      }
    };
  }, [loaded, markers, center, zoom, singleMarker, mapId]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border-border bg-muted text-sm text-muted-foreground ${showBorder ? 'border' : ''}`}
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      id={mapId}
      ref={mapRef}
      className={`w-full overflow-hidden rounded-xl border-border shadow-sm ${showBorder ? 'border' : ''}`}
      style={{ height }}
    />
  );
}

// Extract marker setup to a helper
function setupMarkers(map: any, mappls: any, markers: MarkerData[], singleMarker: boolean) {
  markers.forEach((m) => {
    const marker = new mappls.Marker({
      map,
      position: { lat: m.lat, lng: m.lng },
    });

    if (!singleMarker) {
      const popup = new mappls.InfoWindow({
        map,
        content: `
          <div style="padding:8px;max-width:200px;font-family:system-ui,sans-serif;">
            <strong style="font-size:14px;">${m.title}</strong>
            ${m.price ? `<p style="margin:4px 0;color:#666;">${m.price}</p>` : ""}
            <a href="/stay/${m.slug}" style="color:#0EA5E9;font-weight:600;text-decoration:none;font-size:13px;">
              View details →
            </a>
          </div>
        `,
      });

      marker.addListener("click", () => {
        popup.open(map, marker);
      });
    }
  });

  if (markers.length > 1) {
    const lats = markers.map((m) => m.lat);
    const lngs = markers.map((m) => m.lng);
    const sw = { lat: Math.min(...lats) - 0.01, lng: Math.min(...lngs) - 0.01 };
    const ne = { lat: Math.max(...lats) + 0.01, lng: Math.max(...lngs) + 0.01 };
    try {
      const bounds = new mappls.LatLngBounds(sw, ne);
      map.fitBounds(bounds, { padding: 50 });
    } catch {
      // ignore
    }
  }
}

