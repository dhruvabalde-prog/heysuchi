// Security headers are applied by this Next.js middleware.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const h = response.headers;
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("X-Frame-Options", "DENY");
  h.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  h.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  if (request.nextUrl.protocol === "https:") {
    h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
