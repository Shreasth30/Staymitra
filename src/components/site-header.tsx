import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { LogOut } from "lucide-react";
import { NavLinks } from "@/components/nav-links";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  const isLoggedIn = Boolean(user);
  const isOwner = role === "owner";

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-8">
        <Link
          href="/"
          className="flex items-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Light Mode Logo */}
          <img
            src="/logo.png?v=3"
            alt="Staymitra"
            className="light-logo h-10 w-auto rounded-md border border-border/10 bg-white p-0.5 sm:h-12 shadow-sm"
          />
          {/* Dark Mode Logo */}
          <img
            src="/logo-dark.jpg?v=3"
            alt="Staymitra"
            className="dark-logo h-10 w-auto rounded-md border border-border/10 p-0.5 sm:h-12 shadow-sm"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1.5 md:flex">
          <NavLinks isLoggedIn={isLoggedIn} />
          
          {user ? (
            <>
              {isOwner ? (
                <Button asChild size="sm" className="ml-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="ml-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Link href="/dashboard">My requests</Link>
                </Button>
              )}
              <div className="ml-2 flex items-center border-l border-border/60 pl-3">
                <form action="/auth/signout" method="post" className="flex">
                  <button
                    type="submit"
                    className="flex h-[36px] items-center gap-2 rounded-full px-3 text-[14px] font-semibold text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Sign out</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-1.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Log in
              </Link>
              <Button asChild size="sm" className="ml-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5 shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}
          <div className="ml-2 border-l border-border/60 pl-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Nav */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <MobileNav isLoggedIn={isLoggedIn} isOwner={isOwner} />
        </div>
      </div>
    </header>
  );
}
