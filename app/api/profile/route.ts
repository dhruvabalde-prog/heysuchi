import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
export async function GET(){
 const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data,error}=await supabase.from("profiles").select("id,email,full_name,role,status").eq("id",user.id).maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({profile:data??{id:user.id,email:user.email}},{headers:{"Cache-Control":"private, no-store"}});
}
