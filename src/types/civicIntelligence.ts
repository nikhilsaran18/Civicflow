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
  source: 'initial_statement' | 'clarification_answer' | 'evidence_file';
}

export interface EvidenceItem {
  id: string;
  title: string;
  reason: string;
  priority: 'recommended' | 'optional';
  fileMetadata?: {
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
}

export interface PartyInfo {
  name: string;
  type: string;
}

export interface CaseUnderstanding {
  caseTitle: string;
  categoryBadge?: string;
  situationSummary: string;
  summary?: string; // fallback alias
  confirmedFacts: ConfirmedFact[];
  inferences?: string[];
  unknowns?: string[];
  parties?: PartyInfo[];
  responsiblePartyType?: string;
  likelyGoal?: string;
  desiredOutcome?: string;
  aiCaseDescription?: string;
  confidence: 'low' | 'medium' | 'high';
  readyForSolution?: boolean;
  readinessReason?: string;
  domain?: string;
  domainName?: string; // internal compatibility
  applicableLaws?: string[];
}


export interface OptionPath {
  id?: string;
  title: string;
  description?: string;
  explanation?: string;
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
}

export interface CivicSource {
  id?: string;
  title: string;
  authority?: string;
  url: string;
  relevance: string;
}

export interface SuggestedDocument {
  id?: string;
  documentType: string;
  type?: string; // alias
  title: string;
  reason: string;
  recommended?: boolean;
}

export interface ResponsibleAuthority {
  name: string | null;
  type?: string;
  relevance?: string;
  reason?: string;
  actionableInfo?: string;
  officialLink?: string;
  confidence?: 'low' | 'medium' | 'high';
}

export interface CivicSolution {
  caseTitle: string;
  categoryBadge?: string;
  situationSummary: string;
  userGoal: string;
  whatCivicFlowFound: string;
  explanation?: string; // fallback alias
  rightsAndConsiderations: string[];
  options: OptionPath[];
  recommendedNextStep: RecommendedStep;
  actionPlan: ActionPlanStep[];
  sources: CivicSource[];
  suggestedDocuments: SuggestedDocument[];
  responsibleAuthority?: ResponsibleAuthority | null;
  limitations: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface DynamicField {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

export interface GeneratedDocument {
  id: string;
  caseId: string;
  documentType: string;
  title: string;
  fields: Record<string, string>;
  dynamicFields?: DynamicField[];
  previewMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionAnswerPair {
  questionNumber: number;
  question: ClarificationQuestion;
  answer: string | string[];
}

export interface CivicCase {
  id: string;
  userId?: string;
  title: string;
  categoryBadge?: string;
  originalProblem: string;
  currentSummary: string;
  confidence: 'low' | 'medium' | 'high';
  status: 'analysing' | 'action_required' | 'waiting' | 'resolved' | 'archived';
  analysisVersion?: number;
  createdAt: string;
  updatedAt: string;
  understanding: CaseUnderstanding;
  qAndA: QuestionAnswerPair[];
  recommendedEvidence?: EvidenceItem[];
  uploadedEvidence?: EvidenceItem[];
  evidenceSkipped?: boolean;
  solution?: CivicSolution;
  documents?: GeneratedDocument[];
  caseFileMarkdown?: string;
  answers: Record<string, string | string[]>;
}


