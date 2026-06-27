import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PhoneCall, MapPin, ArrowRight, Building, CheckCircle2, Clock, MessageSquare } from "lucide-react";

export default async function MyCallbacksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/auth/login?next=/dashboard/my-callbacks");
    return null;
  }

  const { data: callbacks } = await supabase
    .from("callback_requests")
    .select("*, properties:property_id(name, slug, city, area)")
    .eq("seeker_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">My Callbacks</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Track callback requests you&apos;ve sent to property owners.
        </p>
      </div>

      {!callbacks?.length ? (
        <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-accent rounded-2xl flex items-center justify-center text-muted-foreground mb-4">
            <PhoneCall className="h-8 w-8" />
          </div>
          <CardContent className="p-0">
            <h3 className="font-display text-xl font-bold">No callbacks requested</h3>
            <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
              Request a callback to have property owners reach out to you directly.
            </p>
            <Button asChild className="mt-6 rounded-full bg-primary font-bold">
              <Link href="/search">Browse Properties</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {callbacks.map((c) => {
            const prop = c.properties as { name: string; slug: string; city: string; area: string | null };
            return (
              <Card key={c.id} className="overflow-hidden border-border/80 shadow-sm transition-all hover:border-primary/20 group">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/stay/${prop?.slug ?? ""}`} className="group-hover:text-primary transition-colors flex items-center gap-2 mb-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-display text-lg font-bold">{prop?.name ?? "Property"}</h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-3.5 w-3.5" />
                          {prop?.city ?? ""}{prop?.area ? `, ${prop?.area}` : ""}
                        </div>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/40 border border-border/50 text-sm font-bold text-primary">
                          <PhoneCall className="h-4 w-4" />
                          {c.contact_phone}
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>

                    {c.message && (
                      <div className="mt-4 text-[15px] text-foreground/80 bg-accent/20 p-3 rounded-lg border border-border/30 flex gap-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-1">Your Message</span>
                          {c.message}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-accent/10 border-l border-border/50 p-6 flex items-center justify-center sm:w-48">
                    <Button asChild variant="outline" className="w-full rounded-xl font-bold bg-background hover:bg-accent/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all h-11">
                      <Link href={`/stay/${prop?.slug ?? ""}`}>
                        View Property
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", class: "bg-orange-500/10 text-orange-500", icon: <Clock className="h-3 w-3" /> },
    done: { label: "Completed", class: "bg-green-500/10 text-green-500", icon: <CheckCircle2 className="h-3 w-3" /> },
  };
  const config = configs[status] || configs.pending;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.class}`}>
      {config.icon}
      {config.label}
    </div>
  );
}
