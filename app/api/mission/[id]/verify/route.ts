import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",user.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
  const {data:task,error}=await supabase.from("mission_tasks").select("id,title,status,position").eq("mission_id",id).eq("status","working").order("position").limit(1).maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:500}); if(!task)return NextResponse.json({message:"Nothing is waiting for verification."});
  const {data:verified,error:verifyError}=await supabase.from("mission_tasks").update({status:"verified"}).eq("id",task.id).select("id,title,status,position").single();
  if(verifyError)return NextResponse.json({error:verifyError.message},{status:500});
  return NextResponse.json({task:verified});
}
