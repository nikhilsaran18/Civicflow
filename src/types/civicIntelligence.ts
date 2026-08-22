export type RelationshipType =
  | 'GOVERNMENT_PUBLIC_AUTHORITY'
  | 'PRIVATE_INDIVIDUAL'
  | 'BUSINESS_SELLER'
  | 'ONLINE_PLATFORM'
  | 'BANK_FINANCIAL_INSTITUTION'
  | 'UPI_PAYMENT_PROVIDER'
  | 'EMPLOYER'
  | 'EMPLOYEE'
  | 'LANDLORD'
  | 'TENANT'
  | 'EDUCATIONAL_INSTITUTION'
  | 'HOSPITAL_HEALTHCARE_PROVIDER'
  | 'INSURANCE_PROVIDER'
  | 'TELECOM_PROVIDER'
  | 'UTILITY_PROVIDER'
  | 'POLICE_LAW_ENFORCEMENT'
  | 'LOCAL_BODY'
  | 'GOVERNMENT_SCHEME'
  | 'CYBER_ONLINE_ACTOR'
  | 'UNKNOWN'
  | 'OTHER';

export type IssueCategory =
  | 'CONSUMER_REFUND'
  | 'DEFECTIVE_PRODUCT'
  | 'SERVICE_FAILURE'
  | 'PAYMENT_DISPUTE'
  | 'PRIVATE_FINANCIAL_DISPUTE'
  | 'SUSPECTED_THEFT'
  | 'SUSPECTED_FRAUD'
  | 'UNAUTHORIZED_TRANSFER'
  | 'UPI_FRAUD'
  | 'BANKING_FRAUD'
  | 'ACCOUNT_ACCESS'
  | 'CYBER_FRAUD'
  | 'LANDLORD_DEPOSIT'
  | 'RENTAL_DISPUTE'
  | 'EVICTION_ISSUE'
  | 'SALARY_NONPAYMENT'
  | 'WORKPLACE_DISPUTE'
  | 'EDUCATION_GRIEVANCE'
  | 'PUBLIC_SERVICE_FAILURE'
  | 'GOVERNMENT_BENEFIT_ISSUE'
  | 'PENSION_ISSUE'
  | 'PUBLIC_AUTHORITY_DELAY'
  | 'RTI_INFORMATION_REQUEST'
  | 'HEALTHCARE_SERVICE_DISPUTE'
  | 'UNKNOWN';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'yes_no'
  | 'single_select'
  | 'multi_select'
  | 'date'
  | 'number'
  | 'location';

export interface ClarificationOption {
  id: string;
  label: string;
  value: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  reason: string;
  type: QuestionType;
  options?: (string | ClarificationOption)[];
  required: boolean;
}

export interface CaseEvidenceState {
  counterpartyKnown: boolean;
  relationshipKnown: boolean;
  eventKnown: boolean;
  transactionMethodKnown: boolean;
  authorizationKnown: boolean;
  timelineKnown: boolean;
  amountOrImpactKnown: boolean;
  evidenceAvailabilityKnown: boolean;
  priorActionKnown: boolean;
  urgencyKnown: boolean;
  desiredOutcomeKnown: boolean;
  jurisdictionKnown: boolean;
  classificationConfidence: number;
  routeConfidence: number;
  missingCriticalFacts: string[];
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
  relationship?: RelationshipType;
  issueCategory?: IssueCategory;
  subCategory?: string;
  evidenceState?: CaseEvidenceState;
  rtiApplicable?: boolean;
  potentialRoutes?: string[];
  inappropriateRoutes?: string[];
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
  relationship?: RelationshipType;
  issueCategory?: IssueCategory;
  rtiApplicable?: boolean;
  potentialRoutes?: string[];
  inappropriateRoutes?: string[];
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
  selectedOptionId?: string;
  selectedOptionLabel?: string;
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
