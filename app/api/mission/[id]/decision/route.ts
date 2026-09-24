import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../../lib/supabase/admin";
import { requireIdentity } from "../../../../../../lib/auth";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const body=await request.json(); const identity=await requireIdentity(); if(!identity)return NextResponse.json({error:"Sign in required."},{status:401});
 const supabase=getSupabaseAdmin(); const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",identity.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 if(body.decisionId){
  const {data:decision,error}=await supabase.from("mission_decisions").update({status:"answered",answer:body.answer,answered_at:new Date().toISOString()}).eq("id",String(body.decisionId)).eq("mission_id",id).eq("status","open").select("*").single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  const proceed=String(body.answer??"").toLowerCase()==="proceed";
  if(proceed){
   const {data:tasks}=await supabase.from("mission_tasks").select("id,status,depends_on,title,position").eq("mission_id",id).order("position");
   const completed=new Set((tasks??[]).filter(t=>["done","verified"].includes(t.status)).map(t=>t.id));
   const next=(tasks??[]).find(t=>["queued","working"].includes(t.status)&&(t.depends_on??[]).every((dependency:string)=>completed.has(dependency)));
   if(next){await supabase.from("mission_tasks").update({status:"working"}).eq("id",next.id).eq("mission_id",id);await supabase.from("missions").update({status:"working",next_action:"Verify: "+next.title}).eq("id",id).eq("owner_id",identity.id);}
   else await supabase.from("missions").update({status:"working",next_action:"Suchi is continuing."}).eq("id",id).eq("owner_id",identity.id);
  } else await supabase.from("missions").update({status:"needs_you",next_action:"Waiting for your next decision."}).eq("id",id).eq("owner_id",identity.id);
  return NextResponse.json({decision,continued:proceed});
 }
 const question=String(body.question??"").trim(),options=Array.isArray(body.options)?body.options:[]; if(!question||!options.length)return NextResponse.json({error:"A question and options are required."},{status:400});
 const {data,error}=await supabase.from("mission_decisions").insert({mission_id:id,question,options,status:"open"}).select("*").single(); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({decision:data});
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){return POST(request,{params});}
