import { CivicClassification } from '../types';
import { classifyScope } from './scopeClassifier';
import { classifyDomain } from './domainClassifier';
import { classifyPattern } from './patternClassifier';

/**
 * Main Hierarchical Case Understanding Pipeline
 * Runs Stage A (Scope), Stage B (Rights Domain), Stage C (Issue Pattern)
 */
export function classifyCivicCase(text: string): CivicClassification {
  const scopeResult = classifyScope(text);

  // If Stage A determines out-of-scope (e.g. medical treatment request "what medicine for fever?"), halt!
  if (!scopeResult.inCivicScope) {
    return {
      inScope: false,
      domain: 'other_civic_legal',
      pattern: 'other',
      domainConfidence: 0,
      patternConfidence: 0,
      alternatives: [],
      matchedSignals: [],
      matchedNouns: [],
      matchedVerbs: [],
      explanation: scopeResult.reason,
      scopeResult
    };
  }

  // Stage B: Rights Domain
  const domainResult = classifyDomain(text);

  // Stage C: Universal Issue Pattern
  const patternResult = classifyPattern(text);

  // Explanation construction
  const explanation = `${domainResult.explanation} Situation pattern: ${patternResult.pattern.replace(/_/g, ' ')}.`;

  return {
    inScope: true,
    domain: domainResult.domain,
    pattern: patternResult.pattern,
    domainConfidence: domainResult.confidence,
    patternConfidence: patternResult.confidence,
    alternatives: domainResult.alternatives,
    matchedSignals: domainResult.matchedSignals,
    matchedNouns: domainResult.matchedNouns,
    matchedVerbs: domainResult.matchedVerbs,
    explanation,
    scopeResult
  };
}
