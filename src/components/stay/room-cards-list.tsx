"use client";

import { useState } from "react";
import Image from "next/image";
import { publicImageUrlFromPath } from "@/lib/image-url";
import { RoomDetailModal } from "./room-detail-modal";
import { Users, Snowflake, Sofa, ShowerHead, BedDouble } from "lucide-react";

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
  rooms: RoomData[];
  photosByRoom: Record<string, string[]>;
};

const AVAILABILITY_BADGE: Record<string, { label: string; class: string }> = {
  available: { label: "Available", class: "bg-green-500/10 text-green-600" },
  few_beds_left: { label: "Few Beds Left", class: "bg-orange-500/10 text-orange-500" },
  full: { label: "Full", class: "bg-red-500/10 text-red-500" },
  reserved: { label: "Reserved", class: "bg-blue-500/10 text-blue-500" },
  coming_soon: { label: "Coming Soon", class: "bg-purple-500/10 text-purple-500" },
};

const ROOM_TYPE_SHORT: Record<string, string> = {
  single: "Single",
  double: "Double",
  triple: "Triple",
  shared: "Shared",
};

export function RoomCardsList({ rooms, photosByRoom }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  return (
    <>
      <div className="flex flex-col gap-5">
        {rooms.map((room) => {
          const rPhotos = photosByRoom[room.id] ?? [];
          const avail = AVAILABILITY_BADGE[room.availability_status ?? "available"] ?? AVAILABILITY_BADGE.available;
          const bedsLeft = (room.total_occupancy ?? room.beds_count) - (room.current_occupancy ?? 0);

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedRoom(room)}
              className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center text-left transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 group cursor-pointer"
            >
              {/* Availability Badge on card */}
              <div className={`absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border border-current/10 ${avail.class}`}>
                {avail.label}
                {room.availability_status !== "full" && bedsLeft > 0 && bedsLeft <= 3 && (
                  <span> · {bedsLeft} left</span>
                )}
              </div>

              {/* Thumbnail */}
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-44">
                {rPhotos[0] ? (
                  <Image
                    src={publicImageUrlFromPath(rPhotos[0])}
                    alt={room.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="200px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-accent text-2xl font-display font-bold text-muted-foreground/30">
                    {room.label.slice(0, 1)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-display text-[17px] font-bold group-hover:text-primary transition-colors">{room.label}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ROOM_TYPE_SHORT[room.room_type ?? "shared"] || "Shared"}</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{room.beds_count} bed{room.beds_count > 1 ? "s" : ""}</span>
                    {room.has_ac && <span className="flex items-center gap-1 text-primary"><Snowflake className="h-3 w-3" />AC</span>}
                    {room.is_furnished && <span className="flex items-center gap-1 text-amber-600"><Sofa className="h-3 w-3" />Furnished</span>}
                    {room.has_attached_washroom && <span className="flex items-center gap-1 text-blue-500"><ShowerHead className="h-3 w-3" />Bath</span>}
                  </div>
                  {room.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{room.description}</p>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-bold">
                    ₹{Number(room.monthly_rent).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ month</span>
                  </div>
                  <span className="text-xs font-bold text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    View details →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          photos={photosByRoom[selectedRoom.id] ?? []}
          open={true}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </>
  );
}
