export type TaskStatus = "queued" | "working" | "needs_you" | "verified" | "blocked" | "done";

export type MissionTask = {
  id: string;
  missionId: string;
  title: string;
  status: TaskStatus;
  dependsOn: string[];
  artifactIds: string[];
};

export type AgentRequest = {
  missionId: string;
  taskId: string;
  capability: "reasoning" | "research" | "writing" | "browser" | "code" | "workspace";
  input: string;
};

export interface AgentProvider {
  id: string;
  canHandle(capability: AgentRequest["capability"]): boolean;
  execute(request: AgentRequest): Promise<{ summary: string; artifact?: string }>;
}

export class AgentRouter {
  constructor(private providers: AgentProvider[]) {}

  select(request: AgentRequest) {
    return this.providers.find(provider => provider.canHandle(request.capability));
  }
}
