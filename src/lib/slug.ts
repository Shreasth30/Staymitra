export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base: string, suffix?: string): string {
  const s = suffix ? `${base}-${suffix}` : base;
  return s.slice(0, 120) || "stay";
}
