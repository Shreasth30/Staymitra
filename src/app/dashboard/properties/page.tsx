import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Building2, MapPin, CheckCircle2, CircleDashed, Settings, ExternalLink } from "lucide-react";

export default async function PropertiesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("properties")
    .select(
      "id, name, slug, city, area, type, published, callback_enabled, min_monthly_rent, max_monthly_rent",
    )
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-border/50 pb-8">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            My properties
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage your listings, room types, and photos.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-bold shadow-md h-12">
          <Link href="/dashboard/properties/new">
            <Plus className="mr-2 h-5 w-5" />
            New property
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search properties by name..." 
            className="pl-10 h-11 rounded-xl bg-accent/30 border-0 focus-visible:ring-1"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-11 rounded-xl bg-accent/30 border-0 px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none">
            <option value="all">All Types</option>
            <option value="pg">PG</option>
            <option value="hostel">Hostel</option>
          </select>
          <select className="h-11 rounded-xl bg-accent/30 border-0 px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {!rows?.length ? (
        <Card className="border-dashed border-2 py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">No properties yet</CardTitle>
            <CardDescription className="mt-2 max-w-sm text-base">
              Publish your first hostel or PG to start receiving inquiries from students.
            </CardDescription>
            <Button asChild className="mt-8 rounded-full px-8">
              <Link href="/dashboard/properties/new">Add first property</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {rows.map((p) => (
            <Card key={p.id} className="group overflow-hidden border-border/80 transition-all hover:shadow-lg hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="font-display text-xl font-bold group-hover:text-primary transition-colors">
                      {p.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {p.city}{p.area ? `, ${p.area}` : ""}
                    </div>
                  </div>
                  <div className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {p.type}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-y border-border/50 py-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground font-medium">Monthly rent</p>
                    <p className="mt-1 font-bold text-foreground">
                      ₹{Number(p.min_monthly_rent).toLocaleString()} – ₹{Number(p.max_monthly_rent).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground font-medium text-sm">Status</p>
                    <div className={`mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${p.published ? "text-primary" : "text-muted-foreground"}`}>
                      {p.published ? (
                        <><CheckCircle2 className="h-3 w-3" /> Published</>
                      ) : (
                        <><CircleDashed className="h-3 w-3" /> Draft</>
                      )}
                    </div>
                  </div>
                </div>

                 <div className="flex items-center justify-between gap-3">
                  <Link 
                    href={`/stay/${p.slug}`} 
                    target="_blank"
                    className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View live
                  </Link>
                  <Button asChild variant="outline" size="sm" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                    <Link href={`/dashboard/properties/${p.id}`}>
                      <Settings className="mr-2 h-3.5 w-3.5" />
                      Edit Property
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
