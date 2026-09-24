import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";
import { requireIdentity } from "../../../../../lib/auth";
import { missionProgress } from "../../../../../lib/mission-progress";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const identity=await requireIdentity(); if(!identity)return NextResponse.json({error:"Sign in required."},{status:401});
 const supabase=getSupabaseAdmin(); const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",identity.id).single();
 if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 const {data:task,error}=await supabase.from("mission_tasks").select("id,title,status,position").eq("mission_id",id).eq("status","working").order("position").limit(1).maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:500}); if(!task)return NextResponse.json({message:"Nothing is waiting for verification."});
 const {data:verified,error:verifyError}=await supabase.from("mission_tasks").update({status:"verified"}).eq("id",task.id).eq("mission_id",id).select("id,title,status,position").single();
 if(verifyError)return NextResponse.json({error:verifyError.message},{status:500});
 const {data:tasks}=await supabase.from("mission_tasks").select("status,title").eq("mission_id",id); const state=missionProgress(tasks??[]); const next=(tasks??[]).find(t=>!["done","verified"].includes(t.status));
 await supabase.from("missions").update({progress:state.progress,status:state.complete?"done":"working",next_action:state.complete?"Mission complete.":next?"Suchi is ready for the next step.":"Suchi is working."}).eq("id",id).eq("owner_id",identity.id);
 return NextResponse.json({task:verified,progress:state.progress,status:state.complete?"done":"working"});
}