import { defaultGeminiClient } from './ai/geminiClient';

export interface TranslationResult {
  originalText: string;
  simpleExplanation: string;
  keyTakeaways: string[];
}

export class TranslatorService {
  public static async explainSimply(bureaucraticText: string): Promise<TranslationResult> {
    const trimmed = bureaucraticText.trim();
    if (!trimmed) {
      return {
        originalText: '',
        simpleExplanation: 'No text provided to translate.',
        keyTakeaways: [],
      };
    }

    if (defaultGeminiClient.hasKey()) {
      const systemInstruction = `You are CivicFlow's Simple-Language Translator.
Your job is to translate intimidating legal, government, or bureaucratic text into clear, citizen-friendly language without altering the underlying legal or administrative meaning.`;
      const prompt = `Translate this bureaucratic text into simple language:
"${trimmed}"

Return JSON:
{
  "originalText": "${trimmed}",
  "simpleExplanation": "Plain language explanation",
  "keyTakeaways": ["Point 1", "Point 2"]
}`;

      const res = await defaultGeminiClient.generateJSON<TranslationResult>(systemInstruction, prompt);
      if (res) return res;
    }

    // Heuristic simple translator fallback
    let simpleExplanation = trimmed;
    const keyTakeaways: string[] = [];

    if (trimmed.includes('representation before the competent authority')) {
      simpleExplanation = 'You can send a written request to the specific government office responsible for this issue.';
      keyTakeaways.push('Write a formal request letter', 'Send it to the responsible government office');
    } else if (trimmed.includes('suo motu') || trimmed.includes('deficiency of service')) {
      simpleExplanation = 'The service provider failed to perform their expected duties properly as required by law.';
      keyTakeaways.push('You have a right to demand service completion or compensation');
    } else if (trimmed.includes('locus standi') || trimmed.includes('inter-alia')) {
      simpleExplanation = 'You have a direct legal interest or right to present this case to the authority.';
      keyTakeaways.push('You are eligible to file this complaint');
    } else {
      simpleExplanation = `In simple terms: ${trimmed.replace(/competent authority/gi, 'responsible government office').replace(/representation/gi, 'written request').replace(/intimated/gi, 'informed').replace(/forthwith/gi, 'immediately')}`;
      keyTakeaways.push('Read the steps carefully', 'Keep written records of all communications');
    }

    return {
      originalText: trimmed,
      simpleExplanation,
      keyTakeaways,
    };
  }
}
