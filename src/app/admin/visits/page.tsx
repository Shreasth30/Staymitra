import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  CalendarClock,
  Search,
  User,
  Building2,
  Trash2,
  Clock,
  MessageSquare,
} from "lucide-react";
import { adminUpdateVisitStatusForm, adminDeleteVisitForm } from "@/app/admin/actions";

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("visit_requests")
    .select("*, properties!visit_requests_property_id_fkey(name)")
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data: visits } = await query;
  const visitsData = visits ?? [];

  // Fetch profiles for the visits
  let visitsWithProfiles = visitsData.map(v => ({ ...v, profiles: null }));
  const seekerIds = Array.from(new Set(visitsData.map((v) => v.seeker_id).filter(Boolean)));
  if (seekerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", seekerIds);
    
    if (profiles) {
      const profileMap = new Map(profiles.map((u) => [u.id, u]));
      visitsWithProfiles = visitsData.map((v) => ({
        ...v,
        profiles: profileMap.get(v.seeker_id) || null,
      }));
    }
  }

  let filtered = visitsWithProfiles;

  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter((v) => {
      const profiles = v.profiles as { full_name: string | null } | null;
      const properties = v.properties as { name: string } | null;
      return (
        (profiles?.full_name && profiles.full_name.toLowerCase().includes(q)) ||
        (properties?.name && properties.name.toLowerCase().includes(q))
      );
    });
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Visit Requests</h1>
        <p className="text-sm text-slate-400 mt-1">{filtered.length} visit{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search by name or property..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
          />
          {params.status && <input type="hidden" name="status" value={params.status} />}
        </form>
        <div className="flex gap-2 flex-wrap">
          <StatusFilter href="/admin/visits" label="All" active={!params.status} />
          <StatusFilter href="/admin/visits?status=pending" label="Pending" active={params.status === "pending"} />
          <StatusFilter href="/admin/visits?status=confirmed" label="Confirmed" active={params.status === "confirmed"} />
          <StatusFilter href="/admin/visits?status=visit_scheduled" label="Scheduled" active={params.status === "visit_scheduled"} />
          <StatusFilter href="/admin/visits?status=done" label="Done" active={params.status === "done"} />
          <StatusFilter href="/admin/visits?status=declined" label="Declined" active={params.status === "declined"} />
          <StatusFilter href="/admin/visits?status=closed" label="Closed" active={params.status === "closed"} />
        </div>
      </div>

      {/* Visits List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <CalendarClock className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No visit requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => {
            const profiles = v.profiles as { full_name: string | null; phone: string | null } | null;
            const properties = v.properties as { name: string } | null;
            return (
              <div key={v.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate flex items-center gap-2">
                        <User className="h-3 w-3 text-slate-500" />
                        {profiles?.full_name || "Guest"}
                        {profiles?.phone && (
                          <span className="text-xs text-slate-500 font-normal">({profiles.phone})</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 className="h-3 w-3" />
                        {properties?.name || "Unknown Property"}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-sky-400">
                          <Clock className="h-3 w-3" />
                          {new Date(v.preferred_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        {v.note && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MessageSquare className="h-3 w-3" />
                            {v.note}
                          </span>
                        )}
                        <span className="text-slate-600">
                          Created {new Date(v.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </span>
                        {v.source && v.source !== "web" && (
                          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-slate-400">
                            via {v.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3">
                    <form action={adminUpdateVisitStatusForm} className="flex items-center gap-2">
                      <input type="hidden" name="visitId" value={v.id} />
                      <select
                        name="status"
                        defaultValue={v.status}
                        className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-xs font-semibold text-slate-200 focus:border-sky-500/40 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="interested">Interested</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="visit_scheduled">Visit Scheduled</option>
                        <option value="done">Completed</option>
                        <option value="declined">Declined</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        type="submit"
                        className="h-9 rounded-lg bg-sky-500/15 px-3 text-xs font-bold text-sky-400 hover:bg-sky-500/25 transition-colors"
                      >
                        Update
                      </button>
                    </form>
                    <form action={adminDeleteVisitForm}>
                      <input type="hidden" name="visitId" value={v.id} />
                      <button
                        type="submit"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete"
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

function StatusFilter({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
        active ? "bg-sky-500/15 text-sky-400" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
      }`}
    >
      {label}
    </Link>
  );
}
