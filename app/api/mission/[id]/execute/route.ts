import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { needsApproval, type ApprovalMode, type ApprovalRuleKey } from "../../../../../../lib/decision";
import { inferCapability } from "../../../../../../lib/task-graph";
import { MissionExecutor } from "../../../../../../lib/executor";
import { createAgentRouter } from "../../../../../../lib/runtime";
import { normalizeArtifact } from "../../../../../../lib/artifacts";
import { deriveMissionState } from "../../../../../../lib/mission-progress";

const SIDE_EFFECTS=/\b(buy|purchase|pay|book|reserve|send|email|message|publish|post|delete|cancel|submit|hire|invite|transfer)\b/i;
const DEFAULT_APPROVALS:Record<ApprovalRuleKey,boolean>={spending:true,external_messages:true,documents:true,deletion:true,travel_booking:true,research:false,code_changes:false};

function policyFromSettings(settings:any){
 const mode=(settings?.data?.autonomy??"approval") as ApprovalMode;
 const raw=settings?.data?.approvals??{};
 return {mode,rules:{...DEFAULT_APPROVALS,spending:raw.spending??DEFAULT_APPROVALS.spending,external_messages:raw.external_messages??raw.messages??DEFAULT_APPROVALS.external_messages,documents:raw.documents??DEFAULT_APPROVALS.documents,deletion:raw.deletion??DEFAULT_APPROVALS.deletion,travel_booking:raw.travel_booking??raw.bookings??DEFAULT_APPROVALS.travel_booking,research:raw.research??DEFAULT_APPROVALS.research,code_changes:raw.code_changes??raw.code??DEFAULT_APPROVALS.code_changes}};
}

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:mission}=await supabase.from("missions").select("id,owner_id,title,raw_input").eq("id",id).eq("owner_id",user.id).single();
 if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 const {data:settings}=await supabase.from("user_settings").select("data").eq("user_id",user.id).eq("realm","personal").maybeSingle();
 const policy=policyFromSettings(settings);
 const {data:tasks,error}=await supabase.from("mission_tasks").select("id,title,status,position,depends_on").eq("mission_id",id).order("position");
 if(error)return NextResponse.json({error:error.message},{status:500});
 const completed=new Set((tasks??[]).filter(t=>["done","verified"].includes(t.status)).map(t=>t.id));
 const task=(tasks??[]).find(t=>t.status==="queued" && (t.depends_on??[]).every((dependency:string)=>completed.has(dependency)));
 if(!task)return NextResponse.json({message:"No dependency-ready task is available."});
 if(SIDE_EFFECTS.test(task.title) && needsApproval(task.title,policy).required){
  const {data:openDecision}=await supabase.from("mission_decisions").select("id,question,options,status").eq("mission_id",id).eq("status","open").limit(1).maybeSingle();
  if(openDecision)return NextResponse.json({needsDecision:true,decision:openDecision});
  const {data:decision,error:decisionError}=await supabase.from("mission_decisions").insert({mission_id:id,question:"This step creates an external side effect. Should Suchi proceed?",options:["Proceed","Not now"],status:"open"}).select("id,question,options,status").single();
  if(decisionError)return NextResponse.json({error:decisionError.message},{status:500});
  return NextResponse.json({needsDecision:true,decision});
 }
 const {data:started,error:startError}=await supabase.from("mission_tasks").update({status:"working"}).eq("id",task.id).eq("mission_id",id).eq("status","queued").select("id,title,status,position").single();
 if(startError)return NextResponse.json({error:startError.message},{status:500});
 await supabase.from("missions").update({status:"working",next_action:"Suchi is working on: "+task.title}).eq("id",id).eq("owner_id",user.id);

 const executor=new MissionExecutor(createAgentRouter());
 const result=await executor.run({missionId:id,taskId:task.id,capability:inferCapability(task.title),input:mission.raw_input+"\n\nCurrent task: "+task.title});
 if(result.status==="blocked"){
  await supabase.from("mission_tasks").update({status:"blocked"}).eq("id",task.id).eq("mission_id",id);
  return NextResponse.json({task:started,status:"blocked",summary:result.summary},{status:503});
 }

 let artifact:any=null;
 if(result.artifact){
  const normalized=normalizeArtifact({name:"mission.md",kind:"task_output",title:task.title,summary:result.summary,content:result.artifact});
  const {data:created,error:artifactError}=await supabase.from("mission_artifacts").insert({mission_id:id,...normalized}).select("*").single();
  if(artifactError){
   await supabase.from("mission_tasks").update({status:"blocked"}).eq("id",task.id).eq("mission_id",id);
   return NextResponse.json({error:artifactError.message},{status:500});
  }
  artifact=created;
 }
 await supabase.from("mission_tasks").update({status:"verified"}).eq("id",task.id).eq("mission_id",id);
 const {data:allTasks}=await supabase.from("mission_tasks").select("id,status,position,title,depends_on").eq("mission_id",id).order("position");
 const state=deriveMissionState((allTasks??[]).map(t=>({...t,dependsOn:t.depends_on??[]})));
 await supabase.from("missions").update({progress:state.progress,status:state.status,next_action:state.nextAction}).eq("id",id).eq("owner_id",user.id);
 return NextResponse.json({task:{...started,status:"verified"},summary:result.summary,artifact,state});
}