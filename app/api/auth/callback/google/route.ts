import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { exchangeGoogleCode } from "../../../../../lib/google-oauth";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const store = await (await import("next/headers")).cookies();
  const expected = store.get("suchi_oauth_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/auth?error=oauth_state", request.url));
  }

  try {
    const identity = await exchangeGoogleCode(code);
    const supabase = getSupabaseAdmin();

    const { data: existing, error: identityError } = await supabase
      .from("auth_identities")
      .upsert({
        provider: "google",
        provider_subject: identity.googleId,
        email: identity.email,
        display_name: identity.name,
        avatar_url: identity.picture,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: "provider,provider_subject" })
      .select("id,email,display_name,avatar_url")
      .single();

    if (identityError || !existing) throw identityError ?? new Error("Could not create identity.");

    const { data: invite } = await supabase.from("platform_admin_invites").select("id,role_id").eq("email", identity.email.toLowerCase()).is("accepted_at", null).maybeSingle();
    if (invite) {
      await supabase.from("platform_admin_members").upsert({ identity_id: existing.id, role_id: invite.role_id, granted_by: existing.id }, { onConflict: "identity_id" });
      await supabase.from("platform_admin_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
    }

    // First account bootstraps the platform. After that, admin membership is explicit.
    const { count } = await supabase.from("platform_admin_members").select("identity_id", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      const { data: role } = await supabase.from("platform_roles").select("id").eq("key", "super_admin").single();
      if (role) {
        await supabase.from("platform_admin_members").insert({ identity_id: existing.id, role_id: role.id, granted_by: existing.id });
      }
    }

    const sessionToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
    const { error: sessionError } = await supabase.from("auth_sessions").insert({
      identity_id: existing.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (sessionError) throw sessionError;

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("suchi_session", sessionToken, {
      httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60,
    });
    response.cookies.delete("suchi_oauth_state");
    return response;
  } catch (error) {
    console.error("google oauth failed", error);
    return NextResponse.redirect(new URL("/auth?error=oauth_failed", request.url));
  }
}
