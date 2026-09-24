import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";

const SIDE_EFFECTS=/\b(buy|purchase|pay|book|reserve|send|email|message|publish|post|delete|cancel|submit|hire|invite|transfer)\b/i;

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
  if(SIDE_EFFECTS.test(task.title)){
    const {data:openDecision}=await supabase.from("mission_decisions").select("id,question,options,status").eq("mission_id",id).eq("status","open").limit(1).maybeSingle();
    if(!openDecision){
      const {data:decision,error:decisionError}=await supabase.from("mission_decisions").insert({mission_id:id,question:"This step creates an external side effect. Should Suchi proceed?",options:["Proceed","Not now"],status:"open"}).select("id,question,options,status").single();
      if(decisionError)return NextResponse.json({error:decisionError.message},{status:500});
      return NextResponse.json({needsDecision:true,decision});
    }
    return NextResponse.json({needsDecision:true,decision:openDecision});
  }
  const {data:started,error:startError}=await supabase.from("mission_tasks").update({status:"working"}).eq("id",task.id).eq("mission_id",id).select("id,title,status,position").single();
  if(startError)return NextResponse.json({error:startError.message},{status:500});

  const artifactContent=`# ${task.title}\n\nHeySuchi prepared the next useful output for this mission.\n\n## Input\n${task.title}\n\n## Status\nPrepared for verification.`;
  const {data:artifact,error:artifactError}=await supabase.from("mission_artifacts").insert({mission_id:id,name:`task-${task.position+1}.md`,kind:"execution",title:task.title,summary:"Prepared the next useful output.",content:artifactContent}).select("id,name,title,summary,content").single();
  if(artifactError)return NextResponse.json({error:artifactError.message},{status:500});

  const {error:missionError}=await supabase.from("missions").update({status:"working",next_action:"Verify: "+task.title}).eq("id",id).eq("owner_id",user.id);
  if(missionError)return NextResponse.json({error:missionError.message},{status:500});
  return NextResponse.json({task:started,artifact});
}