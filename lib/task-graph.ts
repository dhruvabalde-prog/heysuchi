import type { MissionTask } from "./runtime";

export type PlannedTask = Omit<MissionTask, "id" | "missionId" | "artifactIds"> & { id?: string };

export function planMission(raw: string): PlannedTask[] {
  const tasks: PlannedTask[] = [
    { title: "Clarify the outcome", status: "done", dependsOn: [] },
    { title: "Research and gather what is needed", status: "queued", dependsOn: [] },
    { title: "Produce the first useful output", status: "queued", dependsOn: [] },
    { title: "Verify the result", status: "queued", dependsOn: [] },
    { title: "Deliver the completed result", status: "queued", dependsOn: [] },
  ];
  for (let i = 1; i < tasks.length; i++) tasks[i].dependsOn = [String(i - 1)];
  return tasks;
}
