import OpenAI from 'openai';
import { AIProvider, ExecutionContext, ExecutionResult } from './provider';

// Initialize with a dummy key or expect it from env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const systemPrompt = `You are Suchi, an AI operating system. 
Your goal is to understand human intent, plan the work, and return execution results.
You can optionally output a JSON block wrapped in <decision>...</decision> if you need the user to make a choice.
Format: <decision>{"question": "...", "options": ["A", "B"]}</decision>
You can optionally output an artifact wrapped in <artifact>...</artifact>.
Format: <artifact>{"title": "...", "content": "..."}</artifact>
Otherwise, just return a short, concise update.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...context.history.map(msg => ({
        role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user' as const,
        content: msg.content
      }))
    ];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });

      const text = response.choices[0]?.message?.content || '';
      return this.parseResponse(text);
    } catch (error) {
      console.error('OpenAI execute error:', error);
      return { text: 'Suchi encountered an issue while communicating with OpenAI.' };
    }
  }

  private parseResponse(text: string): ExecutionResult {
    let result: ExecutionResult = { text };

    const decisionMatch = text.match(/<decision>([\s\S]*?)<\/decision>/);
    if (decisionMatch) {
      try {
        result.decisionRequired = JSON.parse(decisionMatch[1]);
        result.text = result.text.replace(decisionMatch[0], '').trim();
      } catch (e) {
        console.error('Failed to parse decision JSON');
      }
    }

    const artifactMatch = text.match(/<artifact>([\s\S]*?)<\/artifact>/);
    if (artifactMatch) {
      try {
        result.artifact = JSON.parse(artifactMatch[1]);
        result.text = result.text.replace(artifactMatch[0], '').trim();
      } catch (e) {
        console.error('Failed to parse artifact JSON');
      }
    }

    return result;
  }
}
