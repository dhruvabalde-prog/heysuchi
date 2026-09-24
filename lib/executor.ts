import { AgentRouter, type AgentProvider, type AgentRequest } from "./runtime";

export class MissionExecutor {
 constructor(private router:AgentRouter){}
 async run(request:AgentRequest){
  const provider=this.router.select(request);
  if(!provider)return{status:"blocked" as const,summary:"No agent is connected for this capability."};
  try{
   const result=await provider.execute(request);
   return{status:"verified" as const,summary:result.summary,artifact:result.artifact};
  }catch(error){
   return{status:"blocked" as const,summary:error instanceof Error?error.message:"Agent execution failed."};
  }
}
}
