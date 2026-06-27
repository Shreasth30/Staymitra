import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "seeker";

  const ownerLinks = [
    { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
    { href: "/dashboard/properties", label: "Properties", icon: "Building2" },
    { href: "/dashboard/leads", label: "Leads", icon: "Inbox" },
  ];

  const seekerLinks = [
    { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
    { href: "/dashboard/my-visits", label: "My Visits", icon: "CalendarClock" },
    { href: "/dashboard/my-callbacks", label: "My Callbacks", icon: "PhoneCall" },
  ];

  const links = role === "owner" ? ownerLinks : seekerLinks;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-10 sm:px-8 sm:py-10 md:flex-row">
      {/* Sidebar */}
      <aside className="w-full shrink-0 md:w-64">
        <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm">
          <div className="mb-6 border-b border-border/50 pb-4">
            <p className="font-display text-xl font-bold">Dashboard</p>
            <p className="text-sm font-medium text-muted-foreground capitalize mt-1">
              {role} account
            </p>
          </div>
          <DashboardNav links={links} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
