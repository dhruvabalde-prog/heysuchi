import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {data:mission}=await supabase.from("missions").select("id,owner_id").eq("id",id).eq("owner_id",user.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
  const {data:task}=await supabase.from("mission_tasks").select("id,title,status,position").eq("mission_id",id).in("status",["queued","working"]).order("position").limit(1).maybeSingle();
  if(!task)return NextResponse.json({message:"Mission has no runnable tasks."});
  const {data:started,error:startError}=await supabase.from("mission_tasks").update({status:"working"}).eq("id",task.id).select("id,title,status,position").single();
  if(startError)return NextResponse.json({error:startError.message},{status:500});
  await supabase.from("missions").update({status:"working",next_action:"Suchi is working on: "+task.title}).eq("id",id).eq("owner_id",user.id);
  return NextResponse.json({task:started});
}
