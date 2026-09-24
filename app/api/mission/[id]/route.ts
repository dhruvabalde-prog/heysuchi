import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: mission, error } = await supabase.from("missions").select("id,title,owner_id").eq("id", id).eq("owner_id", user.id).single();
  if (error || !mission) return NextResponse.json({ error: "Mission not found." }, { status: 404 });
  const [taskResult, artifactResult, decisionResult] = await Promise.all([
    supabase.from("mission_tasks").select("id,title,status,position").eq("mission_id", id).order("position"),
    supabase.from("mission_artifacts").select("id,name,title,summary,content").eq("mission_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("mission_decisions").select("id,question,options,status,answer,created_at,answered_at").eq("mission_id", id).order("created_at", { ascending: false }),
  ]);
  if (taskResult.error || artifactResult.error || decisionResult.error) return NextResponse.json({ error: "Could not load mission details." }, { status: 500 });
  return NextResponse.json({ tasks: taskResult.data ?? [], artifact: artifactResult.data ?? null, decisions: decisionResult.data ?? [] });
}
