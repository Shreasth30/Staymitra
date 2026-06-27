import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-80"
            >
              {/* Light Mode Logo */}
              <img
                src="/logo.png?v=3"
                alt="Staymitra — Best Hostels and PGs in Greater Noida"
                className="light-logo h-10 w-auto rounded-md border border-border/10 bg-white p-0.5"
              />
              {/* Dark Mode Logo */}
              <img
                src="/logo-dark.jpg?v=3"
                alt="Staymitra — Best Hostels and PGs in Greater Noida"
                className="dark-logo h-10 w-auto rounded-md border border-border/10 p-0.5"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Greater Noida&apos;s zero-brokerage platform for finding verified
              hostels and PG accommodations near top colleges. Direct owner connect.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Discover
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link href="/search" className="transition-colors hover:text-foreground">
                Browse hostels & PGs
              </Link>
              <Link href="/blog" className="transition-colors hover:text-foreground">
                Blog & Guides
              </Link>
              <Link href="/auth/signup" className="transition-colors hover:text-foreground">
                List your property
              </Link>
              <Link href="/about" className="transition-colors hover:text-foreground">
                About us
              </Link>
            </nav>
          </div>

          {/* Popular Searches - SEO internal links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Popular Searches
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link href="/search?city=Greater+Noida" className="transition-colors hover:text-foreground">
                Hostels near Galgotias
              </Link>
              <Link href="/search?city=Greater+Noida" className="transition-colors hover:text-foreground">
                Hostels near NIET
              </Link>
              <Link href="/search?city=Greater+Noida" className="transition-colors hover:text-foreground">
                Hostels near GL Bajaj
              </Link>
              <Link href="/search?city=Greater+Noida" className="transition-colors hover:text-foreground">
                Hostels near GNIOT
              </Link>
              <Link href="/search?city=Greater+Noida" className="transition-colors hover:text-foreground">
                All hostels in Greater Noida
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Support
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact us
              </Link>
              <Link href="/auth/forgot-password" className="transition-colors hover:text-foreground">
                Reset password
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Legal
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms of service
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Staymitra. All rights reserved.
      </div>
    </footer>
  );
}
