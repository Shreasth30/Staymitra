import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  BedDouble,
  Eye,
  EyeOff,
  Trash2,
  Image as ImageIcon,
  Phone,
  User,
} from "lucide-react";
import { adminUpdateProperty, adminTogglePublishForm, adminDeletePropertyForm, adminDeletePropertyPhoto, adminDeleteRoomPhoto, adminCreateRoomOffering, adminDeleteRoomOffering } from "@/app/admin/actions";
import { AMENITY_OPTIONS } from "@/types/database";
import { publicImageUrlFromPath } from "@/lib/image-url";

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) return notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", property.user_id)
    .single();

  property.profiles = profile || null;

  const [{ data: rooms }, { data: propertyPhotos }] = await Promise.all([
    supabase
      .from("room_offerings")
      .select("*, room_photos(id, storage_path, sort_order)")
      .eq("property_id", id)
      .order("sort_order"),
    supabase
      .from("property_photos")
      .select("id, storage_path, sort_order")
      .eq("property_id", id)
      .order("sort_order"),
  ]);

  const ownerProfile = property.profiles as { full_name: string | null; phone: string | null; role: string } | null;

  async function handleUpdate(formData: FormData) {
    "use server";
    await adminUpdateProperty(id, formData);
  }

  async function handleCreateOffering(formData: FormData) {
    "use server";
    await adminCreateRoomOffering(id, formData);
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/properties" className="text-slate-500 hover:text-sky-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Properties
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 font-medium truncate">{property.name}</span>
      </div>

      {/* Header + Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{property.name}</h1>
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.city}{property.area ? `, ${property.area}` : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <form action={adminTogglePublishForm}>
            <input type="hidden" name="propertyId" value={property.id} />
            <input type="hidden" name="published" value={property.published ? "false" : "true"} />
            <button
              type="submit"
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                property.published
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-white/[0.06] text-slate-400 hover:bg-white/10"
              }`}
            >
              {property.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {property.published ? "Published" : "Draft"}
            </button>
          </form>
          <form action={adminDeletePropertyForm}>
            <input type="hidden" name="propertyId" value={property.id} />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Owner Info */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Property Owner</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{ownerProfile?.full_name || "Unknown"}</p>
            {ownerProfile?.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {ownerProfile.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form action={handleUpdate} className="space-y-6">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
          <h2 className="text-sm font-bold text-white">Edit Property Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Property Name" name="name" defaultValue={property.name} required />
            <FormField label="City" name="city" defaultValue={property.city} required />
            <FormField label="Area" name="area" defaultValue={property.area || ""} />
            <FormField label="Address" name="address" defaultValue={property.address || ""} />
            <FormField label="Min Monthly Rent (₹)" name="min_monthly_rent" type="number" defaultValue={String(property.min_monthly_rent)} />
            <FormField label="Max Monthly Rent (₹)" name="max_monthly_rent" type="number" defaultValue={String(property.max_monthly_rent)} />
            <FormField label="Latitude" name="latitude" defaultValue={property.latitude ? String(property.latitude) : ""} />
            <FormField label="Longitude" name="longitude" defaultValue={property.longitude ? String(property.longitude) : ""} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Type</label>
            <select
              name="type"
              defaultValue={property.type}
              className="h-10 w-full max-w-xs rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
            >
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Description</label>
            <textarea
              name="description"
              defaultValue={property.description || ""}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none resize-none"
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <label key={a} className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 cursor-pointer hover:bg-white/[0.06] transition-colors has-[:checked]:bg-sky-500/15 has-[:checked]:text-sky-400">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={a}
                    defaultChecked={(property.amenities as string[])?.includes(a)}
                    className="sr-only"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" name="published" defaultChecked={property.published} className="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/30" />
              Published
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" name="callback_enabled" defaultChecked={property.callback_enabled} className="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/30" />
              Callbacks Enabled
            </label>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-2.5 text-sm font-bold text-white transition-colors shadow-lg shadow-sky-500/20"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Property Photos */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-sky-400" />
          Property Photos ({propertyPhotos?.length ?? 0})
        </h2>
        {!propertyPhotos?.length ? (
          <p className="text-xs text-slate-600 italic">No property photos uploaded</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {propertyPhotos.map((photo) => (
              <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-white/[0.06]">
                <img
                  src={publicImageUrlFromPath(photo.storage_path)}
                  alt="Property"
                  className="w-full h-28 object-cover"
                />
                <form action={async () => { "use server"; await adminDeletePropertyPhoto(photo.id); }}>
                  <button
                    type="submit"
                    className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    title="Delete photo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Offerings */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-amber-400" />
            Room Offerings ({rooms?.length ?? 0})
          </h2>
        </div>
        {!rooms?.length ? (
          <p className="text-xs text-slate-600 italic">No room offerings</p>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{room.label}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <Badge label={room.room_type || "shared"} />
                      <Badge label={`${room.beds_count} bed${room.beds_count > 1 ? "s" : ""}`} />
                      {room.has_ac && <Badge label="AC" color="text-sky-400 bg-sky-500/10" />}
                      {room.is_furnished && <Badge label="Furnished" color="text-violet-400 bg-violet-500/10" />}
                      {room.has_attached_washroom && <Badge label="Attached Bath" color="text-emerald-400 bg-emerald-500/10" />}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">₹{Number(room.monthly_rent).toLocaleString()}/mo</p>
                      <AvailBadge status={room.availability_status || "available"} />
                    </div>
                    <form action={async () => { "use server"; await adminDeleteRoomOffering(room.id, id); }}>
                      <button
                        type="submit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete offering"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
                {/* Room Photos */}
                {room.room_photos && (room.room_photos as { id: string; storage_path: string }[]).length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(room.room_photos as { id: string; storage_path: string }[]).map((photo) => (
                      <div key={photo.id} className="group relative shrink-0 rounded-lg overflow-hidden border border-white/[0.06]">
                        <img
                          src={publicImageUrlFromPath(photo.storage_path)}
                          alt="Room"
                          className="h-20 w-28 object-cover"
                        />
                        <form action={async () => { "use server"; await adminDeleteRoomPhoto(photo.id); }}>
                          <button
                            type="submit"
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete photo"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Offering Form */}
        <div className="rounded-xl border border-dashed border-white/10 p-5 bg-white/[0.01]">
          <h3 className="text-xs font-bold text-white mb-3">Add New Room Type</h3>
          <form action={handleCreateOffering} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Room Category Name</label>
                <input
                  type="text"
                  name="label"
                  required
                  placeholder="e.g. Deluxe 2-Sharing with AC"
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Room Type</label>
                <select
                  name="room_type"
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                  defaultValue="shared"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Beds in Room</label>
                <input
                  type="number"
                  name="beds_count"
                  min={1}
                  defaultValue={2}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Total Occupancy</label>
                <input
                  type="number"
                  name="total_occupancy"
                  min={1}
                  defaultValue={2}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Rent (₹/mo)</label>
                <input
                  type="number"
                  name="monthly_rent"
                  min={0}
                  defaultValue={8000}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Deposit (₹)</label>
                <input
                  type="number"
                  name="security_deposit"
                  min={0}
                  defaultValue={0}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" name="has_ac" className="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/30" />
                Air Conditioned
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" name="is_furnished" className="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/30" />
                Furnished
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" name="has_attached_washroom" className="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/30" />
                Attached Washroom
              </label>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Short Description</label>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none resize-none"
                placeholder="Tell guests about the room specifics..."
              />
            </div>
            <input type="hidden" name="sort_order" defaultValue={(rooms?.length ?? 0) + 1} />
            <button
              type="submit"
              className="rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-2.5 text-xs font-bold text-white transition-colors shadow-lg shadow-sky-500/20"
            >
              Create Room Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS ─── */

function FormField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
      />
    </div>
  );
}

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color || "text-slate-400 bg-white/[0.06]"}`}>
      {label}
    </span>
  );
}

function AvailBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    available: "text-emerald-400 bg-emerald-500/15",
    few_beds_left: "text-amber-400 bg-amber-500/15",
    full: "text-red-400 bg-red-500/15",
    reserved: "text-blue-400 bg-blue-500/15",
    coming_soon: "text-violet-400 bg-violet-500/15",
  };
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase mt-1 ${colors[status] || colors.available}`}>
      {status.replace("_", " ")}
    </span>
  );
}
