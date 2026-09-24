import { NextResponse } from "next/server";
import { requireIdentity } from "../../../lib/auth";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";

export async function GET() {
  const identity = await requireIdentity();
  if (!identity) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("id,email,full_name,role,status")
    .eq("id", identity.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    { profile: data ?? { id: identity.id, email: identity.email, full_name: identity.displayName } },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
