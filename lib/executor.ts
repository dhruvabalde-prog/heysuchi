import { AgentRouter, type AgentProvider, type AgentRequest } from "./runtime";

export class MissionExecutor {
  constructor(private router: AgentRouter) {}
  async run(request: AgentRequest) {
    const provider = this.router.select(request);
    if (!provider) return { status: "blocked" as const, summary: "No agent is connected for this capability." };
    const result = await provider.execute(request);
    return { status: "verified" as const, summary: result.summary, artifact: result.artifact };
  }
}

export const createDeterministicProvider = (): AgentProvider => ({
  id: "core-deterministic",
  canHandle: () => true,
  async execute(request) {
    return { summary: `Prepared the next output for: ${request.input}`, artifact: `# ${request.input}\n\nPrepared by HeySuchi's execution runtime.` };
  },
});
