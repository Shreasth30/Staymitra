/**
 * Resolves Supabase URL + public API key from env.
 * Supports both legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the newer
 * dashboard name `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
 */
export function getSupabaseUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return u || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const legacy = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();
  return legacy || publishable || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
