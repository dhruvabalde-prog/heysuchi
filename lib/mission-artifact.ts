export type MissionArtifact = {
  id: string;
  missionId: string;
  name: string;
  kind: "markdown" | "document" | "research" | "decision";
  title: string;
  summary: string;
  content: string;
  createdAt: string;
};

export function createMissionBrief(mission: { id: string; title: string; raw: string; domain: string }): MissionArtifact {
  return {
    id: crypto.randomUUID(),
    missionId: mission.id,
    name: "mission.md",
    kind: "markdown",
    title: `${mission.title} — Mission brief`,
    summary: "Detailed mission context, plan and decisions.",
    content: `# ${mission.title}\n\n## Outcome\n${mission.raw}\n\n## Domain\n${mission.domain}\n\n## Communication\nHeySuchi keeps the main experience concise. Detailed execution context belongs here.\n\n## Plan\nPlan will be generated from the mission outcome and refined as execution progresses.\n\n## Decisions\nNo decision required yet.\n`,
    createdAt: new Date().toISOString(),
  };
}
