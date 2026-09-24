import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const defaults={autonomy:"approval",approvals:{spending:true,messages:true,documents:true,bookings:true,deletion:true,code:true},notifications:true};

export async function GET(){
 const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data}=await supabase.from("user_settings").select("data").eq("user_id",user.id).eq("realm","user").maybeSingle();
 return NextResponse.json({settings:{...defaults,...(data?.data??{})},email:user.email??null});
}
export async function PATCH(request:Request){
 const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const body=await request.json(); const data={...defaults,...body};
 const {error}=await supabase.from("user_settings").upsert({user_id:user.id,realm:"user",data,updated_at:new Date().toISOString()},{onConflict:"user_id,realm"});
 if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({settings:data});
}