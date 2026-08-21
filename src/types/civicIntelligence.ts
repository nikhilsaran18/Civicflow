export type QuestionType =
  | 'text'
  | 'textarea'
  | 'yes_no'
  | 'single_select'
  | 'multi_select'
  | 'date'
  | 'number'
  | 'location';

export interface ClarificationQuestion {
  id: string;
  question: string;
  reason: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

export interface ConfirmedFact {
  id: string;
  fact: string;
  source: 'initial_statement' | 'clarification_answer';
}

export interface FactItem {
  label: string;
  value: string;
}

export interface CaseUnderstanding {
  situationSummary: string;
  summary?: string; // alias for backwards compatibility
  confirmedFacts: ConfirmedFact[];
  knownFacts?: FactItem[];
  missingCriticalInformation: string[];
  missingInformation?: string[];
  desiredOutcomeKnown?: boolean;
  desiredOutcome?: string;
  inferredGoal?: string;
  goalNeedsClarification?: boolean;
  aiCaseDescription: string;
  jurisdictionNeeded?: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  confidence: 'low' | 'medium' | 'high';
  readyForSolution: boolean;
  readinessReason: string;
}

export interface OptionPath {
  id?: string;
  title: string;
  description?: string;
  explanation?: string;
  considerations?: string[];
  sourceIds?: string[];
}

export interface RecommendedStep {
  title: string;
  explanation: string;
}

export interface ActionPlanStep {
  order: number;
  title: string;
  description: string;
  whyItMatters?: string;
  evidenceNeeded?: string[];
  authority?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  deadline?: string;
}

export interface CivicSource {
  id?: string;
  title: string;
  authority?: string;
  url: string;
  relevance: string;
  lastChecked?: string;
}

export interface SuggestedDocument {
  type: 'complaint' | 'rti' | 'request' | 'appeal' | 'representation' | 'email' | string;
  title: string;
  reason: string;
}

export interface ResponsibleAuthority {
  name?: string;
  type?: string;
  relevance?: string;
  reason?: string;
  actionableInfo?: string;
  officialLink?: string;
  confidence?: 'low' | 'medium' | 'high';
}

export interface CivicSolution {
  situationSummary: string;
  userGoal: string;
  explanation?: string;
  whatCivicFlowFound?: string;
  options: OptionPath[];
  possibleOptions?: OptionPath[];
  recommendedNextStep: RecommendedStep;
  actionPlan: ActionPlanStep[];
  sources: CivicSource[];
  suggestedDocuments: SuggestedDocument[];
  responsibleAuthority?: ResponsibleAuthority;
  likelyAuthority?: ResponsibleAuthority;
  relevantEvidence?: string[];
  confidence: 'low' | 'medium' | 'high';
  limitations: string[];
}

export interface SolutionValidation {
  valid: boolean;
  unsupportedClaims: string[];
  irrelevantRecommendations: string[];
  unsupportedAuthorities: string[];
  unsupportedDocuments: string[];
  shouldRegenerate: boolean;
}

export interface CaseMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  questions?: ClarificationQuestion[];
  answers?: Record<string, string | string[]>;
}

export interface GeneratedDocument {
  id: string;
  caseId: string;
  documentType: string;
  title: string;
  fields: Record<string, string>;
  previewMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface CivicCase {
  id: string;
  userId?: string;
  title: string;
  originalProblem: string;
  currentSummary: string;
  desiredOutcome?: string;
  aiCaseDescription?: string;
  confidence: 'low' | 'medium' | 'high';
  status: 'analysing' | 'action_required' | 'waiting' | 'resolved' | 'archived';
  createdAt: string;
  updatedAt: string;
  messages: CaseMessage[];
  understanding: CaseUnderstanding;
  solution?: CivicSolution;
  documents?: GeneratedDocument[];
  answers: Record<string, string | string[]>;
}
