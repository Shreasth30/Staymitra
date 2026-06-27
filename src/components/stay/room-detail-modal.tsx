"use client";

import { useState } from "react";
import Image from "next/image";
import { publicImageUrlFromPath } from "@/lib/image-url";
import {
  X, ChevronLeft, ChevronRight, BedDouble, Snowflake,
  Users, Sofa, ShowerHead, IndianRupee, Shield,
} from "lucide-react";

type RoomData = {
  id: string;
  label: string;
  room_type?: string;
  beds_count: number;
  has_ac: boolean;
  is_furnished?: boolean;
  has_attached_washroom?: boolean;
  monthly_rent: number;
  security_deposit?: number;
  description: string | null;
  availability_status?: string;
  total_occupancy?: number;
  current_occupancy?: number;
};

type Props = {
  room: RoomData;
  photos: string[];
  open: boolean;
  onClose: () => void;
};

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-green-500 text-white" },
  few_beds_left: { label: "Few Beds Left", color: "bg-orange-500 text-white" },
  full: { label: "Full", color: "bg-red-500 text-white" },
  reserved: { label: "Reserved", color: "bg-blue-500 text-white" },
  coming_soon: { label: "Coming Soon", color: "bg-purple-500 text-white" },
};

const ROOM_TYPE_MAP: Record<string, string> = {
  single: "Single Occupancy",
  double: "Double Sharing",
  triple: "Triple Sharing",
  shared: "Shared Room",
};

export function RoomDetailModal({ room, photos, open, onClose }: Props) {
  const [imgIdx, setImgIdx] = useState(0);

  if (!open) return null;

  const avail = AVAILABILITY_LABELS[room.availability_status ?? "available"] ?? AVAILABILITY_LABELS.available;
  const roomType = ROOM_TYPE_MAP[room.room_type ?? "shared"] ?? "Shared Room";
  const bedsLeft = (room.total_occupancy ?? room.beds_count) - (room.current_occupancy ?? 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] rounded-2xl bg-card shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image Slider */}
        {photos.length > 0 ? (
          <div className="relative aspect-[16/10] bg-muted shrink-0">
            <Image
              src={publicImageUrlFromPath(photos[imgIdx])}
              alt={room.label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((p) => (p - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImgIdx((p) => (p + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === imgIdx ? "w-6 bg-white" : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Availability Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${avail.color}`}>
              {avail.label}
              {room.availability_status !== "full" && bedsLeft > 0 && (
                <span className="ml-1">· {bedsLeft} bed{bedsLeft > 1 ? 's' : ''} left</span>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-[16/10] bg-accent flex items-center justify-center shrink-0">
            <BedDouble className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="font-display text-2xl font-bold">{room.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{roomType}</p>

          {/* Spec Grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SpecItem icon={<Users className="h-4 w-4" />} label="Beds" value={`${room.beds_count} bed${room.beds_count > 1 ? 's' : ''}`} />
            <SpecItem icon={<Snowflake className="h-4 w-4" />} label="AC" value={room.has_ac ? "Yes" : "No"} highlight={room.has_ac} />
            <SpecItem icon={<Sofa className="h-4 w-4" />} label="Furnished" value={room.is_furnished ? "Yes" : "No"} highlight={room.is_furnished} />
            <SpecItem icon={<ShowerHead className="h-4 w-4" />} label="Attached Bath" value={room.has_attached_washroom ? "Yes" : "No"} highlight={room.has_attached_washroom} />
            <SpecItem icon={<IndianRupee className="h-4 w-4" />} label="Rent" value={`₹${Number(room.monthly_rent).toLocaleString()}/mo`} />
            {Number(room.security_deposit) > 0 && (
              <SpecItem icon={<Shield className="h-4 w-4" />} label="Deposit" value={`₹${Number(room.security_deposit).toLocaleString()}`} />
            )}
          </div>

          {/* Description */}
          {room.description && (
            <div className="mt-5">
              <p className="text-sm leading-relaxed text-foreground/80">{room.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecItem({
  icon, label, value, highlight,
}: {
  icon: React.ReactNode; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${highlight ? "border-primary/20 bg-primary/5" : "border-border/50 bg-accent/15"}`}>
      <div className={`${highlight ? "text-primary" : "text-muted-foreground"}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
