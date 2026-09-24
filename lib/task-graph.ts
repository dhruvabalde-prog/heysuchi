export function planMission(raw: string) {
  const outcome = raw.trim().toLowerCase();
  const research = /research|compare|find|plan|learn|analy[sz]e/.test(outcome);
  const communication = /email|message|send|contact|reply|invite/.test(outcome);
  const first = research ? "Gather what is needed" : communication ? "Draft the communication" : "Prepare the first useful output";
  return [
    { title: "Clarify the outcome", status: "done", dependsOn: [] as string[] },
    { title: first, status: "queued", dependsOn: ["0"] },
    { title: "Produce the result", status: "queued", dependsOn: ["1"] },
    { title: "Verify the result", status: "queued", dependsOn: ["2"] },
    { title: "Deliver the completed result", status: "queued", dependsOn: ["3"] }
  ];
}
