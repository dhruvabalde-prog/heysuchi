import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, ExecutionContext, ExecutionResult } from './provider';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export class GeminiProvider implements AIProvider {
  name = 'Gemini';

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const systemPrompt = `You are Suchi, an AI operating system. 
Your goal is to understand human intent, plan the work, and return execution results.
You can optionally output a JSON block wrapped in <decision>...</decision> if you need the user to make a choice.
Format: <decision>{"question": "...", "options": ["A", "B"]}</decision>
You can optionally output an artifact wrapped in <artifact>...</artifact>.
Format: <artifact>{"title": "...", "content": "..."}</artifact>
Otherwise, just return a short, concise update.`;

    const chat = model.startChat({
      systemInstruction: systemPrompt,
      history: context.history.filter(m => m.role !== 'system').map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });

    try {
      // In a real app, we'd trigger on the latest input
      const latestMessage = context.history[context.history.length - 1];
      const result = await chat.sendMessage(latestMessage.content);
      const text = result.response.text();
      return this.parseResponse(text);
    } catch (error) {
      console.error('Gemini execute error:', error);
      return { text: 'Suchi encountered an issue while communicating with Gemini.' };
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
