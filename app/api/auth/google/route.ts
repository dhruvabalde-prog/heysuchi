import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { googleAuthUrl } from "../../../../lib/google-oauth";

export async function GET(request:Request){
 const state=crypto.randomBytes(32).toString("hex");
 const response=NextResponse.redirect(googleAuthUrl(state));
 response.cookies.set("suchi_oauth_state",state,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:600});
 return response;
}
