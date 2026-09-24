export type TaskStatus="queued"|"working"|"needs_you"|"verified"|"blocked"|"done";
export type MissionTask={id:string;missionId:string;title:string;status:TaskStatus;dependsOn:string[];artifactIds:string[]};
export type AgentRequest={missionId:string;taskId:string;capability:"reasoning"|"research"|"writing"|"browser"|"code"|"workspace";input:string};
export type AgentResult={summary:string;artifact?:string};
export interface AgentProvider{id:string;canHandle(capability:AgentRequest["capability"]):boolean;execute(request:AgentRequest):Promise<AgentResult>;}
export class AgentRouter{constructor(private providers:AgentProvider[]){}select(request:AgentRequest){return this.providers.find(p=>p.canHandle(request.capability));}}
export class DeterministicAgent implements AgentProvider{id="suchi-core";canHandle(){return true;}async execute(request:AgentRequest){return{summary:"Prepared execution for task "+request.taskId};}}
