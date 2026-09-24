import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL("/auth?error=sign-in-failed", request.url));
  return NextResponse.redirect(new URL("/auth?error=use-google-sign-in", request.url));
}
