export type MissionStatus = "planning" | "working" | "needs_you" | "completed";
export type Mission = { id:string; title:string; raw:string; domain:"Life"|"Work"; status:MissionStatus; progress:number; createdAt:string; nextAction:string; };
