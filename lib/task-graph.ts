export function planMission(raw: string) {
  return [
    { title: "Clarify the outcome", status: "done", dependsOn: [] as string[] },
    { title: "Research and gather what is needed", status: "queued", dependsOn: ["0"] },
    { title: "Produce the first useful output", status: "queued", dependsOn: ["1"] },
    { title: "Verify the result", status: "queued", dependsOn: ["2"] },
    { title: "Deliver the completed result", status: "queued", dependsOn: ["3"] }
  ];
}
