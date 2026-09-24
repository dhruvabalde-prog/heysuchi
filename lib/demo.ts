import type { Mission } from "./types";

export const seedMissions: Mission[] = [
  { id:"build-heysuchi", title:"Build HeySuchi", raw:"Build the first working version of HeySuchi.", domain:"Work", status:"working", progress:42, createdAt:"Today", nextAction:"Connect the mission engine to real persistent state." },
  { id:"family-weekend", title:"Plan family weekend", raw:"Plan a relaxed family weekend.", domain:"Life", status:"needs_you", progress:72, createdAt:"Yesterday", nextAction:"Choose between the three shortlisted plans." },
];
