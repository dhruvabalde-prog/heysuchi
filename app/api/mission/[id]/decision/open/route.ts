import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../../lib/supabase/admin";
import { requireIdentity } from "../../../../../../lib/auth";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const body=await request.json(); const question=String(body.question??"").trim(); const options=Array.isArray(body.options)?body.options:[];
 if(!question||!options.length)return NextResponse.json({error:"Question and options required."},{status:400});
 const identity=await requireIdentity(); if(!identity)return NextResponse.json({error:"Sign in required."},{status:401});
 const supabase=getSupabaseAdmin(); const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",identity.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 const {data,error}=await supabase.from("mission_decisions").insert({mission_id:id,question,options,status:"open"}).select("*").single(); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({decision:data});
}