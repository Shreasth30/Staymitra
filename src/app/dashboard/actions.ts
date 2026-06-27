"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

async function assertOwnerProperty(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: prop } = await supabase
    .from("properties")
    .select("id, user_id")
    .eq("id", propertyId)
    .single();
  if (!prop || prop.user_id !== user.id) throw new Error("Forbidden");
  return { supabase, user };
}

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "pg") as "hostel" | "pg";
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const minRent = Number(formData.get("min_monthly_rent") ?? 0);
  const maxRent = Number(formData.get("max_monthly_rent") ?? 0);
  const published = formData.get("published") === "on";
  const cbVals = formData.getAll("callback_enabled");
  const callbackEnabled = cbVals.includes("on");
  const lat = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const lng = formData.get("longitude") ? Number(formData.get("longitude")) : null;
  const amenities = formData.getAll("amenities").map(String);

  if (!name || !city) throw new Error("Name and city are required");

  let base = slugify(name);
  if (!base) base = "property";
  let slug = base;
  for (let i = 0; i < 25; i++) {
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: user.id,
      name,
      slug,
      type: type === "hostel" ? "hostel" : "pg",
      city,
      area: area || null,
      address: address || null,
      description,
      min_monthly_rent: minRent,
      max_monthly_rent: maxRent || minRent,
      published,
      callback_enabled: callbackEnabled,
      latitude: lat,
      longitude: lng,
      amenities,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  revalidatePath("/search");
  return data.id;
}

export async function updateProperty(propertyId: string, formData: FormData) {
  await assertOwnerProperty(propertyId);
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "pg") as "hostel" | "pg";
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const minRent = Number(formData.get("min_monthly_rent") ?? 0);
  const maxRent = Number(formData.get("max_monthly_rent") ?? 0);
  const published = formData.get("published") === "on";
  const lat = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const lng = formData.get("longitude") ? Number(formData.get("longitude")) : null;
  const amenities = formData.getAll("amenities").map(String);

  if (!name || !city) throw new Error("Name and city are required");

  const { error } = await supabase
    .from("properties")
    .update({
      name,
      type: type === "hostel" ? "hostel" : "pg",
      city,
      area: area || null,
      address: address || null,
      description,
      min_monthly_rent: minRent,
      max_monthly_rent: maxRent || minRent,
      published,
      latitude: lat,
      longitude: lng,
      amenities,
    })
    .eq("id", propertyId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/search");
  revalidatePath("/");
}

export async function setPropertyCallbackEnabled(
  propertyId: string,
  enabled: boolean,
) {
  await assertOwnerProperty(propertyId);
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("properties")
    .select("slug")
    .eq("id", propertyId)
    .single();
  const { error } = await supabase
    .from("properties")
    .update({ callback_enabled: enabled })
    .eq("id", propertyId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/search");
  if (row?.slug) revalidatePath(`/stay/${row.slug}`);
}

export async function deleteProperty(propertyId: string) {
  await assertOwnerProperty(propertyId);
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  revalidatePath("/search");
}

export async function createRoomOffering(
  propertyId: string,
  formData: FormData,
) {
  await assertOwnerProperty(propertyId);
  const supabase = await createClient();

  const label = String(formData.get("label") ?? "").trim();
  const roomType = String(formData.get("room_type") ?? "shared");
  const bedsCount = Math.max(1, Number(formData.get("beds_count") ?? 1));
  const hasAc = formData.get("has_ac") === "on";
  const isFurnished = formData.get("is_furnished") === "on";
  const hasAttachedWashroom = formData.get("has_attached_washroom") === "on";
  const monthlyRent = Number(formData.get("monthly_rent") ?? 0);
  const securityDeposit = Number(formData.get("security_deposit") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const totalOccupancy = Math.max(1, Number(formData.get("total_occupancy") ?? bedsCount));

  if (!label) throw new Error("Room label is required");

  const { error } = await supabase.from("room_offerings").insert({
    property_id: propertyId,
    label,
    room_type: roomType,
    beds_count: bedsCount,
    has_ac: hasAc,
    is_furnished: isFurnished,
    has_attached_washroom: hasAttachedWashroom,
    monthly_rent: monthlyRent,
    security_deposit: securityDeposit,
    description,
    sort_order: sortOrder,
    total_occupancy: totalOccupancy,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/search");
}

export async function deleteRoomOffering(roomId: string, propertyId: string) {
  await assertOwnerProperty(propertyId);
  const supabase = await createClient();
  const { error } = await supabase.from("room_offerings").delete().eq("id", roomId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/search");
}

export async function updateVisitStatus(
  visitId: string,
  status: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: visit } = await supabase
    .from("visit_requests")
    .select("property_id")
    .eq("id", visitId)
    .single();
  if (!visit) throw new Error("Not found");
  const { data: prop } = await supabase
    .from("properties")
    .select("user_id")
    .eq("id", visit.property_id)
    .single();
  if (!prop || prop.user_id !== user.id) throw new Error("Forbidden");

  const { error } = await supabase
    .from("visit_requests")
    .update({ status })
    .eq("id", visitId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

export async function updateCallbackStatus(
  callbackId: string,
  status: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: cb } = await supabase
    .from("callback_requests")
    .select("property_id")
    .eq("id", callbackId)
    .single();
  if (!cb) throw new Error("Not found");
  const { data: prop } = await supabase
    .from("properties")
    .select("user_id")
    .eq("id", cb.property_id)
    .single();
  if (!prop || prop.user_id !== user.id) throw new Error("Forbidden");

  const { error } = await supabase
    .from("callback_requests")
    .update({ status })
    .eq("id", callbackId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

export async function updateRoomAvailability(
  propertyId: string,
  roomId: string,
  availabilityStatus: string,
) {
  await assertOwnerProperty(propertyId);
  const supabase = await createClient();
  const { error } = await supabase
    .from("room_offerings")
    .update({ availability_status: availabilityStatus })
    .eq("id", roomId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/search");
}

export async function updateVisitStatusForm(formData: FormData) {
  const visitId = formData.get("visitId") as string;
  const status = formData.get("status") as string;
  if (!visitId || !status) throw new Error("Invalid form data");
  await updateVisitStatus(visitId, status);
}

export async function updateCallbackStatusForm(formData: FormData) {
  const callbackId = formData.get("callbackId") as string;
  const status = formData.get("status") as string;
  if (!callbackId || !status) throw new Error("Invalid form data");
  await updateCallbackStatus(callbackId, status);
}
