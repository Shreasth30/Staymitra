import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  async function updateProfile(formData: FormData) {
    "use server";
    const supabase = await (await import("@/lib/supabase/server")).createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const fullName = String(formData.get("full_name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/profile");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight animate-fade-in-up">
        Profile
      </h1>
      <p className="mt-2 text-lg text-muted-foreground animate-fade-in-up delay-100">
        Manage your account details and settings.
      </p>

      <Card className="mt-10 animate-fade-in-up delay-200 border-border/80 shadow-md">
        <CardHeader className="pb-6">
          <CardTitle className="font-display text-2xl font-bold">Personal info</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Update your name and phone number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold block text-left">Email address</Label>
              <Input
                id="email"
                type="email"
                value={user.email ?? ""}
                disabled
                className="h-11 bg-muted border-0 opacity-70"
              />
              <p className="text-xs text-muted-foreground font-medium text-left">
                Email cannot be changed here.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-semibold block text-left">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                className="h-11 bg-accent/40 border-0 focus-visible:ring-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold block text-left">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                placeholder="+91…"
                className="h-11 bg-accent/40 border-0 focus-visible:ring-1"
              />
            </div>
            <div className="rounded-xl border border-border/50 bg-accent/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Account type</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Joined {new Date(profile?.created_at ?? "").toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-md bg-card px-3 py-1 text-sm font-bold capitalize text-primary shadow-sm border border-border/30">
                  {profile?.role ?? "seeker"}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
