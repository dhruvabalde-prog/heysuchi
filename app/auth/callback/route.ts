import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
export async function GET(request: Request) {
 const url=new URL(request.url); const code=url.searchParams.get("code"); const error=url.searchParams.get("error");
 if(error)return NextResponse.redirect(new URL("/auth?error=sign-in-failed",request.url));
 if(!code)return NextResponse.redirect(new URL("/auth?error=missing-code",request.url));
 const supabase=await createSupabaseServerClient(); const result=await supabase.auth.exchangeCodeForSession(code);
 if(result.error)return NextResponse.redirect(new URL("/auth?error=sign-in-failed",request.url));
 return NextResponse.redirect(new URL("/",request.url));
}
