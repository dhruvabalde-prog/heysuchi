export type EngineTask={id?:string;status:string;dependsOn?:string[];depends_on?:string[];position?:number;title?:string};

export function missionProgress(tasks:EngineTask[]) {
 const total=tasks.length; const completed=tasks.filter(t=>["done","verified"].includes(t.status)).length;
 return {total,completed,progress:total?Math.round(completed/total*100):0,complete:total>0&&completed===total};
}
export function readyTask(tasks:EngineTask[]):EngineTask|undefined {
 const done=new Set(tasks.filter(t=>["done","verified"].includes(t.status)).map(t=>t.id));
 return [...tasks].filter(t=>t.status==="queued").sort((a,b)=>(a.position??0)-(b.position??0)).find(t=>(t.dependsOn??t.depends_on??[]).every(id=>done.has(id)));
}
export function transitionTask(status:string,action:"start"|"verify"|"block"|"unblock"|"complete") {
 const allowed:Record<string,string[]>={start:["queued"],verify:["working"],block:["queued","working"],unblock:["blocked"],complete:["verified","working"]};
 if(!allowed[action].includes(status)) throw new Error("Invalid task transition");
 return action==="start"?"working":action==="verify"?"verified":action==="block"?"blocked":action==="unblock"?"queued":"done";
}
export function deriveMissionState(tasks:EngineTask[]) {
 const state=missionProgress(tasks);
 if(state.complete)return {status:"done",progress:100,nextAction:"Mission complete."};
 const blocked=tasks.find(t=>t.status==="blocked"); if(blocked)return {status:"blocked",progress:state.progress,nextAction:"Blocked: "+(blocked.title??"task")};
 const waiting=tasks.find(t=>t.status==="needs_you"); if(waiting)return {status:"needs_you",progress:state.progress,nextAction:"Waiting for your decision: "+(waiting.title??"task")};
 const working=tasks.find(t=>t.status==="working"); if(working)return {status:"working",progress:state.progress,nextAction:"Verify: "+(working.title??"task")};
 const next=readyTask(tasks); return {status:next?"queued":"blocked",progress:state.progress,nextAction:next?"Ready: "+(next.title??"task"):"No executable task is available."};
}
