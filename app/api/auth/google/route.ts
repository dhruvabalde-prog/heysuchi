import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { googleAuthUrl } from "../../../../lib/google-oauth";

function callbackUrl(request: Request) {
  const url = new URL(request.url);
  return new URL("/api/auth/callback/google", url.origin).toString();
}

export async function GET(request: Request) {
  const state = crypto.randomBytes(32).toString("hex");
  const redirectUri = callbackUrl(request);
  const response = NextResponse.redirect(googleAuthUrl(state, redirectUri));
  response.cookies.set("suchi_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
