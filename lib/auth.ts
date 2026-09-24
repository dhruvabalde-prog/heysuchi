import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "./supabase/admin";

const COOKIE = "suchi_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export type Identity = {
  id: string;
  provider: string;
  providerSubject: string;
  email: string;
  displayName: string;
  avatarUrl: string;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(identityId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("auth_sessions").insert({
    identity_id: identityId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + MAX_AGE * 1000).toISOString(),
  });
  if (error) throw error;
  return { token, maxAge: MAX_AGE };
}

export async function requireIdentity(): Promise<Identity | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("auth_sessions")
    .select("id,identity_id,expires_at,auth_identities(id,provider,provider_subject,email,display_name,avatar_url)")
    .eq("token_hash", hashToken(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data?.auth_identities) return null;
  const identity = Array.isArray(data.auth_identities) ? data.auth_identities[0] : data.auth_identities;
  await supabase.from("auth_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);
  await supabase.from("auth_identities").update({ last_seen_at: new Date().toISOString() }).eq("id", identity.id);
  return {
    id: identity.id,
    provider: identity.provider,
    providerSubject: identity.provider_subject,
    email: identity.email,
    displayName: identity.display_name ?? "",
    avatarUrl: identity.avatar_url ?? "",
  };
}

export async function setSessionCookie(response: Response, token: string, maxAge = MAX_AGE) {
  const { cookies: cookieApi } = await import("next/headers");
  const store = await cookieApi();
  store.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge });
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await getSupabaseAdmin().from("auth_sessions").delete().eq("token_hash", hashToken(token));
  store.delete(COOKIE);
}

export const SESSION_COOKIE = COOKIE;
