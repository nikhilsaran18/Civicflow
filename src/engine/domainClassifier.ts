import { RightsDomain, ClassificationAlternative } from '../types';
import { DOMAIN_VOCABULARIES, DomainVocabulary } from '../data/classifierTraining';

export interface DomainClassificationResult {
  domain: RightsDomain;
  confidence: number;
  alternatives: ClassificationAlternative[];
  matchedNouns: string[];
  matchedVerbs: string[];
  matchedSignals: string[];
  explanation: string;
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

/**
 * Stage B — Rights Domain Classification with Negative Evidence Weighting
 */
export function classifyDomain(text: string): DomainClassificationResult {
  const cleanText = text.toLowerCase();
  const tokens = normalize(text);

  const domainScores: Record<RightsDomain, {
    score: number;
    nouns: string[];
    verbs: string[];
    phrases: string[];
  }> = {
    healthcare_patient: { score: 0, nouns: [], verbs: [], phrases: [] },
    consumer: { score: 0, nouns: [], verbs: [], phrases: [] },
    housing_tenant: { score: 0, nouns: [], verbs: [], phrases: [] },
    workplace_labour: { score: 0, nouns: [], verbs: [], phrases: [] },
    public_government_service: { score: 0, nouns: [], verbs: [], phrases: [] },
    municipal_utility: { score: 0, nouns: [], verbs: [], phrases: [] },
    rti_information: { score: 0, nouns: [], verbs: [], phrases: [] },
    education: { score: 0, nouns: [], verbs: [], phrases: [] },
    banking_financial: { score: 0, nouns: [], verbs: [], phrases: [] },
    welfare_entitlement: { score: 0, nouns: [], verbs: [], phrases: [] },
    police_legal_grievance: { score: 0, nouns: [], verbs: [], phrases: [] },
    power_electricity_utility: { score: 0, nouns: [], verbs: [], phrases: [] },
    environment_civic_hazard: { score: 0, nouns: [], verbs: [], phrases: [] },
    cyber_digital_fraud: { score: 0, nouns: [], verbs: [], phrases: [] },
    other_civic_legal: { score: 0, nouns: [], verbs: [], phrases: [] },
  };

  DOMAIN_VOCABULARIES.forEach(vocab => {
    const d = vocab.domain;
    if (!domainScores[d]) return;

    // 1. Noun / Entity Matching (Strongest weight: 3.5)
    vocab.nouns.forEach(noun => {
      if (tokens.includes(noun) || cleanText.includes(noun)) {
        domainScores[d].score += 3.5;
        if (!domainScores[d].nouns.includes(noun)) domainScores[d].nouns.push(noun);
      }
    });

    // 2. Verb / Action Matching (Weight: 2.0)
    vocab.verbs.forEach(verb => {
      if (tokens.includes(verb)) {
        domainScores[d].score += 2.0;
        if (!domainScores[d].verbs.includes(verb)) domainScores[d].verbs.push(verb);
      }
    });

    // 3. Multi-word Phrase Matching (Weight: 5.0)
    vocab.phrases.forEach(phrase => {
      if (cleanText.includes(phrase)) {
        domainScores[d].score += 5.0;
        if (!domainScores[d].phrases.includes(phrase)) domainScores[d].phrases.push(phrase);
      }
    });

    // 4. Example Sentence Similarity Boost (Weight: up to 6.0)
    vocab.examplePhrases.forEach(ex => {
      const exTokens = normalize(ex);
      const overlap = exTokens.filter(t => tokens.includes(t)).length;
      if (overlap >= 2) {
        domainScores[d].score += overlap * 1.5;
      }
    });

    // 5. Negative Evidence Weighting (Mandatory Penalty: -4.0 per negative match)
    vocab.negativeWords.forEach(neg => {
      if (cleanText.includes(neg)) {
        domainScores[d].score = Math.max(0, domainScores[d].score - 4.0);
      }
    });
  });

  // CRITICAL NEGATIVE SIGNAL OVERRIDES:
  // If Healthcare entities exist, penalize Consumer
  const healthcareEntitiesExist = ['doctor', 'physician', 'hospital', 'clinic', 'patient', 'treatment', 'medicine'].some(e => cleanText.includes(e));
  if (healthcareEntitiesExist) {
    domainScores['consumer'].score = Math.max(0, domainScores['consumer'].score - 10.0);
    domainScores['healthcare_patient'].score += 5.0;
  }

  // If Housing entities exist, penalize Consumer
  const tenantEntitiesExist = ['landlord', 'tenant', 'rent', 'lease', 'apartment', 'flat', 'deposit'].some(e => cleanText.includes(e));
  if (tenantEntitiesExist && !cleanText.includes('phone') && !cleanText.includes('laptop')) {
    domainScores['consumer'].score = Math.max(0, domainScores['consumer'].score - 8.0);
    domainScores['housing_tenant'].score += 5.0;
  }

  // If Police / FIR entities exist, boost police
  const policeEntitiesExist = ['police', 'fir', 'sho', 'sp office', 'police station'].some(e => cleanText.includes(e));
  if (policeEntitiesExist) {
    domainScores['police_legal_grievance'].score += 6.0;
    domainScores['consumer'].score = Math.max(0, domainScores['consumer'].score - 6.0);
  }

  // If Electricity / Power entities exist, boost electricity
  const electricityEntitiesExist = ['electricity', 'power cut', 'eb bill', 'meter reading', 'discom', 'transformer'].some(e => cleanText.includes(e));
  if (electricityEntitiesExist) {
    domainScores['power_electricity_utility'].score += 6.0;
  }

  // If Cyber / Online fraud entities exist, boost cyber
  const cyberEntitiesExist = ['cyber', 'phishing', 'scam', 'otp fraud', 'hacked', 'online fraud'].some(e => cleanText.includes(e));
  if (cyberEntitiesExist) {
    domainScores['cyber_digital_fraud'].score += 6.0;
  }

  // Sort scores
  const sorted = (Object.keys(domainScores) as RightsDomain[])
    .map(d => ({
      domain: d,
      score: domainScores[d].score,
      nouns: domainScores[d].nouns,
      verbs: domainScores[d].verbs,
      phrases: domainScores[d].phrases
    }))
    .sort((a, b) => b.score - a.score);

  const top = sorted[0];
  const second = sorted[1];

  let totalTopScore = sorted.reduce((sum, item) => sum + item.score, 0);

  if (totalTopScore === 0 || top.score < 2.0) {
    return {
      domain: 'other_civic_legal',
      confidence: 0.35,
      alternatives: [
        { domain: 'consumer', confidence: 0.2 },
        { domain: 'public_government_service', confidence: 0.2 },
      ],
      matchedNouns: [],
      matchedVerbs: [],
      matchedSignals: [],
      explanation: 'Low confidence in specific rights domain. Offering manual area selection.'
    };
  }

  // Normalized confidence percentage (0.0 to 0.98)
  const rawConfidence = top.score / (top.score + (second ? second.score : 0) + 1.0);
  const confidence = Math.min(0.96, Math.max(0.40, Math.round(rawConfidence * 100) / 100));

  const alternatives: ClassificationAlternative[] = sorted.slice(1, 4)
    .filter(item => item.score > 0)
    .map(item => ({
      domain: item.domain,
      confidence: Math.round((item.score / (top.score + item.score + 1.0)) * 100) / 100
    }));

  const allMatchedSignals = Array.from(new Set([...top.nouns, ...top.verbs, ...top.phrases]));

  const explanation = `Detected domain context signals: ${allMatchedSignals.join(', ') || 'general rights navigation'}.`;

  return {
    domain: top.domain,
    confidence,
    alternatives,
    matchedNouns: top.nouns,
    matchedVerbs: top.verbs,
    matchedSignals: allMatchedSignals,
    explanation
  };
}
