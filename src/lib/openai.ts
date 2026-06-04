import OpenAI from 'openai';

let systemClient: OpenAI | null = null;

export function getOpenAIClient(apiKey?: string): OpenAI {
  if (apiKey) {
    return new OpenAI({ apiKey });
  }

  if (!systemClient) {
    systemClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return systemClient;
}

export async function validateOpenAIKey(key: string): Promise<boolean> {
  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.models.list();
    return !!response.data;
  } catch {
    return false;
  }
}
