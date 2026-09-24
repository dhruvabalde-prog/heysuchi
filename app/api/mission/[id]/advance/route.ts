import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",user.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
  const {data:tasks,error}=await supabase.from("mission_tasks").select("id,status,position").eq("mission_id",id).order("position");
  if(error)return NextResponse.json({error:error.message},{status:500});
  const total=tasks?.length??0, done=(tasks??[]).filter(t=>["done","verified"].includes(t.status)).length, progress=total?Math.round(done/total*100):0;
  const next=(tasks??[]).find(t=>!["done","verified"].includes(t.status));
  await supabase.from("missions").update({progress,status:next?"working":"done",next_action:next?"Suchi is ready for the next step.":"Mission complete."}).eq("id",id).eq("owner_id",user.id);
  return NextResponse.json({progress,status:next?"working":"done"});
}
