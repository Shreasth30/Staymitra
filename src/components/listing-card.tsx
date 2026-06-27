import Link from "next/link";
import Image from "next/image";
import { publicImageUrlFromPath } from "@/lib/storage";
import { MapPin, Star } from "lucide-react";

type Listing = {
  id: string;
  name: string;
  slug: string;
  city: string;
  area: string | null;
  type: string;
  min_monthly_rent: number;
  max_monthly_rent: number;
  description: string | null;
  amenities?: string[];
};

export function ListingCard({
  listing,
  imagePath,
}: {
  listing: Listing;
  imagePath: string | null;
}) {
  const img = imagePath ? publicImageUrlFromPath(imagePath) : null;
  const topAmenities = (listing.amenities ?? []).slice(0, 3);

  return (
    <Link href={`/stay/${listing.slug}`} className="group block h-full">
      <div className="h-full card-hover">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          {img ? (
            <Image
              src={img}
              alt={listing.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-accent">
              <span className="font-display text-5xl font-bold text-muted-foreground/20">
                {listing.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          {/* Badge */}
          <span className="absolute left-3 top-3 rounded-lg bg-card/95 px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-md backdrop-blur-sm">
            {listing.type}
          </span>
          {/* Wishlist-style dot (decorative) */}
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors group-hover:bg-black/40">
            <Star className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="mt-3.5 px-0.5 text-left w-full">
          <div className="flex items-start justify-between gap-2 text-left">
            <h3 className="font-display text-[17px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary text-left">
              {listing.name}
            </h3>
          </div>
          <p className="mt-1 flex items-center justify-start gap-1 text-sm text-muted-foreground text-left">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {listing.city}
            {listing.area ? `, ${listing.area}` : ""}
          </p>
          {topAmenities.length > 0 && (
            <p className="mt-1.5 text-sm text-muted-foreground text-left">
              {topAmenities.join(" · ")}
            </p>
          )}
          <p className="mt-2 text-left">
            <span className="text-[17px] font-bold text-foreground">
              ₹{Number(listing.min_monthly_rent).toLocaleString()}
            </span>
            {Number(listing.max_monthly_rent) !== Number(listing.min_monthly_rent) && (
              <span className="text-[17px] font-bold text-foreground">
                {" "}– ₹{Number(listing.max_monthly_rent).toLocaleString()}
              </span>
            )}
            <span className="text-sm font-normal text-muted-foreground"> / month</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
