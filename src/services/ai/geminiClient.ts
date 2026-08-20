export interface GeminiConfig {
  apiKey?: string;
  model?: string;
}

export class GeminiClient {
  private apiKey: string;
  private model: string;

  constructor(config?: GeminiConfig) {
    this.apiKey =
      config?.apiKey ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
      '';
    this.model = config?.model || 'gemini-2.5-flash';
  }

  public hasKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  public async generateJSON<T>(systemInstruction: string, userPrompt: string): Promise<T | null> {
    if (!this.hasKey()) {
      return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn('Gemini API request failed:', response.statusText);
        return null;
      }

      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) return null;

      // Clean JSON string if wrapped in markdown codeblock
      const cleanJson = textResponse.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (err) {
      console.warn('Error calling Gemini API:', err);
      return null;
    }
  }
}

export const defaultGeminiClient = new GeminiClient();
