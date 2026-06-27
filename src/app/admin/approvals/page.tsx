import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  MapPin,
  User,
  BedDouble,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { adminTogglePublishForm, adminDeletePropertyForm } from "@/app/admin/actions";
import { publicImageUrlFromPath } from "@/lib/image-url";

export default async function AdminApprovalsPage() {
  const supabase = await createClient();

  const { data: propertiesData } = await supabase
    .from("properties")
    .select("id, name, slug, city, area, type, min_monthly_rent, max_monthly_rent, created_at, description, user_id")
    .eq("published", false)
    .order("created_at", { ascending: false });

  const properties = propertiesData ?? [];

  // Fetch profiles for the properties
  let propertiesWithProfiles = properties.map(p => ({ ...p, profiles: null }));
  const userIds = Array.from(new Set(properties.map((p) => p.user_id).filter(Boolean)));
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", userIds);
    
    if (profiles) {
      const profileMap = new Map(profiles.map((u) => [u.id, u]));
      propertiesWithProfiles = properties.map((p) => ({
        ...p,
        profiles: profileMap.get(p.user_id) || null,
      }));
    }
  }

  const propertyIds = propertiesWithProfiles.map((p) => p.id);

  // Get room counts and first photo per property
  const [{ data: roomData }, { data: photoData }] = await Promise.all([
    propertyIds.length
      ? supabase.from("room_offerings").select("property_id, beds_count").in("property_id", propertyIds)
      : Promise.resolve({ data: [] }),
    propertyIds.length
      ? supabase
          .from("property_photos")
          .select("property_id, storage_path")
          .in("property_id", propertyIds)
          .order("sort_order")
      : Promise.resolve({ data: [] }),
  ]);

  const roomCountMap: Record<string, number> = {};
  (roomData ?? []).forEach((r: { property_id: string }) => {
    roomCountMap[r.property_id] = (roomCountMap[r.property_id] || 0) + 1;
  });

  const firstPhotoMap: Record<string, string> = {};
  (photoData ?? []).forEach((p: { property_id: string; storage_path: string }) => {
    if (!firstPhotoMap[p.property_id]) {
      firstPhotoMap[p.property_id] = p.storage_path;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Listing Approvals</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {propertiesWithProfiles.length} listing{propertiesWithProfiles.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
      </div>

      {/* Queue */}
      {!propertiesWithProfiles.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500/30 mx-auto mb-4" />
          <p className="text-base font-semibold text-slate-400">All caught up!</p>
          <p className="text-sm text-slate-600 mt-1">No listings pending approval</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {propertiesWithProfiles.map((p) => {
            const profile = p.profiles as { full_name: string | null; phone: string | null } | null;
            const photoUrl = firstPhotoMap[p.id] ? publicImageUrlFromPath(firstPhotoMap[p.id]) : null;

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all hover:border-white/10 hover:bg-white/[0.04] group"
              >
                {/* Image / Placeholder */}
                <div className="relative h-36 bg-white/[0.03] overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-amber-400">
                      <Clock className="h-3 w-3" />
                      Pending Review
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="inline-block rounded-md bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase text-white/80">
                      {p.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="text-sm font-bold text-slate-200 hover:text-sky-400 transition-colors line-clamp-1"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {p.city}{p.area ? `, ${p.area}` : ""}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-400">
                      <BedDouble className="h-3 w-3" />
                      {roomCountMap[p.id] || 0} room{(roomCountMap[p.id] || 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="text-slate-400">
                      ₹{Number(p.min_monthly_rent).toLocaleString()}{Number(p.max_monthly_rent) > Number(p.min_monthly_rent) ? ` – ₹${Number(p.max_monthly_rent).toLocaleString()}` : ""}
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="h-3 w-3" />
                    <span>by {profile?.full_name || "Unknown"}</span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                    <form action={adminTogglePublishForm} className="flex-1">
                      <input type="hidden" name="propertyId" value={p.id} />
                      <input type="hidden" name="published" value="true" />
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Approve & Publish
                      </button>
                    </form>
                    <form action={adminDeletePropertyForm}>
                      <input type="hidden" name="propertyId" value={p.id} />
                      <button
                        type="submit"
                        className="flex h-full items-center justify-center rounded-xl bg-red-500/10 px-3 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Reject & Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
