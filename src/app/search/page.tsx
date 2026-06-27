import Link from "next/link";
import { queryPublishedProperties, getPropertyImagePathsBatch } from "@/lib/properties-query";
import { ListingCard } from "@/components/listing-card";
import { SearchResultsWithMap } from "@/components/search-results-with-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

import type { Metadata } from "next";

type PageProps = {
  searchParams: Promise<{
    city?: string;
    type?: string;
    budgetMin?: string;
    budgetMax?: string;
    hasAc?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const city = sp.city || "Greater Noida";
  const type = sp.type === "hostel" ? "Hostels" : sp.type === "pg" ? "PGs" : "Hostels & PGs";
  const budget = sp.budgetMax ? ` Under ₹${sp.budgetMax}/month` : "";

  const title = `${type} in ${city}${budget} — Zero Brokerage | Staymitra`;
  const description = `Find verified ${type.toLowerCase()} in ${city}${budget ? budget.toLowerCase() : ""}. Compare rooms, schedule visits, and book directly with owners — zero brokerage. Near Galgotias, NIET, GL Bajaj & top colleges.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    alternates: {
      canonical: `/search${sp.city ? `?city=${sp.city}` : ""}`,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = {
    city: sp.city,
    type: (sp.type === "hostel" || sp.type === "pg" ? sp.type : "") as
      | "hostel"
      | "pg"
      | "",
    budgetMin: sp.budgetMin,
    budgetMax: sp.budgetMax,
    hasAc: sp.hasAc === "1" || sp.hasAc === "true",
  };

  const list = await queryPublishedProperties(filters);
  const imagePaths = await getPropertyImagePathsBatch(list.map((p) => p.id));
  const withImages = list.map((p) => ({
    listing: p,
    imagePath: imagePaths[p.id] ?? null,
  }));

  const markers = list
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      id: p.id,
      lat: p.latitude!,
      lng: p.longitude!,
      title: p.name,
      slug: p.slug,
      price: Number(p.min_monthly_rent),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-10 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Explore stays
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {withImages.length} propert{withImages.length === 1 ? "y" : "ies"} available
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="w-full shrink-0 lg:w-72 animate-fade-in-up delay-100">
          {/* Mobile filter toggle */}
          <details className="group lg:open" open>
            <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 font-bold text-sm lg:hidden">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </span>
              <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
            </summary>
          <form
            method="get"
            action="/search"
            className="mt-3 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:mt-0"
          >
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                City
              </Label>
              <Input
                id="f-city"
                name="city"
                defaultValue={sp.city}
                placeholder="e.g. Bengaluru"
                className="bg-accent/50 border-0 focus-visible:ring-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Property type
              </Label>
              <select
                id="f-type"
                name="type"
                className="flex h-10 w-full rounded-md bg-accent/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue={sp.type ?? ""}
              >
                <option value="">Any</option>
                <option value="pg">PG</option>
                <option value="hostel">Hostel</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="f-min" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Min ₹
                </Label>
                <Input
                  id="f-min"
                  name="budgetMin"
                  type="number"
                  min={0}
                  defaultValue={sp.budgetMin}
                  placeholder="3000"
                  className="bg-accent/50 border-0 focus-visible:ring-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-max" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Max ₹
                </Label>
                <Input
                  id="f-max"
                  name="budgetMax"
                  type="number"
                  min={0}
                  defaultValue={sp.budgetMax}
                  placeholder="20000"
                  className="bg-accent/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                name="hasAc"
                value="1"
                defaultChecked={filters.hasAc}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              AC rooms only
            </label>
            <Button type="submit" className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              Apply filters
            </Button>
            <Button variant="ghost" type="button" className="w-full text-muted-foreground" asChild>
              <Link href="/search">Clear all</Link>
            </Button>
          </form>
          </details>
        </aside>

        <SearchResultsWithMap markers={markers}>
          <div className="grid gap-6 sm:grid-cols-2">
            {withImages.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card py-20 text-center text-muted-foreground">
                No matches found. Try widening your filters.
              </div>
            ) : (
              withImages.map(({ listing, imagePath }) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  imagePath={imagePath}
                />
              ))
            )}
          </div>
        </SearchResultsWithMap>
      </div>
    </div>
  );
}
