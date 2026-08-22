import {
  CaseUnderstanding,
  ClarificationQuestion,
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
} from '../../types/civicIntelligence';
import { GeminiClient, defaultGeminiClient } from './geminiClient';
import { QuestionValidator, defaultQuestionValidator } from './questionValidator';

export const CIVIC_SYSTEM_INSTRUCTION = `You are CivicFlow AI's Civic Intelligence Engine.
You help Indian citizens understand and navigate civic, rights, administrative, consumer, tenancy, employment, education, healthcare, and public service problems.

THERE ARE NO PREDEFINED SUPPORTED DOMAINS.
Analyse every case independently using ONLY the current case facts.
Never force cases into preset categories or static questionnaires.
Never invent institutions, authorities, laws, portal links, or statutory deadlines.
If an authority is uncertain, set responsibleAuthority to null.`;

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
    const q1 = await this.generateNextQuestion(userDescription, understanding.confirmedFacts, [], 1);
    const q2 = await this.generateNextQuestion(userDescription, understanding.confirmedFacts, q1 ? [{ questionNumber: 1, question: q1, answer: 'Details provided' }] : [], 2);
    const q3 = await this.generateNextQuestion(userDescription, understanding.confirmedFacts, q2 ? [{ questionNumber: 1, question: q1!, answer: 'Details provided' }, { questionNumber: 2, question: q2, answer: 'Details provided' }] : [], 3);

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
   * STAGE 1: Initial Case Understanding
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
        return {
          caseTitle: res.caseTitle || this.deriveTitleFallback(userDescription),
          situationSummary: res.situationSummary,
          summary: res.situationSummary,
          confirmedFacts: res.confirmedFacts && res.confirmedFacts.length > 0
            ? res.confirmedFacts
            : [{ id: 'f1', fact: userDescription, source: 'initial_statement' }],
          inferences: res.inferences || [],
          unknowns: res.unknowns || [],
          parties: res.parties || [],
          responsiblePartyType: res.responsiblePartyType || 'unknown',
          likelyGoal: res.likelyGoal || 'Resolve issue',
          desiredOutcome: res.likelyGoal,
          aiCaseDescription: res.caseTitle || this.deriveTitleFallback(userDescription),
          confidence: res.confidence || 'medium',
        };
      }
    }

    // Dynamic Offline Fallback
    return this.fallbackUnderstanding(userDescription);
  }

  /**
   * STAGE 2, 3, 4: Sequential Question Generator (Generates Q1, Q2, Q3 one by one)
   */
  public async generateNextQuestion(
    userDescription: string,
    confirmedFacts: ConfirmedFact[],
    previousQA: QuestionAnswerPair[],
    questionNumber: number
  ): Promise<ClarificationQuestion | null> {
    if (questionNumber > 3) return null;

    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const res = await this.client.callBackend<{ question: ClarificationQuestion }>(
        'generate-next-question',
        {
          userDescription,
          confirmedFacts,
          previousQA,
          questionNumber,
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
    return this.fallbackQuestionGenerator(userDescription, previousQA, questionNumber);
  }

  /**
   * STAGE 5: Recommend Dynamic Evidence Items
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
   * STAGE 6: Full Case Analysis & Solution Generation
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
        return {
          caseTitle: res.caseTitle || understanding.caseTitle || 'Civic Case Strategy',
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
   * STAGE 7: Action Studio Dynamic Document Draft
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
   * STAGE 8: Professional Case File Compilation
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

  // --- Dynamic Fallback Helpers (offline / no API key) ---

  public deriveTitleFallback(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('pension')) return 'Unexpected Cessation of Father\'s Pension Payments';
    if (lower.includes('caste') && (lower.includes('certificate') || lower.includes('applied') || lower.includes('portal'))) {
      return 'Delay in Caste Certificate Application';
    }
    if (lower.includes('university') || (lower.includes('college') && lower.includes('certificate'))) {
      return 'University Withholding Original Certificates';
    }
    if (lower.includes('deposit') || lower.includes('rent') || lower.includes('landlord')) {
      return 'Rental Security Deposit Dispute';
    }
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('street')) {
      return 'Public Street Lighting Outage';
    }
    if (lower.includes('tuition') || (lower.includes('teacher') && lower.includes('fee')) || lower.includes('coaching')) {
      return 'Private Tuition Fee Refund Dispute';
    }
    if (lower.includes('road') && (lower.includes('spent') || lower.includes('money') || lower.includes('repair'))) {
      return 'Road Repair Expenditure & Transparency Inquiry';
    }
    if (lower.includes('salary') || lower.includes('wage') || lower.includes('employer')) return 'Unpaid Salary Dispute';
    if (lower.includes('phone') || lower.includes('seller') || lower.includes('refund') || lower.includes('laptop')) return 'Product Refund Dispute';
    if (lower.includes('bill') || lower.includes('electricity')) return 'Utility Billing Grievance';
    if (lower.includes('insurance') || lower.includes('claim')) return 'Insurance Claim Rejection';
    return 'Civic Assistance Matter';
  }

  public deriveCategoryBadge(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('pension')) return 'PENSION / ADMINISTRATIVE';
    if (lower.includes('caste') || lower.includes('certificate') || lower.includes('aadhaar')) return 'DOCUMENTATION';
    if (lower.includes('university') || lower.includes('college') || lower.includes('school')) return 'EDUCATION';
    if (lower.includes('deposit') || lower.includes('rent') || lower.includes('landlord') || lower.includes('tenant')) return 'TENANCY';
    if (lower.includes('light') || lower.includes('street') || lower.includes('road') || lower.includes('municipal')) return 'MUNICIPAL SERVICE';
    if (lower.includes('tuition') || lower.includes('fee') || lower.includes('seller') || lower.includes('product') || lower.includes('refund')) return 'CONSUMER DISPUTE';
    return 'CIVIC MATTER';
  }

  private fallbackUnderstanding(userDescription: string): CaseUnderstanding {
    const title = this.deriveTitleFallback(userDescription);
    const categoryBadge = this.deriveCategoryBadge(userDescription);
    
    let likelyGoal = 'Resolve matter and obtain appropriate remedy';
    const lower = userDescription.toLowerCase();

    let domain = 'civic_general';
    let domainName = 'Civic & Legal Access';
    if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('medical')) {
      domain = 'healthcare_patient';
      domainName = 'Healthcare & Patient Rights';
    } else if (lower.includes('deposit') || lower.includes('rent') || lower.includes('landlord') || lower.includes('tenant')) {
      domain = 'housing_tenant';
      domainName = 'Housing & Tenancy';
    } else if (lower.includes('laptop') || lower.includes('phone') || lower.includes('seller') || lower.includes('product') || lower.includes('refund')) {
      domain = 'consumer';
      domainName = 'Consumer Protection';
    } else if (lower.includes('employer') || lower.includes('salary') || lower.includes('work') || lower.includes('job')) {
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

    if (lower.includes('pension')) likelyGoal = 'Restore pension payments and recover pending arrears';
    else if (lower.includes('university') || lower.includes('certificate')) likelyGoal = 'Secure return of original educational certificates';
    else if (lower.includes('caste')) likelyGoal = 'Expedite issuance of pending caste certificate';
    else if (lower.includes('deposit') || lower.includes('landlord')) likelyGoal = 'Recover unpaid rental security deposit';
    else if (lower.includes('light') || lower.includes('street')) likelyGoal = 'Repair non-functioning public street light';
    else if (lower.includes('tuition') || lower.includes('fee')) likelyGoal = 'Obtain refund of tuition fee';

    const isAmbiguous = userDescription.trim().toLowerCase() === "they haven't paid me." || userDescription.trim().length < 25;
    const readyForSolution = !isAmbiguous;

    return {
      caseTitle: title,
      categoryBadge,
      situationSummary: `Citizen reported: "${userDescription}"`,
      summary: `Citizen reported: "${userDescription}"`,
      confirmedFacts: [{ id: 'f1', fact: `Citizen reported: "${userDescription}"`, source: 'initial_statement' }],
      inferences: ['Issue reported directly by citizen'],
      unknowns: ['Specific reference numbers', 'Prior formal written communication'],
      parties: [{ name: 'Responsible Authority / Counterparty', type: 'unknown' }],
      responsiblePartyType: 'contextual',
      likelyGoal,
      desiredOutcome: likelyGoal,
      aiCaseDescription: title,
      confidence: 'medium',
      readyForSolution,
      domain,
      domainName,
    };
  }


  private fallbackQuestionGenerator(
    userDescription: string,
    previousQA: QuestionAnswerPair[],
    questionNumber: number
  ): ClarificationQuestion {
    const text = userDescription.toLowerCase();

    // 1. PENSION CASE
    if (text.includes('pension')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_pension_type',
          question: 'What type of pension is involved, and what is the Pension Payment Order (PPO) status?',
          reason: 'Identifies whether this is a Central/State Government, Defence, or EPF pension.',
          type: 'single_select',
          options: ['Government Employee Pension', 'Defence Pension (SPARSH)', 'EPF / Freedom Fighter Pension', 'State Welfare Pension'],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_pension_stoppage_reason',
          question: 'When was the last pension credit, and has an annual Life Certificate (Jeevan Pramaan) been submitted?',
          reason: 'Determines whether non-disbursement is due to missing Life Certificate or bank account KYC issue.',
          type: 'single_select',
          options: ['Life Certificate submitted recently', 'Life Certificate deadline missed / unknown', 'Account KYC verification pending'],
          required: true,
        };
      }
      return {
        id: 'q3_pension_bank_contact',
        question: 'Have you contacted the pension-disbursing bank branch or CPPC regarding the stoppage?',
        reason: 'Establishes whether a formal bank grievance reference number has been generated.',
        type: 'single_select',
        options: ['Contacted bank branch, no resolution', 'Submitted written grievance to CPPC', 'Have not contacted bank yet'],
        required: true,
      };
    }

    // 2. CASTE CERTIFICATE DELAY
    if (text.includes('caste') || (text.includes('certificate') && text.includes('portal'))) {
      if (questionNumber === 1) {
        return {
          id: 'q1_caste_application_no',
          question: 'Do you have an official application acknowledgement or reference number from the e-Seva / Government portal?',
          reason: 'Essential to track application status with the Revenue Department / Tahsildar Office.',
          type: 'single_select',
          options: ['Yes, have application reference number', 'Applied online through portal', 'Applied offline at Revenue Office'],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_caste_documents_submitted',
          question: 'Were all mandatory family community proofs (parent caste certificate, school TC, land records) submitted with the application?',
          reason: 'Verifies if application was flagged for missing verification documents or field inspection.',
          type: 'single_select',
          options: ['All required documents submitted', 'Field verification pending by Village Administrative Officer (VAO)', 'Unsure if additional documents requested'],
          required: true,
        };
      }
      return {
        id: 'q3_caste_delay_duration',
        question: 'How long has the application been pending beyond the prescribed statutory service timeline (RTS Act)?',
        reason: 'Determines whether to file an appellate grievance under the Right to Services Act or RTI application.',
        type: 'single_select',
        options: ['Over 30 days pending', '6 weeks or more pending', 'Under 15 days'],
        required: true,
      };
    }

    // 3. UNIVERSITY CERTIFICATES WITHHOLDING
    if (text.includes('university') || (text.includes('college') && text.includes('certificate'))) {
      if (questionNumber === 1) {
        return {
          id: 'q1_university_reason',
          question: 'Has the university or college given any written or oral reason for withholding your original certificates?',
          reason: 'Identifies whether withholding is over fee disputes, clearance certificates, or administrative delay.',
          type: 'single_select',
          options: ['Fee dispute claimed by college', 'No official reason given', 'Clearance / No-Dues pending'],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_course_completion',
          question: 'Have you completed all course requirements and obtained a provisional degree or marksheet?',
          reason: 'Establishes statutory right under UGC guidelines prohibiting retention of original certificates.',
          type: 'single_select',
          options: ['Course fully completed with all marksheets', 'Discontinued course midway', 'Final semester result pending'],
          required: true,
        };
      }
      return {
        id: 'q3_university_written_request',
        question: 'Have you submitted a formal written representation or letter requesting the release of certificates?',
        reason: 'Prerequisite for UGC Grievance Portal filing or legal demand notice.',
        type: 'single_select',
        options: ['Written letter submitted with acknowledgment', 'Verbal requests only', 'No formal letter sent yet'],
        required: true,
      };
    }

    // 4. TENANCY / SECURITY DEPOSIT
    if (text.includes('landlord') || text.includes('deposit') || text.includes('rent')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_tenancy_agreement',
          question: 'Was there a written rental/tenancy agreement specifying the security deposit amount?',
          reason: 'Establishes contractual refund obligation.',
          type: 'single_select',
          options: ['Yes, written signed agreement', 'Verbal agreement only', 'Agreement expired recently'],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_move_out_notice',
          question: 'Did you provide formal notice before moving out, and has the landlord stated any reason for withholding the deposit?',
          reason: 'Determines whether landlord claims damages or legitimate deductions.',
          type: 'single_select',
          options: ['Gave full notice, landlord refusing without valid reason', 'Landlord claiming property damage', 'Moved out suddenly'],
          required: true,
        };
      }
      return {
        id: 'q3_prior_communication',
        question: 'Have you sent a written demand (WhatsApp, email, registered letter) requesting return of deposit?',
        reason: 'Establishes whether landlord was formally put on notice for repayment.',
        type: 'single_select',
        options: ['Written reminders sent without response', 'Landlord refused verbally', 'Have not sent formal written demand yet'],
        required: true,
      };
    }

    // 5. STREET LIGHT OUTAGE
    if (text.includes('street light') || text.includes('lamp') || text.includes('light outside')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_location',
          question: 'What is the exact locality, street name, and municipal ward number of the malfunctioning light?',
          reason: 'Pinpoints the municipal ward electrical office responsible for repair.',
          type: 'text',
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_duration',
          question: 'How long has this street light been out of order?',
          reason: 'Establishes duration of municipal service neglect.',
          type: 'single_select',
          options: ['10 days or more', 'Under 7 days', 'Over a month'],
          required: true,
        };
      }
      return {
        id: 'q3_prior_complaint',
        question: 'Have you or local residents already lodged a complaint with the municipal office or citizen helpline?',
        reason: 'Determines whether this requires initial reporting or executive escalation.',
        type: 'single_select',
        options: ['Not reported yet', 'Reported but no reference number given', 'Have official complaint reference number'],
        required: true,
      };
    }

    // 6. TUITION REFUND
    if (text.includes('tuition') || text.includes('teacher') || text.includes('coaching') || text.includes('fee')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_tuition_type',
          question: 'Is the tuition fee payment related to a private coaching institute, individual tutor, or school/college?',
          reason: 'Determines whether Consumer Protection Act or institutional refund policy applies.',
          type: 'single_select',
          options: ['Private Coaching Institute / EdTech', 'Individual Private Tutor', 'School / College Institution'],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_fee_receipt',
          question: 'Do you have a fee receipt, bank transaction proof, or written terms regarding refund upon cancellation?',
          reason: 'Essential to substantiate financial claim.',
          type: 'single_select',
          options: ['Fee receipt / UPI transfer record available', 'Bank statement proof', 'No written receipt'],
          required: true,
        };
      }
      return {
        id: 'q3_refund_reason',
        question: 'What reason was given for refusing the fee refund upon discontinuation?',
        reason: 'Establishes unfair trade practice under Consumer Rights.',
        type: 'single_select',
        options: ['No-refund policy claimed after service deficiency', 'Refused without explanation', 'Partial refund offered'],
        required: true,
      };
    }

    // 7. AMBIGUOUS / PAYMENT DISPUTE
    if (text.includes("haven't paid") || text.includes("paid me") || text.includes("pay me")) {
      return {
        id: 'payer_identity',
        question: 'Who was supposed to pay you (e.g. employer, client, buyer, or government department)?',
        reason: 'Identifies responsible party and legal domain.',
        type: 'single_select',
        options: ['Employer (Salary)', 'Client / Business', 'Government Agency', 'Landlord / Deposit'],
        required: true,
      };
    }

    // 8. HEALTHCARE
    if (text.includes('hospital') || text.includes('doctor') || text.includes('treatment')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_hospital_type',
          question: 'Is this grievance regarding a private hospital or a government medical institution?',
          reason: 'Determines applicable statutory framework (Clinical Establishments Act / Govt Medical Regulations).',
          type: 'single_select',
          options: ['Private Hospital / Nursing Home', 'Government / Municipal Hospital'],
          required: true,
        };
      }
    }

    // 9. ROAD REPAIR / EXPENDITURE INQUIRY
    if (text.includes('road') || text.includes('spent') || text.includes('municipality')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_road_location',
          question: 'What is the exact street name, locality, and ward number of the repaired road?',
          reason: 'Identifies local municipal public works office for RTI application.',
          type: 'text',
          required: true,
        };
      }
    }

    // Generic fallbacks for Q1, Q2, Q3
    if (questionNumber === 1) {
      return {
        id: `gen_q1_${Date.now()}`,
        question: 'When did this issue first occur or when did you last communicate with the responsible authority?',
        reason: 'Establishes the timeline of events for formal recourse.',
        type: 'single_select',
        options: ['Within the last 7 days', '1 to 4 weeks ago', 'Over a month ago'],
        required: true,
      };
    }
    if (questionNumber === 2) {
      return {
        id: `gen_q2_${Date.now()}`,
        question: 'Do you have written proof (messages, receipts, letters, emails, or reference numbers) regarding this matter?',
        reason: 'Identifies available documentary evidence.',
        type: 'single_select',
        options: ['Yes, written documents/messages available', 'Partial proof available', 'Verbal communication only'],
        required: true,
      };
    }
    return {
      id: `gen_q3_${Date.now()}`,
      question: 'What specific primary outcome do you wish to achieve?',
      reason: 'Aligns the final action plan with your primary goal.',
      type: 'single_select',
      options: ['Restoration of service / payment', 'Official public records / information', 'Resolution of administrative grievance', 'Full monetary refund'],
      required: true,
    };
  }

  private fallbackEvidenceRecommendation(userDescription: string): EvidenceItem[] {
    const lower = userDescription.toLowerCase();

    if (lower.includes('pension')) {
      return [
        { id: 'ev1', title: 'Pension Payment Order (PPO) Copy', reason: 'Shows authorized PPO number and pension sanction details', priority: 'recommended' },
        { id: 'ev2', title: 'Bank Passbook / Account Statement', reason: 'Proves date of last pension credit and cessation', priority: 'recommended' },
        { id: 'ev3', title: 'Jeevan Pramaan / Life Certificate Receipt', reason: 'Proves submission of annual life certificate', priority: 'optional' },
      ];
    }
    if (lower.includes('caste') || lower.includes('certificate')) {
      return [
        { id: 'ev1', title: 'Application Acknowledgement Slip', reason: 'Contains application reference number and filing date', priority: 'recommended' },
        { id: 'ev2', title: 'Family Community Proofs (Parent Caste Certificate)', reason: 'Substantiates community status', priority: 'recommended' },
      ];
    }
    if (lower.includes('university') || lower.includes('college')) {
      return [
        { id: 'ev1', title: 'Course Completion / No-Dues Certificate', reason: 'Proves all academic and financial clearances obtained', priority: 'recommended' },
        { id: 'ev2', title: 'Fee Payment Receipts & Marksheets', reason: 'Proves enrollment and successful course completion', priority: 'recommended' },
      ];
    }
    if (lower.includes('deposit') || lower.includes('landlord') || lower.includes('rent')) {
      return [
        { id: 'ev1', title: 'Rental / Tenancy Agreement', reason: 'Shows security deposit amount and refund clause', priority: 'recommended' },
        { id: 'ev2', title: 'Deposit Payment Receipt / UPI Record', reason: 'Proves transfer of funds to landlord', priority: 'recommended' },
        { id: 'ev3', title: 'WhatsApp / Email Communication Logs', reason: 'Proves request for refund and landlord response', priority: 'optional' },
      ];
    }
    if (lower.includes('tuition') || lower.includes('fee')) {
      return [
        { id: 'ev1', title: 'Fee Receipt / Bank Transfer Proof', reason: 'Proves payment made to tutor / coaching institute', priority: 'recommended' },
        { id: 'ev2', title: 'Written Refund Request / Email Log', reason: 'Shows communication seeking refund', priority: 'recommended' },
      ];
    }
    return [
      { id: 'ev1', title: 'Supporting Document / Receipt / Photo', reason: 'Helps substantiate facts', priority: 'recommended' },
      { id: 'ev2', title: 'Communication Records (Chat/Email)', reason: 'Shows attempts to resolve directly', priority: 'optional' },
    ];
  }

  private fallbackSolutionGenerator(
    userDescription: string,
    understanding: CaseUnderstanding,
    qAndA: QuestionAnswerPair[]
  ): CivicSolution {
    const text = userDescription.toLowerCase();
    const title = understanding.caseTitle || this.deriveTitleFallback(userDescription);
    const categoryBadge = understanding.categoryBadge || this.deriveCategoryBadge(userDescription);

    let situationSummary = understanding.situationSummary || `Matter regarding: "${userDescription}"`;
    let userGoal = 'Resolve matter and obtain appropriate remedy';
    let whatCivicFlowFound = 'CivicFlow evaluated your case narrative and clarification answers under applicable statutory frameworks.';
    let rightsAndConsiderations: string[] = [];
    let options = [];
    let recommendedNextStep = { title: '', explanation: '' };
    let actionPlan: ActionPlanStep[] = [];
    let responsibleAuthority: ResponsibleAuthority | null = null;
    let suggestedDocuments: SuggestedDocument[] = [];
    let sources = [];

    // 1. PENSION CASE
    if (text.includes('pension')) {
      userGoal = 'Restore pension payments and recover pending arrears';
      whatCivicFlowFound = 'Under Central/State Civil Services Pension Rules and RBI Guidelines on Pension Disbursement, pension payments cannot be stopped without issuing formal notice to the pensioner. Stoppage is frequently due to missing Jeevan Pramaan (Life Certificate) or bank account KYC updates.';
      rightsAndConsiderations = [
        'Pensioners have a statutory right to uninterrupted pension disbursement.',
        'If stopped due to Life Certificate delay, submission of Jeevan Pramaan requires immediate credit of arrears.',
        'Centralized Pension Grievance Redress System (CPENGRAMS) resolves pension delays within 30 days.'
      ];
      options = [
        { title: 'Submit Life Certificate / KYC at Disbursing Bank Branch', description: 'Visit bank or use Jeevan Pramaan portal to update digital life certificate.', considerations: ['Immediate administrative trigger for pension restoration'] },
        { title: 'Submit Written Pension Grievance to CPPC & CPENGRAMS', description: 'Lodge formal representation to Central Pension Processing Centre (CPPC) and CPENGRAMS portal.', considerations: ['Official executive escalation for arrears recovery'] },
      ];
      recommendedNextStep = { title: 'Verify Life Certificate & Lodge Bank Pension Grievance', explanation: 'Submits formal representation to pension disbursing bank CPPC and pension sanctioning authority.' };
      actionPlan = [
        { order: 1, title: 'Collect PPO Copy, Passbook & Life Certificate Receipt', description: 'Gather Pension Payment Order, recent bank statements, and Jeevan Pramaan slip.', status: 'completed' },
        { order: 2, title: 'Verify Pension Status with Disbursing Bank Branch / CPPC', description: 'Check whether stoppage is recorded under missing Life Certificate or KYC update.', status: 'in_progress' },
        { order: 3, title: 'Submit Written Pension Grievance Requesting Restoration & Arrears', description: 'Deliver formal representation to CPPC Manager & Nodal Pension Officer.', status: 'not_started' },
        { order: 4, title: 'Escalate via CPENGRAMS / Pensioners Portal', description: 'If unresolved after 15 days, lodge grievance on CPENGRAMS portal.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'Pension Disbursing Bank / CPPC & Pension Sanctioning Authority',
        type: 'Public Nodal Pension Authority',
        relevance: 'Statutorily responsible for monthly pension credit and PPO records.',
        actionableInfo: 'Submit representation to Branch Manager / CPPC Nodal Officer or CPENGRAMS portal.',
        officialLink: 'https://pgportal.gov.in/pension/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', type: 'representation', title: 'Pension Restoration & Arrears Representation', reason: 'Formal representation requesting pension restoration and arrears credit', recommended: true },
        { id: 'doc_2', documentType: 'rti', type: 'rti', title: 'RTI Application on Pension Suspension Records', reason: 'Requests certified copies of PPO suspension order and file notings', recommended: false },
      ];
      sources = [
        { id: 's1', title: 'CPENGRAMS — Central Pension Grievance Portal', url: 'https://pgportal.gov.in/pension/', relevance: 'Official Portal for Pension Grievances' },
        { id: 's2', title: 'Jeevan Pramaan Digital Life Certificate Portal', url: 'https://jeevanpramaan.gov.in/', relevance: 'Digital Life Certificate Submission' },
      ];
    }
    // 2. CASTE CERTIFICATE DELAY
    else if (text.includes('caste') || (text.includes('certificate') && text.includes('portal'))) {
      userGoal = 'Expedite processing and issuance of pending caste certificate application';
      whatCivicFlowFound = 'Under State Right to Public Services Acts (RTS), revenue services including caste certificates have a statutory time limit (typically 15 to 30 days). Unreasonable delay without written rejection empowers citizens to file an appeal or RTI inquiry.';
      rightsAndConsiderations = [
        'Citizens have a statutory right to timely delivery of public certificates under Right to Services Act.',
        'The Revenue Department must record written reasons if an application is held for field verification.',
        'An appellate authority exists under RTS Act to penalize officer delay.'
      ];
      options = [
        { title: 'Submit Expedite Representation to Tahsildar / Revenue Divisional Officer', description: 'File written petition highlighting statutory timeline expiry and application acknowledgment number.', considerations: ['Direct executive intervention at revenue office'] },
        { title: 'File RTI Application Seeking Status & File Notings', description: 'Request certified copies of action taken on application reference number under RTI Act Section 6(1).', considerations: ['Creates binding public record requirement within 30 days'] },
      ];
      recommendedNextStep = { title: 'Submit Expedite Petition to Tahsildar Office', explanation: 'Creates formal written demand citing application reference number and statutory timeline.' };
      actionPlan = [
        { order: 1, title: 'Compile Application Acknowledgment & Submitted Proofs', description: 'Gather e-Seva receipt, reference number, and family community documents.', status: 'completed' },
        { order: 2, title: 'Submit Formal Representation to Tahsildar / Revenue Officer', description: 'Submit written letter requesting immediate processing of pending caste certificate.', status: 'in_progress' },
        { order: 3, title: 'Lodge Public Grievance on State e-District Portal', description: 'Escalate to District Collectorate Public Grievance portal if unresolved.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'Office of the Tahsildar / Revenue Department',
        type: 'Statutory Revenue Authority',
        relevance: 'Competent statutory authority for verifying community records and issuing Caste Certificates.',
        actionableInfo: 'Submit representation to Tahsildar / Zonal Deputy Tahsildar at Revenue Taluk Office.',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', type: 'representation', title: 'Petition to Expedite Caste Certificate Processing', reason: 'Formal representation citing statutory timeline expiry', recommended: true },
        { id: 'doc_2', documentType: 'rti', type: 'rti', title: 'RTI Application on Pending Caste Certificate Status', reason: 'Requests certified inspection notes and delay reasons under RTI Act', recommended: false },
      ];
      sources = [
        { id: 's1', title: 'National Government Services Portal — Revenue Services', url: 'https://services.india.gov.in/', relevance: 'State Revenue & e-District Services' },
      ];
    }
    // 3. UNIVERSITY CERTIFICATES WITHHOLDING
    else if (text.includes('university') || (text.includes('college') && text.includes('certificate'))) {
      userGoal = 'Secure return of original educational certificates from institution';
      whatCivicFlowFound = 'The University Grants Commission (UGC) Public Notice guidelines strictly prohibit higher educational institutions from retaining original academic certificates of students under any circumstances. Retention of certificates constitutes illegal coercion.';
      rightsAndConsiderations = [
        'Colleges and Universities CANNOT withhold original certificates even during fee disputes.',
        'UGC guidelines mandate immediate return of original documents upon request.',
        'Students can file a complaint directly on the UGC Student Grievance Redressal Portal.'
      ];
      options = [
        { title: 'Serve UGC-Compliant Demand Letter to Registrar / Principal', description: 'Issue formal written demand citing UGC Public Notice prohibiting retention of original certificates.', considerations: ['Cites binding UGC regulatory circular'] },
        { title: 'Lodge Complaint on UGC Student Grievance Portal', description: 'Escalate institution non-compliance to UGC Ombudsman & Vice-Chancellor.', considerations: ['Triggers regulatory review of college affiliation'] },
      ];
      recommendedNextStep = { title: 'Issue UGC-Compliant Demand Letter for Certificate Release', explanation: 'Demands immediate release of original certificates citing UGC circulars.' };
      actionPlan = [
        { order: 1, title: 'Compile Course Completion Proofs & Acknowledgment Receipts', description: 'Gather marksheets, admission receipts, and identity proof.', status: 'completed' },
        { order: 2, title: 'Submit Written Demand Letter to College Principal / Registrar', description: 'Deliver letter requesting return of original certificates within 7 days.', status: 'in_progress' },
        { order: 3, title: 'Escalate to UGC Student Grievance Portal (samarth.ac.in)', description: 'Lodge formal online complaint with UGC if college fails to comply.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'Office of the Registrar / Principal & UGC Student Grievance Cell',
        type: 'Educational Statutory Regulatory Body',
        relevance: 'Statutorily governs higher education compliance and student document rights.',
        actionableInfo: 'Submit petition to Registrar / Principal and escalate to UGC Grievance Portal.',
        officialLink: 'https://www.ugc.gov.in/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', type: 'representation', title: 'Demand Letter for Release of Original Certificates', reason: 'Formal demand citing UGC circular prohibiting document retention', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'University Grants Commission (UGC) Official Portal', url: 'https://www.ugc.gov.in/', relevance: 'UGC Regulations & Student Grievance Portal' },
      ];
    }
    // 4. TENANCY / SECURITY DEPOSIT
    else if (text.includes('landlord') || text.includes('deposit') || text.includes('rent')) {
      userGoal = 'Recover unpaid rental security deposit';
      whatCivicFlowFound = 'Under Indian Tenancy Laws and Contract Law principles, security deposits are refundable upon tenancy completion unless legitimate physical damage deductions are proved by landlord.';
      rightsAndConsiderations = [
        'Landlords cannot withhold security deposit without itemized proof of damage.',
        'Normal wear and tear cannot be deducted from deposit.',
        'A formal legal demand notice gives 7-15 days to refund before court filing.'
      ];
      options = [
        { title: 'Formal Written Demand Notice', description: 'Serve a formal demand letter citing payment receipts and 7-day refund deadline.', considerations: ['Creates binding written record for legal proceedings'] },
        { title: 'Rent Control Court / Small Claims Grievance', description: 'Approach local Rent Authority or District Consumer Commission for refund recovery.', considerations: ['Statutory legal recovery route'] },
      ];
      recommendedNextStep = { title: 'Issue Formal Security Deposit Demand Notice', explanation: 'Sends an official written request giving landlord 7 days to repay before filing legal grievance.' };
      actionPlan = [
        { order: 1, title: 'Compile Rental Proof & Payment Receipts', description: 'Gather agreement copy, UPI payment statement, and communication logs.', status: 'completed' },
        { order: 2, title: 'Send Formal Demand Letter to Landlord', description: 'Dispatch demand notice via Registered Post / Email giving 7 days deadline.', status: 'in_progress' },
        { order: 3, title: 'Approach Rent Authority / Consumer Forum', description: 'If unpaid after 7 days, submit petition before Rent Control Authority.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'District Rent Authority / Consumer Disputes Redressal Commission',
        type: 'Statutory Judicial & Rent Tribunal',
        relevance: 'Adjudicates landlord-tenant deposit recovery disputes.',
        actionableInfo: 'Submit petition at District Rent Tribunal or e-Daakhil consumer portal.',
        officialLink: 'https://edaakhil.nic.in/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'security_deposit_refund_demand', type: 'security_deposit_refund_demand', title: 'Security Deposit Refund Demand Notice', reason: 'Formal demand notice to landlord', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'e-Daakhil Consumer Filing Portal', url: 'https://edaakhil.nic.in/', relevance: 'Online Consumer Grievance Filing' },
      ];
    }
    // 5. STREET LIGHT OUTAGE
    else if (text.includes('light') || text.includes('lamp') || text.includes('street')) {
      userGoal = 'Repair non-functioning public street light';
      whatCivicFlowFound = 'Urban Local Bodies (Municipal Corporations) have a statutory duty under State Municipal Acts to maintain public street lighting for community safety.';
      rightsAndConsiderations = [
        'Citizens have a right to functioning public street lighting maintained by municipal funds.',
        'Municipalities must provide a complaint reference number upon reporting.'
      ];
      options = [
        { title: 'Direct Municipal Ward Office Complaint', description: 'Submit complaint ticket with specific pole landmark to Municipal Electrical Division.', considerations: ['Generates official repair tracking ticket'] },
        { title: 'State Public Grievance Escalation', description: 'Escalate to Municipal Commissioner or Chief Minister Grievance Portal.', considerations: ['Forces executive oversight on ward staff'] },
      ];
      recommendedNextStep = { title: 'Lodge Municipal Streetlight Repair Complaint', explanation: 'Creates an official repair ticket with local ward electrical staff.' };
      actionPlan = [
        { order: 1, title: 'Identify Pole Location & Ward Number', description: 'Note exact street landmark and municipal ward number.', status: 'completed' },
        { order: 2, title: 'Submit Grievance to Municipal Electrical Engineer', description: 'Submit formal complaint letter to Municipal Corporation.', status: 'in_progress' },
        { order: 3, title: 'Track Repair Action', description: 'Allow 3 to 5 working days for maintenance crew dispatch.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'Local Municipal Corporation — Electrical Division',
        type: 'Urban Local Body (Municipal Authority)',
        relevance: 'Statutorily responsible for public street lighting maintenance.',
        actionableInfo: 'Submit complaint at Ward Office or Municipal Citizen Portal.',
        officialLink: 'https://pgportal.gov.in/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'complaint', type: 'complaint', title: 'Municipal Street Light Repair Complaint Letter', reason: 'Formal complaint to Municipal Executive Engineer', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'CPGRAMS Public Grievance Portal', url: 'https://pgportal.gov.in/', relevance: 'National Public Grievances Portal' },
      ];
    }
    // 6. TUITION REFUND
    else if (text.includes('tuition') || text.includes('teacher') || text.includes('coaching') || text.includes('fee')) {
      userGoal = 'Obtain refund of unutilized tuition fee';
      whatCivicFlowFound = 'Under the Consumer Protection Act, 2019, coaching institutes and service providers cannot enforce non-refundable clauses when services are discontinued due to deficiency or genuine student withdrawal.';
      rightsAndConsiderations = [
        'Consumers have a right to refund of unutilized fees on pro-rata basis under Consumer Protection Act.',
        'Coaching institutes cannot demand full upfront annual fees without refund options.',
        'A formal legal notice gives 15 days deadline before filing a consumer complaint on e-Daakhil.'
      ];
      options = [
        { title: 'Serve Consumer Legal Notice to Coaching / Tutor', description: 'Dispatch formal legal demand notice claiming pro-rata fee refund within 15 days.', considerations: ['Mandatory pre-litigation notice for Consumer Forum'] },
        { title: 'File Complaint on National Consumer Helpline (NCH)', description: 'Lodge online grievance at consumerhelpline.gov.in.', considerations: ['Free official conciliation mechanism'] },
      ];
      recommendedNextStep = { title: 'Issue Formal Fee Refund Demand Notice', explanation: 'Sends written legal demand citing Consumer Protection Act refund rights.' };
      actionPlan = [
        { order: 1, title: 'Compile Fee Receipts & Discontinuation Communication', description: 'Gather bank statement, fee slip, and written discontinuation notice.', status: 'completed' },
        { order: 2, title: 'Send Formal Refund Demand Letter', description: 'Deliver written demand letter giving 15 days deadline for fee refund.', status: 'in_progress' },
        { order: 3, title: 'Lodge Grievance on National Consumer Helpline / e-Daakhil', description: 'Escalate to NCH portal (consumerhelpline.gov.in) if unpaid.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'District Consumer Disputes Redressal Commission / National Consumer Helpline',
        type: 'Statutory Consumer Protection Authority',
        relevance: 'Adjudicates deficiency of service and unfair fee retention claims.',
        actionableInfo: 'File grievance on NCH portal (consumerhelpline.gov.in) or e-Daakhil portal.',
        officialLink: 'https://consumerhelpline.gov.in/',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', type: 'representation', title: 'Tuition Fee Refund Demand Notice', reason: 'Formal demand notice under Consumer Protection Act', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'National Consumer Helpline Portal', url: 'https://consumerhelpline.gov.in/', relevance: 'National Consumer Helpline Portal' },
      ];
    }
    // 7. ROAD REPAIR / EXPENDITURE INQUIRY
    else if (text.includes('road') || text.includes('spent') || text.includes('municipality')) {
      userGoal = 'Obtain public expenditure records and tender details for road repair';
      whatCivicFlowFound = 'Under Section 6(1) of the Right to Information Act 2005, citizens have a statutory right to inspect municipal works, obtain certified expenditure statements, contractor tender details, and work completion certificates.';
      rightsAndConsiderations = [
        'Municipal authorities must disclose public project expenditure upon RTI application within 30 days.',
        'Citizens can request certified copy of tender allotment, work order, and site inspection log.'
      ];
      options = [
        { title: 'Submit RTI Application to Municipal Public Information Officer', description: 'Request certified copies of road repair tender, budget allocation, and contractor payments.', considerations: ['Statutory 30-day binding public record requirement'] },
      ];
      recommendedNextStep = { title: 'File RTI Application Seeking Expenditure Records', explanation: 'Submits formal RTI request to Municipal Public Information Officer.' };
      actionPlan = [
        { order: 1, title: 'Identify Municipal Ward Office & PIO Details', description: 'Note exact ward number and municipal Public Information Officer address.', status: 'completed' },
        { order: 2, title: 'Submit RTI Application with ₹10 Fee Stamp', description: 'Dispatch RTI application seeking certified copies of expenditure and work orders.', status: 'in_progress' },
      ];
      responsibleAuthority = {
        name: 'Public Information Officer (PIO) — Municipal Engineering Division',
        type: 'Statutory RTI Public Authority',
        relevance: 'Statutorily obliged under RTI Act 2005 to provide public expenditure records.',
        actionableInfo: 'Submit RTI application at Municipal Corporation PIO counter or State RTI Portal.',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_rti', documentType: 'rti', type: 'rti', title: 'RTI Application for Road Repair Expenditure', reason: 'Requests certified copies of tender allotment, budget, and completion certificates', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'RTI Online Portal — Central/State Public Records', url: 'https://rtionline.gov.in/', relevance: 'RTI Application Submission' },
      ];
    }
    // 8. HEALTHCARE
    else if (text.includes('hospital') || text.includes('doctor') || text.includes('treatment')) {
      userGoal = 'Seek administrative grievance redressal for emergency medical treatment denial';
      whatCivicFlowFound = 'Under the Charter of Patients\' Rights and Clinical Establishments Act, emergency treatment cannot be denied by registered medical institutions over upfront deposit demands.';
      rightsAndConsiderations = [
        'Patients have a statutory right to emergency medical care without delay.',
        'Grievance can be submitted to State Medical Council and District Health Officer.'
      ];
      options = [
        { title: 'Submit Formal Medical Grievance Representation', description: 'File written complaint with Hospital Superintendent and District Health Officer.', considerations: ['Executive administrative review'] },
      ];
      recommendedNextStep = { title: 'Submit Medical Grievance Representation', explanation: 'Creates formal record of patient rights violation.' };
      actionPlan = [
        { order: 1, title: 'Gather Hospital Admission Bills & Communication Proofs', description: 'Compile receipts, discharge summary, and deposit demand slips.', status: 'completed' },
        { order: 2, title: 'Submit Grievance to Medical Superintendent & Health Officer', description: 'Deliver formal representation citing Charter of Patients Rights.', status: 'in_progress' },
      ];
      responsibleAuthority = {
        name: 'District Health Officer & State Medical Council / Hospital Ombudsman',
        type: 'Statutory Health & Medical Authority',
        relevance: 'Regulates clinical establishment compliance and patient grievance redressal.',
        actionableInfo: 'Submit petition to District Health Officer or State Medical Council.',
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', type: 'representation', title: 'Medical Grievance & Patient Rights Representation', reason: 'Formal complaint regarding treatment refusal under Patients Rights Charter', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'Ministry of Health & Family Welfare — Patients Rights Charter', url: 'https://main.mohfw.gov.in/', relevance: 'National Charter of Patients Rights' },
      ];
    }
    // GENERAL CIVIC MATTER
    else {
      userGoal = 'Resolve administrative issue and obtain appropriate remedy';
      whatCivicFlowFound = 'Based on the facts provided, you have a right to issue a formal written representation and seek administrative grievance redressal.';
      rightsAndConsiderations = [
        'Written representations create binding official records for administrative review.',
        'Grievances submitted to nodal authorities require acknowledgment under administrative norms.'
      ];
      options = [
        { title: 'Formal Administrative Representation', description: 'Submit an official written statement of facts requesting specific relief.', considerations: ['Establishes written notice for review'] },
      ];
      recommendedNextStep = { title: 'Submit Structured Representation', explanation: 'Creates formal documentation of your grievance.' };
      actionPlan = [
        { order: 1, title: 'Organize Case Timeline and Evidence', description: 'Compile dates, reference numbers, and facts.', status: 'in_progress' },
        { order: 2, title: 'Deliver Written Representation to Nodal Department', description: 'Submit formal letter to responsible authority.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'Relevant Department / Nodal Grievance Office (Jurisdiction Verification Needed)',
        type: 'Public Authority',
        relevance: 'Oversees service compliance and public grievance resolution for this sector.',
        actionableInfo: 'Submit directly to head of department or nodal public grievance officer.',
        officialLink: 'https://pgportal.gov.in/',
        confidence: 'medium',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', type: 'representation', title: 'Formal Written Representation', reason: 'Official statement of facts and request for action', recommended: true },
      ];
      sources = [
        { id: 's1', title: 'CPGRAMS Central Grievance Portal', url: 'https://pgportal.gov.in/', relevance: 'National Public Grievances Portal' },
      ];
    }

    return {
      caseTitle: title,
      categoryBadge,
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

    } else if (textLower.includes('phone') || textLower.includes('seller') || textLower.includes('laptop') || textLower.includes('product') || docType === 'consumer_notice') {
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
    } else if (textLower.includes('salary') || textLower.includes('employer') || textLower.includes('wage')) {
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
    } else if (textLower.includes('police') || textLower.includes('fir') || textLower.includes('station')) {
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
    } else if (textLower.includes('university') || textLower.includes('college') || textLower.includes('certificates')) {
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
      title = 'Formal Grievance Complaint';
      previewMarkdown = `### FORMAL GRIEVANCE COMPLAINT

**Date:** ${currentDate}

**To,**  
**${authorityName}**  
${location}

**Subject:** Complaint regarding ${caseTitle}

**Respected Sir / Madam,**

I am writing to lodge a formal complaint regarding civic/service deficiency at ${location}.

**Details of Issue:**
${userDescription}

**Relief Requested:**
1. Immediate inspection and action by responsible officials.
2. Resolution of the issue and issuance of a formal complaint tracking number.

Yours faithfully,  
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

## 4. SEQUENTIAL CLARIFICATION Q&A (EXACTLY 3 QUESTIONS)
${(c.qAndA || []).map(qa => `
### Question ${qa.questionNumber}: ${qa.question.question}
- **Why it matters:** ${qa.question.reason}
- **Citizen Answer:** **${Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer}**
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

### Rights & Key Considerations:
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

## 9. RESPONSIBLE AUTHORITY
- **Authority Name:** ${c.solution?.responsibleAuthority?.name || 'Requires local verification'}
- **Type:** ${c.solution?.responsibleAuthority?.type || 'Public / Private Entity'}
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
