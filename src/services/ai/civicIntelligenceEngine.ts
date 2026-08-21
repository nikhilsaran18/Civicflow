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

  private deriveTitleFallback(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('deposit') || lower.includes('rent') || lower.includes('landlord')) return 'Security Deposit Refund Dispute';
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('street')) return 'Municipal Streetlight Repair Matter';
    if (lower.includes('salary') || lower.includes('wage') || lower.includes('employer')) return 'Unpaid Salary Dispute';
    if (lower.includes('phone') || lower.includes('refund') || lower.includes('seller')) return 'Product Refund Dispute';
    if (lower.includes('certificate') || lower.includes('marksheet') || lower.includes('college')) return 'Educational Certificate Withholding';
    if (lower.includes('pension')) return 'Pension Disbursement Delay';
    if (lower.includes('road') && (lower.includes('spent') || lower.includes('money'))) return 'Road Repair Expenditure Inquiry';
    if (lower.includes('bill') || lower.includes('electricity')) return 'Utility Billing Grievance';
    if (lower.includes('insurance') || lower.includes('claim')) return 'Insurance Claim Rejection';
    return 'Civic Assistance Matter';
  }

  private fallbackUnderstanding(userDescription: string): CaseUnderstanding {
    const title = this.deriveTitleFallback(userDescription);
    return {
      caseTitle: title,
      situationSummary: `Citizen reported: "${userDescription}"`,
      summary: `Citizen reported: "${userDescription}"`,
      confirmedFacts: [{ id: 'f1', fact: userDescription, source: 'initial_statement' }],
      inferences: ['Issue reported directly by citizen'],
      unknowns: ['Specific timeline', 'Written notices sent'],
      parties: [{ name: 'Opposing Party / Authority', type: 'unknown' }],
      responsiblePartyType: 'contextual',
      likelyGoal: 'Resolve matter and obtain appropriate remedy',
      desiredOutcome: 'Resolve matter and obtain appropriate remedy',
      aiCaseDescription: title,
      confidence: 'medium',
    };
  }

  private fallbackQuestionGenerator(
    userDescription: string,
    previousQA: QuestionAnswerPair[],
    questionNumber: number
  ): ClarificationQuestion {
    const text = userDescription.toLowerCase();

    if (text.includes('landlord') || text.includes('deposit') || text.includes('tenant')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_tenancy_agreement',
          question: 'Do you have a written tenancy/rental agreement specifying the security deposit amount?',
          reason: 'Helps establish contractual refund obligation.',
          type: 'single_select',
          options: ['Yes, written registered/signed agreement', 'Verbal agreement only', 'Agreement expired recently'],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_move_out_notice',
          question: 'Did you provide formal notice before moving out, and were any property damages claimed by the landlord?',
          reason: 'Determines whether landlord has any legal ground to withhold deductions.',
          type: 'single_select',
          options: ['Gave full notice, no damage', 'Gave notice, minor wear-and-tear claimed', 'Moved out suddenly'],
          required: true,
        };
      }
      return {
        id: 'q3_prior_communication',
        question: 'Have you sent a written message (WhatsApp, email, letter) requesting return of deposit?',
        reason: 'Establishes whether landlord was formally put on notice for repayment.',
        type: 'single_select',
        options: ['Yes, written reminders sent without response', 'Landlord refused verbally', 'Have not sent formal written demand yet'],
        required: true,
      };
    }

    if (text.includes('street light') || text.includes('lamp') || text.includes('light near')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_location',
          question: 'What is the exact locality, street name, and ward number of the malfunctioning light?',
          reason: 'Pinpoints the exact municipal ward office responsible for repair dispatch.',
          type: 'text',
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_duration',
          question: 'How long has this street light been out of order?',
          reason: 'Establishes severity of municipal maintenance negligence.',
          type: 'single_select',
          options: ['Under 7 days', '10 to 30 days', 'Over a month'],
          required: true,
        };
      }
      return {
        id: 'q3_prior_complaint',
        question: 'Have you or local residents already lodged a complaint with the municipal office?',
        reason: 'Determines whether this requires initial reporting or escalation.',
        type: 'single_select',
        options: ['Not reported yet', 'Reported but no reference number given', 'Have official complaint reference number'],
        required: true,
      };
    }

    if (text.includes('phone') || text.includes('seller') || text.includes('refund')) {
      if (questionNumber === 1) {
        return {
          id: 'q1_invoice_receipt',
          question: 'Do you have an invoice, bill, or digital transaction receipt for the purchase?',
          reason: 'Essential to prove consumer transaction.',
          type: 'single_select',
          options: ['Yes, tax invoice available', 'Bank/UPI statement only', 'No receipt'],
          required: true,
        };
      }
      if (questionNumber === 2) {
        return {
          id: 'q2_defect_timeline',
          question: 'When did the product stop working, and is it under manufacturer warranty?',
          reason: 'Establishes warranty claim validity.',
          type: 'single_select',
          options: ['Stopped within return window', 'Under active manufacturer warranty', 'Warranty expired'],
          required: true,
        };
      }
      return {
        id: 'q3_seller_response',
        question: 'What reason did the seller or authorized service center give for refusing refund/repair?',
        reason: 'Determines whether this constitutes deficiency of service under Consumer Protection Act.',
        type: 'textarea',
        required: true,
      };
    }

    // Generic fallbacks for Q1, Q2, Q3
    if (questionNumber === 1) {
      return {
        id: `gen_q1_${Date.now()}`,
        question: 'When did this issue first occur or when did you last communicate with the opposing party?',
        reason: 'Establishes the timeline of events for legal recourse.',
        type: 'single_select',
        options: ['Within the last 7 days', '1 to 4 weeks ago', 'Over a month ago'],
        required: true,
      };
    }
    if (questionNumber === 2) {
      return {
        id: `gen_q2_${Date.now()}`,
        question: 'Do you have written proof (messages, receipts, letters, emails, or agreements) regarding this matter?',
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
      options: ['Full monetary refund / payment', 'Service repair or restoration', 'Official public records / information', 'Formal written apology & grievance resolution'],
      required: true,
    };
  }

  private fallbackEvidenceRecommendation(userDescription: string): EvidenceItem[] {
    const lower = userDescription.toLowerCase();

    if (lower.includes('deposit') || lower.includes('landlord') || lower.includes('rent')) {
      return [
        { id: 'ev1', title: 'Rental / Tenancy Agreement', reason: 'Shows security deposit amount and refund clause', priority: 'recommended' },
        { id: 'ev2', title: 'Deposit Payment Receipt / UPI Record', reason: 'Proves transfer of funds to landlord', priority: 'recommended' },
        { id: 'ev3', title: 'WhatsApp / Email Communication Logs', reason: 'Proves request for refund and landlord response', priority: 'optional' },
      ];
    }
    if (lower.includes('phone') || lower.includes('seller') || lower.includes('refund')) {
      return [
        { id: 'ev1', title: 'Tax Invoice / Cash Memo', reason: 'Proves purchase transaction and price paid', priority: 'recommended' },
        { id: 'ev2', title: 'Service Center Job Sheet / Rejection Note', reason: 'Proves reported defect and service refusal', priority: 'recommended' },
      ];
    }
    if (lower.includes('salary') || lower.includes('employer')) {
      return [
        { id: 'ev1', title: 'Appointment Letter / Employment Contract', reason: 'Proves employment terms and agreed salary', priority: 'recommended' },
        { id: 'ev2', title: 'Bank Statement / Pay Slips', reason: 'Proves non-payment of monthly salary', priority: 'recommended' },
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

    let situationSummary = understanding.situationSummary || `Matter regarding: "${userDescription}"`;
    let userGoal = 'Resolve matter and obtain appropriate remedy';
    let whatCivicFlowFound = 'CivicFlow evaluated your case narrative and clarification answers.';
    let rightsAndConsiderations: string[] = [];
    let options = [];
    let recommendedNextStep = { title: '', explanation: '' };
    let actionPlan: ActionPlanStep[] = [];
    let responsibleAuthority: ResponsibleAuthority | null = null;
    let suggestedDocuments: SuggestedDocument[] = [];

    if (text.includes('landlord') || text.includes('deposit') || text.includes('rent')) {
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
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'security_deposit_refund_demand', title: 'Security Deposit Refund Demand Notice', reason: 'Formal demand notice to landlord', recommended: true },
      ];
    } else if (text.includes('light') || text.includes('lamp') || text.includes('street')) {
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
        confidence: 'high',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'complaint', title: 'Municipal Street Light Repair Complaint Letter', reason: 'Formal complaint to Municipal Executive Engineer', recommended: true },
      ];
    } else {
      whatCivicFlowFound = 'Based on the facts provided, you have a right to issue a formal written representation and seek administrative grievance redressal.';
      rightsAndConsiderations = [
        'Written representations create binding official records for administrative review.',
        'Grievances submitted to nodal authorities require acknowledgment.'
      ];
      options = [
        { title: 'Formal Administrative Representation', description: 'Submit an official written statement of facts requesting specific relief.', considerations: ['Establishes written notice for review'] },
      ];
      recommendedNextStep = { title: 'Submit Structured Representation', explanation: 'Creates formal documentation of your grievance.' };
      actionPlan = [
        { order: 1, title: 'Organize Case Timeline and Evidence', description: 'Compile dates, reference numbers, and facts.', status: 'in_progress' },
        { order: 2, title: 'Deliver Written Representation to Nodal Office', description: 'Submit formal letter to responsible authority.', status: 'not_started' },
      ];
      responsibleAuthority = {
        name: 'Nodal Public Authority / Service Provider',
        type: 'Competent Authority',
        relevance: 'Oversees service compliance and grievance resolution.',
        actionableInfo: 'Submit directly to head of department or nodal officer.',
        confidence: 'medium',
      };
      suggestedDocuments = [
        { id: 'doc_1', documentType: 'representation', title: 'Formal Written Representation', reason: 'Official statement of facts and request for action', recommended: true },
      ];
    }

    return {
      caseTitle: title,
      situationSummary,
      userGoal,
      whatCivicFlowFound,
      explanation: whatCivicFlowFound,
      rightsAndConsiderations,
      options,
      recommendedNextStep,
      actionPlan,
      responsibleAuthority,
      sources: [
        { id: 's1', title: 'Constitution of India & Statutory Rights Framework', url: 'https://india.gov.in', relevance: 'Governing statutory rights framework' },
      ],
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

    if (docType === 'security_deposit_refund_demand' || userDescription.toLowerCase().includes('deposit') || userDescription.toLowerCase().includes('landlord')) {
      title = 'Demand Notice for Security Deposit Refund';
      previewMarkdown = `### DEMAND NOTICE FOR REFUND OF SECURITY DEPOSIT

**Date:** ${currentDate}

**To,**  
**${authorityName}**  
${location}

**Subject:** Demand for immediate refund of security deposit — Regarding ${caseTitle}

**Sir / Madam,**

I am writing to formally demand the immediate refund of my security deposit paid for the rented premises at ${location}.

**1. Statement of Facts:**
- Applicant Name: ${applicantName}
- Issue Narrative: ${userDescription}
- I have handed over vacant possession of the premises with no unpaid dues or physical damages beyond normal wear and tear.

**2. Legal Obligation:**
Under Indian contract and tenancy principles, withholding security deposit without itemized proof of damage constitutes illegal retention of funds.

**3. Relief Demanded:**
You are hereby called upon to process and transfer the full security deposit amount to my bank account within **7 (seven) days** from receipt of this notice.

Failing this, I shall be constrained to initiate appropriate legal proceedings before the Rent Tribunal / Consumer Disputes Redressal Commission at your cost and risk.

Sincerely,  
**${applicantName}**  
Contact: ${fields.applicant_phone}  
Address: ${fields.applicant_address}`;
    } else if (docType === 'rti') {
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
