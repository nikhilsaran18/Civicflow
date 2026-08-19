import { IssuePattern } from '../types';
import { PATTERN_VOCABULARIES } from '../data/classifierTraining';

export interface PatternClassificationResult {
  pattern: IssuePattern;
  confidence: number;
  matchedKeywords: string[];
}

export function classifyPattern(text: string): PatternClassificationResult {
  const cleanText = text.toLowerCase();

  const patternScores: Record<IssuePattern, { score: number; keywords: string[] }> = {
    service_denied: { score: 0, keywords: [] },
    service_not_provided: { score: 0, keywords: [] },
    delay_no_response: { score: 0, keywords: [] },
    rejected: { score: 0, keywords: [] },
    financial_dispute: { score: 0, keywords: [] },
    incorrect_charge: { score: 0, keywords: [] },
    quality_defect: { score: 0, keywords: [] },
    document_problem: { score: 0, keywords: [] },
    information_request: { score: 0, keywords: [] },
    eligibility_problem: { score: 0, keywords: [] },
    unfair_treatment: { score: 0, keywords: [] },
    other: { score: 0, keywords: [] },
  };

  PATTERN_VOCABULARIES.forEach(p => {
    p.keywords.forEach(kw => {
      if (cleanText.includes(kw)) {
        patternScores[p.pattern].score += 2.0;
        patternScores[p.pattern].keywords.push(kw);
      }
    });

    p.phrases.forEach(phrase => {
      if (cleanText.includes(phrase)) {
        patternScores[p.pattern].score += 4.0;
        patternScores[p.pattern].keywords.push(phrase);
      }
    });
  });

  const sorted = (Object.keys(patternScores) as IssuePattern[])
    .map(p => ({ pattern: p, score: patternScores[p].score, keywords: patternScores[p].keywords }))
    .sort((a, b) => b.score - a.score);

  const top = sorted[0];

  if (!top || top.score === 0) {
    return {
      pattern: 'other',
      confidence: 0.5,
      matchedKeywords: []
    };
  }

  return {
    pattern: top.pattern,
    confidence: Math.min(0.95, 0.5 + top.score * 0.1),
    matchedKeywords: top.keywords
  };
}
