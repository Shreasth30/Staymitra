import { createClient } from "@/lib/supabase/server";

export type SearchFilters = {
  city?: string;
  type?: "hostel" | "pg" | "";
  budgetMin?: string;
  budgetMax?: string;
  hasAc?: boolean;
};

const PROPERTY_SELECT =
  "id, name, slug, city, area, type, min_monthly_rent, max_monthly_rent, description, latitude, longitude, amenities";

export async function queryPublishedProperties(filters: SearchFilters) {
  const supabase = await createClient();
  let q = supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("published", true)
    .order("created_at", { ascending: false });

  const city = filters.city?.trim();
  if (city) {
    q = q.ilike("city", `%${city}%`);
  }
  if (filters.type === "hostel" || filters.type === "pg") {
    q = q.eq("type", filters.type);
  }
  const bmax = filters.budgetMax ? Number(filters.budgetMax) : NaN;
  const bmin = filters.budgetMin ? Number(filters.budgetMin) : NaN;
  if (!Number.isNaN(bmax) && bmax > 0) {
    q = q.lte("min_monthly_rent", bmax);
  }
  if (!Number.isNaN(bmin) && bmin > 0) {
    q = q.gte("max_monthly_rent", bmin);
  }

  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  let list = rows ?? [];

  if (filters.hasAc && list.length) {
    const ids = list.map((p) => p.id);
    const { data: acRooms } = await supabase
      .from("room_offerings")
      .select("property_id")
      .in("property_id", ids)
      .eq("has_ac", true);
    const withAc = new Set(acRooms?.map((r) => r.property_id) ?? []);
    list = list.filter((p) => withAc.has(p.id));
  }

  return list;
}

export async function getFeaturedProperties(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPropertyImagePathsBatch(
  propertyIds: string[],
): Promise<Record<string, string>> {
  if (!propertyIds.length) return {};
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("properties")
    .select(`
      id,
      property_photos (
        storage_path
      ),
      room_offerings (
        room_photos (
          storage_path
        )
      )
    `)
    .in("id", propertyIds);

  const map: Record<string, string> = {};
  if (data) {
    for (const p of data) {
      let firstPhoto = null;
      if (p.property_photos && (p.property_photos as { storage_path: string }[]).length > 0) {
        firstPhoto = (p.property_photos as { storage_path: string }[])[0].storage_path;
      }
      if (!firstPhoto) {
        for (const r of (p.room_offerings as { room_photos: { storage_path: string }[] }[]) || []) {
           if (r.room_photos && r.room_photos.length > 0) {
              firstPhoto = r.room_photos[0].storage_path;
              break;
           }
        }
      }
      if (firstPhoto) map[p.id] = firstPhoto;
    }
  }
  return map;
}
