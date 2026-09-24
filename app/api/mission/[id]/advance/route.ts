import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { requireIdentity } from "../../../../lib/auth";
import { deriveMissionState } from "../../../../lib/mission-progress";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const identity=await requireIdentity(); if(!identity)return NextResponse.json({error:"Sign in required."},{status:401});
 const supabase=getSupabaseAdmin(); const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",identity.id).single();
 if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 const {data:tasks,error}=await supabase.from("mission_tasks").select("id,status,position,title,depends_on").eq("mission_id",id).order("position");
 if(error)return NextResponse.json({error:error.message},{status:500});
 const state=deriveMissionState((tasks??[]).map(t=>({...t,dependsOn:t.depends_on??[]})));
 const {error:updateError}=await supabase.from("missions").update({progress:state.progress,status:state.status,next_action:state.nextAction}).eq("id",id).eq("owner_id",identity.id);
 if(updateError)return NextResponse.json({error:updateError.message},{status:500}); return NextResponse.json(state);
}