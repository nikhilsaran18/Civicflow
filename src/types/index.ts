export type RightsDomain =
  | 'consumer'
  | 'housing_tenant'
  | 'workplace_labour'
  | 'healthcare_patient'
  | 'education'
  | 'banking_financial'
  | 'public_government_service'
  | 'municipal_utility'
  | 'welfare_entitlement'
  | 'rti_information'
  | 'other_civic_legal';

export type CivicCategory = RightsDomain; // Alias for backwards compatibility

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
  | 'other';

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface ScopeResult {
  inCivicScope: boolean;
  confidence: number;
  reason: string;
  isMedicalDiagnosisAttempt?: boolean;
}

export interface ClassificationAlternative {
  domain: RightsDomain;
  confidence: number;
}

export interface CivicClassification {
  inScope: boolean;
  domain: RightsDomain;
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

export interface CaseContext {
  organisationType?: string;
  institutionType?: string;
  amountRange?: string;
  serviceType?: string;
  governmentOrPrivate?: string;
  previousComplaintMade?: boolean;
  responseReceived?: boolean;
  evidenceAvailable?: boolean;
}

export interface CivicQuestionOption {
  value: string;
  label: string;
  nextQuestionId?: string;
  signalMultiplier?: number;
  evidenceProvided?: string[];
  evidenceMissing?: string[];
}

export interface CivicQuestion {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multiple' | 'yesno' | 'text' | 'number';
  options?: CivicQuestionOption[];
  required?: boolean;
  dependsOn?: {
    questionId: string;
    value: string | string[];
  };
}

export interface EvidenceRequirement {
  id: string;
  title: string;
  description: string;
  weight: number;
  isRequired: boolean;
  category: RightsDomain;
}

export interface WorkflowRule {
  id: string;
  condition: (answers: Record<string, any>) => boolean;
  priorityAdjustment: number;
  reasoningSignal: {
    type: 'positive' | 'negative' | 'warning' | 'info';
    text: string;
  };
  recommendedNextAction?: string;
}

export interface ActionStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'not_started' | 'current' | 'completed';
  estimatedDays?: string;
  templateAvailable?: boolean;
}

export interface ReasoningItem {
  id: string;
  type: 'positive' | 'negative' | 'warning' | 'info';
  text: string;
}

export interface CaseAnalysis {
  category: RightsDomain;
  domain: RightsDomain;
  issuePattern: IssuePattern;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  readinessScore: number;
  strengths: string[];
  missingItems: string[];
  nextBestAction: string;
  actionPlan: ActionStep[];
  reasoning: ReasoningItem[];
  pathwayStage: string;
  isFallbackWorkflow?: boolean;
}

export interface CivicCase {
  id: string;
  title: string;
  category: RightsDomain;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed';
  userDescription?: string;
  answers: Record<string, any>;
  analysis: CaseAnalysis;
  completedSteps: string[];
  evidenceChecked: Record<string, boolean>;
  classification?: CivicClassification;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: 'en' | 'ta' | 'hi';
  isDemo?: boolean;
}

export interface CivicWorkflow {
  id: string;
  category: RightsDomain;
  title: string;
  description: string;
  questions: CivicQuestion[];
  evidenceItems: EvidenceRequirement[];
  rules: WorkflowRule[];
  actionSteps: ActionStep[];
  sourceLabel?: string;
  sourceUrl?: string;
  lastVerified?: string;
  isFallbackWorkflow?: boolean;
}

export interface RightsKnowledgePack {
  domain: RightsDomain;
  title: string;
  description: string;
  supportedPatterns: IssuePattern[];
  questions: CivicQuestion[];
  evidenceTypes: EvidenceRequirement[];
  rules: WorkflowRule[];
  actionSteps: ActionStep[];
  sourceLabel?: string;
  sourceUrl?: string;
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
