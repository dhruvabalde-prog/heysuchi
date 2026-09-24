import crypto from "node:crypto";
import { getSupabaseAdmin } from "./supabase/admin";
import { requireIdentity } from "./auth";
import type { Mission } from "./types";

export async function createMission(input: { raw: string; title: string; domain: "Life" | "Work"; nextAction: string }) {
  const identity = await requireIdentity();
  if (!identity) return null;
  const supabase = getSupabaseAdmin();
  let { data: workspace } = await supabase.from("workspaces").select("id").eq("owner_id", identity.id).limit(1).maybeSingle();
  if (!workspace) {
    const created = await supabase.from("workspaces").insert({ name: "HeySuchi", owner_id: identity.id }).select("id").single();
    if (created.error) throw created.error;
    workspace = created.data;
  }
  const result = await supabase.from("missions").insert({
    workspace_id: workspace.id, owner_id: identity.id, title: input.title, raw_input: input.raw,
    domain: input.domain, status: "queued", progress: 0, next_action: input.nextAction
  }).select("*").single();
  if (result.error) throw result.error;
  return result.data;
}

export async function saveMissionPlan(missionId: string, tasks: Array<{ title: string; status: string; dependsOn: string[] }>, artifact: { name: string; kind: string; title: string; summary: string; content: string }) {
  const identity = await requireIdentity();
  if (!identity) return false;
  const supabase = getSupabaseAdmin();
  const { data: mission } = await supabase.from("missions").select("id").eq("id", missionId).eq("owner_id", identity.id).single();
  if (!mission) return false;
  const ids = tasks.map(() => crypto.randomUUID());
  const rows = tasks.map((task, index) => ({
    id: ids[index], mission_id: missionId, title: task.title,
    status: task.status === "done" ? "done" : "queued",
    depends_on: task.dependsOn.map(key => ids[Number(key)]).filter(Boolean), position: index
  }));
  const taskResult = await supabase.from("mission_tasks").insert(rows);
  if (taskResult.error) throw taskResult.error;
  const artifactResult = await supabase.from("mission_artifacts").insert({
    mission_id: missionId, name: artifact.name, kind: artifact.kind, title: artifact.title,
    summary: artifact.summary, content: artifact.content
  }).select("id").single();
  if (artifactResult.error) throw artifactResult.error;
  const completed = rows.filter(row => row.status === "done").length;
  const progress = rows.length ? Math.round((completed / rows.length) * 100) : 0;
  const status = rows.length && completed === rows.length ? "done" : "working";
  const nextAction = rows.find(row => row.status !== "done")?.title ?? "Mission complete.";
  const { error: missionUpdateError } = await supabase.from("missions").update({ progress, status, next_action: nextAction }).eq("id", missionId).eq("owner_id", identity.id);
  if (missionUpdateError) throw missionUpdateError;
  return true;
}

export async function listMissions(): Promise<Mission[]> {
  const identity = await requireIdentity();
  if (!identity) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("missions").select("*").eq("owner_id", identity.id).order("updated_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []).map(m => ({
    id: m.id, title: m.title, raw: m.raw_input, domain: m.domain as Mission["domain"],
    status: m.status as Mission["status"], progress: m.progress,
    createdAt: m.created_at ?? m.updated_at ?? new Date().toISOString(),
    nextAction: m.next_action ?? "Suchi is working on it."
  }));
}
