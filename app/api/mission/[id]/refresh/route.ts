import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../../lib/supabase/admin";
import { requireIdentity } from "../../../../../../lib/auth";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const identity=await requireIdentity(); if(!identity)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:mission,error}=await getSupabaseAdmin().from("missions").select("*").eq("id",id).eq("owner_id",identity.id).single();
 if(error||!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 return NextResponse.json({mission},{headers:{"Cache-Control":"no-store"}});
}