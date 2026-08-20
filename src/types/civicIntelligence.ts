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

export interface FactItem {
  label: string;
  value: string;
}

export interface CaseUnderstanding {
  summary: string;
  knownFacts: FactItem[];
  missingInformation: string[];
  desiredOutcomeKnown: boolean;
  desiredOutcome?: string;
  aiCaseDescription?: string; // Descriptive label like "Municipal public-infrastructure issue"
  jurisdictionNeeded: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  confidence: 'low' | 'medium' | 'high';
  readyForSolution: boolean;
}

export interface OptionPath {
  title: string;
  description: string;
  considerations?: string[];
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
  title: string;
  authority: string;
  url?: string;
  relevance: string;
  lastChecked?: string;
}

export interface SuggestedDocument {
  type: 'complaint' | 'rti' | 'request' | 'appeal' | 'representation' | 'email' | string;
  title: string;
  reason: string;
}

export interface ResponsibleAuthority {
  name: string;
  type: string;
  relevance: string;
  actionableInfo: string;
  officialLink?: string;
}

export interface CivicSolution {
  situationSummary: string;
  userGoal: string;
  explanation: string;
  options: OptionPath[];
  recommendedNextStep: RecommendedStep;
  actionPlan: ActionPlanStep[];
  sources: CivicSource[];
  suggestedDocuments: SuggestedDocument[];
  responsibleAuthority?: ResponsibleAuthority;
  confidence: 'low' | 'medium' | 'high';
  limitations?: string[];
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
