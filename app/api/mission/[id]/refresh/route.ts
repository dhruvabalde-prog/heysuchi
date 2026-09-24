import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:mission,error}=await supabase.from("missions").select("*").eq("id",id).eq("owner_id",user.id).single();
 if(error||!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 return NextResponse.json({mission},{headers:{"Cache-Control":"no-store"}});
}
