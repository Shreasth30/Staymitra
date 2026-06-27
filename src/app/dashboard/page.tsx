import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS_CONFIG } from "@/types/database";
import {
  ArrowRight, Building2, BedDouble, Users, PhoneCall,
  CalendarClock, Eye, AlertCircle, Plus,
} from "lucide-react";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/auth/login?next=/dashboard");
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "seeker";

  if (role === "owner") {
    return <OwnerOverview userId={user.id} name={profile?.full_name} />;
  }
  return <SeekerOverview userId={user.id} name={profile?.full_name} />;
}

interface RoomOfferingSummary {
  id: string;
  availability_status: string | null;
  beds_count: number | null;
}

interface ProfileSummary {
  full_name: string | null;
}

interface VisitRequestSummary {
  id: string;
  profiles: ProfileSummary | null;
  property_id: string;
  preferred_at: string;
  status: string;
}

interface CallbackRequestSummary {
  id: string;
  profiles: ProfileSummary | null;
  property_id: string;
  contact_phone: string;
  status: string;
}

/* ─── OWNER DASHBOARD ─── */
async function OwnerOverview({ userId, name }: { userId: string; name: string | null }) {
  const supabase = await createClient();

  // Fetch all owner data in parallel
  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, published")
    .eq("user_id", userId);

  const ids = properties?.map((p: { id: string }) => p.id) ?? [];
  const propNames = Object.fromEntries((properties ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));

  const [
    roomsResult,
    totalVisitsResult,
    totalCallbacksResult,
    pendingVisitsResult,
    pendingCallbacksResult,
    recentVisitsResult,
    recentCallbacksResult,
  ] = await Promise.all([
    ids.length
      ? supabase.from("room_offerings").select("id, availability_status, beds_count").in("property_id", ids)
      : Promise.resolve({ data: [] as RoomOfferingSummary[] }),
    ids.length
      ? supabase.from("visit_requests").select("*", { count: "exact", head: true }).in("property_id", ids)
      : Promise.resolve({ count: 0 }),
    ids.length
      ? supabase.from("callback_requests").select("*", { count: "exact", head: true }).in("property_id", ids)
      : Promise.resolve({ count: 0 }),
    ids.length
      ? supabase.from("visit_requests").select("*", { count: "exact", head: true }).in("property_id", ids).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    ids.length
      ? supabase.from("callback_requests").select("*", { count: "exact", head: true }).in("property_id", ids).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    ids.length
      ? supabase.from("visit_requests").select("*, seeker_id")
          .in("property_id", ids).order("created_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: [] as any[] }),
    ids.length
      ? supabase.from("callback_requests").select("*, seeker_id")
          .in("property_id", ids).order("created_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const rooms = (roomsResult as { data: RoomOfferingSummary[] | null }).data;
  const totalVisits = (totalVisitsResult as { count: number | null }).count;
  const totalCallbacks = (totalCallbacksResult as { count: number | null }).count;
  const pendingVisits = (pendingVisitsResult as { count: number | null }).count;
  const pendingCallbacks = (pendingCallbacksResult as { count: number | null }).count;
  const recentVisitsRaw = (recentVisitsResult as { data: any[] | null }).data;
  const recentCallbacksRaw = (recentCallbacksResult as { data: any[] | null }).data;

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

  const recentVisits = (recentVisitsRaw ?? []).map(v => ({
    ...v,
    profiles: profilesMap.get(v.seeker_id) || null
  }));

  const recentCallbacks = (recentCallbacksRaw ?? []).map(cb => ({
    ...cb,
    profiles: profilesMap.get(cb.seeker_id) || null
  }));

  const totalRooms = rooms?.length ?? 0;
  const availableRooms = rooms?.filter((r) => r.availability_status === "available" || !r.availability_status).length ?? 0;
  const fullRooms = rooms?.filter((r) => r.availability_status === "full").length ?? 0;
  const totalLeads = (totalVisits ?? 0) + (totalCallbacks ?? 0);
  const pendingTotal = (pendingVisits ?? 0) + (pendingCallbacks ?? 0);
  const publishedCount = properties?.filter((p: { published: boolean }) => p.published).length ?? 0;

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {name ? `Welcome, ${name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {pendingTotal > 0
              ? <>You have <span className="font-bold text-primary">{pendingTotal}</span> pending lead{pendingTotal > 1 ? 's' : ''} to review.</>
              : "Everything is up to date. No pending leads right now."
            }
          </p>
        </div>
        <Button asChild className="rounded-xl font-bold h-11 px-6 shadow-md">
          <Link href="/dashboard/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard icon={<Building2 className="h-5 w-5" />} label="Properties" value={properties?.length ?? 0} subtext={`${publishedCount} live`} />
        <MetricCard icon={<BedDouble className="h-5 w-5" />} label="Total Rooms" value={totalRooms} subtext={`${availableRooms} available`} />
        <MetricCard icon={<Users className="h-5 w-5" />} label="Total Leads" value={totalLeads} subtext={`${pendingTotal} pending`} highlight={pendingTotal > 0} />
        <MetricCard icon={<CalendarClock className="h-5 w-5" />} label="Visit Requests" value={totalVisits ?? 0} subtext={`${pendingVisits ?? 0} pending`} highlight={(pendingVisits ?? 0) > 0} />
        <MetricCard icon={<PhoneCall className="h-5 w-5" />} label="Callbacks" value={totalCallbacks ?? 0} subtext={`${pendingCallbacks ?? 0} pending`} highlight={(pendingCallbacks ?? 0) > 0} />
      </div>

      {/* Quick Inventory Overview */}
      {totalRooms > 0 && (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Room Inventory at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-3 flex-wrap">
              <InventoryPill label="Available" count={availableRooms} color="bg-green-500" />
              <InventoryPill label="Few Beds Left" count={rooms?.filter((r) => r.availability_status === "few_beds_left").length ?? 0} color="bg-orange-500" />
              <InventoryPill label="Full" count={fullRooms} color="bg-red-500" />
              <InventoryPill label="Reserved" count={rooms?.filter((r) => r.availability_status === "reserved").length ?? 0} color="bg-blue-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Recent Activity</h2>
          <Link href="/dashboard/leads" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            View all leads <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Recent Visits */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5" />
                Visit Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!recentVisits?.length ? (
                <EmptyMini text="No visit requests yet" />
              ) : (
                <div className="divide-y divide-border/30">
                  {recentVisits.map((v: { id: string; profiles: { full_name: string | null } | null; property_id: string; preferred_at: string; status: string }) => (
                    <div key={v.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/20 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{v.profiles?.full_name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground truncate">{propNames[v.property_id]}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-[11px] font-medium text-foreground/70">
                          {new Date(v.preferred_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <LeadStatusBadge status={v.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Callbacks */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <PhoneCall className="h-3.5 w-3.5" />
                Callback Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!recentCallbacks?.length ? (
                <EmptyMini text="No callback requests yet" />
              ) : (
                <div className="divide-y divide-border/30">
                  {recentCallbacks.map((c: { id: string; profiles: { full_name: string | null } | null; property_id: string; contact_phone: string; status: string }) => (
                    <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/20 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{c.profiles?.full_name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground truncate">{propNames[c.property_id]}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs font-bold text-primary">{c.contact_phone}</p>
                        <LeadStatusBadge status={c.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── SEEKER DASHBOARD ─── */
async function SeekerOverview({ userId, name }: { userId: string; name: string | null }) {
  const supabase = await createClient();

  const [{ count: visitCount }, { count: callbackCount }] = await Promise.all([
    supabase.from("visit_requests").select("*", { count: "exact", head: true }).eq("seeker_id", userId),
    supabase.from("callback_requests").select("*", { count: "exact", head: true }).eq("seeker_id", userId),
  ]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {name ? `Hey, ${name.split(" ")[0]}!` : "My Dashboard"}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Track your visit and callback requests across all properties.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard title="Visit requests" value={visitCount ?? 0} href="/dashboard/my-visits" linkText="View visits" />
        <StatCard title="Callback requests" value={callbackCount ?? 0} href="/dashboard/my-callbacks" linkText="View callbacks" />
      </div>
      <div className="mt-8 rounded-2xl bg-accent/40 px-6 py-10 text-center">
        <h2 className="font-display text-xl font-bold">Looking for a new place?</h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Discover hundreds of verified hostels and PGs across our network without paying a single rupee in brokerage.
        </p>
        <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-[15px] font-bold shadow-md">
          <Link href="/search">Browse stays <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}

/* ─── SHARED COMPONENTS ─── */
function MetricCard({
  icon, label, value, subtext, highlight,
}: {
  icon: React.ReactNode; label: string; value: number; subtext: string; highlight?: boolean;
}) {
  return (
    <Card className={`shadow-sm transition-all hover:shadow-md ${highlight ? "border-primary/30 bg-primary/5" : "border-border/50"}`}>
      <CardContent className="pt-5 pb-4 px-5">
        <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${highlight ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"}`}>
          {icon}
        </div>
        <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
        <p className="text-[11px] text-muted-foreground/80 mt-0.5">{subtext}</p>
      </CardContent>
    </Card>
  );
}

function InventoryPill({ label, count, color }: { label: string; count: number; color: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 rounded-full bg-accent/30 px-3 py-1.5 text-xs font-bold">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}: {count}
    </div>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const config = LEAD_STATUS_CONFIG[status] || LEAD_STATUS_CONFIG.pending;
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground italic">{text}</p>
    </div>
  );
}

function StatCard({
  title, value, href, linkText, highlight,
}: {
  title: string; value: number; href: string; linkText: string; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40 bg-primary/5 shadow-sm" : "shadow-sm border-border"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-4xl font-bold text-foreground">{value}</p>
        <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          {linkText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
