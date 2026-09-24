import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient<any> | null = null;

export function getSupabaseAdmin(): SupabaseClient<any> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Server database credentials are not configured.");
  if (!cached) {
    cached = createClient<any>(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  }
  return cached;
}
