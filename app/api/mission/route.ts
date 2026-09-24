import { NextResponse } from "next/server";
import { createMissionBrief } from "../../../lib/mission-artifact";

export async function POST(request: Request) {
  const body = await request.json();
  const raw = String(body.raw ?? "").trim();
  if (!raw) return NextResponse.json({ error: "Tell Suchi what outcome you want." }, { status: 400 });

  const words = raw.replace(/[.!?]+$/, "").split(/\s+/);
  const mission = {
    id: crypto.randomUUID(),
    title: words.slice(0, 9).join(" ") + (words.length > 9 ? "…" : ""),
    raw,
    domain: /family|home|personal|health|trip|house/i.test(raw) ? "Life" : "Work",
    status: "working",
    progress: 8,
    createdAt: new Date().toISOString(),
    nextAction: "Suchi is turning your outcome into an execution plan.",
  };

  return NextResponse.json({ mission, artifact: createMissionBrief(mission) });
}
