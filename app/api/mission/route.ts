import { NextResponse } from "next/server";
import { createMission, listMissions, saveMissionPlan } from "../../../lib/mission-store";
import { planMission } from "../../../lib/task-graph";
import { createMissionBrief } from "../../../lib/mission-artifact";

export async function GET() {
  try { return NextResponse.json({ missions: await listMissions() }); }
  catch (error) { console.error("mission list failed", error); return NextResponse.json({ missions: [] }); }
}

export async function POST(request: Request) {
  const body = await request.json();
  const raw = String(body.raw ?? "").trim();
  if (!raw) return NextResponse.json({ error: "Tell Suchi what outcome you want." }, { status: 400 });
  const words = raw.replace(/[.!?]+$/, "").split(/\s+/);
  const title = words.slice(0, 9).join(" ") + (words.length > 9 ? "…" : "");
  const domain: "Life" | "Work" = /family|home|personal|health|trip|house/i.test(raw) ? "Life" : "Work";
  const nextAction = "Suchi is turning your outcome into an execution plan.";
  const tasks = planMission(raw);
  try {
    const mission = await createMission({ raw, title, domain, nextAction });
    if (!mission) return NextResponse.json({ error: "Sign in to start a mission." }, { status: 401 });
    const artifact = createMissionBrief({ id: mission.id, title: mission.title, raw: mission.raw_input, domain: mission.domain });
    await saveMissionPlan(mission.id, tasks, artifact);
    return NextResponse.json({ mission: { id: mission.id, title: mission.title, raw: mission.raw_input, domain: mission.domain, status: mission.status, progress: mission.progress, nextAction: mission.next_action }, tasks, artifact });
  } catch (error) {
    console.error("mission persistence failed", error);
    return NextResponse.json({ error: "Suchi could not save this mission." }, { status: 500 });
  }
}
