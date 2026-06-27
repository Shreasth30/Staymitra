import { createClient } from "@/lib/supabase/server";
import { updateVisitStatusForm, updateCallbackStatusForm } from "@/app/dashboard/actions";
import { LEAD_STATUS_CONFIG } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarClock, PhoneCall, Clock, User, Building,
  MessageSquare,
} from "lucide-react";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/auth/login?next=/dashboard/leads");
    return null;
  }

  const { data: props } = await supabase
    .from("properties")
    .select("id, name")
    .eq("user_id", user.id);

  const ids = props?.map((p) => p.id) ?? [];
  const propName = Object.fromEntries((props ?? []).map((p) => [p.id, p.name]));

  const [{ data: visitsRaw, count: visitCount }, { data: callbacksRaw, count: callbackCount }] = await Promise.all([
    ids.length > 0
      ? supabase
          .from("visit_requests")
          .select("*, seeker_id", { count: "exact" })
          .in("property_id", ids)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[], count: 0 }),
    ids.length > 0
      ? supabase
          .from("callback_requests")
          .select("*, seeker_id", { count: "exact" })
          .in("property_id", ids)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[], count: 0 }),
  ]);

  // Fetch profiles for callbacks and visits in parallel
  const callbackSeekerIds = Array.from(new Set((callbacksRaw ?? []).map(cb => cb.seeker_id).filter(Boolean)));
  const visitSeekerIds = Array.from(new Set((visitsRaw ?? []).map(v => v.seeker_id).filter(Boolean)));
  const allSeekerIds = Array.from(new Set([...callbackSeekerIds, ...visitSeekerIds]));

  let profilesMap = new Map();
  if (allSeekerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", allSeekerIds);
    if (profiles) {
      profilesMap = new Map(profiles.map(u => [u.id, u]));
    }
  }

  const visits = (visitsRaw ?? []).map(v => ({
    ...v,
    profiles: profilesMap.get(v.seeker_id) || null
  }));

  const callbacks = (callbacksRaw ?? []).map(cb => ({
    ...cb,
    profiles: profilesMap.get(cb.seeker_id) || null
  }));

  const totalLeads = (visitCount ?? 0) + (callbackCount ?? 0);
  const pendingVisits = visits?.filter((v) => v.status === "pending").length ?? 0;
  const pendingCallbacks = callbacks?.filter((c) => c.status === "pending").length ?? 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Leads</h1>
          <p className="mt-2 text-base text-muted-foreground">
            <span className="font-bold text-foreground">{totalLeads}</span> total lead{totalLeads !== 1 ? 's' : ''}
            {pendingVisits + pendingCallbacks > 0 && (
              <> · <span className="font-bold text-primary">{pendingVisits + pendingCallbacks}</span> need attention</>
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total Visits" value={visitCount ?? 0} pending={pendingVisits} />
        <MiniStat label="Total Callbacks" value={callbackCount ?? 0} pending={pendingCallbacks} />
        <MiniStat label="Pending" value={pendingVisits + pendingCallbacks} highlight />
        <MiniStat label="Completed" value={
          (visits?.filter((v) => v.status === "done" || v.status === "closed").length ?? 0) +
          (callbacks?.filter((c) => c.status === "done" || c.status === "closed").length ?? 0)
        } />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="bg-accent/40 p-1 rounded-xl h-auto mb-6 w-full sm:w-auto">
          <TabsTrigger value="visits" className="rounded-lg px-5 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm flex-1 sm:flex-none">
            <CalendarClock className="mr-2 h-4 w-4" />
            Visits ({visitCount ?? 0})
          </TabsTrigger>
          <TabsTrigger value="callbacks" className="rounded-lg px-5 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm flex-1 sm:flex-none">
            <PhoneCall className="mr-2 h-4 w-4" />
            Callbacks ({callbackCount ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* ─── VISITS TAB ─── */}
        <TabsContent value="visits" className="space-y-4 outline-none">
          {!visits?.length ? (
            <EmptyState icon={<CalendarClock className="h-10 w-10" />} text="No visit requests yet" subtitle="When guests request a visit, they'll appear here." />
          ) : (
            visits.map((v) => (
              <Card key={v.id} className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md hover:border-primary/15">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5 sm:p-6">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold truncate">{v.profiles?.full_name || "Guest"}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{propName[v.property_id] ?? "Property"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <LeadBadge status={v.status} />
                    </div>

                    {/* Details */}
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {new Date(v.preferred_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      {v.source && v.source !== "web" && (
                        <span className="text-xs bg-accent/50 rounded-full px-2 py-0.5 font-medium">via {v.source}</span>
                      )}
                    </div>

                    {/* Note */}
                    {v.note && (
                      <div className="mt-3 p-3 rounded-lg bg-accent/20 border border-border/30">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Guest Note</p>
                        <p className="text-sm">{v.note}</p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    {v.profiles?.phone && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs border-primary/20 text-primary hover:bg-primary/5 font-bold" asChild>
                          <a href={`tel:${v.profiles.phone}`}>
                            <PhoneCall className="mr-1.5 h-3 w-3" />
                            Call
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs border-green-500/20 text-green-600 hover:bg-green-500/5 font-bold" asChild>
                          <a href={`https://wa.me/${v.profiles.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="mr-1.5 h-3 w-3" />
                            WhatsApp
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Status Form */}
                  <div className="bg-accent/10 border-t lg:border-t-0 lg:border-l border-border/30 p-5 flex items-center justify-center lg:w-56">
                    <VisitStatusForm visitId={v.id} current={v.status} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── CALLBACKS TAB ─── */}
        <TabsContent value="callbacks" className="space-y-4 outline-none">
          {!callbacks?.length ? (
            <EmptyState icon={<PhoneCall className="h-10 w-10" />} text="No callback requests yet" subtitle="When guests request a callback, they'll appear here." />
          ) : (
            callbacks.map((c) => (
              <Card key={c.id} className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md hover:border-primary/15">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5 sm:p-6">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                            <PhoneCall className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold truncate">{c.profiles?.full_name || "Guest"}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{propName[c.property_id] ?? "Property"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <LeadBadge status={c.status} />
                    </div>

                    {/* Contact */}
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                      <span className="flex items-center gap-1.5 font-bold text-primary">
                        <PhoneCall className="h-3.5 w-3.5" />
                        {c.contact_phone}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </span>
                    </div>

                    {/* Message */}
                    {c.message && (
                      <div className="mt-3 p-3 rounded-lg bg-accent/20 border border-border/30">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Message</p>
                        <p className="text-sm">{c.message}</p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs border-primary/20 text-primary hover:bg-primary/5 font-bold" asChild>
                        <a href={`tel:${c.contact_phone}`}>
                          <PhoneCall className="mr-1.5 h-3 w-3" />
                          Call
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs border-green-500/20 text-green-600 hover:bg-green-500/5 font-bold" asChild>
                        <a href={`https://wa.me/${c.contact_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <MessageSquare className="mr-1.5 h-3 w-3" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Status Form */}
                  <div className="bg-accent/10 border-t lg:border-t-0 lg:border-l border-border/30 p-5 flex items-center justify-center lg:w-56">
                    <CallbackStatusForm callbackId={c.id} current={c.status} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */
function MiniStat({ label, value, pending, highlight }: { label: string; value: number; pending?: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-primary/5 border border-primary/20" : "bg-accent/20 border border-border/30"}`}>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
      {pending !== undefined && pending > 0 && (
        <p className="text-[10px] font-bold text-primary mt-0.5">{pending} pending</p>
      )}
    </div>
  );
}

function EmptyState({ icon, text, subtitle }: { icon: React.ReactNode; text: string; subtitle?: string }) {
  return (
    <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
      <div className="h-16 w-16 bg-accent rounded-2xl flex items-center justify-center text-muted-foreground/30 mb-4">
        {icon}
      </div>
      <p className="text-lg font-display font-bold text-foreground">{text}</p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground max-w-xs">{subtitle}</p>}
    </Card>
  );
}

function LeadBadge({ status }: { status: string }) {
  const config = LEAD_STATUS_CONFIG[status] || LEAD_STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  );
}

function VisitStatusForm({ visitId, current }: { visitId: string; current: string }) {
  return (
    <form
      className="flex flex-col gap-2.5 w-full"
      action={updateVisitStatusForm}
    >
      <input type="hidden" name="visitId" value={visitId} />
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Update Status</label>
      <select
        name="status"
        required
        defaultValue={current}
        className="h-10 w-full rounded-lg border-0 bg-background px-3 text-sm font-semibold shadow-sm focus:ring-1 focus:ring-primary outline-none appearance-none"
      >
        <option value="pending">New / Pending</option>
        <option value="contacted">Contacted</option>
        <option value="interested">Interested</option>
        <option value="confirmed">Confirmed</option>
        <option value="visit_scheduled">Visit Scheduled</option>
        <option value="done">Completed</option>
        <option value="declined">Declined</option>
        <option value="closed">Closed</option>
      </select>
      <Button type="submit" size="sm" className="w-full rounded-lg font-bold bg-primary hover:bg-primary/90 h-9 text-xs">
        Save
      </Button>
    </form>
  );
}

function CallbackStatusForm({ callbackId, current }: { callbackId: string; current: string }) {
  return (
    <form
      className="flex flex-col gap-2.5 w-full"
      action={updateCallbackStatusForm}
    >
      <input type="hidden" name="callbackId" value={callbackId} />
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Update Status</label>
      <select
        name="status"
        required
        defaultValue={current}
        className="h-10 w-full rounded-lg border-0 bg-background px-3 text-sm font-semibold shadow-sm focus:ring-1 focus:ring-primary outline-none appearance-none"
      >
        <option value="pending">New / Pending</option>
        <option value="contacted">Contacted</option>
        <option value="interested">Interested</option>
        <option value="done">Completed</option>
        <option value="closed">Closed</option>
      </select>
      <Button type="submit" size="sm" className="w-full rounded-lg font-bold bg-primary hover:bg-primary/90 h-9 text-xs">
        Save
      </Button>
    </form>
  );
}
