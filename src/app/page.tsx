import Link from "next/link";
import Image from "next/image";
import { getFeaturedProperties, getPropertyImagePathsBatch } from "@/lib/properties-query";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, MapPin, CalendarClock, PhoneCall, Shield, Users, ArrowRight, Star, Check } from "lucide-react";

export default async function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://staymitra.in";
  const featured = await getFeaturedProperties(6);
  const imagePaths = await getPropertyImagePathsBatch(featured.map(p => p.id));
  const withImages = featured.map(p => ({
    listing: p,
    imagePath: imagePaths[p.id] ?? null,
  }));

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 transition-opacity duration-1000">
          <Image
            src="/hero-mountain.jpg"
            alt="Staymitra scenic premium stay background view"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 z-0 bg-background/45 backdrop-blur-[4px]" />

        {/* Floating Ambient Background */}
        <div className="pointer-events-none absolute left-0 top-[-10%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px] mix-blend-multiply opacity-80 dark:mix-blend-lighten dark:opacity-40 animate-pulse-soft z-0" />
        <div className="pointer-events-none absolute right-0 top-[20%] h-[400px] w-[400px] translate-x-1/3 rounded-full bg-amber-500/10 blur-[100px] mix-blend-multiply opacity-70 dark:mix-blend-lighten dark:opacity-30 animate-float delay-300 z-0" />
        <div className="pointer-events-none absolute bottom-[-20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px] mix-blend-multiply opacity-50 dark:bg-blue-400/5 dark:mix-blend-lighten animate-float delay-500 z-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 z-10">
          <div className="grid min-h-[60vh] items-center gap-8 py-12 sm:min-h-[70vh] sm:py-16 lg:min-h-[85vh] lg:grid-cols-2 lg:gap-16 lg:py-0">
            {/* Left: Text */}
            <div className="max-w-xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/15">
                <Star className="h-3.5 w-3.5 fill-primary" />
                Trusted by 1000+ students
              </div>
              <h1 className="mt-6 font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:mt-8 sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem]">
                Your next home,{" "}
                <span className="text-gradient">simplified.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-foreground sm:text-lg">
                Discover verified hostels and PGs in Greater Noida.
                Compare rooms, schedule visits, and move in — all
                without paying a single rupee in brokerage.
              </p>

              {/* Search bar */}
              <form
                action="/search"
                method="get"
                className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-3 shadow-xl shadow-black/5 dark:shadow-black/20 sm:mt-10 sm:flex-row sm:items-end sm:gap-2 sm:p-3"
              >
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Where
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Search Greater Noida..."
                    className="h-11 border-0 bg-accent/50 text-base placeholder:text-muted-foreground/60 focus-visible:ring-1"
                  />
                </div>
                <div className="w-full space-y-1.5 sm:w-36">
                  <Label htmlFor="budgetMax" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Budget
                  </Label>
                  <Input
                    id="budgetMax"
                    name="budgetMax"
                    type="number"
                    min={0}
                    placeholder="Max ₹/mo"
                    className="h-11 border-0 bg-accent/50 text-base placeholder:text-muted-foreground/60 focus-visible:ring-1"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 shrink-0 gap-2 rounded-xl bg-primary px-6 text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg sm:w-auto"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </form>

              {/* Social proof */}
              <div className="mt-8 flex items-center gap-6 text-sm text-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-accent text-xs font-bold text-muted-foreground"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <span className="font-bold text-foreground">500+</span> students found their stay this month
                </div>
              </div>
            </div>

            {/* Right: Our Offerings Section */}
            <div className="relative block animate-fade-in-up delay-200">
              {/* Glow Highlight Effect */}
              <div className="absolute inset-0 -m-3 bg-gradient-to-tr from-primary/20 via-amber-500/10 to-indigo-500/10 rounded-[2rem] blur-2xl opacity-75 pointer-events-none" />

              <div className="relative rounded-3xl border border-primary/25 bg-card/75 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Staymitra Exclusives
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Exclusive Student Benefits</h3>
                <p className="text-sm text-muted-foreground mb-6">Unlock curated perks, learning resources, and career opportunities when you book your stay with us.</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: "Up to ₹5,000 Cashback",
                      desc: "Direct cashback on your booking.",
                    },
                    {
                      title: "Quarterly Movie Tickets",
                      desc: "Enjoy the latest movies on us every quarter.",
                    },
                    {
                      title: "Industrial Visits",
                      desc: "Visit top companies like Microsoft, Masters' Union, & more.",
                    },
                    {
                      title: "Free Udemy Courses",
                      desc: "Access premium learning materials to upskill.",
                    },
                    {
                      title: "Peer Community",
                      desc: "Connect with a group of like-minded, ambitious students.",
                    },
                    {
                      title: "Entrepreneurship Hub",
                      desc: "Get incubation and networking opportunities for your ideas.",
                    },
                    {
                      title: "Career Mentorship",
                      desc: "Specialized guidance sessions to polish your resume and LinkedIn.",
                    },
                  ].map((o, index) => (
                    <div
                      key={o.title}
                      className={`group relative rounded-2xl border border-border/50 border-l-4 border-l-primary/60 bg-card/45 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:border-l-primary hover:bg-card hover:shadow-md ${
                        index === 6 ? "sm:col-span-2" : ""
                      }`}
                    >
                      <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {o.title}
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {o.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Three steps. Zero hassle.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No brokers, no hidden charges. Just a seamless way to find your next home.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              {
                icon: Search,
                title: "Discover",
                desc: "Filter by city, budget, room type, and amenities. Find exactly what works for you.",
                step: "1",
                color: "bg-red-50 text-primary dark:bg-red-950/30",
              },
              {
                icon: CalendarClock,
                title: "Visit",
                desc: "Schedule a visit at your convenience. The owner confirms — no middlemen involved.",
                step: "2",
                color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30",
              },
              {
                icon: PhoneCall,
                title: "Move in",
                desc: "Finalize terms directly with the owner. Pay only the agreed rent — zero platform fees.",
                step: "3",
                color: "bg-green-50 text-green-600 dark:bg-green-950/30",
              },
            ].map(({ icon: Icon, title, desc, step, color }) => (
              <div key={step} className="group relative">
                <div className="rounded-2xl border border-border bg-card p-8 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                        {step}
                      </span>
                      <h3 className="font-display text-xl font-bold">{title}</h3>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED STAYS ── */}
      <section className="border-t border-border bg-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Featured</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Popular stays
              </h2>
              <p className="mt-3 text-muted-foreground">
                Recently listed and highly-rated properties.
              </p>
            </div>
            <Button variant="outline" asChild className="hidden rounded-full px-6 sm:inline-flex">
              <Link href="/search">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {withImages.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-card py-20 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  <MapPin className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-display text-lg font-bold">No listings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first to{" "}
                  <Link href="/auth/signup" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
                    list your property
                  </Link>
                </p>
              </div>
            ) : (
              withImages.map(({ listing, imagePath }) => (
                <ListingCard key={listing.id} listing={listing} imagePath={imagePath} />
              ))
            )}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Button variant="outline" asChild className="rounded-full px-8">
              <Link href="/search">
                View all stays
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── WHY STAYMITRA ── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Why Staymitra</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Built for students,<br />by someone who gets it.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                We know how stressful relocating can be. Staymitra removes the noise —
                no brokers, no scams, no hidden deposits. Just real listings from real owners.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { icon: Shield, title: "Verified owners", desc: "Every listing is posted directly by the property owner." },
                { icon: Users, title: "Zero brokerage", desc: "No commission. No middlemen. Just you and the owner." },
                { icon: MapPin, title: "Greater Noida First", desc: "Currently focused on securing the best stays in Greater Noida." },
                { icon: Check, title: "Free forever", desc: "Browsing, visiting, and connecting is 100% free." },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-[17px] font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO: COLLEGES SECTION ── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Hostels Near Your College</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Find hostels near top colleges in Greater Noida
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you study at Galgotias University, NIET, GL Bajaj, GNIOT, or any other college in Greater Noida — Staymitra helps you find verified hostels and PGs within walking distance of your campus.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { college: "Galgotias University", area: "Knowledge Park II", query: "Galgotias" },
              { college: "NIET (Noida Institute of Engineering & Technology)", area: "Knowledge Park II", query: "NIET" },
              { college: "GL Bajaj Institute of Technology", area: "Knowledge Park III", query: "GL Bajaj" },
              { college: "GNIOT (Greater Noida Institute of Technology)", area: "Knowledge Park II", query: "GNIOT" },
              { college: "Sharda University", area: "Knowledge Park III", query: "Sharda" },
              { college: "Bennett University", area: "Tech Zone II", query: "Bennett" },
            ].map((c) => (
              <Link
                key={c.college}
                href={`/search?city=${encodeURIComponent(c.query)}`}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Hostels near {c.college}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Find verified hostels and PGs near {c.college} in {c.area}, Greater Noida. Zero brokerage.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Browse stays <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO: FAQ SECTION ── */}
      <section className="border-t border-border bg-accent/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">FAQs</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How do I find hostels near my college in Greater Noida?",
                a: "Simply search for your college name or area on Staymitra. We list verified hostels and PGs near Galgotias University, NIET, GL Bajaj, GNIOT, Sharda University, Bennett University, and all other major colleges in Greater Noida."
              },
              {
                q: "Is Staymitra free to use?",
                a: "Yes! Staymitra is 100% free for students. You can browse listings, schedule visits, and contact owners directly — all with zero brokerage and zero hidden charges."
              },
              {
                q: "What is the average hostel rent in Greater Noida?",
                a: "Hostel and PG rents in Greater Noida typically range from ₹4,000 to ₹12,000 per month depending on the room type (single, double, or triple sharing), amenities like AC, food, and location proximity to colleges."
              },
              {
                q: "Are the hostels on Staymitra verified?",
                a: "Yes. Every listing on Staymitra is posted directly by verified property owners. We don't allow brokers or middlemen. You always deal directly with the owner."
              },
              {
                q: "Can I schedule a visit before booking?",
                a: "Absolutely! You can schedule a visit to any hostel or PG directly through Staymitra. The property owner will confirm your visit — no middlemen involved."
              },
              {
                q: "Does Staymitra offer hostels near Knowledge Park in Greater Noida?",
                a: "Yes! We have extensive listings in Knowledge Park I, II, and III — the areas closest to major colleges like Galgotias, NIET, GL Bajaj, and GNIOT in Greater Noida."
              },
            ].map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card">
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 sm:p-6 font-display text-base font-bold text-foreground">
                  {faq.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-180 shrink-0">▼</span>
                </summary>
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm leading-relaxed text-muted-foreground -mt-1">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl gradient-cta px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Own a hostel or PG?<br />Start getting leads today.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/70">
              Create your listing in minutes. Add rooms, upload photos, and let verified
              seekers come to you.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 text-base font-bold text-black shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                <Link href="/auth/signup">Get started free</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 px-8 text-base font-semibold text-white bg-transparent hover:bg-white/10"
              >
                <Link href="/about">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── JSON-LD STRUCTURED DATA ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "Staymitra",
                url: siteUrl,
                logo: `${siteUrl}/logo.png`,
                description: "India's zero-brokerage platform for finding verified hostels and PG accommodations near colleges in Greater Noida.",
                sameAs: [],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "Customer Support",
                  availableLanguage: ["English", "Hindi"],
                },
              },
              {
                "@type": "LocalBusiness",
                name: "Staymitra — Hostels & PGs in Greater Noida",
                description: "Find the best verified hostels and PG accommodations near Galgotias University, NIET, GL Bajaj, GNIOT, and other top colleges in Greater Noida. Zero brokerage, direct owner contact.",
                url: siteUrl,
                image: `${siteUrl}/logo.png`,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Greater Noida",
                  addressRegion: "Uttar Pradesh",
                  addressCountry: "IN",
                  postalCode: "201310",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: "28.4744",
                  longitude: "77.5040",
                },
                areaServed: {
                  "@type": "City",
                  name: "Greater Noida",
                },
                priceRange: "₹4000 - ₹12000",
              },
              {
                "@type": "WebSite",
                name: "Staymitra",
                url: siteUrl,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${siteUrl}/search?city={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How do I find hostels near my college in Greater Noida?",
                    acceptedAnswer: { "@type": "Answer", text: "Simply search for your college name or area on Staymitra. We list verified hostels and PGs near Galgotias University, NIET, GL Bajaj, GNIOT, Sharda University, Bennett University, and all other major colleges in Greater Noida." },
                  },
                  {
                    "@type": "Question",
                    name: "Is Staymitra free to use?",
                    acceptedAnswer: { "@type": "Answer", text: "Yes! Staymitra is 100% free for students. You can browse listings, schedule visits, and contact owners directly — all with zero brokerage and zero hidden charges." },
                  },
                  {
                    "@type": "Question",
                    name: "What is the average hostel rent in Greater Noida?",
                    acceptedAnswer: { "@type": "Answer", text: "Hostel and PG rents in Greater Noida typically range from ₹4,000 to ₹12,000 per month depending on the room type, amenities, and location." },
                  },
                  {
                    "@type": "Question",
                    name: "Are the hostels on Staymitra verified?",
                    acceptedAnswer: { "@type": "Answer", text: "Yes. Every listing on Staymitra is posted directly by verified property owners. No brokers or middlemen allowed." },
                  },
                  {
                    "@type": "Question",
                    name: "Does Staymitra offer hostels near Knowledge Park in Greater Noida?",
                    acceptedAnswer: { "@type": "Answer", text: "Yes! We have extensive listings in Knowledge Park I, II, and III — areas closest to major colleges like Galgotias, NIET, GL Bajaj, and GNIOT." },
                  },
                ],
              },
            ],
          }),
        }}
      />
    </>
  );
}
