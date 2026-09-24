import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:mission}=await supabase.from("missions").select("id").eq("id",id).eq("owner_id",user.id).single();
 if(!mission)return NextResponse.json({error:"Mission not found."},{status:404});
 const {data,error}=await supabase.from("mission_artifacts").select("name,content").eq("mission_id",id).order("created_at",{ascending:false}).limit(1).maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:500});
 if(!data)return NextResponse.json({error:"Artifact not found."},{status:404});
 const filename=(data.name||"mission.md").replace(/[^a-zA-Z0-9._-]/g,"-");
 return new NextResponse(data.content,{headers:{"Content-Type":"text/markdown; charset=utf-8","Content-Disposition":`attachment; filename="${filename}"`,"Cache-Control":"private, no-store"}});
}
