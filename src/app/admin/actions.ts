"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Ensure current user is super_admin, throw if not */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    throw new Error("Forbidden: super_admin role required");
  }
  return { supabase, user };
}

// ─── PROPERTY ACTIONS ───

export async function adminTogglePublish(propertyId: string, published: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("properties")
    .update({ published })
    .eq("id", propertyId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/admin/approvals");
  revalidatePath("/search");
  revalidatePath("/");
}

export async function adminDeleteProperty(propertyId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/admin/approvals");
  revalidatePath("/search");
}

export async function adminUpdateProperty(propertyId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "pg") as "hostel" | "pg";
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const minRent = Number(formData.get("min_monthly_rent") ?? 0);
  const maxRent = Number(formData.get("max_monthly_rent") ?? 0);
  const published = formData.get("published") === "on";
  const callbackEnabled = formData.get("callback_enabled") === "on";
  const lat = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const lng = formData.get("longitude") ? Number(formData.get("longitude")) : null;
  const amenities = formData.getAll("amenities").map(String);

  if (!name || !city) throw new Error("Name and city are required");

  const { error } = await supabase
    .from("properties")
    .update({
      name,
      type,
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
    .eq("id", propertyId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/search");
}

// ─── USER ACTIONS ───

export async function adminUpdateUser(userId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("role") ?? "seeker").trim();

  if (!["seeker", "owner", "super_admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      role,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function adminDeleteUser(userId: string) {
  const { supabase } = await requireAdmin();
  // Delete profile (cascade will handle related data)
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

// ─── CALLBACK ACTIONS ───

export async function adminUpdateCallbackStatus(callbackId: string, status: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("callback_requests")
    .update({ status })
    .eq("id", callbackId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/callbacks");
  revalidatePath("/admin");
}

export async function adminDeleteCallback(callbackId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("callback_requests")
    .delete()
    .eq("id", callbackId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/callbacks");
  revalidatePath("/admin");
}

export async function adminCreateCallback(formData: FormData) {
  const { supabase } = await requireAdmin();

  const seekerId = String(formData.get("seeker_id") ?? "").trim();
  const propertyId = String(formData.get("property_id") ?? "").trim();
  const contactPhone = String(formData.get("contact_phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!seekerId || !propertyId || !contactPhone) {
    throw new Error("Seeker, property, and phone are required");
  }

  const { error } = await supabase.from("callback_requests").insert({
    seeker_id: seekerId,
    property_id: propertyId,
    contact_phone: contactPhone,
    message: message || null,
    status: "pending",
    source: "admin",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/callbacks");
  revalidatePath("/admin");
}

// ─── VISIT ACTIONS ───

export async function adminUpdateVisitStatus(visitId: string, status: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("visit_requests")
    .update({ status })
    .eq("id", visitId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/visits");
  revalidatePath("/admin");
}

export async function adminDeleteVisit(visitId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("visit_requests")
    .delete()
    .eq("id", visitId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/visits");
  revalidatePath("/admin");
}

// ─── PHOTO ACTIONS ───

export async function adminDeletePropertyPhoto(photoId: string) {
  const { supabase } = await requireAdmin();
  // Get storage path first
  const { data: photo } = await supabase
    .from("property_photos")
    .select("storage_path")
    .eq("id", photoId)
    .single();

  if (photo?.storage_path) {
    await supabase.storage.from("property-images").remove([photo.storage_path]);
  }

  const { error } = await supabase
    .from("property_photos")
    .delete()
    .eq("id", photoId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/properties");
}

export async function adminDeleteRoomPhoto(photoId: string) {
  const { supabase } = await requireAdmin();
  const { data: photo } = await supabase
    .from("room_photos")
    .select("storage_path")
    .eq("id", photoId)
    .single();

  if (photo?.storage_path) {
    await supabase.storage.from("property-images").remove([photo.storage_path]);
  }

  const { error } = await supabase
    .from("room_photos")
    .delete()
    .eq("id", photoId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/properties");
}

// ─── FORM WRAPPER ACTIONS (for <form action={}>) ───

export async function adminTogglePublishForm(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const published = formData.get("published") === "true";
  if (!propertyId) throw new Error("Missing propertyId");
  await adminTogglePublish(propertyId, published);
}

export async function adminUpdateCallbackStatusForm(formData: FormData) {
  const callbackId = formData.get("callbackId") as string;
  const status = formData.get("status") as string;
  if (!callbackId || !status) throw new Error("Invalid form data");
  await adminUpdateCallbackStatus(callbackId, status);
}

export async function adminUpdateVisitStatusForm(formData: FormData) {
  const visitId = formData.get("visitId") as string;
  const status = formData.get("status") as string;
  if (!visitId || !status) throw new Error("Invalid form data");
  await adminUpdateVisitStatus(visitId, status);
}

export async function adminDeletePropertyForm(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  if (!propertyId) throw new Error("Missing propertyId");
  await adminDeleteProperty(propertyId);
}

export async function adminDeleteCallbackForm(formData: FormData) {
  const callbackId = formData.get("callbackId") as string;
  if (!callbackId) throw new Error("Missing callbackId");
  await adminDeleteCallback(callbackId);
}

export async function adminDeleteVisitForm(formData: FormData) {
  const visitId = formData.get("visitId") as string;
  if (!visitId) throw new Error("Missing visitId");
  await adminDeleteVisit(visitId);
}

export async function adminUpdateUserForm(formData: FormData) {
  const userId = formData.get("userId") as string;
  if (!userId) throw new Error("Missing userId");
  await adminUpdateUser(userId, formData);
}

export async function adminDeleteUserForm(formData: FormData) {
  const userId = formData.get("userId") as string;
  if (!userId) throw new Error("Missing userId");
  await adminDeleteUser(userId);
}

export async function adminCreateRoomOffering(propertyId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

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
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/search");
}

export async function adminDeleteRoomOffering(roomId: string, propertyId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("room_offerings").delete().eq("id", roomId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/search");
}
