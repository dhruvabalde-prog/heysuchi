export type DecisionRequirement = { required: boolean; question?: string; options?: string[] };

const SIDE_EFFECTS = /\b(buy|purchase|pay|book|reserve|send|email|message|publish|post|delete|cancel|submit|hire|invite|transfer)\b/i;

export function needsApproval(text: string): DecisionRequirement {
  if (!SIDE_EFFECTS.test(text)) return { required: false };
  return { required: true, question: "This action creates an external side effect. Should Suchi proceed?", options: ["Proceed", "Not now"] };
}
