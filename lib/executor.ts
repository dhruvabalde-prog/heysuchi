import { AgentRouter, type AgentRequest } from "./runtime";

export class MissionExecutor {
 constructor(private router:AgentRouter){}
 async run(request:AgentRequest){
  const providers=this.router.all(request);
  if(!providers.length)return{status:"blocked" as const,summary:"No agent is connected for this capability."};
  let lastError="Agent execution failed.";
  for(const provider of providers){
   try{
    const result=await provider.execute(request);
    return{status:"verified" as const,summary:result.summary,artifact:result.artifact,provider:provider.id};
   }catch(error){
    lastError=error instanceof Error?error.message:"Agent execution failed.";
    if(lastError.includes("Sensitive data detected")) return {status:"blocked" as const,summary:lastError};
   }
  }
  return{status:"blocked" as const,summary:lastError};
 }
}
