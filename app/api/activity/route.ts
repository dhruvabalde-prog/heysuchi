import { NextResponse } from "next/server";
import { requireIdentity } from "../../../lib/auth";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";

export async function GET() {
  const identity = await requireIdentity();
  if (!identity) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await getSupabaseAdmin()
    .from("audit_log")
    .select("id,action,target,meta,created_at")
    .eq("actor_id", identity.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}
