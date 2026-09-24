import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { requirePermission } from "../../../../lib/admin";

export async function GET() {
  const context = await requirePermission("admin.users");
  if (!context) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("platform_admin_members")
    .select("identity_id,created_at,auth_identities(email,display_name),platform_roles(key,name)")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(request: Request) {
  const context = await requirePermission("admin.users");
  if (!context) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const roleKey = String(body.role ?? "").trim();
  if (!email || !roleKey) return NextResponse.json({ error: "Email and role are required." }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const [{ data: identity }, { data: role }] = await Promise.all([
    supabase.from("auth_identities").select("id,email").eq("email", email).maybeSingle(),
    supabase.from("platform_roles").select("id,key").eq("key", roleKey).single(),
  ]);
  if (!identity) return NextResponse.json({ error: "That Google account must sign in once before it can be assigned a platform role." }, { status: 404 });
  if (!role) return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  const { error } = await supabase.from("platform_admin_members").upsert({
    identity_id: identity.id, role_id: role.id, granted_by: context.identity.id
  }, { onConflict: "identity_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("audit_log").insert({ actor_email: context.identity.email, action: "platform_role_granted", target: email, meta: { role: roleKey } });
  return NextResponse.json({ ok: true });
}
