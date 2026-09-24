import { AgentRouter, type AgentRequest } from "./runtime";

export class MissionExecutor{
 constructor(private router:AgentRouter){}
 async run(request:AgentRequest){
  const providers=this.router.all(request);
  if(!providers.length)return{status:"blocked" as const,summary:"No agent is connected for this capability."};
  let current=request.input;
  let lastSummary=""; let lastArtifact:string|undefined; const used:string[]=[];
  for(const provider of providers.slice(0,3)){
   try{
    const result=await provider.execute({...request,input:current,handoff:lastArtifact});
    used.push(provider.id); lastSummary=result.summary; lastArtifact=result.artifact??lastArtifact;
    current=result.handoff??result.artifact??result.summary;
    if(provider.id==="suchi-core")break;
   }catch(error){
    const message=error instanceof Error?error.message:"Agent execution failed.";
    if(message.includes("Sensitive data detected"))return{status:"blocked" as const,summary:message,providers:used};
   }
  }
  return lastArtifact?{status:"verified" as const,summary:lastSummary,artifact:lastArtifact,providers:used}:{status:"blocked" as const,summary:lastSummary||"Agent execution failed.",providers:used};
 }
}