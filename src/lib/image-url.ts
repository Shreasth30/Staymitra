/**
 * Client-safe image URL utility.
 * Does NOT import any server-only code.
 */
export function publicImageUrlFromPath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/property-images/${encodeURI(path)}`;
}
