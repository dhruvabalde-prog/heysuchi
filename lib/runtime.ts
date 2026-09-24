export type TaskStatus="queued"|"working"|"needs_you"|"verified"|"blocked"|"done";
export type MissionTask={id:string;missionId:string;title:string;status:TaskStatus;dependsOn:string[];artifactIds:string[]};
export type AgentRequest={missionId:string;taskId:string;capability:"reasoning"|"research"|"writing"|"browser"|"code"|"workspace";input:string};
export type AgentResult={summary:string;artifact?:string};
export interface AgentProvider{id:string;canHandle(capability:AgentRequest["capability"]):boolean;execute(request:AgentRequest):Promise<AgentResult>;}

export class AgentRouter{
 constructor(private providers:AgentProvider[]){}
 select(request:AgentRequest){return this.providers.find(p=>p.canHandle(request.capability));}
}

export class DeterministicAgent implements AgentProvider{
 id="suchi-core";
 canHandle(){return true;}
 async execute(request:AgentRequest){return{summary:"Prepared execution for task "+request.taskId};}
}

export class OpenAICompatibleAgent implements AgentProvider{
 id="env-model";
 constructor(private endpoint:string,private apiKey:string,private model:string){}
 canHandle(){return true;}
 async execute(request:AgentRequest){
  const response=await fetch(this.endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+this.apiKey},body:JSON.stringify({model:this.model,messages:[{role:"system",content:"You are HeySuchi. Execute the requested task concisely. Return a useful artifact when appropriate."},{role:"user",content:request.input}],temperature:0.2})});
  if(!response.ok) throw new Error("Agent provider request failed.");
  const data=await response.json();
  const content=data?.choices?.[0]?.message?.content;
  if(typeof content!=="string"||!content.trim()) throw new Error("Agent provider returned no usable output.");
  return {summary:content.trim().slice(0,500),artifact:content.trim()};
 }
}

export function createAgentRouter(){
 const endpoint=process.env.SUCHI_MODEL_ENDPOINT;
 const key=process.env.SUCHI_MODEL_API_KEY;
 const model=process.env.SUCHI_MODEL_NAME;
 if(endpoint&&key&&model)return new AgentRouter([new OpenAICompatibleAgent(endpoint,key,model),new DeterministicAgent()]);
 return new AgentRouter([new DeterministicAgent()]);
}
