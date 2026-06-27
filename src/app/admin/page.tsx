import { createClient } from "@/lib/supabase/server";
import {
  Building2,
  Users,
  PhoneCall,
  CalendarClock,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch all counts in parallel
  const [
    { count: totalUsers },
    { count: seekerCount },
    { count: ownerCount },
    { count: totalProperties },
    { count: publishedProperties },
    { count: unpublishedProperties },
    { count: totalCallbacks },
    { count: pendingCallbacks },
    { count: totalVisits },
    { count: pendingVisits },
    { data: recentCallbacksRaw },
    { data: recentVisitsRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seeker"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "owner"),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("published", false),
    supabase.from("callback_requests").select("*", { count: "exact", head: true }),
    supabase.from("callback_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("visit_requests").select("*", { count: "exact", head: true }),
    supabase.from("visit_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("callback_requests")
      .select("id, contact_phone, status, created_at, property_id, properties(name), seeker_id")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("visit_requests")
      .select("id, preferred_at, status, created_at, property_id, properties(name), seeker_id")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Fetch profiles for callbacks and visits in parallel
  const callbackSeekerIds = Array.from(new Set((recentCallbacksRaw ?? []).map(cb => cb.seeker_id).filter(Boolean)));
  const visitSeekerIds = Array.from(new Set((recentVisitsRaw ?? []).map(v => v.seeker_id).filter(Boolean)));
  const allSeekerIds = Array.from(new Set([...callbackSeekerIds, ...visitSeekerIds]));

  let profilesMap = new Map();
  if (allSeekerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", allSeekerIds);
    if (profiles) {
      profilesMap = new Map(profiles.map(u => [u.id, u]));
    }
  }

  const recentCallbacks = (recentCallbacksRaw ?? []).map(cb => ({
    ...cb,
    profiles: profilesMap.get(cb.seeker_id) || null
  }));

  const recentVisits = (recentVisitsRaw ?? []).map(v => ({
    ...v,
    profiles: profilesMap.get(v.seeker_id) || null
  }));

  const stats = [
    {
      label: "Total Users",
      value: totalUsers ?? 0,
      sub: `${seekerCount ?? 0} seekers · ${ownerCount ?? 0} owners`,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
    },
    {
      label: "Properties",
      value: totalProperties ?? 0,
      sub: `${publishedProperties ?? 0} live · ${unpublishedProperties ?? 0} draft`,
      icon: Building2,
      gradient: "from-sky-500 to-blue-600",
      shadow: "shadow-sky-500/20",
    },
    {
      label: "Callbacks",
      value: totalCallbacks ?? 0,
      sub: `${pendingCallbacks ?? 0} pending`,
      icon: PhoneCall,
      gradient: "from-emerald-500 to-green-600",
      shadow: "shadow-emerald-500/20",
      highlight: (pendingCallbacks ?? 0) > 0,
    },
    {
      label: "Visits",
      value: totalVisits ?? 0,
      sub: `${pendingVisits ?? 0} pending`,
      icon: CalendarClock,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
      highlight: (pendingVisits ?? 0) > 0,
    },
    {
      label: "Pending Approvals",
      value: unpublishedProperties ?? 0,
      sub: "listings to review",
      icon: ShieldCheck,
      gradient: "from-rose-500 to-red-600",
      shadow: "shadow-rose-500/20",
      highlight: (unpublishedProperties ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of Staymitra platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:bg-white/[0.05] hover:border-white/10 ${
                stat.highlight ? "ring-1 ring-sky-500/30" : ""
              }`}
            >
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
              {stat.highlight && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <InsightCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Platform Activity"
          value={`${(totalCallbacks ?? 0) + (totalVisits ?? 0)} total leads`}
          color="text-sky-400"
        />
        <InsightCard
          icon={<Eye className="h-4 w-4" />}
          label="Publish Rate"
          value={`${totalProperties ? Math.round(((publishedProperties ?? 0) / (totalProperties ?? 1)) * 100) : 0}% of listings live`}
          color="text-emerald-400"
        />
        <InsightCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Action Needed"
          value={`${(pendingCallbacks ?? 0) + (pendingVisits ?? 0)} pending leads`}
          color={(pendingCallbacks ?? 0) + (pendingVisits ?? 0) > 0 ? "text-amber-400" : "text-slate-500"}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Callbacks */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
            <PhoneCall className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Recent Callbacks</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {!recentCallbacks?.length ? (
              <EmptyRow text="No callback requests yet" />
            ) : (
              recentCallbacks.map((cb: Record<string, unknown>) => {
                const profiles = cb.profiles as { full_name: string | null } | null;
                const properties = cb.properties as { name: string } | null;
                return (
                  <div key={cb.id as string} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {profiles?.full_name || "Guest"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{properties?.name ?? "Unknown Property"}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <StatusPill status={cb.status as string} />
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(cb.created_at as string).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Visits */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
            <CalendarClock className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Recent Visits</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {!recentVisits?.length ? (
              <EmptyRow text="No visit requests yet" />
            ) : (
              recentVisits.map((v: Record<string, unknown>) => {
                const profiles = v.profiles as { full_name: string | null } | null;
                const properties = v.properties as { name: string } | null;
                return (
                  <div key={v.id as string} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {profiles?.full_name || "Guest"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{properties?.name ?? "Unknown Property"}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <StatusPill status={v.status as string} />
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(v.created_at as string).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUB COMPONENTS ─── */

function InsightCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{label}</p>
        <p className={`text-sm font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400",
    new: "bg-amber-500/15 text-amber-400",
    contacted: "bg-blue-500/15 text-blue-400",
    interested: "bg-emerald-500/15 text-emerald-400",
    confirmed: "bg-green-500/15 text-green-400",
    visit_scheduled: "bg-violet-500/15 text-violet-400",
    done: "bg-sky-500/15 text-sky-400",
    closed: "bg-slate-500/15 text-slate-500",
    declined: "bg-red-500/15 text-red-400",
    rejected: "bg-red-500/15 text-red-400",
  };
  const c = colors[status] || colors.pending;
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${c}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="py-10 text-center">
      <Clock className="h-6 w-6 text-slate-700 mx-auto mb-2" />
      <p className="text-xs text-slate-600 italic">{text}</p>
    </div>
  );
}
