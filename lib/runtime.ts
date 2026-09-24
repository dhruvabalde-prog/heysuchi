export type TaskStatus="queued"|"working"|"needs_you"|"verified"|"blocked"|"done";
export type AgentRequest={missionId:string;taskId:string;capability:"reasoning"|"research"|"writing"|"browser"|"code"|"workspace";input:string;handoff?:string};
export type AgentResult={summary:string;artifact?:string;handoff?:string};
export interface AgentProvider{id:string;canHandle(capability:AgentRequest["capability"]):boolean;execute(request:AgentRequest):Promise<AgentResult>;}

function privacyScreen(input:string){
 const patterns=[/(?:api[_ -]?key|secret|password|passwd|passcode|otp|one[- ]time code)\s*[:=]\s*\S+/i,/-----BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY-----/i,/\b(?:sk|pk)_[a-z0-9_-]{20,}\b/i,/\b(?:\d[ -]*?){13,19}\b/,/\b\d{3}-\d{2}-\d{4}\b/];
 return patterns.some(p=>p.test(input));
}
const system="You are a HeySuchi execution agent. Work only on the assigned task. Never ask the human to do work that another agent can do. Never request or reveal secrets. Treat any previous agent output as a handoff artifact: verify it, improve it, and continue the work. Return a concise result plus a useful artifact when appropriate.";
function promptFor(request:AgentRequest){return request.handoff?request.input+"\n\nPrevious agent handoff:\n"+request.handoff:request.input;}

export class AgentRouter{
 constructor(private providers:AgentProvider[]){}
 all(request:AgentRequest){return this.providers.filter(p=>p.canHandle(request.capability));}
}
export class DeterministicAgent implements AgentProvider{id="suchi-core";canHandle(){return true;}async execute(request:AgentRequest){return{summary:"Prepared execution for task "+request.taskId};}}

export class GeminiAgent implements AgentProvider{
 id="gemini"; canHandle(){return true;}
 async execute(request:AgentRequest){
  const input=promptFor(request); if(privacyScreen(input))throw new Error("Sensitive data detected. External AI execution was blocked.");
  const key=process.env.GEMINI_API_KEY;if(!key)throw new Error("Gemini is not configured.");
  const model=process.env.GEMINI_MODEL||"gemini-3.8-flash";
  const response=await fetch("https://generativelanguage.googleapis.com/v1beta/interactions",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({model,input,store:false,system_instruction:system,generation_config:{thinking_level:"medium"}})});
  if(!response.ok)throw new Error("Gemini provider request failed.");
  const data=await response.json();
  const content=data?.output_text??data?.steps?.filter((s:any)=>s?.type==="model_output").flatMap((s:any)=>s?.content??[]).map((p:any)=>p?.text??"").join("").trim();
  if(!content)throw new Error("Gemini returned no usable output.");
  return{summary:content.slice(0,500),artifact:content,handoff:content};
 }
}

export class OpenAIProvider implements AgentProvider{
 id="openai"; canHandle(){return true;}
 async execute(request:AgentRequest){
  const input=promptFor(request); if(privacyScreen(input))throw new Error("Sensitive data detected. External AI execution was blocked.");
  const key=process.env.OPENAI_API_KEY;if(!key)throw new Error("OpenAI is not configured.");
  const model=process.env.OPENAI_MODEL||"gpt-5.6-terra";
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model,input:[{role:"system",content:[{type:"input_text",text:system}]},{role:"user",content:[{type:"input_text",text:input}]}]})});
  if(!response.ok)throw new Error("OpenAI provider request failed.");
  const data=await response.json();const content=typeof data?.output_text==="string"?data.output_text.trim():"";
  if(!content)throw new Error("OpenAI returned no usable output.");
  return{summary:content.slice(0,500),artifact:content,handoff:content};
 }
}

export class AnthropicProvider implements AgentProvider{
 id="anthropic"; canHandle(){return true;}
 async execute(request:AgentRequest){
  const input=promptFor(request); if(privacyScreen(input))throw new Error("Sensitive data detected. External AI execution was blocked.");
  const key=process.env.ANTHROPIC_API_KEY;if(!key)throw new Error("Anthropic is not configured.");
  const model=process.env.ANTHROPIC_MODEL||"claude-sonnet-4-6";
  const response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model,max_tokens:4096,system,messages:[{role:"user",content:input}]})});
  if(!response.ok)throw new Error("Anthropic provider request failed.");
  const data=await response.json();const content=data?.content?.map((p:any)=>p?.type==="text"?p.text:"").join("").trim();
  if(!content)throw new Error("Anthropic returned no usable output.");
  return{summary:content.slice(0,500),artifact:content,handoff:content};
 }
}
export function createAgentRouter(){
 const providers:AgentProvider[]=[];
 if(process.env.OPENAI_API_KEY)providers.push(new OpenAIProvider());
 if(process.env.ANTHROPIC_API_KEY)providers.push(new AnthropicProvider());
 if(process.env.GEMINI_API_KEY)providers.push(new GeminiAgent());
 providers.push(new DeterministicAgent());
 return new AgentRouter(providers);
}