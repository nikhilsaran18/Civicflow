import { CivicCategory, ClassificationResult } from '../types';
import { classifyCivicCase } from './hierarchicalClassifier';

/**
 * Legacy classifier wrapper delegating to 3-stage Hierarchical Case Understanding Pipeline
 */
export function classifyIssue(text: string): ClassificationResult {
  const result = classifyCivicCase(text);

  const mappedAlternatives = result.alternatives.map(a => ({
    category: a.domain as CivicCategory,
    confidence: Math.round(a.confidence * 100)
  }));

  return {
    category: result.domain as CivicCategory,
    confidence: Math.round(result.domainConfidence * 100),
    alternatives: mappedAlternatives,
    matchedSignals: result.matchedSignals
  };
}
