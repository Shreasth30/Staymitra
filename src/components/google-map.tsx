"use client";
/* eslint-disable */

import { useEffect, useRef, useState } from "react";

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
  center?: [number, number];
  zoom?: number;
  height?: string;
  showBorder?: boolean;
};

export function GoogleMap({
  markers,
  center,
  zoom = 13,
  height = "400px",
  showBorder = true,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).google?.maps) {
      setScriptLoaded(true);
      return;
    }

    if (!apiKey) {
      setError("Google Maps API Key missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local");
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=beta`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps SDK");
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    const google = (window as any).google;
    const initialCenter = center 
      ? { lat: center[0], lng: center[1] }
      : markers.length > 0 
        ? { lat: markers[0].lat, lng: markers[0].lng }
        : { lat: 28.4744, lng: 77.5030 }; // Default Greater Noida

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        // Use a modern style if possible
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapId: "STAYMITRA_MAP_ID", // Optional: for advanced markers
      });

      googleMapRef.current = map;

      const bounds = new google.maps.LatLngBounds();

      markers.forEach((m) => {
        const position = { lat: m.lat, lng: m.lng };
        bounds.extend(position);

        if (m.price) {
          // Price Marker (Custom HTML)
          const priceStr = typeof m.price === 'number' 
            ? `₹${m.price.toLocaleString()}` 
            : m.price;
            
          const priceTag = document.createElement("div");
          priceTag.className = "price-tag bg-primary text-white px-2 py-1 rounded-full font-bold text-xs shadow-md border-2 border-white hover:scale-110 transition-transform cursor-pointer whitespace-nowrap";
          priceTag.innerText = priceStr;
          
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: priceTag,
            title: m.title,
          });

          marker.addListener("click", () => {
            if (m.slug) window.location.href = `/stay/${m.slug}`;
          });
        } else {
          // Standard Marker
          const marker = new google.maps.Marker({
            position,
            map,
            title: m.title,
            animation: google.maps.Animation.DROP,
          });

          marker.addListener("click", () => {
            if (m.slug) window.location.href = `/stay/${m.slug}`;
          });
        }
      });

      if (markers.length > 1 && !center) {
        map.fitBounds(bounds);
      }
    } catch (e) {
      console.error("Google Maps initialization error:", e);
      setError("Failed to initialize map features");
    }
  }, [scriptLoaded, markers, center, zoom]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border-border bg-muted p-6 text-center text-sm text-muted-foreground ${showBorder ? 'border' : ''}`}
        style={{ height }}
      >
        <div className="max-w-xs">
          <p className="font-bold text-foreground mb-2">Google Maps Setup Required</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .price-tag {
          transform: translate(-50%, -100%);
        }
      `}</style>
      <div
        ref={mapRef}
        className={`w-full overflow-hidden rounded-xl border-border shadow-sm ${showBorder ? 'border' : ''}`}
        style={{ height }}
      />
    </>
  );
}
