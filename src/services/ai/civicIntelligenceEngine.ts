import {
  CaseUnderstanding,
  ClarificationQuestion,
  ClarificationOption,
  ConfirmedFact,
  EvidenceItem,
  CivicSolution,
  ActionPlanStep,
  ResponsibleAuthority,
  SuggestedDocument,
  GeneratedDocument,
  QuestionAnswerPair,
  CivicCase,
  DynamicField,
  RelationshipType,
  IssueCategory,
  CaseEvidenceState,
} from '../../types/civicIntelligence';
import { GeminiClient, defaultGeminiClient } from './geminiClient';
import { QuestionValidator, defaultQuestionValidator } from './questionValidator';

export const CIVIC_SYSTEM_INSTRUCTION = `You are CivicFlow AI's Civic Intelligence Engine.
You help Indian citizens understand and navigate civic, rights, administrative, consumer, tenancy, employment, education, healthcare, banking, cyber fraud, and personal dispute matters.

CRITICAL PIPELINE ARCHITECTURE:
UNDERSTAND → CLARIFY → VERIFY → CLASSIFY → ROUTE → ACT

ABSOLUTE SYSTEM RULES:
1. RELATIONSHIP-FIRST CLASSIFICATION:
   Before choosing any authority or remedy, determine WHO is involved (GOVERNMENT_PUBLIC_AUTHORITY, PRIVATE_INDIVIDUAL, BUSINESS_SELLER, BANK_FINANCIAL_INSTITUTION, LANDLORD, EMPLOYER, HOSPITAL_HEALTHCARE_PROVIDER, etc.).
2. DO NOT DEFAULT TO GOVERNMENT GRIEVANCE:
   If the counterparty is a PRIVATE_INDIVIDUAL, BUSINESS_SELLER, LANDLORD, EMPLOYER, or BANK, DO NOT route the dispute to a government grievance portal (such as CPGRAMS).
3. STRICT CPGRAMS SAFETY RULE:
   CPGRAMS can ONLY be recommended when the grievance actually concerns an eligible government/public authority or public service.
4. STRICT RTI SAFETY RULE:
   RTI can ONLY be recommended when information/records are sought from a PUBLIC AUTHORITY (rtiApplicable = true).
5. PREDEFINED SELECTABLE ANSWER CHOICES:
   All clarification questions MUST provide 3 to 7 structured, selectable answer choices (options).
6. NEUTRAL & SAFE TITLES:
   Titles must be 3 to 8 words, specific, and neutral (e.g., "Suspected Unauthorized UPI Transaction", "Private Money Dispute").`;

export class CivicIntelligenceEngine {
  private client: GeminiClient;
  private validator: QuestionValidator;

  constructor(
    client: GeminiClient = defaultGeminiClient,
    validator: QuestionValidator = defaultQuestionValidator
  ) {
    this.client = client;
    this.validator = validator;
  }

  /**
   * END-TO-END Case Analysis Helper
   */
  public async analyzeCase(userDescription: string, answers: Record<string, any> = {}) {
    const understanding = await this.understandCase(userDescription);
    const q1 = await this.generateNextQuestion(userDescription, understanding.confirmedFacts, [], 1, understanding.relationship);
    const q2 = await this.generateNextQuestion(userDescription, understanding.confirmedFacts, q1 ? [{ questionNumber: 1, question: q1, answer: 'Details provided' }] : [], 2, understanding.relationship);
    const q3 = await this.generateNextQuestion(userDescription, understanding.confirmedFacts, q2 ? [{ questionNumber: 1, question: q1!, answer: 'Details provided' }, { questionNumber: 2, question: q2!, answer: 'Details provided' }] : [], 3, understanding.relationship);

    const questions = [q1, q2, q3].filter(Boolean) as ClarificationQuestion[];
    const evidence = await this.recommendEvidence(userDescription, understanding.confirmedFacts, []);
    const solution = await this.generateSolution(userDescription, understanding, []);

    return {
      understanding,
      questions,
      evidence,
      solution,
    };
  }

  /**
   * STAGE 1: Initial Case Understanding & Relationship-First Classification
   */
  public async understandCase(
    userDescription: string
  ): Promise<CaseUnderstanding> {
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<CaseUnderstanding>('understand-case', {
        userDescription,
      });

      if (res && res.situationSummary) {
        const relationship = res.relationship || this.deriveRelationship(userDescription);
        const issueCategory = res.issueCategory || this.deriveIssueCategory(userDescription, relationship);
        const rtiApplicable = res.rtiApplicable !== undefined ? res.rtiApplicable : this.isRTIApplicable(relationship, issueCategory, userDescription);

        return {
          caseTitle: res.caseTitle || this.deriveTitleFallback(userDescription, relationship),
          categoryBadge: res.categoryBadge || this.deriveCategoryBadge(userDescription, relationship),
          relationship,
          issueCategory,
          rtiApplicable,
          situationSummary: res.situationSummary,
          summary: res.situationSummary,
          confirmedFacts: res.confirmedFacts && res.confirmedFacts.length > 0
            ? res.confirmedFacts
            : [{ id: 'f1', fact: `Citizen reported: "${userDescription}"`, source: 'initial_statement' }],
          inferences: res.inferences || [],
          unknowns: res.unknowns || [],
          parties: res.parties || [],
          responsiblePartyType: res.responsiblePartyType || 'unknown',
          likelyGoal: res.likelyGoal || 'Resolve issue',
          desiredOutcome: res.likelyGoal,
          aiCaseDescription: res.caseTitle || this.deriveTitleFallback(userDescription, relationship),
          confidence: res.confidence || 'medium',
        };
      }
    }

