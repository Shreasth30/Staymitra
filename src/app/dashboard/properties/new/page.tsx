import Link from "next/link";
import { createProperty } from "@/app/dashboard/actions";
import { AMENITY_OPTIONS } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Building, Sparkles } from "lucide-react";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in-up pb-20">
      <div>
        <Link href="/dashboard/properties" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4 text-left">
          <ChevronLeft className="h-4 w-4" />
          Back to Properties
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-left">
              New Property
            </h1>
            <p className="mt-1 text-base text-muted-foreground text-left">
              Start by naming your property and adding basic details.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="pb-6 border-b border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-2xl font-bold">Listing Details</CardTitle>
          </div>
          <CardDescription className="text-base text-muted-foreground text-left">You can add specific room types and photos in the next step.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 text-left">
          <form
            className="space-y-8"
            action={async (fd) => {
              "use server";
              const id = await createProperty(fd);
              const { redirect } = await import("next/navigation");
              redirect(`/dashboard/properties/${id}`);
            }}
          >
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold">Property name</Label>
                <Input id="name" name="name" required placeholder="e.g. Sunrise PG" className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-bold">Property Type</Label>
                  <select
                    id="type"
                    name="type"
                    required
                    className="flex h-11 w-full rounded-xl border-0 bg-accent/40 px-4 text-sm font-semibold shadow-sm focus:ring-1 focus:ring-primary outline-none"
                    defaultValue="pg"
                  >
                    <option value="pg">PG (Paying Guest)</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-bold">City</Label>
                  <Input id="city" name="city" required placeholder="Bengaluru" className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-bold">Area (optional)</Label>
                  <Input id="area" name="area" placeholder="Koramangala" className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-bold">Full Address</Label>
                  <Input id="address" name="address" placeholder="123, 4th Cross..." className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm font-bold">Latitude (optional)</Label>
                  <Input id="latitude" name="latitude" type="number" step="any" placeholder="12.9716" className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm font-bold">Longitude (optional)</Label>
                  <Input id="longitude" name="longitude" type="number" step="any" placeholder="77.5946" className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="bg-accent/40 border-0 focus-visible:ring-1 rounded-xl p-4"
                  placeholder="Tell guests what makes your place special..."
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min_monthly_rent" className="text-sm font-bold">Starting Rent (₹/mo)</Label>
                  <Input
                    id="min_monthly_rent"
                    name="min_monthly_rent"
                    type="number"
                    min={0}
                    defaultValue={5000}
                    className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_monthly_rent" className="text-sm font-bold">Max Rent (₹/mo)</Label>
                  <Input
                    id="max_monthly_rent"
                    name="max_monthly_rent"
                    type="number"
                    min={0}
                    defaultValue={15000}
                    className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-sm font-bold">Amenities Provided</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITY_OPTIONS.map((a) => (
                    <label key={a} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-accent/20 cursor-pointer hover:bg-accent/40 transition-colors text-sm font-medium">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={a}
                        className="rounded border-border h-4 w-4 accent-primary"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5 rounded-xl border border-primary/10 bg-primary/5">
              <label className="flex items-center gap-3 text-sm font-bold cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  value="on"
                  className="rounded border-border h-4 w-4 accent-primary"
                />
                Publish listing (visible in search immediately)
              </label>
              <div className="pt-2 border-t border-primary/10">
                <input type="hidden" name="callback_enabled" value="off" />
                <label className="flex items-center gap-3 text-sm font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    name="callback_enabled"
                    value="on"
                    defaultChecked
                    className="rounded border-border h-4 w-4 accent-primary"
                  />
                  Allow direct callback requests (recommended)
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full sm:w-auto px-12 h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
              Save & Add Room Types
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
