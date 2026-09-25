export interface ExecutionContext {
  missionId: string;
  originalInput: string;
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

export interface ExecutionResult {
  text: string;
  // If the agent needs a human decision, it will return this block
  decisionRequired?: {
    question: string;
    options: string[];
  };
  // If the agent generated an artifact (e.g. mission.md)
  artifact?: {
    title: string;
    content: string;
  };
}

export interface AIProvider {
  name: string;
  execute(context: ExecutionContext): Promise<ExecutionResult>;
}
