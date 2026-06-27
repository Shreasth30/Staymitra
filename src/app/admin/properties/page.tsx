import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Building2,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  MapPin,
  BedDouble,
  Search,
} from "lucide-react";
import { adminTogglePublishForm, adminDeletePropertyForm } from "@/app/admin/actions";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("id, name, slug, city, area, type, published, min_monthly_rent, max_monthly_rent, created_at, user_id")
    .order("created_at", { ascending: false });

  if (params.status === "published") query = query.eq("published", true);
  if (params.status === "draft") query = query.eq("published", false);
  if (params.type === "hostel" || params.type === "pg") query = query.eq("type", params.type);

  const { data: propertiesData } = await query;
  const properties = propertiesData ?? [];

  // Fetch profiles for the properties
  let propertiesWithProfiles = properties.map(p => ({ ...p, profiles: null }));
  const userIds = Array.from(new Set(properties.map((p) => p.user_id).filter(Boolean)));
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    
    if (profiles) {
      const profileMap = new Map(profiles.map((u) => [u.id, u]));
      propertiesWithProfiles = properties.map((p) => ({
        ...p,
        profiles: profileMap.get(p.user_id) || null,
      }));
    }
  }

  // Client-side name search filter
  let filtered = propertiesWithProfiles;
  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.area && p.area.toLowerCase().includes(q))
    );
  }

  // Get room counts per property
  const propertyIds = filtered.map((p) => p.id);
  const { data: roomCounts } = propertyIds.length
    ? await supabase
        .from("room_offerings")
        .select("property_id")
        .in("property_id", propertyIds)
    : { data: [] };

  const roomCountMap: Record<string, number> = {};
  (roomCounts ?? []).forEach((r: { property_id: string }) => {
    roomCountMap[r.property_id] = (roomCountMap[r.property_id] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Properties</h1>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} propert{filtered.length !== 1 ? "ies" : "y"} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search by name, city, area..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
          />
          {/* Hidden fields to preserve other filters */}
          {params.status && <input type="hidden" name="status" value={params.status} />}
          {params.type && <input type="hidden" name="type" value={params.type} />}
        </form>
        <div className="flex gap-2">
          <FilterLink href="/admin/properties" label="All" active={!params.status} />
          <FilterLink href="/admin/properties?status=published" label="Published" active={params.status === "published"} />
          <FilterLink href="/admin/properties?status=draft" label="Draft" active={params.status === "draft"} />
          <FilterLink href="/admin/properties?type=hostel" label="Hostel" active={params.type === "hostel"} />
          <FilterLink href="/admin/properties?type=pg" label="PG" active={params.type === "pg"} />
        </div>
      </div>

      {/* Properties Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <Building2 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No properties found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Property</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">Owner</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:table-cell">Type</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:table-cell">Rooms</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:table-cell">Rent Range</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((p) => {
                const profile = p.profiles as { full_name: string | null } | null;
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/properties/${p.id}`}
                            className="text-sm font-semibold text-slate-200 hover:text-sky-400 transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {p.city}{p.area ? `, ${p.area}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                      {profile?.full_name || "—"}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="inline-block rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <BedDouble className="h-3 w-3" />
                        {roomCountMap[p.id] || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
                      ₹{Number(p.min_monthly_rent).toLocaleString()}
                      {Number(p.max_monthly_rent) > Number(p.min_monthly_rent) && ` – ₹${Number(p.max_monthly_rent).toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {p.published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          <Eye className="h-3 w-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                          <EyeOff className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/properties/${p.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-sky-400 transition-colors"
                          title="Edit"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <form action={adminTogglePublishForm}>
                          <input type="hidden" name="propertyId" value={p.id} />
                          <input type="hidden" name="published" value={p.published ? "false" : "true"} />
                          <button
                            type="submit"
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              p.published
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : "text-slate-500 hover:bg-white/[0.06] hover:text-emerald-400"
                            }`}
                            title={p.published ? "Unpublish" : "Publish"}
                          >
                            {p.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </form>
                        <form action={adminDeletePropertyForm}>
                          <input type="hidden" name="propertyId" value={p.id} />
                          <button
                            type="submit"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
        active
          ? "bg-sky-500/15 text-sky-400"
          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
      }`}
    >
      {label}
    </Link>
  );
}
