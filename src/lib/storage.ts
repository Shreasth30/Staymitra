import { createClient } from "@/lib/supabase/server";

// Re-export the client-safe helper so existing server-side imports still work
export { publicImageUrlFromPath } from "@/lib/image-url";

export async function getPublicImageUrl(path: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage.from("property-images").getPublicUrl(path);
  return data.publicUrl;
}
