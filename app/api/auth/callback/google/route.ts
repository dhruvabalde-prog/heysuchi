import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "../../../../../lib/google-oauth";

export async function GET(request:Request){
 const url=new URL(request.url);
 const code=url.searchParams.get("code");
 const state=url.searchParams.get("state");
 const cookie=(await import("next/headers")).cookies;
 const store=await cookie();
 const expected=store.get("suchi_oauth_state")?.value;
 if(!code||!state||!expected||state!==expected) return NextResponse.redirect(new URL("/auth?error=oauth_state",request.url));
 try{
  const identity=await exchangeGoogleCode(code);
  const response=NextResponse.redirect(new URL("/",request.url));
  response.cookies.set("suchi_google_identity",JSON.stringify({id:identity.googleId,email:identity.email,name:identity.name,picture:identity.picture}),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*24*30});
  response.cookies.delete("suchi_oauth_state");
  return response;
 }catch{return NextResponse.redirect(new URL("/auth?error=oauth_failed",request.url));}
}
