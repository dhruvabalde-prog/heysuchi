import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(){
 try{const supabase=await createSupabaseServerClient();const {data,error}=await supabase.from("missions").select("id").limit(1);if(error)return NextResponse.json({ok:false,service:"supabase",error:error.message},{status:503});return NextResponse.json({ok:true,service:"heysuchi",supabase:"connected",checkedAt:new Date().toISOString(),sampleCount:data?.length??0});}
 catch(error){return NextResponse.json({ok:false,error:"Health check failed."},{status:503});}
}
