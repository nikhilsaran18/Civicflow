export * from './civicIntelligence';

export type PriorityLevel = 'low' | 'medium' | 'high';

export type IssuePattern =
  | 'service_denied'
  | 'service_not_provided'
  | 'delay_no_response'
  | 'rejected'
  | 'financial_dispute'
  | 'incorrect_charge'
  | 'quality_defect'
  | 'document_problem'
  | 'information_request'
  | 'eligibility_problem'
  | 'unfair_treatment'
  | 'harassment_misconduct'
  | 'regulatory_violation'
  | 'other';

export interface ScopeResult {
  inCivicScope: boolean;
  confidence: number;
  reason: string;
  isMedicalDiagnosisAttempt?: boolean;
}

export interface ClassificationAlternative {
  domain: import('./civicIntelligence').RightsDomain;
  confidence: number;
}

export interface CivicClassification {
  inScope: boolean;
  domain: import('./civicIntelligence').RightsDomain;
  pattern: IssuePattern;
  domainConfidence: number;
  patternConfidence: number;
  alternatives: ClassificationAlternative[];
  matchedSignals: string[];
  matchedNouns: string[];
  matchedVerbs: string[];
  explanation: string;
  scopeResult: ScopeResult;
  isFallbackWorkflow?: boolean;
}

export interface ClassificationResult {
  category: import('./civicIntelligence').RightsDomain;
  confidence: number;
  alternatives: { category: import('./civicIntelligence').RightsDomain; confidence: number }[];
  matchedSignals: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: 'en' | 'ta' | 'hi';
  isDemo?: boolean;
}

export interface RTIDraft {
  applicantName: string;
  applicantAddress: string;
  applicantPhone: string;
  publicAuthority: string;
  department: string;
  informationRequested: string;
  periodYears: string;
  isBPL: boolean;
  bplCardNumber?: string;
  preferredFormat: 'Inspection' | 'Hard Copies' | 'Digital / Email';
  createdDate: string;
}
