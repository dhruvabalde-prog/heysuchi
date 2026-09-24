import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
export async function GET(){
 try{
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({ok:true,service:"heysuchi",auth:"required"},{status:200,headers:{"Cache-Control":"no-store"}});
  const {error}=await supabase.from("missions").select("id").eq("owner_id",user.id).limit(1);
  if(error)return NextResponse.json({ok:false,service:"supabase",error:error.message},{status:503});
  return NextResponse.json({ok:true,service:"heysuchi",supabase:"connected",checkedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({ok:false,error:"Health check failed."},{status:503});}
}
