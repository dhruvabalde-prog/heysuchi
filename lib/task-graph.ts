export type PlannedTask={title:string;status:"queued"|"done";dependsOn:string[];capability:"reasoning"|"research"|"writing"|"browser"|"code"|"workspace"};

export function inferCapability(title:string): PlannedTask["capability"] {
  if(/research|find|compare|source|investigat/i.test(title)) return "research";
  if(/email|message|draft|write|reply|invite/i.test(title)) return "writing";
  if(/browser|website|book|reserve|publish|submit/i.test(title)) return "browser";
  if(/code|build|implement|fix|develop/i.test(title)) return "code";
  if(/workspace|sheet|document|calendar/i.test(title)) return "workspace";
  return "reasoning";
}

export function planMission(raw:string):PlannedTask[] {
  const outcome=raw.trim();
  const lower=outcome.toLowerCase();
  const research=/research|compare|find|plan|learn|analy[sz]e|investigat/.test(lower);
  const communication=/email|message|send|contact|reply|invite/.test(lower);
  const first=research?"Gather what is needed":communication?"Draft the communication":"Prepare the first useful output";
  const tasks=[
    {title:"Clarify the outcome",status:"done" as const,dependsOn:[]},
    {title:first,status:"queued" as const,dependsOn:["0"]},
    {title:"Produce the result",status:"queued" as const,dependsOn:["1"]},
    {title:"Verify the result",status:"queued" as const,dependsOn:["2"]},
    {title:"Deliver the completed result",status:"queued" as const,dependsOn:["3"]}
  ];
  return tasks.map(t=>({...t,capability:inferCapability(t.title)}));
}
