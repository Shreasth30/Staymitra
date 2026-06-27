import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrlFromPath } from "@/lib/storage";
import { StayActions } from "@/components/stay/stay-actions";
import { StayMap } from "@/components/stay/stay-map";
import { RoomCardsList } from "@/components/stay/room-cards-list";
import { Button } from "@/components/ui/button";
import { MapPin, Snowflake, BedDouble, ChevronLeft, ExternalLink } from "lucide-react";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("properties")
    .select("name, description, city, area, type, min_monthly_rent, max_monthly_rent")
    .eq("slug", slug)
    .maybeSingle();

  if (!p) {
    return { title: "Listing not found" };
  }

  const typeName = p.type === "hostel" ? "Hostel" : p.type === "pg" ? "PG" : "Stay";
  const location = p.area ? `${p.area}, ${p.city}` : p.city;
  const priceRange = p.min_monthly_rent
    ? `from ₹${Number(p.min_monthly_rent).toLocaleString()}/month`
    : "";

  const title = `${p.name} — ${typeName} in ${location} | Staymitra`;
  const desc =
    (p.description && p.description.slice(0, 155)) ||
    `${p.name} is a verified ${typeName.toLowerCase()} in ${location}. ${priceRange ? `Rooms starting ${priceRange}.` : ""} Compare rooms, schedule a visit, and book with zero brokerage on Staymitra.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
    },
    alternates: {
      canonical: `/stay/${slug}`,
    },
  };
}

export default async function StayPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!property) notFound();

  const { data: rooms } = await supabase
    .from("room_offerings")
    .select("*")
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true });

  const roomIds = rooms?.map((r) => r.id) ?? [];
  const { data: photos } =
    roomIds.length > 0
      ? await supabase
        .from("room_photos")
        .select("*")
        .in("room_offering_id", roomIds)
        .order("sort_order", { ascending: true })
      : { data: [] as { room_offering_id: string; storage_path: string }[] };

  const photosByRoom = new Map<string, string[]>();
  for (const ph of photos ?? []) {
    const arr = photosByRoom.get(ph.room_offering_id) ?? [];
    arr.push(ph.storage_path);
    photosByRoom.set(ph.room_offering_id, arr);
  }

  const { data: propPhotos } = await supabase
    .from("property_photos")
    .select("storage_path")
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true });

  const heroPaths: string[] = [];
  for (const p of propPhotos ?? []) {
    heroPaths.push(p.storage_path);
  }
  for (const r of rooms ?? []) {
    const ps = photosByRoom.get(r.id) ?? [];
    heroPaths.push(...ps);
  }
  const uniqueHero = [...new Set(heroPaths)].slice(0, 5);

  const isLoggedIn = Boolean(user);
  const amenities: string[] = property.amenities ?? [];
  const hasCoords = property.latitude && property.longitude;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.description || `${property.name} — ${property.type} in ${property.city}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.area || undefined,
      addressCountry: "IN",
    },
    ...(hasCoords
      ? {
        geo: {
          "@type": "GeoCoordinates",
          latitude: property.latitude,
          longitude: property.longitude,
        },
      }
      : {}),
    priceRange: `₹${Number(property.min_monthly_rent)} - ₹${Number(property.max_monthly_rent)}`,
  };

  const mapUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.name}, ${property.address || property.area || property.city}`)}`;

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8 sm:py-6">
        <Link href="/search" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to search
        </Link>

        {/* ── HEADER ── */}
        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {property.name}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a href={mapUrl} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 hover:text-primary transition-colors">
                {property.city}{property.area ? `, ${property.area}` : ""}
              </a>
              <span className="text-muted-foreground">•</span>
              <span className="capitalize text-muted-foreground">{property.type}</span>
            </div>
          </div>
        </div>

        {/* ── PHOTO GRID ── */}
        {uniqueHero.length > 0 && (
          <div className="mt-8">
            <div className={`grid gap-1.5 sm:gap-2 overflow-hidden rounded-xl sm:rounded-2xl ${uniqueHero.length >= 5 ? 'h-[240px] sm:h-[400px] md:h-[500px] grid-cols-2 sm:grid-cols-4 grid-rows-2' : 'aspect-video grid-cols-1'}`}>
              <div className={`relative ${uniqueHero.length >= 5 ? 'col-span-2 row-span-2' : 'col-span-1 h-full'}`}>
                <Image
                  src={publicImageUrlFromPath(uniqueHero[0])}
                  alt={property.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {uniqueHero.length >= 5 && (
                <>
                  <div className="relative hidden sm:block col-span-1 row-span-1">
                    <Image src={publicImageUrlFromPath(uniqueHero[1])} alt="" fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="25vw" />
                  </div>
                  <div className="relative hidden sm:block col-span-1 row-span-1">
                    <Image src={publicImageUrlFromPath(uniqueHero[2])} alt="" fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="25vw" />
                  </div>
                  <div className="relative hidden sm:block col-span-1 row-span-1">
                    <Image src={publicImageUrlFromPath(uniqueHero[3])} alt="" fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="25vw" />
                  </div>
                  <div className="relative hidden sm:block col-span-1 row-span-1">
                    <Image src={publicImageUrlFromPath(uniqueHero[4])} alt="" fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="25vw" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-12 sm:gap-12 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div>
            {/* ABOUT */}
            <section>
              <h2 className="font-display text-2xl font-bold">About this stay</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                {property.description || "The owner has not provided a description yet."}
              </p>
            </section>

            <hr className="my-8 border-border" />

            {/* AMENITIES */}
            <section>
              <h2 className="font-display text-2xl font-bold">What this place offers</h2>
              {amenities.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 sm:gap-x-8">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-3 text-[15px] text-foreground">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-muted-foreground">
                        <StarIconForAmenity name={a} />
                      </div>
                      {a}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-muted-foreground">No amenities listed.</p>
              )}
            </section>

            <hr className="my-8 border-border" />

            {/* ROOM TYPES */}
            <section>
              <h2 className="font-display text-2xl font-bold">Available rooms</h2>
              <div className="mt-6">
                {(rooms ?? []).length === 0 ? (
                  <p className="text-muted-foreground">Room types coming soon.</p>
                ) : (
                  <RoomCardsList
                    rooms={(rooms ?? []).map((room) => ({
                      id: room.id,
                      label: room.label,
                      room_type: room.room_type,
                      beds_count: room.beds_count,
                      has_ac: room.has_ac,
                      is_furnished: room.is_furnished,
                      has_attached_washroom: room.has_attached_washroom,
                      monthly_rent: room.monthly_rent,
                      security_deposit: room.security_deposit,
                      description: room.description,
                      availability_status: room.availability_status,
                      total_occupancy: room.total_occupancy,
                      current_occupancy: room.current_occupancy,
                    }))}
                    photosByRoom={Object.fromEntries(
                      Array.from(photosByRoom.entries())
                    )}
                  />
                )}
              </div>
            </section>

            <hr className="my-8 border-border" />

            {/* MAP */}
            {(hasCoords || property.address) && (
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">Where you&apos;ll be</h2>
                  <Button variant="outline" size="sm" asChild className="rounded-xl font-bold shadow-sm hidden sm:inline-flex">
                    <a href={mapUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Get Directions
                    </a>
                  </Button>
                </div>
                {property.address && <p className="mt-2 text-base text-foreground/90">{property.address}</p>}
                {hasCoords && (
                  <div className="mt-6 h-[280px] sm:h-[400px] overflow-hidden rounded-2xl border border-border relative">
                    <StayMap lat={property.latitude!} lng={property.longitude!} name={property.name} />
                  </div>
                )}
                <div className="mt-4 sm:hidden">
                  <Button variant="outline" className="w-full rounded-xl font-bold shadow-sm" asChild>
                    <a href={mapUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Get Directions
                    </a>
                  </Button>
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="hidden lg:block relative">
            <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 dark:shadow-white/5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-2xl font-bold">
                    ₹{Number(property.min_monthly_rent).toLocaleString()}
                  </span>
                  {Number(property.max_monthly_rent) !== Number(property.min_monthly_rent) && (
                    <span className="text-2xl font-bold">
                      {" "}– ₹{Number(property.max_monthly_rent).toLocaleString()}
                    </span>
                  )}
                  <span className="text-base text-muted-foreground"> / month</span>
                </div>
              </div>

              <div className="mt-6">
                <StayActions
                  propertyId={property.id}
                  propertyName={property.name}
                  slug={property.slug}
                  callbackEnabled={property.callback_enabled}
                  isLoggedIn={isLoggedIn}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 text-center text-sm">
                <span className="font-semibold text-foreground">Zero brokerage. Ever.</span>
                <p className="text-muted-foreground">You won&apos;t be charged anything to schedule a visit or request a call.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE CTA ── */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-card/95 pb-safe pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 pb-3">
          <div>
            <div className="text-lg font-bold">
              ₹{Number(property.min_monthly_rent).toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground"> / mo</span>
            </div>
          </div>
          <StayActions
            propertyId={property.id}
            propertyName={property.name}
            slug={property.slug}
            callbackEnabled={property.callback_enabled}
            isLoggedIn={isLoggedIn}
            compact
          />
        </div>
      </div>
    </div>
  );
}

// Quick helper for generic amenity icons
function StarIconForAmenity({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("wifi") || n.includes("internet")) return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
  if (n.includes("ac") || n.includes("air")) return <Snowflake className="w-5 h-5" />;
  if (n.includes("bed")) return <BedDouble className="w-5 h-5" />;
  return <div className="w-2 h-2 rounded-full bg-current opacity-50" />;
}
