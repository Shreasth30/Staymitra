import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  PhoneCall,
  Search,
  User,
  Building2,
  Trash2,
  Plus,
  MessageSquare,
  Clock,
} from "lucide-react";
import {
  adminUpdateCallbackStatusForm,
  adminDeleteCallbackForm,
  adminCreateCallback,
} from "@/app/admin/actions";

export default async function AdminCallbacksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("callback_requests")
    .select("*, properties!callback_requests_property_id_fkey(name)")
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data: callbacks } = await query;
  const callbacksData = callbacks ?? [];

  // Fetch profiles for the callbacks
  let callbacksWithProfiles = callbacksData.map(c => ({ ...c, profiles: null }));
  const seekerIds = Array.from(new Set(callbacksData.map((c) => c.seeker_id).filter(Boolean)));
  if (seekerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", seekerIds);
    
    if (profiles) {
      const profileMap = new Map(profiles.map((u) => [u.id, u]));
      callbacksWithProfiles = callbacksData.map((c) => ({
        ...c,
        profiles: profileMap.get(c.seeker_id) || null,
      }));
    }
  }

  let filtered = callbacksWithProfiles;

  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter((c) => {
      const profiles = c.profiles as { full_name: string | null } | null;
      const properties = c.properties as { name: string } | null;
      return (
        (profiles?.full_name && profiles.full_name.toLowerCase().includes(q)) ||
        (properties?.name && properties.name.toLowerCase().includes(q)) ||
        c.contact_phone.includes(q)
      );
    });
  }

  // Fetch users and properties for the "create" form
  const [{ data: allUsers }, { data: allProperties }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone").order("full_name"),
    supabase.from("properties").select("id, name").order("name"),
  ]);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400",
    new: "bg-amber-500/15 text-amber-400",
    contacted: "bg-blue-500/15 text-blue-400",
    interested: "bg-emerald-500/15 text-emerald-400",
    visit_scheduled: "bg-violet-500/15 text-violet-400",
    done: "bg-sky-500/15 text-sky-400",
    closed: "bg-slate-500/15 text-slate-500",
    rejected: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Callback Requests</h1>
          <p className="text-sm text-slate-400 mt-1">{filtered.length} callback{filtered.length !== 1 ? "s" : ""}</p>
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
            placeholder="Search by name, property, phone..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
          />
          {params.status && <input type="hidden" name="status" value={params.status} />}
        </form>
        <div className="flex gap-2 flex-wrap">
          <StatusFilter href="/admin/callbacks" label="All" active={!params.status} />
          <StatusFilter href="/admin/callbacks?status=pending" label="Pending" active={params.status === "pending"} />
          <StatusFilter href="/admin/callbacks?status=contacted" label="Contacted" active={params.status === "contacted"} />
          <StatusFilter href="/admin/callbacks?status=done" label="Done" active={params.status === "done"} />
          <StatusFilter href="/admin/callbacks?status=closed" label="Closed" active={params.status === "closed"} />
        </div>
      </div>

      {/* Create Callback (on behalf of user) */}
      <details className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden group">
        <summary className="cursor-pointer px-5 py-4 flex items-center gap-2 text-sm font-bold text-sky-400 hover:bg-white/[0.02] transition-colors">
          <Plus className="h-4 w-4" />
          Book Callback on Behalf of a User
        </summary>
        <form action={adminCreateCallback} className="px-5 pb-5 pt-2 border-t border-white/[0.04] space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Select User (Seeker)
              </label>
              <select
                name="seeker_id"
                required
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
              >
                <option value="">Choose a user...</option>
                {(allUsers ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || "No Name"} {u.phone ? `(${u.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Select Property
              </label>
              <select
                name="property_id"
                required
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
              >
                <option value="">Choose a property...</option>
                {(allProperties ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contact_phone"
                required
                placeholder="+91 9876543210"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Message (optional)
              </label>
              <input
                type="text"
                name="message"
                placeholder="Reason for callback..."
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-2.5 text-sm font-bold text-white transition-colors shadow-lg shadow-sky-500/20"
          >
            Create Callback Request
          </button>
        </form>
      </details>

      {/* Callbacks List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <PhoneCall className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No callback requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cb) => {
            const profiles = cb.profiles as { full_name: string | null; phone: string | null } | null;
            const properties = cb.properties as { name: string } | null;
            return (
              <div key={cb.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <PhoneCall className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate flex items-center gap-2">
                        <User className="h-3 w-3 text-slate-500" />
                        {profiles?.full_name || "Guest"}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 className="h-3 w-3" />
                        {properties?.name || "Unknown Property"}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1 font-bold text-sky-400">
                          <PhoneCall className="h-3 w-3" />
                          {cb.contact_phone}
                        </span>
                        {cb.message && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MessageSquare className="h-3 w-3" />
                            {cb.message}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-3 w-3" />
                          {new Date(cb.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </span>
                        {cb.source && cb.source !== "web" && (
                          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-slate-400">
                            via {cb.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3">
                    <form action={adminUpdateCallbackStatusForm} className="flex items-center gap-2">
                      <input type="hidden" name="callbackId" value={cb.id} />
                      <select
                        name="status"
                        defaultValue={cb.status}
                        className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-xs font-semibold text-slate-200 focus:border-sky-500/40 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="interested">Interested</option>
                        <option value="done">Done</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        type="submit"
                        className="h-9 rounded-lg bg-sky-500/15 px-3 text-xs font-bold text-sky-400 hover:bg-sky-500/25 transition-colors"
                      >
                        Update
                      </button>
                    </form>
                    <form action={adminDeleteCallbackForm}>
                      <input type="hidden" name="callbackId" value={cb.id} />
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
