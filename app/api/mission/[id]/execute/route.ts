import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {data:mission}=await supabase.from("missions").select("id,owner_id").eq("id",id).eq("owner_id",user.id).single();
  if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
  const {data:tasks,error}=await supabase.from("mission_tasks").select("id,title,status,position,depends_on").eq("mission_id",id).order("position");
  if(error)return NextResponse.json({error:error.message},{status:500});
  const completed=new Set((tasks??[]).filter(t=>["done","verified"].includes(t.status)).map(t=>t.id));
  const task=(tasks??[]).find(t=>["queued","working"].includes(t.status) && (t.depends_on??[]).every((dependency:string)=>completed.has(dependency)));
  if(!task)return NextResponse.json({message:"No dependency-ready task is available."});
  const {data:started,error:startError}=await supabase.from("mission_tasks").update({status:"working"}).eq("id",task.id).eq("mission_id",id).select("id,title,status,position").single();
  if(startError)return NextResponse.json({error:startError.message},{status:500});
  const {error:missionError}=await supabase.from("missions").update({status:"working",next_action:"Suchi is working on: "+task.title}).eq("id",id).eq("owner_id",user.id);
  if(missionError)return NextResponse.json({error:missionError.message},{status:500});
  return NextResponse.json({task:started});
}