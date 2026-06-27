import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProperty, deleteProperty, createRoomOffering, deleteRoomOffering, updateRoomAvailability } from "@/app/dashboard/actions";
import { publicImageUrlFromPath } from "@/lib/storage";
import { AMENITY_OPTIONS, ROOM_TYPE_LABELS, AVAILABILITY_CONFIG } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { CallbackSwitch } from "@/components/dashboard/callback-switch";
import { RoomPhotoUpload } from "@/components/dashboard/room-photo-upload";
import { PropertyPhotoUpload } from "@/components/dashboard/property-photo-upload";
import {
  ExternalLink, Trash2, ChevronLeft, MapPin, Building, Sparkles,
  BedDouble, Snowflake, Image as ImageIcon, Plus, ShowerHead, Sofa,
  Users
} from "lucide-react";
import Image from "next/image";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!property) notFound();

  const { data: rooms } = await supabase
    .from("room_offerings")
    .select("id, label, room_type, beds_count, has_ac, is_furnished, has_attached_washroom, monthly_rent, security_deposit, description, sort_order, availability_status, total_occupancy, current_occupancy")
    .eq("property_id", id)
    .order("sort_order", { ascending: true });

  const roomIds = rooms?.map((r) => r.id) ?? [];
  const { data: photos } =
    roomIds.length > 0
      ? await supabase
          .from("room_photos")
          .select("id, room_offering_id, storage_path, sort_order")
          .in("room_offering_id", roomIds)
          .order("sort_order", { ascending: true })
      : { data: [] as { id: string; room_offering_id: string; storage_path: string; sort_order: number }[] };

  const { data: propPhotos } = await supabase
    .from("property_photos")
    .select("id, storage_path, sort_order")
    .eq("property_id", id)
    .order("sort_order", { ascending: true });

  const photosByRoom = new Map<string, typeof photos>();
  for (const p of photos ?? []) {
    const list = photosByRoom.get(p.room_offering_id) ?? [];
    list.push(p);
    photosByRoom.set(p.room_offering_id, list);
  }

  const currentAmenities: string[] = property.amenities ?? [];

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard/properties" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft className="h-4 w-4" />
            Back to Properties
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight">
                {property.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground font-medium text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {property.city}{property.area ? `, ${property.area}` : ""}
                <span className="mx-1">·</span>
                <span className="capitalize">{property.type}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {property.published ? (
            <Button variant="outline" className="rounded-xl font-bold shadow-sm" asChild>
              <Link href={`/stay/${property.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View live
              </Link>
            </Button>
          ) : null}
          <form
            action={async () => {
              "use server";
              await deleteProperty(id);
              const { redirect } = await import("next/navigation");
              redirect("/dashboard/properties");
            }}
          >
            <Button type="submit" variant="destructive" className="rounded-xl font-bold shadow-sm bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border-0">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Property
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Listing Details Card */}
          <Card className="border-border/80 shadow-md">
            <CardHeader className="pb-6 border-b border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-2xl font-bold">Listing Details</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">Update your property&apos;s visibility and information.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Property Photos Section */}
              <div className="mb-8">
                <Label className="text-sm font-bold block mb-3">Property Photos</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(propPhotos ?? []).map((ph) => (
                    <div key={ph.id} className="relative h-24 w-32 overflow-hidden rounded-xl border border-border group">
                      <Image src={publicImageUrlFromPath(ph.storage_path)} alt="" fill className="object-cover" sizes="128px" />
                    </div>
                  ))}
                  {(propPhotos ?? []).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 w-full border-2 border-dashed border-border/50 rounded-xl bg-accent/10">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/30 mb-1" />
                      <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">No Property Photos</span>
                    </div>
                  )}
                </div>
                <PropertyPhotoUpload propertyId={id} />
              </div>

              <hr className="my-8 border-border/50" />

              <form
                className="space-y-8"
                action={async (fd) => {
                  "use server";
                  await updateProperty(id, fd);
                }}
              >
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold">Property name</Label>
                    <Input id="name" name="name" required defaultValue={property.name} className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-bold">Property Type</Label>
                      <select id="type" name="type" required className="flex h-11 w-full rounded-xl border-0 bg-accent/40 px-4 text-sm font-semibold shadow-sm focus:ring-1 focus:ring-primary outline-none" defaultValue={property.type}>
                        <option value="pg">PG (Paying Guest)</option>
                        <option value="hostel">Hostel</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="published" className="text-sm font-bold">Visibility Status</Label>
                      <label className="flex h-11 items-center gap-3 px-4 rounded-xl border-0 bg-accent/40 text-sm font-semibold cursor-pointer">
                        <input type="checkbox" name="published" value="on" defaultChecked={property.published} className="rounded border-border h-4 w-4 accent-primary" />
                        Published &amp; Live
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-bold">City</Label>
                      <Input id="city" name="city" required defaultValue={property.city} className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm font-bold">Area / Neighborhood</Label>
                      <Input id="area" name="area" defaultValue={property.area ?? ""} className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-bold">Full Address</Label>
                    <Input id="address" name="address" defaultValue={property.address ?? ""} className="h-11 bg-accent/40 border-0 focus-visible:ring-1" placeholder="Plot No, Street, Road..." />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-bold">Latitude (for Map)</Label>
                      <Input id="latitude" name="latitude" type="number" step="any" defaultValue={property.latitude ?? ""} className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm font-bold">Longitude (for Map)</Label>
                      <Input id="longitude" name="longitude" type="number" step="any" defaultValue={property.longitude ?? ""} className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold">Description</Label>
                    <Textarea id="description" name="description" rows={6} className="bg-accent/40 border-0 focus-visible:ring-1 rounded-xl p-4 text-base" defaultValue={property.description ?? ""} placeholder="Describe the rooms, environment, and rules..." />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="min_monthly_rent" className="text-sm font-bold">Starting Rent (₹/mo)</Label>
                      <Input id="min_monthly_rent" name="min_monthly_rent" type="number" min={0} className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold" defaultValue={Number(property.min_monthly_rent)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_monthly_rent" className="text-sm font-bold">Max Rent (₹/mo)</Label>
                      <Input id="max_monthly_rent" name="max_monthly_rent" type="number" min={0} className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold" defaultValue={Number(property.max_monthly_rent)} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-sm font-bold">Amenities Provided</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {AMENITY_OPTIONS.map((a) => (
                        <label key={a} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-accent/20 cursor-pointer hover:bg-accent/40 transition-colors text-sm font-medium">
                          <input type="checkbox" name="amenities" value={a} defaultChecked={currentAmenities.includes(a)} className="rounded border-border h-4 w-4 accent-primary" />
                          {a}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <Button type="submit" className="w-full sm:w-auto px-10 h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* ─── Room Types Section ─── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <BedDouble className="h-6 w-6 text-primary" />
                Room Inventory
              </h2>
              <span className="text-sm font-bold text-muted-foreground">{rooms?.length ?? 0} room type{(rooms?.length ?? 0) !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="grid gap-6">
              {(rooms ?? []).map((room) => {
                const rPhotos = photosByRoom.get(room.id) ?? [];
                const avail = AVAILABILITY_CONFIG[room.availability_status as keyof typeof AVAILABILITY_CONFIG] || AVAILABILITY_CONFIG.available;
                const roomTypeLabel = ROOM_TYPE_LABELS[room.room_type as keyof typeof ROOM_TYPE_LABELS] || "Shared";

                return (
                  <Card key={room.id} className="overflow-hidden border-border/60 shadow-md">
                    <div className="p-6">
                      {/* Room Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display text-xl font-bold">{room.label}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${avail.bgColor} ${avail.color}`}>
                              {avail.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground font-medium flex-wrap">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{roomTypeLabel}</span>
                            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{room.beds_count} Bed{room.beds_count > 1 ? 's' : ''}</span>
                            {room.has_ac && <span className="flex items-center gap-1 text-primary"><Snowflake className="h-3.5 w-3.5" />AC</span>}
                            {room.is_furnished && <span className="flex items-center gap-1 text-amber-600"><Sofa className="h-3.5 w-3.5" />Furnished</span>}
                            {room.has_attached_washroom && <span className="flex items-center gap-1 text-blue-500"><ShowerHead className="h-3.5 w-3.5" />Attached Bath</span>}
                          </div>
                        </div>
                        <form
                          action={async () => {
                            "use server";
                            await deleteRoomOffering(room.id, id);
                          }}
                        >
                          <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-500/10 font-bold p-2 h-auto rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>

                      {/* Pricing */}
                      <div className="flex flex-wrap gap-4 mb-4 p-3 rounded-lg bg-accent/15 border border-border/30">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rent</p>
                          <p className="text-lg font-bold text-foreground">₹{Number(room.monthly_rent).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                        </div>
                        {Number(room.security_deposit) > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deposit</p>
                            <p className="text-lg font-bold text-foreground">₹{Number(room.security_deposit).toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Occupancy</p>
                          <p className="text-lg font-bold text-foreground">{room.current_occupancy ?? 0}/{room.total_occupancy ?? room.beds_count}</p>
                        </div>
                      </div>

                      {room.description && <p className="text-sm text-muted-foreground mb-4">{room.description}</p>}
                      
                      {/* Photos */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {rPhotos.map((ph) => (
                          <div key={ph.id} className="relative h-20 w-28 overflow-hidden rounded-xl border border-border group">
                            <Image src={publicImageUrlFromPath(ph.storage_path)} alt="" fill className="object-cover" sizes="120px" />
                          </div>
                        ))}
                        {rPhotos.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-20 w-full border-2 border-dashed border-border/50 rounded-xl bg-accent/10">
                            <ImageIcon className="h-5 w-5 text-muted-foreground/30 mb-1" />
                            <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">No Photos</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions row */}
                      <div className="flex flex-wrap items-center gap-3">
                        <RoomPhotoUpload roomOfferingId={room.id} />
                        <form
                          className="flex items-center gap-2"
                          action={async (fd) => {
                            "use server";
                            const s = fd.get("availability_status") as string;
                            await updateRoomAvailability(id, room.id, s);
                          }}
                        >
                          <select
                            name="availability_status"
                            defaultValue={room.availability_status || "available"}
                            className="h-9 rounded-lg border-0 bg-accent/40 px-3 text-xs font-bold focus:ring-1 focus:ring-primary outline-none appearance-none"
                          >
                            <option value="available">Available</option>
                            <option value="few_beds_left">Few Beds Left</option>
                            <option value="full">Full</option>
                            <option value="reserved">Reserved</option>
                            <option value="coming_soon">Coming Soon</option>
                          </select>
                          <Button type="submit" size="sm" variant="outline" className="h-9 rounded-lg text-xs font-bold">
                            Update
                          </Button>
                        </form>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* ─── Add Room Type Card ─── */}
              <Card className="border-dashed border-2 py-8 bg-accent/5">
                <CardHeader className="text-center pt-2">
                  <div className="h-12 w-12 rounded-2xl bg-accent text-muted-foreground flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-display text-xl font-bold">Add New Room Type</CardTitle>
                  <CardDescription>e.g. 2 sharing Deluxe, Single Balcony Room</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-6 max-w-xl mx-auto"
                    action={async (fd) => {
                      "use server";
                      await createRoomOffering(id, fd);
                    }}
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="label" className="text-sm font-bold">Room Category Name</Label>
                        <Input id="label" name="label" required placeholder="e.g. Deluxe 2-Sharing with AC" className="h-11 bg-accent/40 border-0 focus-visible:ring-1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="room_type" className="text-sm font-bold">Room Type</Label>
                        <select id="room_type" name="room_type" className="flex h-11 w-full rounded-xl border-0 bg-accent/40 px-4 text-sm font-semibold shadow-sm focus:ring-1 focus:ring-primary outline-none" defaultValue="shared">
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="triple">Triple</option>
                          <option value="shared">Shared</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beds_count" className="text-sm font-bold">Beds in Room</Label>
                        <Input id="beds_count" name="beds_count" type="number" min={1} defaultValue={2} className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="monthly_rent" className="text-sm font-bold">Rent (₹/mo)</Label>
                        <Input id="monthly_rent" name="monthly_rent" type="number" min={0} defaultValue={8000} className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="security_deposit" className="text-sm font-bold">Deposit (₹)</Label>
                        <Input id="security_deposit" name="security_deposit" type="number" min={0} defaultValue={0} className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_occupancy" className="text-sm font-bold">Total Occupancy</Label>
                        <Input id="total_occupancy" name="total_occupancy" type="number" min={1} defaultValue={2} className="h-11 bg-accent/40 border-0 focus-visible:ring-1 font-bold" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <input type="checkbox" name="has_ac" value="on" className="rounded border-border h-4 w-4 accent-primary" />
                        Air Conditioned
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <input type="checkbox" name="is_furnished" value="on" className="rounded border-border h-4 w-4 accent-primary" />
                        Furnished
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <input type="checkbox" name="has_attached_washroom" value="on" className="rounded border-border h-4 w-4 accent-primary" />
                        Attached Washroom
                      </label>
                      <Input name="sort_order" type="hidden" defaultValue={(rooms?.length ?? 0) + 1} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room_desc" className="text-sm font-bold">Short Description</Label>
                      <Textarea id="room_desc" name="description" rows={2} className="bg-accent/40 border-0 focus-visible:ring-1 rounded-xl" placeholder="Tell guests about the room specifics..." />
                    </div>

                    <Button type="submit" className="w-full h-11 rounded-xl bg-primary font-bold shadow-md">
                      Create Room Category
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <Card className="border-border/80 shadow-md sticky top-6">
            <CardHeader className="pb-6 border-b border-border/50">
              <CardTitle className="font-display text-xl font-bold">Configurations</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <Label className="text-sm font-bold block mb-4">Direct Communication</Label>
                <div className="p-4 rounded-xl bg-accent/10 border border-border/50">
                  <CallbackSwitch propertyId={id} initialEnabled={property.callback_enabled} />
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground font-medium font-sans">
                    When enabled, seekers can request a direct phone callback. Their contacts will appear in your Leads tab.
                  </p>
                </div>
              </div>

              {/* Room Summary */}
              {(rooms?.length ?? 0) > 0 && (
                <div className="pt-4 border-t border-border/50">
                  <Label className="text-sm font-bold block mb-3">Room Summary</Label>
                  <div className="space-y-2">
                    {(rooms ?? []).map((r) => {
                      const avail = AVAILABILITY_CONFIG[r.availability_status as keyof typeof AVAILABILITY_CONFIG] || AVAILABILITY_CONFIG.available;
                      return (
                        <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/15 text-sm">
                          <span className="font-medium truncate">{r.label}</span>
                          <span className={`text-[10px] font-bold uppercase ${avail.color}`}>{avail.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-border/50">
                <Button variant="outline" className="w-full h-11 rounded-xl border-dashed border-2 hover:bg-accent/30 font-bold" asChild>
                  <Link href={`/stay/${property.slug}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview Live Listing
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
