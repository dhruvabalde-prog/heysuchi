import {NextResponse}from"next/server";import{createSupabaseServerClient}from"../../../../lib/supabase/server";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const{id}=await params; const body=await request.json(); const supabase=await createSupabaseServerClient(); const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const{data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",user.id).single(); if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 if(body.decisionId){
  const{data:decision,error}=await supabase.from("mission_decisions").update({status:"answered",answer:body.answer,answered_at:new Date().toISOString()}).eq("id",String(body.decisionId)).eq("mission_id",id).eq("status","open").select("*").single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  const proceed=String(body.answer??"").toLowerCase()==="proceed";
  if(proceed)await supabase.from("missions").update({status:"working",next_action:"Suchi is continuing."}).eq("id",id).eq("owner_id",user.id);
  else await supabase.from("missions").update({status:"needs_you",next_action:"Waiting for your next decision."}).eq("id",id).eq("owner_id",user.id);
  return NextResponse.json({decision,continued:proceed});
 }
 const question=String(body.question??"").trim(),options=Array.isArray(body.options)?body.options:[];
 if(!question||!options.length)return NextResponse.json({error:"A question and options are required."},{status:400});
 const{data,error}=await supabase.from("mission_decisions").insert({mission_id:id,question,options,status:"open"}).select("*").single();
 if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({decision:data});
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){return POST(request,{params});}
