import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function DbCheck() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let status = "missing-server-credentials";

  if (url && key) {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.from("workspaces").select("id,name").limit(1);
    status = error ? `query-error: ${error.message}` : `connected:${data?.[0]?.name ?? "no-workspace"}`;
  }

  return <pre>{status}</pre>;
}
