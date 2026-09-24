import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { requireIdentity } from "../../../lib/auth";

export async function GET() {
  try {
    const identity = await requireIdentity();
    if (!identity) return NextResponse.json({ ok: true, service: "heysuchi", auth: "required" }, { headers: { "Cache-Control": "no-store" } });
    const { error } = await getSupabaseAdmin().from("missions").select("id").eq("owner_id", identity.id).limit(1);
    if (error) return NextResponse.json({ ok: false, service: "supabase", error: error.message }, { status: 503 });
    return NextResponse.json({ ok: true, service: "heysuchi", supabase: "connected", auth: "custom-google-session", checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Health check failed." }, { status: 503 });
  }
}
