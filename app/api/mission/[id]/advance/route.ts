import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { missionProgress } from "../../../../../../lib/mission-progress";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",user.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 const {data:tasks,error}=await supabase.from("mission_tasks").select("id,status,position,title").eq("mission_id",id).order("position");
 if(error)return NextResponse.json({error:error.message},{status:500});
 const state=missionProgress(tasks??[]); const next=(tasks??[]).find(t=>!["done","verified"].includes(t.status));
 const status=state.complete?"done":next?.status==="needs_you"?"needs_you":"working";
 const nextAction=state.complete?"Mission complete.":next?"Suchi is ready for the next step.":"Suchi is working.";
 const {error:updateError}=await supabase.from("missions").update({progress:state.progress,status,next_action:nextAction}).eq("id",id).eq("owner_id",user.id);
 if(updateError)return NextResponse.json({error:updateError.message},{status:500});
 return NextResponse.json({progress:state.progress,status,nextAction});
}
