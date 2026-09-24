import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";

export async function PATCH(request: Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const body=await request.json(); const taskId=String(body.taskId??""); const status=String(body.status??"");
  if(!taskId||!["queued","working","needs_you","verified","blocked","done"].includes(status)) return NextResponse.json({error:"Invalid task update."},{status:400});
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",user.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
  const {data,error}=await supabase.from("mission_tasks").update({status}).eq("id",taskId).eq("mission_id",id).select("id,title,status,position").single();
  if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({task:data});
}