    // Dynamic Offline Fallback
    return this.fallbackUnderstanding(userDescription);
  }

  /**
   * STAGE 2: Evidence Sufficiency Evaluation
   */
  public async evaluateSufficiency(
    userDescription: string,
    understanding: CaseUnderstanding,
    qAndA: QuestionAnswerPair[]
  ): Promise<{
    sufficient: boolean;
    classificationConfidence: number;
    routeConfidence: number;
    missingCriticalFacts: string[];
    readinessReason: string;
  }> {
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<{
        sufficient: boolean;
        classificationConfidence: number;
        routeConfidence: number;
        missingCriticalFacts: string[];
        readinessReason: string;
      }>('evaluate-sufficiency', {
        userDescription,
        relationship: understanding.relationship,
        issueCategory: understanding.issueCategory,
        confirmedFacts: understanding.confirmedFacts,
        previousQA: qAndA,
      });

      if (res && typeof res.sufficient === 'boolean') {
        return res;
      }
    }

    // Offline Sufficiency Logic
    const qCount = qAndA.length;
    const text = userDescription.toLowerCase();
    const isVague = text === "they took my money." || text.length < 20;

    if (qCount === 0) {
      return {
        sufficient: false,
        classificationConfidence: 0.4,
        routeConfidence: 0.3,
        missingCriticalFacts: ['counterparty_identity', 'event_method', 'authorization_consent'],
        readinessReason: 'Initial narrative requires clarification regarding relationship and transaction method.',
      };
    }

    if (isVague && qCount < 2) {
      return {
        sufficient: false,
        classificationConfidence: 0.6,
        routeConfidence: 0.5,
        missingCriticalFacts: ['event_method', 'authorization_consent'],
        readinessReason: 'Gathering essential dispute context.',
      };
    }

    if (qCount >= 4 || !isVague) {
      return {
        sufficient: true,
        classificationConfidence: 0.9,
        routeConfidence: 0.85,
        missingCriticalFacts: [],
        readinessReason: 'Sufficient facts gathered to identify classification and recommended route.',
      };
    }

    return {
      sufficient: true,
      classificationConfidence: 0.85,
      routeConfidence: 0.8,
      missingCriticalFacts: [],
      readinessReason: 'Ready for analysis.',
    };
  }

  /**
   * STAGE 3: Unlimited Dynamic Question Generator with Predefined Selectable Choices
   */
  public async generateNextQuestion(
    userDescription: string,
    confirmedFacts: ConfirmedFact[],
    previousQA: QuestionAnswerPair[],
    questionNumber: number,
    relationship?: RelationshipType
  ): Promise<ClarificationQuestion | null> {
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<{ question: ClarificationQuestion }>(
        'generate-next-question',
        {
          userDescription,
          confirmedFacts,
          previousQA,
          questionNumber,
          relationship,
        }
      );

      if (res && res.question && res.question.question) {
        const isValid = await this.validator.validateQuestion(userDescription, res.question);
        if (isValid.relevant && !isValid.duplicate) {
          return res.question;
        }
      }
    }

    // Dynamic Offline Fallback Question Generator
    return this.fallbackQuestionGenerator(userDescription, previousQA, questionNumber, relationship);
  }

  /**
   * STAGE 4: Recommend Dynamic Evidence Items
   */
  public async recommendEvidence(
    userDescription: string,
    confirmedFacts: ConfirmedFact[],
    qAndA: QuestionAnswerPair[]
  ): Promise<EvidenceItem[]> {
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<{ recommendedEvidence: EvidenceItem[] }>(
        'recommend-evidence',
        {
          userDescription,
          confirmedFacts,
          qAndA,
        }
      );

      if (res && res.recommendedEvidence && res.recommendedEvidence.length > 0) {
        return res.recommendedEvidence;
      }
    }

    // Dynamic Offline Fallback Evidence Recommendation
    return this.fallbackEvidenceRecommendation(userDescription);
  }

  /**
   * STAGE 5: Full Case Analysis & Solution Generation
   */
  public async generateSolution(
    userDescription: string,
    understanding: CaseUnderstanding,
    qAndA: QuestionAnswerPair[],
    evidenceFacts: ConfirmedFact[] = []
  ): Promise<CivicSolution> {
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<CivicSolution>('solve-case', {
        userDescription,
        understanding,
        qAndA,
        evidenceFacts,
      });

      if (res && res.situationSummary) {
        const relationship = res.relationship || understanding.relationship || this.deriveRelationship(userDescription);
        const issueCategory = res.issueCategory || understanding.issueCategory || this.deriveIssueCategory(userDescription, relationship);
        const rtiApplicable = res.rtiApplicable !== undefined ? res.rtiApplicable : this.isRTIApplicable(relationship, issueCategory, userDescription);

        return {
          caseTitle: res.caseTitle || understanding.caseTitle || 'Civic Case Strategy',
          categoryBadge: res.categoryBadge || understanding.categoryBadge || this.deriveCategoryBadge(userDescription, relationship),
          relationship,
          issueCategory,
          rtiApplicable,
          potentialRoutes: res.potentialRoutes || [],
          inappropriateRoutes: res.inappropriateRoutes || [],
          situationSummary: res.situationSummary,
          userGoal: res.userGoal || understanding.likelyGoal || 'Obtain resolution',
          whatCivicFlowFound: res.whatCivicFlowFound || res.explanation || 'Case analyzed under applicable rights.',
          explanation: res.whatCivicFlowFound || res.explanation,
          rightsAndConsiderations: res.rightsAndConsiderations || [],
          options: res.options || [],
          recommendedNextStep: res.recommendedNextStep || { title: 'Proceed with Action Step', explanation: 'Follow step 1' },
          actionPlan: res.actionPlan || [],
          responsibleAuthority: res.responsibleAuthority !== undefined ? res.responsibleAuthority : null,
          sources: res.sources || [],
          suggestedDocuments: res.suggestedDocuments || [],
          limitations: res.limitations || ['CivicFlow provides civic navigation support and does not replace formal legal counsel.'],
          confidence: res.confidence || 'medium',
        };
      }
    }

    // Dynamic Offline Fallback Solution
    return this.fallbackSolutionGenerator(userDescription, understanding, qAndA);
  }

  /**
   * STAGE 6: Action Studio Dynamic Document Draft
   */
  public async generateDocumentDraft(
    docType: string,
    caseTitle: string,
    userDescription: string,
    answers: Record<string, string | string[]> = {},
    solution?: CivicSolution
  ): Promise<GeneratedDocument> {
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<GeneratedDocument>('generate-document', {
        docType,
        caseTitle,
        userDescription,
        answers,
        solution,
      });

      if (res && res.previewMarkdown) {
        return {
          id: res.id || `doc_${Date.now()}`,
          caseId: res.caseId || 'case_active',
          documentType: docType,
          title: res.title || 'Dynamic Legal Document Draft',
          fields: res.fields || {},
          dynamicFields: res.dynamicFields || [],
          previewMarkdown: res.previewMarkdown,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    // Dynamic Offline Fallback Document Draft
    return this.fallbackDocumentGenerator(docType, caseTitle, userDescription, answers, solution);
  }

  /**
   * STAGE 7: Professional Case File Compilation
   */
  public async generateCaseFile(caseData: CivicCase): Promise<string> {
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<{ caseFileMarkdown: string }>('generate-case-file', {
        caseData,
      });
      if (res && res.caseFileMarkdown) {
        return res.caseFileMarkdown;
      }
    }

    // Local Format Generator
    return this.compileLocalCaseFile(caseData);
  }

  // --- RELATIONSHIP & ISSUE CLASSIFIER HELPERS ---

  public deriveRelationship(text: string): RelationshipType {
    const lower = text.toLowerCase();
    if (
      lower.includes('girlfriend') ||
      lower.includes('boyfriend') ||
      lower.includes('friend') ||
      lower.includes('brother') ||
      lower.includes('sister') ||
      lower.includes('father') && lower.includes('took') ||
      lower.includes('relative') ||
      lower.includes('acquaintance') ||
      lower.includes('neighbor') ||
      lower.includes('neighbour')
    ) {
      return 'PRIVATE_INDIVIDUAL';
    }
    if (lower.includes('amazon') || lower.includes('flipkart') || lower.includes('seller') || lower.includes('shop') || lower.includes('product') || lower.includes('merchant')) {
      return 'BUSINESS_SELLER';
    }
    if (lower.includes('bank') || lower.includes('upi') || lower.includes('atm') || lower.includes('account transfer')) {
      return 'BANK_FINANCIAL_INSTITUTION';
    }
    if (lower.includes('landlord') || lower.includes('tenant') || lower.includes('rent')) {
      return 'LANDLORD';
    }
    if (lower.includes('employer') || lower.includes('salary') || lower.includes('boss') || lower.includes('wages') || lower.includes('job')) {
      return 'EMPLOYER';
    }
    if (lower.includes('university') || lower.includes('college') || lower.includes('school') || lower.includes('tuition')) {
      return 'EDUCATIONAL_INSTITUTION';
    }
    if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('medical') || lower.includes('nursing home')) {
      return 'HOSPITAL_HEALTHCARE_PROVIDER';
    }
    if (lower.includes('police') || lower.includes('fir') || lower.includes('station')) {
      return 'POLICE_LAW_ENFORCEMENT';
    }
    if (lower.includes('pension') || lower.includes('caste') || lower.includes('street light') || lower.includes('road') || lower.includes('tahsildar') || lower.includes('municipal')) {
      return 'GOVERNMENT_PUBLIC_AUTHORITY';
    }
    return 'UNKNOWN';
  }

  public deriveIssueCategory(text: string, relationship: RelationshipType): IssueCategory {
    const lower = text.toLowerCase();
    if (relationship === 'PRIVATE_INDIVIDUAL') {
      if (lower.includes('upi') || lower.includes('transfer')) return 'UNAUTHORIZED_TRANSFER';
      return 'PRIVATE_FINANCIAL_DISPUTE';
    }
    if (relationship === 'BUSINESS_SELLER') return 'CONSUMER_REFUND';
    if (relationship === 'LANDLORD') return 'LANDLORD_DEPOSIT';
    if (relationship === 'EMPLOYER') return 'SALARY_NONPAYMENT';
    if (lower.includes('pension')) return 'PENSION_ISSUE';
    if (lower.includes('caste')) return 'PUBLIC_AUTHORITY_DELAY';
    if (lower.includes('road') && lower.includes('spent')) return 'RTI_INFORMATION_REQUEST';
    if (lower.includes('light') || lower.includes('street')) return 'PUBLIC_SERVICE_FAILURE';
    if (relationship === 'HOSPITAL_HEALTHCARE_PROVIDER') return 'HEALTHCARE_SERVICE_DISPUTE';
    return 'UNKNOWN';
  }

  public isRTIApplicable(relationship: RelationshipType, issueCategory: IssueCategory, text: string): boolean {
    const lower = text.toLowerCase();
    if (relationship === 'PRIVATE_INDIVIDUAL' || relationship === 'BUSINESS_SELLER' || relationship === 'LANDLORD' || relationship === 'EMPLOYER') {
      return false;
    }
    if (issueCategory === 'RTI_INFORMATION_REQUEST' || lower.includes('rti') || lower.includes('expenditure') || lower.includes('tender')) {
      return true;
    }
    if (relationship === 'GOVERNMENT_PUBLIC_AUTHORITY' || relationship === 'POLICE_LAW_ENFORCEMENT' || relationship === 'LOCAL_BODY') {
      return true;
    }
    return false;
  }

  public deriveTitleFallback(text: string, relationship?: RelationshipType): string {
    const lower = text.toLowerCase();
    const rel = relationship || this.deriveRelationship(text);

    if (rel === 'PRIVATE_INDIVIDUAL') {
      if (lower.includes('upi') || lower.includes('account') || lower.includes('transfer')) {
        return 'Suspected Unauthorized UPI Transaction';
      }
      return 'Private Money Recovery Dispute';
    }
    if (lower.includes('pension')) return 'Unexpected Cessation of Father\'s Pension Payments';
    if (lower.includes('caste') && (lower.includes('certificate') || lower.includes('applied') || lower.includes('portal'))) {
      return 'Delay in Caste Certificate Application';
    }
    if (lower.includes('university') || (lower.includes('college') && lower.includes('certificate'))) {
      return 'University Withholding Original Certificates';
    }
    if (rel === 'LANDLORD' || lower.includes('deposit') || lower.includes('rent')) {
      return 'Rental Security Deposit Refund Dispute';
    }
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('street')) {
      return 'Public Street Lighting Outage';
    }
    if (lower.includes('tuition') || lower.includes('fee') || lower.includes('coaching')) {
      return 'Private Tuition Fee Refund Dispute';
    }
    if (lower.includes('road') && (lower.includes('spent') || lower.includes('money') || lower.includes('repair'))) {
      return 'Road Repair Expenditure & Transparency Inquiry';
    }
    if (rel === 'EMPLOYER' || lower.includes('salary') || lower.includes('wage')) return 'Unpaid Salary Dispute';
    if (rel === 'BUSINESS_SELLER' || lower.includes('seller') || lower.includes('refund') || lower.includes('laptop') || lower.includes('phone')) return 'Consumer Refund Dispute';
    if (rel === 'HOSPITAL_HEALTHCARE_PROVIDER' || lower.includes('hospital') || lower.includes('doctor')) return 'Hospital Emergency Admission Grievance';

    return 'Private Money Dispute';
  }

  public deriveCategoryBadge(text: string, relationship?: RelationshipType): string {
    const rel = relationship || this.deriveRelationship(text);
    if (rel === 'PRIVATE_INDIVIDUAL') return 'PRIVATE DISPUTE';
    if (rel === 'BUSINESS_SELLER') return 'CONSUMER DISPUTE';
    if (rel === 'LANDLORD') return 'TENANCY';
    if (rel === 'EMPLOYER') return 'EMPLOYMENT';
    if (rel === 'EDUCATIONAL_INSTITUTION') return 'EDUCATION';
    if (rel === 'HOSPITAL_HEALTHCARE_PROVIDER') return 'HEALTHCARE';
    if (rel === 'BANK_FINANCIAL_INSTITUTION' || rel === 'UPI_PAYMENT_PROVIDER') return 'BANKING / CYBER';
    if (rel === 'GOVERNMENT_PUBLIC_AUTHORITY') return 'PENSION / ADMINISTRATIVE';
    return 'CIVIC MATTER';
  }

  private fallbackUnderstanding(userDescription: string): CaseUnderstanding {
    const relationship = this.deriveRelationship(userDescription);
    const issueCategory = this.deriveIssueCategory(userDescription, relationship);
    const rtiApplicable = this.isRTIApplicable(relationship, issueCategory, userDescription);
    const title = this.deriveTitleFallback(userDescription, relationship);
    const categoryBadge = this.deriveCategoryBadge(userDescription, relationship);

    let domain = 'civic_general';
    let domainName = 'Civic & Legal Access';
    const lower = userDescription.toLowerCase();
    if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('medical')) {
      domain = 'healthcare_patient';
      domainName = 'Healthcare & Patient Rights';
    } else if (lower.includes('deposit') || lower.includes('rent') || lower.includes('landlord') || lower.includes('tenant')) {
      domain = 'housing_tenant';
      domainName = 'Housing & Tenancy';
    } else if (lower.includes('laptop') || lower.includes('phone') || lower.includes('seller') || lower.includes('product') || lower.includes('refund')) {
      domain = 'consumer';
      domainName = 'Consumer Protection';
    } else if (lower.includes('employer') || lower.includes('salary') || lower.includes('work') || lower.includes('job') || lower.includes('wages')) {
      domain = 'workplace_labour';
      domainName = 'Workplace & Labour Rights';
    } else if (lower.includes('police') || lower.includes('fir') || lower.includes('station')) {
      domain = 'police_legal_grievance';
      domainName = 'Police & Legal Grievance';
    } else if (lower.includes('electricity') || lower.includes('bill') || lower.includes('power')) {
      domain = 'power_electricity_utility';
      domainName = 'Electricity & Utility Services';
    } else if (lower.includes('university') || lower.includes('college') || lower.includes('school') || lower.includes('certificate')) {
      domain = 'education';
      domainName = 'Education & Student Rights';
    } else if (lower.includes('pension')) {
      domain = 'pension_welfare';
      domainName = 'Pension & Welfare Entitlements';
    }

    let likelyGoal = 'Resolve matter and obtain appropriate remedy';
    if (relationship === 'PRIVATE_INDIVIDUAL') likelyGoal = 'Recover money and secure financial accounts';
    else if (relationship === 'BUSINESS_SELLER') likelyGoal = 'Obtain full refund for defective product';
    else if (relationship === 'LANDLORD') likelyGoal = 'Recover unpaid rental security deposit';
    else if (relationship === 'GOVERNMENT_PUBLIC_AUTHORITY') likelyGoal = 'Restore pension payments and recover arrears';

    const isVague = userDescription.trim().toLowerCase() === "they haven't paid me." || userDescription.trim().length < 25;

    return {
      caseTitle: title,
      categoryBadge,
      relationship,
      issueCategory,
      domain,
      domainName,
      rtiApplicable,
      situationSummary: `Citizen reported: "${userDescription}"`,
      summary: `Citizen reported: "${userDescription}"`,
      confirmedFacts: [{ id: 'f1', fact: `Citizen reported: "${userDescription}"`, source: 'initial_statement' }],
      inferences: ['Issue reported directly by citizen'],
      unknowns: ['Authorization status', 'Transaction method details', 'Evidence availability'],
      parties: [{ name: relationship === 'PRIVATE_INDIVIDUAL' ? 'Private Acquaintance' : 'Counterparty', type: relationship }],
      responsiblePartyType: relationship === 'GOVERNMENT_PUBLIC_AUTHORITY' ? 'government' : 'private',
      likelyGoal,
      desiredOutcome: likelyGoal,
      aiCaseDescription: title,
      confidence: 'medium',
      readyForSolution: !isVague,
    };
  }

  private fallbackQuestionGenerator(
    userDescription: string,
    previousQA: QuestionAnswerPair[],
    questionNumber: number,
    relationship?: RelationshipType
  ): ClarificationQuestion {
    const rel = relationship || this.deriveRelationship(userDescription);
    const text = userDescription.toLowerCase();

    // Vague "They haven't paid me"
    if (text.includes("haven't paid") || text.includes("paid me") || text.includes("pay me")) {
      return {
        id: 'payer_identity',
        question: 'Who was supposed to pay you (e.g. employer, client, buyer, or government department)?',
        reason: 'Identifies responsible party and legal domain.',
        type: 'single_select',
        options: [
          { id: 'v1', label: 'Employer (Salary)', value: 'EMPLOYER' },
          { id: 'v2', label: 'Client / Business', value: 'BUSINESS' },
          { id: 'v3', label: 'Government Agency', value: 'GOVERNMENT' },
          { id: 'v4', label: 'Landlord / Deposit', value: 'LANDLORD' },
        ],
        required: true,
      };
    }


    // 1. PRIVATE INDIVIDUAL / PRIVATE MONEY / GIRLFRIEND CASE
    if (rel === 'PRIVATE_INDIVIDUAL' || text.includes('girlfriend') || text.includes('robbed') || (text.includes('money') && text.includes('took'))) {
      if (questionNumber === 1) {
        return {
          id: 'q1_private_money_method',
          question: 'How was the money taken or transferred?',
          reason: 'Determines whether this involves an electronic bank/UPI transaction, cash, or a personal loan.',
          type: 'single_select',
          options: [
            { id: 'opt_cash', label: 'Cash was taken without my permission', value: 'CASH_UNAUTHORIZED' },
            { id: 'opt_upi', label: 'Money was sent through UPI / Net Banking', value: 'UPI_BANK_TRANSFER' },
            { id: 'opt_card', label: 'The person used my card or phone', value: 'CARD_OR_DEVICE' },
            { id: 'opt_vol', label: 'I transferred the money voluntarily but want it back', value: 'VOLUNTARY_TRANSFER' },
            { id: 'opt_unsure', label: 'I am not sure', value: 'UNSURE' },
          ],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_private_authorization',
          question: 'Did you personally authorize the payment or transfer?',
          reason: 'Differentiates unauthorized electronic fraud from a private financial dispute.',
          type: 'single_select',
          options: [
            { id: 'auth_no', label: 'No, I did not authorize it (unauthorized transaction)', value: 'NOT_AUTHORIZED' },
            { id: 'auth_yes', label: 'Yes, I authorized the payment myself', value: 'AUTHORIZED' },
            { id: 'auth_phone', label: 'Someone accessed my phone or account without permission', value: 'UNAUTHORIZED_DEVICE_ACCESS' },
            { id: 'auth_unsure', label: 'I am not sure', value: 'UNSURE' },
          ],
          required: true,
        };
      }
      if (questionNumber === 3) {
        return {
          id: 'q3_private_evidence',
          question: 'What written evidence or records do you have regarding this matter?',
          reason: 'Identifies available documentation for bank dispute or cybercrime report.',
          type: 'single_select',
          options: [
            { id: 'ev_bank', label: 'UPI / Bank statement transaction record', value: 'BANK_RECORD' },
            { id: 'ev_chat', label: 'WhatsApp / SMS chat messages', value: 'CHAT_LOGS' },
            { id: 'ev_both', label: 'Both bank record and chat messages', value: 'BOTH' },
            { id: 'ev_none', label: 'No written evidence available', value: 'NONE' },
            { id: 'ev_unsure', label: 'I am not sure', value: 'UNSURE' },
          ],
          required: true,
        };
      }
      return {
        id: 'q4_private_outcome',
        question: 'What primary outcome are you mainly seeking?',
        reason: 'Aligns the recommended route with your goal.',
        type: 'single_select',
        options: [
          { id: 'out_rec', label: 'Recover the money', value: 'RECOVER_MONEY' },
          { id: 'out_rep', label: 'Report the incident to bank / cybercrime cell', value: 'REPORT_INCIDENT' },
          { id: 'out_sec', label: 'Secure my bank account & block unauthorized access', value: 'SECURE_ACCOUNT' },
          { id: 'out_opt', label: 'Understand my legal options', value: 'LEGAL_OPTIONS' },
        ],
        required: true,
      };
    }

    // 2. VAGUE "THEY TOOK MY MONEY"
    if (text.includes("they took my money") || text.includes("took my money")) {
      return {
        id: 'q1_vague_payer',
        question: 'Who took or received the money?',
        reason: 'Identifies the counterparty and applicable legal framework.',
        type: 'single_select',
        options: [
          { id: 'v1', label: 'A person I know (friend, partner, relative)', value: 'PRIVATE_INDIVIDUAL' },
          { id: 'v2', label: 'A seller or private business', value: 'BUSINESS_SELLER' },
          { id: 'v3', label: 'A bank or payment service', value: 'BANK' },
          { id: 'v4', label: 'An online stranger or fraudster', value: 'ONLINE_STRANGER' },
          { id: 'v5', label: 'A landlord', value: 'LANDLORD' },
          { id: 'v6', label: 'An employer', value: 'EMPLOYER' },
          { id: 'v7', label: 'A government office', value: 'GOVERNMENT' },
          { id: 'v8', label: 'I am not sure', value: 'UNSURE' },
        ],
        required: true,
      };
    }

    // 3. PENSION CASE
    if (text.includes('pension')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_pension_type',
          question: 'What type of pension is involved, and what is the Pension Payment Order (PPO) status?',
          reason: 'Identifies whether this is a Central/State Government, Defence, or EPF pension.',
          type: 'single_select',
          options: ['Government Employee Pension', 'Defence Pension (SPARSH)', 'EPF Pension', 'State Welfare Pension', 'I am not sure'],
          required: true,
        };
      }
      return {
        id: 'q2_pension_lc',
        question: 'Has an annual Life Certificate (Jeevan Pramaan) been submitted?',
        reason: 'Determines whether non-disbursement is due to missing Life Certificate.',
        type: 'single_select',
        options: ['Life Certificate submitted recently', 'Life Certificate deadline missed / unknown', 'KYC pending at bank', 'I am not sure'],
        required: true,
      };
    }

    // Default Fallback
    return {
      id: `gen_q_${questionNumber}_${Date.now()}`,
      question: 'What specific primary outcome do you wish to achieve?',
      reason: 'Aligns the final action plan with your primary goal.',
      type: 'single_select',
      options: ['Recover money / refund', 'Service restoration', 'Formal dispute resolution', 'Understand legal options', 'I am not sure'],
      required: true,
    };
  }

  private fallbackEvidenceRecommendation(userDescription: string): EvidenceItem[] {
    const lower = userDescription.toLowerCase();
    const rel = this.deriveRelationship(userDescription);

    if (rel === 'PRIVATE_INDIVIDUAL' || lower.includes('robbed') || lower.includes('girlfriend')) {
      return [
        { id: 'ev1', title: 'UPI / Bank Transaction Statement', reason: 'Proves date, amount, and recipient account of transfer', priority: 'recommended' },
        { id: 'ev2', title: 'WhatsApp / Chat Conversation Logs', reason: 'Proves communication and demand for return of funds', priority: 'recommended' },
        { id: 'ev3', title: 'Police / Cybercrime Acknowledgment', reason: 'If complaint already lodged online', priority: 'optional' },
      ];
    }
    if (lower.includes('pension')) {
      return [
        { id: 'ev1', title: 'Pension Payment Order (PPO) Copy', reason: 'Shows authorized PPO number and pension sanction details', priority: 'recommended' },
        { id: 'ev2', title: 'Bank Passbook / Account Statement', reason: 'Proves date of last pension credit and cessation', priority: 'recommended' },
        { id: 'ev3', title: 'Jeevan Pramaan / Life Certificate Receipt', reason: 'Proves submission of annual life certificate', priority: 'optional' },
      ];
    }
    if (lower.includes('deposit') || lower.includes('landlord') || lower.includes('rent')) {
      return [
        { id: 'ev1', title: 'Rental / Tenancy Agreement', reason: 'Shows security deposit amount and refund clause', priority: 'recommended' },
        { id: 'ev2', title: 'Deposit Payment Receipt / UPI Record', reason: 'Proves transfer of funds to landlord', priority: 'recommended' },
      ];
    }
    return [
      { id: 'ev1', title: 'Bank Statement / Payment Receipt', reason: 'Proves financial transaction details', priority: 'recommended' },
      { id: 'ev2', title: 'Communication Records (Chat/Email)', reason: 'Substantiates direct communication', priority: 'optional' },
    ];
  }

  private fallbackSolutionGenerator(
    userDescription: string,
    understanding: CaseUnderstanding,
    qAndA: QuestionAnswerPair[]
  ): CivicSolution {
    const text = userDescription.toLowerCase();
    const rel = understanding.relationship || this.deriveRelationship(userDescription);
    const issueCat = understanding.issueCategory || this.deriveIssueCategory(userDescription, rel);
    const rtiApplicable = this.isRTIApplicable(rel, issueCat, userDescription);
    const title = understanding.caseTitle || this.deriveTitleFallback(userDescription, rel);
    const categoryBadge = understanding.categoryBadge || this.deriveCategoryBadge(userDescription, rel);

    let situationSummary = understanding.situationSummary || `Matter regarding: "${userDescription}"`;
    let userGoal = 'Resolve matter and obtain appropriate remedy';
    let whatCivicFlowFound = '';
    let rightsAndConsiderations: string[] = [];
    let potentialRoutes: string[] = [];
    let inappropriateRoutes: string[] = [];
    let options = [];
    let recommendedNextStep = { title: '', explanation: '' };
    let actionPlan: ActionPlanStep[] = [];
    let responsibleAuthority: ResponsibleAuthority | null = null;
    let suggestedDocuments: SuggestedDocument[] = [];
    let sources = [];

    // 1. PRIVATE INDIVIDUAL DISPUTE (e.g. girlfriend, friend, relative, private money)
    if (rel === 'PRIVATE_INDIVIDUAL' || text.includes('girlfriend') || text.includes('robbed')) {
      userGoal = 'Recover money and secure bank accounts against unauthorized access';
      whatCivicFlowFound = 'Based on the reported facts, this involves a private money or unauthorized financial transaction rather than a government administrative grievance.';
      rightsAndConsiderations = [
        'For unauthorized bank/UPI transactions, RBI regulations mandate reporting to your bank within 3 working days.',
        'If money was taken without consent by an acquaintance, legal recourse includes filing a dispute with your bank/payment provider, reporting to the Cybercrime Portal (cybercrime.gov.in), or lodging a police representation.',
        'CPGRAMS and RTI do NOT apply to private individual disputes.'
      ];
      potentialRoutes = [
        'Bank / UPI Payment Provider Dispute',
        'National Cybercrime Reporting Portal (cybercrime.gov.in)',
        'Police Station Representation'
      ];
      inappropriateRoutes = [
        'CPGRAMS (Central Public Grievances Portal)',
        'RTI (Right to Information)',
        'Government Nodal Department'
      ];
      options = [
        { title: 'Lodge Chargeback / Dispute with Bank & UPI Provider', description: 'Contact bank helpline immediately to report unauthorized transaction and freeze compromised credentials.', considerations: ['Immediate protection against further loss'] },
        { title: 'Report Incident on National Cybercrime Portal', description: 'File an online complaint at cybercrime.gov.in with bank transaction proof.', considerations: ['Official financial fraud reporting mechanism'] },
      ];
      recommendedNextStep = { title: 'Report Transaction Dispute to Bank & Cybercrime Portal', explanation: 'Immediately puts the financial institution and cybercrime cell on notice to freeze fraudulent transfers.' };
      actionPlan = [
        { order: 1, title: 'Download Bank Statement & Note UPI Transaction IDs', description: 'Compile transaction timestamp, reference numbers, and account details.', status: 'completed' },
        { order: 2, title: 'Lodge Fraud Dispute with Bank Customer Care', description: 'Request written acknowledgment / ticket number for unauthorized transaction report.', status: 'in_progress' },
        { order: 3, title: 'File Online Report on Cybercrime Portal (cybercrime.gov.in)', description: 'Submit transaction reference and incident summary online.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'Bank / Payment Provider Support & Cybercrime Cell',
        type: 'Bank / Cybercrime Authority',
        relevance: 'Handles financial account dispute resolution and unauthorized digital transaction reports.',
        actionableInfo: 'Report to bank customer service or file online at cybercrime.gov.in.',
        officialLink: 'https://cybercrime.gov.in/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'complaint', type: 'complaint', title: 'Transaction Dispute & Incident Summary', reason: 'Formal statement of facts for bank or police report', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'National Cybercrime Reporting Portal', url: 'https://cybercrime.gov.in/', relevance: 'Official Portal for Cyber Crime & Financial Fraud' },
        { id: 's2', title: 'RBI Guidelines on Customer Liability in Unauthorized Electronic Transactions', url: 'https://www.rbi.org.in/', relevance: 'RBI Regulatory Rights for Electronic Payments' },
      ];
    }
    // 2. PENSION CASE
    else if (text.includes('pension')) {
      userGoal = 'Restore pension payments and recover pending arrears';
      whatCivicFlowFound = 'Under Central/State Civil Services Pension Rules and RBI Guidelines, pension payments cannot be stopped without formal notice. Stoppage is frequently due to missing Jeevan Pramaan (Life Certificate).';
      rightsAndConsiderations = [
        'Pensioners have a statutory right to uninterrupted pension disbursement.',
        'Centralized Pension Grievance Redress System (CPENGRAMS) resolves pension delays within 30 days.'
      ];
      potentialRoutes = ['Disbursing Bank CPPC', 'CPENGRAMS Portal', 'RTI Application'];
      inappropriateRoutes = ['Cybercrime Portal'];
      options = [
        { title: 'Submit Life Certificate / KYC at Disbursing Bank Branch', description: 'Visit bank or use Jeevan Pramaan portal to update digital life certificate.', considerations: ['Immediate administrative trigger for pension restoration'] },
        { title: 'Submit Written Pension Grievance to CPPC & CPENGRAMS', description: 'Lodge formal representation to Central Pension Processing Centre and CPENGRAMS portal.', considerations: ['Official executive escalation'] },
      ];
      recommendedNextStep = { title: 'Verify Life Certificate & Lodge Bank Pension Grievance', explanation: 'Submits formal representation to pension disbursing bank.' };
      actionPlan = [
        { order: 1, title: 'Collect PPO Copy, Passbook & Life Certificate Receipt', description: 'Gather Pension Payment Order and recent statements.', status: 'completed' },
        { order: 2, title: 'Submit Written Pension Grievance Requesting Restoration', description: 'Deliver formal representation to CPPC Manager.', status: 'in_progress' },
      ];
      responsibleAuthority = {
        name: 'Pension Disbursing Bank / CPPC & Pension Sanctioning Authority',
        type: 'Public Nodal Pension Authority',
        relevance: 'Statutorily responsible for monthly pension credit.',
        actionableInfo: 'Submit representation to CPPC Nodal Officer or CPENGRAMS portal.',
        officialLink: 'https://pgportal.gov.in/pension/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', type: 'representation', title: 'Pension Restoration & Arrears Representation', reason: 'Formal representation requesting pension restoration', recommended: true },
        { id: 'doc_2', documentType: 'rti', type: 'rti', title: 'RTI Application on Pension Suspension Records', reason: 'Requests certified copies of PPO suspension order', recommended: false },
      ];
      sources = [
        { id: 's1', title: 'CPENGRAMS — Central Pension Grievance Portal', url: 'https://pgportal.gov.in/pension/', relevance: 'Official Portal for Pension Grievances' },
      ];
    }
    // 3. ROAD REPAIR EXPENDITURE / RTI INQUIRY
    else if (text.includes('road') && (text.includes('spent') || text.includes('municipality') || text.includes('repair'))) {
      userGoal = 'Obtain public expenditure records and tender details for road repair';
      whatCivicFlowFound = 'Under Section 6(1) of the Right to Information Act 2005, citizens have a statutory right to inspect municipal works, obtain certified expenditure statements, contractor tender details, and work completion certificates.';
      rightsAndConsiderations = [
        'Municipal authorities must disclose public project expenditure upon RTI application within 30 days.',
        'Citizens can request certified copies of tender allotment, work orders, and site inspection logs.'
      ];
      potentialRoutes = ['RTI Application to Municipal PIO', 'Public Works Department Inspection'];
      inappropriateRoutes = ['Cybercrime Portal'];
      options = [
        { title: 'Submit RTI Application to Municipal Public Information Officer', description: 'Request certified copies of road repair tender, budget allocation, and contractor payments.', considerations: ['Statutory 30-day binding public record requirement'] },
      ];
      recommendedNextStep = { title: 'File RTI Application Seeking Expenditure Records', explanation: 'Submits formal RTI request to Municipal Public Information Officer.' };
      actionPlan = [
        { order: 1, title: 'Identify Municipal Ward Office & PIO Details', description: 'Note exact ward number and Public Information Officer address.', status: 'completed' },
        { order: 2, title: 'Submit RTI Application with ₹10 Fee Stamp', description: 'Dispatch RTI application seeking certified copies of expenditure and work orders.', status: 'in_progress' },
      ];
      responsibleAuthority = {
        name: 'Public Information Officer (PIO) — Municipal Engineering Division',
        type: 'Statutory RTI Public Authority',
        relevance: 'Statutorily obliged under RTI Act 2005 to provide public expenditure records.',
        actionableInfo: 'Submit RTI application at Municipal Corporation counter or State RTI Portal.',
        officialLink: 'https://rtionline.gov.in/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_rti', documentType: 'rti', type: 'rti', title: 'RTI Application for Road Repair Expenditure', reason: 'Requests certified copies of tender allotment, budget, and completion certificates', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'RTI Online Portal — Central/State Public Records', url: 'https://rtionline.gov.in/', relevance: 'RTI Application Submission' },
      ];
    }
    // GENERAL FALLBACK

    else {
      userGoal = 'Resolve dispute and obtain appropriate remedy';
      whatCivicFlowFound = 'CivicFlow evaluated your case narrative under applicable rights and legal frameworks.';
      rightsAndConsiderations = [
        'Clear documentation of facts and communication records is essential for effective resolution.'
      ];
      potentialRoutes = ['Direct Dispute Resolution', 'Appropriate Ombudsman / Commission'];
      inappropriateRoutes = rtiApplicable ? [] : ['CPGRAMS', 'RTI'];
      options = [
        { title: 'Submit Formal Written Demand / Dispute Notice', description: 'Issue a structured statement of facts giving 7-15 days to resolve.', considerations: ['Establishes written notice'] },
      ];
      recommendedNextStep = { title: 'Issue Structured Dispute Notice', explanation: 'Creates formal documentation of your dispute.' };
      actionPlan = [
        { order: 1, title: 'Compile Transaction & Communication Proofs', description: 'Gather receipts and message logs.', status: 'completed' },
        { order: 2, title: 'Deliver Written Dispute Notice', description: 'Send formal notice to recipient.', status: 'in_progress' },
      ];
      responsibleAuthority = {
        name: rel === 'GOVERNMENT_PUBLIC_AUTHORITY' ? 'Relevant Nodal Department' : 'Appropriate Dispute Redressal Body',
        type: rel === 'GOVERNMENT_PUBLIC_AUTHORITY' ? 'Public Authority' : 'Dispute Body',
        relevance: 'Oversees service compliance and grievance resolution.',
        actionableInfo: 'Submit written representation or file online.',
        confidence: 'medium',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'complaint', type: 'complaint', title: 'Formal Dispute Summary & Demand Notice', reason: 'Official statement of facts and request for relief', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'National Consumer Helpline Portal', url: 'https://consumerhelpline.gov.in/', relevance: 'Consumer & Service Rights' },
      ];
    }

    return {
      caseTitle: title,
      categoryBadge,
      relationship: rel,
      issueCategory: issueCat,
      rtiApplicable,
      potentialRoutes,
      inappropriateRoutes,
      situationSummary,
      userGoal,
      whatCivicFlowFound,
      explanation: whatCivicFlowFound,
      rightsAndConsiderations,
      options,
      recommendedNextStep,
      actionPlan,
      responsibleAuthority,
      sources,
      suggestedDocuments,
      limitations: [
        'CivicFlow provides civic navigation and legal information support. It does not replace professional legal representation.',
      ],
      confidence: 'high',
    };
  }

  private fallbackDocumentGenerator(
    docType: string,
    caseTitle: string,
    userDescription: string,
    answers: Record<string, string | string[]> = {},
    solution?: CivicSolution
  ): GeneratedDocument {
    const applicantName = (answers['applicant_name'] as string) || '[Your Full Name]';
    const location = (answers['location'] as string) || '[Locality / City]';
    const authorityName = solution?.responsibleAuthority?.name || '[Target Authority / Person]';
    const currentDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    let title = 'Official Representation';
    let previewMarkdown = '';
    const dynamicFields: DynamicField[] = [
      { id: 'applicant_name', label: 'Your Full Name', value: applicantName, placeholder: 'Enter your full name', required: true, type: 'text' },
      { id: 'applicant_address', label: 'Communication Address', value: (answers['applicant_address'] as string) || '', placeholder: 'Enter your full address', required: true, type: 'textarea' },
      { id: 'applicant_phone', label: 'Contact Phone Number', value: (answers['applicant_phone'] as string) || '', placeholder: 'Enter contact phone number', required: true, type: 'text' },
      { id: 'target_authority', label: 'Recipient / Opposing Party Name', value: authorityName, placeholder: 'Enter authority or recipient name', required: false, type: 'text' },
    ];

    const fields: Record<string, string> = {
      applicant_name: applicantName,
      applicant_address: (answers['applicant_address'] as string) || '[Your Postal Address]',
      applicant_phone: (answers['applicant_phone'] as string) || '[Your Phone Number]',
      target_authority: authorityName,
      date: currentDate,
    };

    const textLower = userDescription.toLowerCase();

    if (textLower.includes('hospital') || textLower.includes('doctor') || textLower.includes('medical')) {
      title = 'Formal Medical Grievance & Patient Rights Representation';
      previewMarkdown = `### FORMAL MEDICAL GRIEVANCE & PATIENT RIGHTS REPRESENTATION

**Date:** ${currentDate}

**To,**  
**${authorityName} / Medical Superintendent**  
${location}

**Subject:** Formal Grievance regarding Emergency Treatment Denial & Patient Rights Violation

**Respected Sir / Madam,**

I am submitting this representation regarding deficiency of medical service at ${location}.

**1. Incident Details:**
${userDescription}

**2. Applicable Statutory Provisions & Charter:**
- Violation of the **Charter of Patients' Rights** (Ministry of Health & Family Welfare).
- Non-compliance with the **Clinical Establishments (Registration and Regulation) Act**.

**3. Action Demanded:**
1. Immediate audit of emergency admission logs and medical records.
2. Written response explaining the grounds for treatment denial or deposit demand.

Yours faithfully,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (textLower.includes('university') || textLower.includes('college') || (textLower.includes('certificate') && !textLower.includes('caste'))) {
      title = 'Representation for Release of Original Certificates';
      previewMarkdown = `### REPRESENTATION FOR IMMEDIATE RELEASE OF ORIGINAL CERTIFICATES

**Date:** ${currentDate}

**To,**  
**The Registrar / Principal**  
**${authorityName}**  
${location}

**Subject:** Formal Demand for Release of Original Certificates — Non-compliance with UGC Regulations

**Respected Sir / Madam,**

I am submitting this representation requesting the immediate release of my original academic certificates.

**1. Fact Statement:**
${userDescription}

**2. Regulatory Guidelines:**
Under binding directives of the **University Grants Commission (UGC)**, no higher education institution is permitted to retain student **original certificates** under any circumstances.

**3. Action Demanded:**
Immediate return of original certificates within 7 days, failing which complaint will be filed on UGC Student Grievance Portal.

Yours faithfully,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (docType === 'security_deposit_refund_demand' || textLower.includes('deposit') || textLower.includes('landlord') || textLower.includes('tenant')) {
      title = 'Demand Notice for Security Deposit Refund';
      previewMarkdown = `### DEMAND NOTICE FOR REFUND OF SECURITY DEPOSIT UNDER MODEL TENANCY ACT & CONTRACT LAW

**Date:** ${currentDate}

**To,**  
**${authorityName}**  
${location}

**Subject:** Demand Notice for Security Deposit Refund — Regarding ${caseTitle}

**Sir / Madam,**

I am writing to formally demand the immediate refund of my security deposit paid for the rented premises at ${location}.

**1. Statement of Facts:**
- Applicant Name: ${applicantName}
- Issue Narrative: ${userDescription}
- I have handed over vacant possession of the premises with no unpaid dues or physical damages beyond normal wear and tear.

**2. Statutory & Legal Obligations:**
Under principles of the **Model Tenancy Act** and Indian Contract Act, withholding security deposit without itemized proof of actual physical damage constitutes illegal retention of tenant funds.

**3. Relief Demanded:**
You are hereby called upon to process and transfer the full security deposit amount to my bank account within **7 (seven) days** from receipt of this notice.

Failing this, I shall be constrained to initiate appropriate legal proceedings before the Rent Tribunal / Consumer Disputes Redressal Commission at your cost and risk.

Sincerely,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (textLower.includes('laptop') || textLower.includes('phone') || textLower.includes('seller') || textLower.includes('product') || textLower.includes('refund') || docType === 'consumer_notice') {
      title = 'Legal Notice under Consumer Protection Act 2019';
      previewMarkdown = `### LEGAL NOTICE UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

**Date:** ${currentDate}

**To,**  
**${authorityName}**  
${location}

**Subject:** Legal Notice regarding Deficiency of Service and Unfair Trade Practice

**Sir / Madam,**

Notice is hereby given to you under the provisions of the **Consumer Protection Act, 2019** (specifically **Section 35**).

**1. Consumer Dispute Summary:**
${userDescription}

**2. Relief Demanded:**
You are hereby called upon to repair, replace, or process full monetary refund within **15 (fifteen) days** of receipt of this notice.

Failing compliance, a consumer complaint will be filed before the District Consumer Disputes Redressal Commission.

Sincerely,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (textLower.includes('employer') || textLower.includes('salary') || textLower.includes('wage') || textLower.includes('wages')) {
      title = 'Demand Notice under Payment of Wages Act';
      previewMarkdown = `### DEMAND NOTICE FOR UNPAID SALARY UNDER PAYMENT OF WAGES ACT

**Date:** ${currentDate}

**To,**  
**${authorityName} / Employer**  
${location}

**Subject:** Demand for payment of outstanding salary arrears

**Sir / Madam,**

This notice demands immediate disbursement of earned salary arrears under the **Payment of Wages Act**.

**1. Employment & Non-Payment Details:**
${userDescription}

**2. Legal Recourse:**
Failing payment within 7 days, a complaint will be lodged before the **District Labour Commissioner** and Labour Court.

Sincerely,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (textLower.includes('police') || textLower.includes('fir') || textLower.includes('stolen') || textLower.includes('station')) {
      title = 'Representation under Section 154(3) Cr.P.C. to Superintendent of Police';
      previewMarkdown = `### WRITTEN REPRESENTATION UNDER SECTION 154(3) CR.P.C.

**Date:** ${currentDate}

**To,**  
**The Superintendent of Police (SP)**  
${location}

**Subject:** Representation under Section 154(3) Cr.P.C. regarding refusal to register FIR

**Respected Sir,**

I submit this representation pursuant to **Section 154(3) Cr.P.C.** following refusal by local police station staff to register an FIR, violating Supreme Court directions in **Lalita Kumari v. Govt. of UP**.

**1. Facts of Cognizable Offense:**
${userDescription}

**2. Prayer:**
Requesting direct intervention to register FIR and direct investigation.

Yours faithfully,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (textLower.includes('electricity') || textLower.includes('power') || textLower.includes('bill')) {
      title = 'Grievance Petition to Consumer Grievance Redressal Forum (CGRF)';
      previewMarkdown = `### GRIEVANCE PETITION BEFORE CONSUMER GRIEVANCE REDRESSAL FORUM (CGRF)

**Date:** ${currentDate}

**To,**  
**The Chairperson, Consumer Grievance Redressal Forum (CGRF)**  
${location}

**Subject:** Electricity Billing Dispute under Section 42(5) of the Electricity Act, 2003

**Respected Authority,**

Petition filed under the **Electricity Act, 2003** regarding billing grievance at ${location}.

**1. Details of Power Utility Dispute:**
${userDescription}

**2. Relief Requested:**
Re-audit of power meter and revision of electricity bill.

Yours faithfully,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (docType === 'rti' || textLower.includes('rti') || textLower.includes('transparency')) {
      title = 'Application under Right to Information Act, 2005';
      previewMarkdown = `### APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

**Date:** ${currentDate}

**To,**  
The Public Information Officer (PIO),  
**${authorityName}**  
${location}

**1. APPLICANT DETAILS:**  
- Name: ${applicantName}  
- Address: ${fields.applicant_address}  
- Contact: ${fields.applicant_phone}  

**2. PARTICULARS OF INFORMATION REQUESTED:**  
Subject: Information seeking public records regarding: ${caseTitle}

Please provide certified copies of the following public records:
1. Itemized expenditure statements and work order allocations regarding: "${userDescription}".
2. Copy of inspection notes and completion certificates issued by responsible department officers.
3. Name and designation of the officer responsible for overseeing this matter.

**3. FEE DETAILS:**  
RTI Application Fee of ₹10/- attached herewith via IPO / Court Fee Stamp.

I confirm that I am a citizen of India.

Sincerely,  
**${applicantName}**`;
    } else {
      title = 'Formal Dispute Summary & Demand Notice';
      previewMarkdown = `### FORMAL DISPUTE SUMMARY & INCIDENT STATEMENT

**Date:** ${currentDate}

**To,**  
**${authorityName}**  
${location}

**Subject:** Dispute Notice & Incident Summary regarding ${caseTitle}

**Sir / Madam,**

I am submitting this formal statement of facts regarding:

**Details of Dispute:**
${userDescription}

**Requested Action / Relief:**
1. Review of recorded transaction and facts.
2. Immediate response and resolution.

Sincerely,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    }


    return {
      id: `doc_${Date.now()}`,
      caseId: 'case_active',
      documentType: docType,
      title,
      fields,
      dynamicFields,
      previewMarkdown,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private compileLocalCaseFile(c: CivicCase): string {
    const dateStr = new Date(c.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `
# CIVICFLOW AI — OFFICIAL CASE FILE

---

## 1. CASE METADATA
- **Case ID:** \`${c.id}\`
- **Case Title:** ${c.title}
- **Category Badge:** ${c.categoryBadge || 'CIVIC DISPUTE'}
- **Relationship Type:** ${c.understanding?.relationship || 'N/A'}
- **RTI Applicable:** ${c.understanding?.rtiApplicable ? 'YES (Public Authority)' : 'NO (Private / Financial Matter)'}
- **Date Created:** ${dateStr}
- **Current Status:** ${c.status.toUpperCase()}
- **Analysis Confidence:** ${c.confidence.toUpperCase()}

---

## 2. ORIGINAL CITIZEN STATEMENT
> "${c.originalProblem}"

---

## 3. AI CASE UNDERSTANDING & CONFIRMED FACTS
- **Summary:** ${c.understanding?.situationSummary || c.currentSummary}
- **Confirmed Facts:**
${(c.understanding?.confirmedFacts || []).map(f => `  - [✓] ${f.fact} (${f.source})`).join('\n')}

---

## 4. SEQUENTIAL CLARIFICATION Q&A RECORD
${(c.qAndA || []).map(qa => `
### Question ${qa.questionNumber}: ${qa.question.question}
- **Why it matters:** ${qa.question.reason}
- **Citizen Selected Answer:** **${qa.selectedOptionLabel || (Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer)}**
`).join('\n')}

---

## 5. EVIDENCE ANALYSIS
${c.uploadedEvidence && c.uploadedEvidence.length > 0
  ? c.uploadedEvidence.map(ev => `- 📄 **${ev.title}:** ${ev.reason} (${ev.fileMetadata?.name || 'File Uploaded'})`).join('\n')
  : c.evidenceSkipped ? '_Citizen proceeded without uploading physical evidence._' : '_No physical evidence attached._'}

---

## 6. CITIZEN OBJECTIVE & CIVIC ANALYSIS
- **User Objective:** ${c.solution?.userGoal || c.understanding?.likelyGoal || 'Resolve matter'}
- **CivicFlow Findings:** ${c.solution?.whatCivicFlowFound || c.solution?.explanation || 'Analyzed under legal framework'}

### Potential Routes:
${(c.solution?.potentialRoutes || []).map(r => `- ✅ ${r}`).join('\n')}

${c.solution?.inappropriateRoutes && c.solution.inappropriateRoutes.length > 0 ? `### Inappropriate Routes (Excluded):\n${c.solution.inappropriateRoutes.map(r => `- ❌ ${r}`).join('\n')}` : ''}

### Key Considerations:
${(c.solution?.rightsAndConsiderations || []).map(r => `- ⚖️ ${r}`).join('\n')}

---

## 7. AVAILABLE OPTIONS & RECOMMENDED NEXT STEP
### ⭐ Recommended Next Step:
**${c.solution?.recommendedNextStep?.title || 'Take action'}**  
_${c.solution?.recommendedNextStep?.explanation || ''}_

### All Practical Options:
${(c.solution?.options || []).map(opt => `
- **${opt.title}:** ${opt.description}
  ${opt.considerations ? opt.considerations.map(c => `  - Key Consideration: ${c}`).join('\n') : ''}
`).join('\n')}

---

## 8. DYNAMIC ACTION PLAN
${(c.solution?.actionPlan || []).map(step => `
**Step ${step.order}: ${step.title}** [Status: ${step.status.toUpperCase()}]
- ${step.description}
- _Why it matters:_ ${step.whyItMatters || 'Essential step'}
${step.evidenceNeeded && step.evidenceNeeded.length > 0 ? `- Required Items: ${step.evidenceNeeded.join(', ')}` : ''}
`).join('\n')}

---

## 9. RESPONSIBLE AUTHORITY / WHERE TO GO
- **Authority / Body Name:** ${c.solution?.responsibleAuthority?.name || 'Private Dispute / Local Verification Needed'}
- **Type:** ${c.solution?.responsibleAuthority?.type || 'Dispute Body'}
- **Relevance:** ${c.solution?.responsibleAuthority?.relevance || ''}
- **Actionable Info:** ${c.solution?.responsibleAuthority?.actionableInfo || ''}
${c.solution?.responsibleAuthority?.officialLink ? `- **Official Link:** ${c.solution.responsibleAuthority.officialLink}` : ''}

---

## 10. SUGGESTED DOCUMENTS & SOURCES
### Suggested Documents:
${(c.solution?.suggestedDocuments || []).map(doc => `- 📝 **${doc.title}:** ${doc.reason}`).join('\n')}

### Authoritative Sources:
${(c.solution?.sources || []).map(src => `- 🔗 [${src.title}](${src.url}) — ${src.relevance}`).join('\n')}

---

## OFFICIAL SAFETY DISCLAIMER
> CivicFlow AI provides civic and legal information and navigation support. It does not replace advice or representation from a qualified legal professional.
`.trim();
  }
}

export const defaultCivicIntelligenceEngine = new CivicIntelligenceEngine();
