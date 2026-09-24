import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
export async function GET(){
 const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data,error}=await supabase.from("audit_log").select("id,action,target,meta,created_at").eq("actor_id",user.id).order("created_at",{ascending:false}).limit(50);
 if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({activity:data??[]});
}