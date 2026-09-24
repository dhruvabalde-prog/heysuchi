import { createSupabaseServerClient } from "./supabase/server";
import type { Mission } from "./types";

export async function createMission(input: { raw: string; title: string; domain: "Life" | "Work"; nextAction: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  let { data: workspace } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
  if (!workspace) {
    const created = await supabase.from("workspaces").insert({ name: "HeySuchi", owner_id: user.id }).select("id").single();
    if (created.error) throw created.error;
    workspace = created.data;
  }
  const result = await supabase.from("missions").insert({ workspace_id: workspace.id, owner_id: user.id, title: input.title, raw_input: input.raw, domain: input.domain, status: "working", progress: 8, next_action: input.nextAction }).select("*").single();
  if (result.error) throw result.error;
  return result.data;
}

export async function listMissions(): Promise<Mission[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("missions").select("*").eq("owner_id", user.id).order("updated_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []).map((m) => ({ id: m.id, title: m.title, raw: m.raw_input, domain: m.domain as Mission["domain"], status: m.status as Mission["status"], progress: m.progress, createdAt: m.created_at ?? m.updated_at ?? new Date().toISOString(), nextAction: m.next_action ?? "Suchi is working on it." }));
}
