import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Assert the current user is a super_admin.
 * Throws/redirects if not authenticated or not a super_admin.
 * Returns the supabase client and user on success.
 */
export async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    // Return null to signal not authorized — layout will show 403
    return null;
  }

  return { supabase, user, profile };
}

/**
 * Check if a given user ID is a super_admin (non-throwing).
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return profile?.role === "super_admin";
}
