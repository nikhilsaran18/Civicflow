import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env is loaded inside module execution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class GeminiService {
  getApiKey() {
    return (process.env.GEMINI_API_KEY || '').trim();
  }

  getModel() {
    return (process.env.GEMINI_MODEL || 'gemini-3.7-flash').trim();
  }

  isConfigured() {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    return Boolean(
      apiKey &&
      apiKey.length > 0 &&
      model &&
      model.length > 0
    );
  }

  getAIClient() {
    if (!this.isConfigured()) return null;
    return new GoogleGenAI({ apiKey: this.getApiKey() });
  }

  async generateJSON(systemInstruction, userPrompt) {
    if (!this.isConfigured()) {
      return { success: false, errorCode: 'GEMINI_NOT_CONFIGURED', error: 'Gemini API key is not configured in .env' };
    }

    const ai = this.getAIClient();
    const modelName = this.getModel();

    try {
      const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;
      const response = await ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        console.warn('Gemini returned empty response text.');
        return { success: false, errorCode: 'GEMINI_EMPTY_RESPONSE', error: 'Empty response received from Gemini model' };
      }

      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      return { success: true, data: parsed };
    } catch (err) {
      console.error(`Gemini API Error (model: ${modelName}):`, err?.message || err);
      const errMsg = err?.message || String(err);
      const isModelNotFound = errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('model');
      return {
        success: false,
        errorCode: isModelNotFound ? 'GEMINI_MODEL_NOT_FOUND' : 'GEMINI_API_ERROR',
        error: errMsg,
      };
    }
  }
}

export const geminiService = new GeminiService();

