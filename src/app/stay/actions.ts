"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitVisitRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to schedule a visit.");

  const propertyId = String(formData.get("property_id") ?? "");
  const preferredAt = String(formData.get("preferred_at") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!propertyId || !preferredAt) throw new Error("Missing fields");

  const { error } = await supabase.from("visit_requests").insert({
    property_id: propertyId,
    seeker_id: user.id,
    preferred_at: preferredAt,
    note,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/leads");
}

export async function submitCallbackRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to request a callback.");

  const propertyId = String(formData.get("property_id") ?? "");
  const contactPhone = String(formData.get("contact_phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!propertyId || !contactPhone) throw new Error("Missing fields");

  const { error } = await supabase.from("callback_requests").insert({
    property_id: propertyId,
    seeker_id: user.id,
    contact_phone: contactPhone,
    message,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/leads");
}
