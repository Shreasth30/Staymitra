import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Search,
  User,
  Phone,
  Building2,
  CalendarClock,
  PhoneCall,
  Shield,
  Trash2,
  Save,
} from "lucide-react";
import { adminUpdateUserForm, adminDeleteUserForm } from "@/app/admin/actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (params.role === "seeker" || params.role === "owner" || params.role === "super_admin") {
    query = query.eq("role", params.role);
  }

  const { data: users } = await query;
  let filtered = users ?? [];

  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
    );
  }

  // Get counts per user
  const userIds = filtered.map((u) => u.id);

  const [{ data: propertyCounts }, { data: visitCounts }, { data: callbackCounts }] = await Promise.all([
    userIds.length
      ? supabase.from("properties").select("user_id").in("user_id", userIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase.from("visit_requests").select("seeker_id").in("seeker_id", userIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase.from("callback_requests").select("seeker_id").in("seeker_id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  const propCountMap: Record<string, number> = {};
  (propertyCounts ?? []).forEach((p: { user_id: string }) => {
    propCountMap[p.user_id] = (propCountMap[p.user_id] || 0) + 1;
  });

  const visitCountMap: Record<string, number> = {};
  (visitCounts ?? []).forEach((v: { seeker_id: string }) => {
    visitCountMap[v.seeker_id] = (visitCountMap[v.seeker_id] || 0) + 1;
  });

  const cbCountMap: Record<string, number> = {};
  (callbackCounts ?? []).forEach((c: { seeker_id: string }) => {
    cbCountMap[c.seeker_id] = (cbCountMap[c.seeker_id] || 0) + 1;
  });

  const roleColors: Record<string, string> = {
    seeker: "text-sky-400 bg-sky-500/15",
    owner: "text-violet-400 bg-violet-500/15",
    super_admin: "text-amber-400 bg-amber-500/15",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
        <p className="text-sm text-slate-400 mt-1">{filtered.length} user{filtered.length !== 1 ? "s" : ""} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search by name or phone..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
          />
          {params.role && <input type="hidden" name="role" value={params.role} />}
        </form>
        <div className="flex gap-2">
          <FilterPill href="/admin/users" label="All" active={!params.role} />
          <FilterPill href="/admin/users?role=seeker" label="Seekers" active={params.role === "seeker"} />
          <FilterPill href="/admin/users?role=owner" label="Owners" active={params.role === "owner"} />
          <FilterPill href="/admin/users?role=super_admin" label="Admins" active={params.role === "super_admin"} />
        </div>
      </div>

      {/* Users List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <Users className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-white/10"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400 shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {user.full_name || "No Name"}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {user.phone && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      )}
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleColors[user.role] || roleColors.seeker}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="flex gap-4 text-xs text-slate-500">
                  {propCountMap[user.id] > 0 && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {propCountMap[user.id]} propert{propCountMap[user.id] > 1 ? "ies" : "y"}
                    </span>
                  )}
                  {visitCountMap[user.id] > 0 && (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {visitCountMap[user.id]} visit{visitCountMap[user.id] > 1 ? "s" : ""}
                    </span>
                  )}
                  {cbCountMap[user.id] > 0 && (
                    <span className="flex items-center gap-1">
                      <PhoneCall className="h-3 w-3" />
                      {cbCountMap[user.id]} callback{cbCountMap[user.id] > 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="text-slate-600">
                    Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Edit Form */}
              <form action={adminUpdateUserForm} className="mt-4 pt-4 border-t border-white/[0.04]">
                <input type="hidden" name="userId" value={user.id} />
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Name</label>
                    <input
                      type="text"
                      name="full_name"
                      defaultValue={user.full_name || ""}
                      className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                    />
                  </div>
                  <div className="w-36">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      defaultValue={user.phone || ""}
                      className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Role</label>
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 text-sm text-slate-200 focus:border-sky-500/40 focus:outline-none"
                    >
                      <option value="seeker">Seeker</option>
                      <option value="owner">Owner</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-sky-500/15 px-4 text-xs font-bold text-sky-400 hover:bg-sky-500/25 transition-colors"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                </div>
              </form>

              {/* Delete */}
              <div className="mt-3 flex justify-end">
                <form action={adminDeleteUserForm}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button
                    type="submit"
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete User
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  const Link = require("next/link").default;
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
