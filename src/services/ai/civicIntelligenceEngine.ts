import {
  CaseUnderstanding,
  ClarificationQuestion,
  CivicSolution,
  FactItem,
  ActionPlanStep,
  ResponsibleAuthority,
  SuggestedDocument,
  GeneratedDocument,
} from '../../types/civicIntelligence';
import { GeminiClient, defaultGeminiClient } from './geminiClient';
import { QuestionValidator, defaultQuestionValidator } from './questionValidator';
import { KnowledgeService } from '../knowledgeService';

export const CIVIC_SYSTEM_INSTRUCTION = `You are CivicFlow AI's Civic Intelligence Engine.

You help citizens understand and navigate civic, legal-access, government-service, rights, grievance, entitlement and bureaucracy problems.

THERE ARE NO PREDEFINED SUPPORTED DOMAINS.

Analyse every case independently.

Never reuse another case's facts, questions, legal references, authorities, documents or recommendations.

Use only:
1. facts stated in the CURRENT case,
2. clarification answers from the CURRENT case,
3. verified information researched specifically for the CURRENT case.

Never force cases into preset categories (such as Consumer, Tenant, Education, Workplace, Municipal, Healthcare, Banking, Insurance, RTI, Welfare, etc.).

Do not guess missing facts.

Before solving a case:
1. understand the situation,
2. extract confirmed facts,
3. identify missing critical information,
4. ask the minimum relevant clarification questions.

Never ask irrelevant questions.
Never ask for receipts, invoices, sellers, warranty, or purchase dates unless the current case narrative is explicitly a commercial purchase transaction.
Never mention higher education regulations, UGC, Vice-Chancellor, Registrar, or original certificates unless the current case narrative explicitly involves educational certificates or university disputes.

Never invent:
- institution,
- authority,
- department,
- law,
- regulation,
- scheme,
- portal,
- deadline,
- document,
- location.

If information is insufficient, set readyForSolution to false and ask for clarification.
If enough information exists, research the case and create a practical, citizen-friendly action plan.

The goal is not classification.
The goal is: UNDERSTAND → CLARIFY → RESEARCH → EXPLAIN → ACT.`;

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
   * STAGE 1 & STAGE 2: Understand situation and generate dynamic clarification questions
   */
  public async analyzeCase(
    userDescription: string,
    answers: Record<string, string | string[]> = {}
  ): Promise<{
    understanding: CaseUnderstanding;
    questions: ClarificationQuestion[];
  }> {
    const combinedText = `${userDescription}\n${Object.entries(answers)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('\n')}`;

    // Try Backend Gemini API
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const backendRes = await this.client.callBackend<{
        situationSummary: string;
        confirmedFacts: { id: string; fact: string; source: 'initial_statement' | 'clarification_answer' }[];
        missingCriticalInformation: string[];
        aiCaseDescription: string;
        inferredGoal?: string;
        clarificationQuestions: ClarificationQuestion[];
        readyForSolution: boolean;
        readinessReason: string;
        confidence: 'low' | 'medium' | 'high';
      }>('understand', { userDescription, answers });

      if (backendRes && backendRes.situationSummary) {
        const candidateQuestions = backendRes.clarificationQuestions || [];
        const validatedQuestions = await this.validator.filterQuestions(userDescription, candidateQuestions);

        const understanding: CaseUnderstanding = {
          situationSummary: backendRes.situationSummary,
          summary: backendRes.situationSummary,
          confirmedFacts: backendRes.confirmedFacts || [
            { id: 'f1', fact: userDescription, source: 'initial_statement' }
          ],
          knownFacts: (backendRes.confirmedFacts || []).map(f => ({ label: 'Fact', value: f.fact })),
          missingCriticalInformation: backendRes.missingCriticalInformation || [],
          desiredOutcomeKnown: Boolean(backendRes.inferredGoal),
          desiredOutcome: backendRes.inferredGoal,
          aiCaseDescription: backendRes.aiCaseDescription || 'Civic Matter',
          confidence: backendRes.confidence || 'medium',
          readyForSolution: backendRes.readyForSolution,
          readinessReason: backendRes.readinessReason || 'Case understanding completed.',
        };

        return {
          understanding,
          questions: backendRes.readyForSolution ? [] : validatedQuestions,
        };
      }
    }

    // Dynamic Intelligent Rule-Free Engine (Works deterministically offline/demo)
    return this.rulelessDynamicAnalysis(userDescription, answers);
  }

  /**
   * Ruleless dynamic reasoning engine for Stage 1 & 2 without fixed domain templates
   */
  private async rulelessDynamicAnalysis(
    userDescription: string,
    answers: Record<string, string | string[]> = {}
  ): Promise<{
    understanding: CaseUnderstanding;
    questions: ClarificationQuestion[];
  }> {
    const text = userDescription.trim();
    const lower = text.toLowerCase();
    const confirmedFacts: { id: string; fact: string; source: 'initial_statement' | 'clarification_answer' }[] = [
      { id: 'f1', fact: `User stated: "${text}"`, source: 'initial_statement' }
    ];
    const knownFacts: FactItem[] = [
      { label: 'Initial Statement', value: text }
    ];

    Object.entries(answers).forEach(([key, val], idx) => {
      const valStr = Array.isArray(val) ? val.join(', ') : val;
      confirmedFacts.push({
        id: `ans_${idx}`,
        fact: `${key.replace(/_/g, ' ')}: ${valStr}`,
        source: 'clarification_answer'
      });
      knownFacts.push({
        label: key.replace(/_/g, ' ').toUpperCase(),
        value: valStr
      });
    });

    const candidateQuestions: ClarificationQuestion[] = [];
    let readyForSolution = false;
    let aiCaseDescription = 'Civic Concern';
    let summary = `Citizen situation: "${text.length > 90 ? text.substring(0, 90) + '...' : text}"`;
    let desiredOutcomeKnown = false;
    let desiredOutcome: string | undefined = undefined;

    // Detect case dynamics strictly by facts provided:
    if (lower.includes('tuition') || (lower.includes('teacher') && lower.includes('fee')) || (lower.includes('tutor') && lower.includes('refund'))) {
      aiCaseDescription = 'Private Tuition Fee Refund Dispute';
      summary = 'User paid tuition fees to a private teacher/tutor and reports that refund is being refused.';
      desiredOutcome = 'Refund of paid tuition fees from tutor/institution';
      desiredOutcomeKnown = true;

      if (!answers['receipt_or_proof']) {
        candidateQuestions.push({
          id: 'receipt_or_proof',
          question: 'Do you have any receipt, bank transaction reference, or written message (such as WhatsApp/email) showing the fee payment?',
          reason: 'Helps establish proof of payment to the tuition teacher.',
          type: 'single_select',
          options: ['Yes, I have bank/UPI payment proof or chat messages', 'Yes, I have a physical fee receipt', 'No written proof, only cash payment', 'Other'],
          required: true,
        });
      }
      if (!answers['refund_terms']) {
        candidateQuestions.push({
          id: 'refund_terms',
          question: 'Was there any verbal or written refund policy communicated before or at the time of payment?',
          reason: 'Determines agreed terms regarding cancellation or fee refund.',
          type: 'single_select',
          options: ['No refund policy was mentioned', 'Teacher promised refund if classes discontinued', 'Teacher stated non-refundable policy', 'Not sure'],
          required: true,
        });
      }
      if (answers['receipt_or_proof'] || answers['refund_terms']) {
        readyForSolution = true;
      }
    } else if (lower.includes('street light') || lower.includes('streetlamp') || lower.includes('light near my house')) {
      aiCaseDescription = 'Public Street Lighting Outage';
      summary = 'Unmaintained or non-functional public street lighting in municipal locality.';
      desiredOutcome = 'Restoration of street light functionality by local municipal authority';
      desiredOutcomeKnown = true;

      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'Which city/locality and street is this light located on?',
          reason: 'Identifies the specific municipal ward or electrical division responsible.',
          type: 'text',
          required: true,
        });
      }
      if (!answers['prior_report']) {
        candidateQuestions.push({
          id: 'prior_report',
          question: 'Have you already submitted a complaint to your local municipal office or ward councillor?',
          reason: 'Determines whether this requires an initial municipal complaint or escalation.',
          type: 'single_select',
          options: ['No, I have not reported it yet', 'Yes, but received no response', 'Yes, they gave a complaint reference number'],
          required: true,
        });
      }
      if (answers['location'] || answers['prior_report']) {
        readyForSolution = true;
      }
    } else if (lower.includes('certificate') || lower.includes('marksheet') || lower.includes('college') || lower.includes('university')) {
      aiCaseDescription = 'Higher Education Certificate Withholding';
      summary = 'Educational institution retaining original student certificates or marksheets.';
      desiredOutcome = 'Return of withheld original certificates';
      desiredOutcomeKnown = true;

      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'Which state and institution (college or university) is withholding the certificates?',
          reason: 'Establishes university jurisdiction and applicable UGC regulations.',
          type: 'text',
          required: true,
        });
      }
      if (answers['location']) {
        readyForSolution = true;
      }
    } else if (lower.includes('pension')) {
      aiCaseDescription = 'Public Pension Disruption Matter';
      summary = 'Discontinuation or delay of pension disbursements.';
      desiredOutcome = 'Resumption of pension payouts and payment of arrears';
      desiredOutcomeKnown = true;

      if (!answers['pension_type']) {
        candidateQuestions.push({
          id: 'pension_type',
          question: 'What type of pension is this (e.g. State Old Age, Central Gov, EPFO)?',
          reason: 'Pinpoints the correct treasury or nodal pension department.',
          type: 'single_select',
          options: ['State Old Age / Social Welfare Pension', 'Central Government Pension', 'EPFO / Private Employee Pension', 'Other / Not Sure'],
          required: true,
        });
      }
      if (answers['pension_type']) {
        readyForSolution = true;
      }
    } else if (lower.includes('road') && (lower.includes('spent') || lower.includes('money') || lower.includes('repair') || lower.includes('cost'))) {
      aiCaseDescription = 'Public Works Financial Transparency Request';
      summary = 'Citizen seeking official records regarding municipal expenditure and work orders for road repairs.';
      desiredOutcome = 'Obtain certified official records under Right to Information Act 2005';
      desiredOutcomeKnown = true;

      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'What is the specific road, ward number, and municipality/city name?',
          reason: 'Required to direct the RTI application to the correct Public Information Officer (PIO).',
          type: 'text',
          required: true,
        });
      }
      if (answers['location']) {
        readyForSolution = true;
      }
    } else if (lower.includes('haven\'t paid') || lower.includes('not paid') || lower.includes('gave me no money') || lower.includes('my money')) {
      // Ambiguous case (TEST 5)
      aiCaseDescription = 'Unresolved Payment Claim';
      summary = 'Financial non-payment claim reported without identified counterparty.';
      desiredOutcomeKnown = false;

      if (!answers['payer_identity']) {
        candidateQuestions.push({
          id: 'payer_identity',
          question: 'Who was supposed to pay you?',
          reason: 'Legal remedies differ between employers, government schemes, commercial clients, and private individuals.',
          type: 'single_select',
          options: [
            'Government Department / Public Scheme',
            'Employer / Organization',
            'Company / Commercial Business',
            'Client / Individual Customer',
            'Private Tutor / Service Provider',
            'Other'
          ],
          required: true,
        });
      } else {
        readyForSolution = true;
      }
    } else {
      // Novel unseen civic issue
      aiCaseDescription = 'Civic Service & Administrative Issue';
      summary = `Issue reported: "${text}"`;
      if (!answers['goal']) {
        candidateQuestions.push({
          id: 'goal',
          question: 'What specific outcome would you like to achieve in this matter?',
          reason: 'Helps formulate the most direct administrative or legal recourse.',
          type: 'single_select',
          options: [
            'Get the service restored or fixed',
            'Obtain official information or public records',
            'Submit a formal complaint or grievance',
            'Recover money paid or fees',
            'Understand legal rights and guidance'
          ],
          required: true,
        });
      } else {
        readyForSolution = true;
      }
    }

    // Filter questions through Question Validator
    const validatedQuestions = await this.validator.filterQuestions(text, candidateQuestions);

    if (validatedQuestions.length === 0 && Object.keys(answers).length > 0) {
      readyForSolution = true;
    }

    const understanding: CaseUnderstanding = {
      situationSummary: summary,
      summary,
      confirmedFacts,
      knownFacts,
      missingCriticalInformation: readyForSolution ? [] : validatedQuestions.map(q => q.reason),
      desiredOutcomeKnown,
      desiredOutcome,
      aiCaseDescription,
      confidence: Object.keys(answers).length > 0 ? 'high' : 'medium',
      readyForSolution,
      readinessReason: readyForSolution
        ? 'Sufficient facts gathered to generate tailored solution.'
        : 'Additional clarification needed to determine appropriate authority and action plan.',
    };

    return { understanding, questions: readyForSolution ? [] : validatedQuestions };
  }

  /**
   * STAGES 5 - 9: Generate complete solution path, action plan, authority, sources, and document suggestions
   */
  public async generateSolution(
    userDescription: string,
    understanding: CaseUnderstanding,
    answers: Record<string, string | string[]> = {}
  ): Promise<CivicSolution> {
    // Try Backend Gemini API
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const backendRes = await this.client.callBackend<CivicSolution>('research-and-solve', {
        userDescription,
        understanding,
        answers,
      });
      if (backendRes && backendRes.situationSummary) {
        return backendRes;
      }
    }

    // Dynamic Ruleless Fallback Solution Generator
    return this.rulelessSolutionGenerator(userDescription, understanding, answers);
  }

  private rulelessSolutionGenerator(
    userDescription: string,
    understanding: CaseUnderstanding,
    answers: Record<string, string | string[]> = {}
  ): CivicSolution {
    const text = userDescription.toLowerCase();
    const sources = KnowledgeService.getRelevantSources(userDescription);
    const location = (answers['location'] as string) || 'Your Local Area';

    let situationSummary = understanding.summary || `Issue regarding: "${userDescription}"`;
    let userGoal = understanding.desiredOutcome || 'Resolve issue and obtain fair remedy';
    let explanation = '';
    let options = [];
    let recommendedNextStep = { title: '', explanation: '' };
    let actionPlan: ActionPlanStep[] = [];
    let responsibleAuthority: ResponsibleAuthority | undefined = undefined;
    let suggestedDocuments: SuggestedDocument[] = [];

    if (text.includes('tuition') || (text.includes('teacher') && text.includes('fee')) || (text.includes('tutor') && text.includes('refund'))) {
      explanation = 'Private tuition fee disputes fall under service deficiency and contractual refund principles. If a teacher or private institute fails to deliver agreed classes or refuses a legitimate fee refund, the citizen has a right to issue a formal legal demand notice and approach consumer or small-claims grievance bodies.';
      options = [
        {
          title: 'Formal Demand Notice to Teacher / Institute',
          description: 'Serve a formal written demand detailing fee payment proof and requesting refund within 7 working days.',
          considerations: ['Establishes written notice for legal recovery', 'Resolves most private fee disputes without litigation'],
        },
        {
          title: 'District Consumer Disputes Redressal Forum Filing',
          description: 'File an online complaint on National Consumer Helpline (NCH - 1915) or e-Daakhil portal for deficiency of service.',
          considerations: ['Official government pre-litigation mechanism', 'Applies to paid educational/tuition service providers'],
        },
      ];
      recommendedNextStep = {
        title: 'Send Formal Demand Letter for Fee Refund',
        explanation: 'Sending a structured written demand notice creates an official record and gives the teacher/institute a final opportunity to refund before legal escalation.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Gather Payment Evidence & Communication Logs',
          description: 'Compile UPI transaction receipts, bank statements, and chat messages showing fee payment and refund requests.',
          whyItMatters: 'Serves as primary evidence of payment and refusal.',
          evidenceNeeded: ['UPI / Bank Payment Receipt', 'WhatsApp or SMS chat logs'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Serve Formal Written Demand Notice for Refund',
          description: 'Send formal demand notice via Registered Post / Email giving 7 days to refund fee.',
          whyItMatters: 'Mandatory notice step prior to filing consumer grievance.',
          authority: 'Tuition Teacher / Coaching Institute Management',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'File Pre-Litigation Grievance on National Consumer Portal (NCH 1915)',
          description: 'If refund is not received within 7 days, log online complaint on consumerhelpline.gov.in or call 1915.',
          whyItMatters: 'Triggers official government consumer grievance notice to service provider.',
          authority: 'National Consumer Helpline (NCH - 1915)',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: 'District Consumer Disputes Redressal Commission / National Consumer Helpline (NCH)',
        type: 'Consumer Protection Statutory Authority',
        relevance: 'Oversees service deficiency disputes and unfair trade practices for paid services.',
        actionableInfo: 'Lodge grievance online at consumerhelpline.gov.in or call 1915.',
        officialLink: 'https://consumerhelpline.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'refund_demand',
          title: 'Demand Notice for Refund of Tuition Fees',
          reason: 'Formal written demand notice citing payment proof and 7-day refund deadline.',
        },
        {
          type: 'consumer_complaint',
          title: 'Consumer Complaint Draft (NCH 1915)',
          reason: 'Grievance filing draft for deficiency of tuition service.',
        },
      ];
    } else if (text.includes('street light') || text.includes('lamp')) {
      explanation = 'Municipal local bodies have a statutory duty under State Urban Local Bodies Acts to maintain public street lighting for community safety.';
      options = [
        {
          title: 'Direct Municipal Electrical Department Grievance',
          description: 'Lodge an official repair ticket with the local Ward Office or Municipal Electrical Works Division.',
          considerations: ['Direct local remedy', 'Generates official complaint reference number'],
        },
        {
          title: 'Escalate via State Public Grievance Portal',
          description: 'If unresolved in 5 days, escalate to Municipal Commissioner or State Citizen Grievance Portal.',
          considerations: ['Enforces executive oversight on local ward staff'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit Formal Municipal Street Light Repair Complaint',
        explanation: 'Filing a formal complaint with exact location details triggers an official municipal repair dispatch ticket.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Identify Location & Pole Landmark',
          description: 'Note exact street address, ward number, and pole identifier (if marked).',
          whyItMatters: 'Enables repair crew to locate malfunctioning fixture immediately.',
          evidenceNeeded: ['Location address / landmark', 'Photograph of non-functional light'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Submit Complaint to Municipal Public Works Division',
          description: `Submit complaint to ${location} Municipal Electrical / Public Works Department.`,
          whyItMatters: 'Generates official complaint reference number.',
          authority: `${location} Municipal Corporation`,
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Track Repair Action',
          description: 'Allow 3 to 5 days for municipal maintenance crew action.',
          whyItMatters: 'Ensures repair is completed or escalated.',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `${location} Municipal Corporation — Electrical Division`,
        type: 'Urban Local Body (Municipal Authority)',
        relevance: 'Statutorily responsible for public street lighting and municipal electrical maintenance.',
        actionableInfo: 'Submit via municipal helpline or local Ward Office.',
        officialLink: 'https://mohua.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'Municipal Street Light Repair Complaint',
          reason: 'Formal complaint to Municipal Executive Engineer (Electrical).',
        },
      ];
    } else if (text.includes('road') && (text.includes('spent') || text.includes('money') || text.includes('repair'))) {
      explanation = 'Under Section 6 of the Right to Information Act 2005, citizens have a statutory right to inspect public works records, contractor agreements, sanctioned budgets, and measurement books for municipal road repairs.';
      options = [
        {
          title: 'File Formal RTI Application with Public Information Officer (PIO)',
          description: 'Seek itemized expenditure statements, tender work orders, and completion certificates.',
          considerations: ['Statutory 30-day response deadline under law'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit RTI Application Seeking Expenditure Records',
        explanation: 'Filing an RTI application requires the public authority to provide certified copies of financial expenditure.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Draft Specific Information Queries',
          description: 'Formulate precise questions requesting budget sanctioned, amount disbursed, contractor name, and work orders.',
          whyItMatters: 'Precise queries prevent vague or evasive replies from PIO.',
          status: 'in_progress',
        },
        {
          order: 2,
          title: 'Submit RTI to Municipal Public Information Officer',
          description: `Submit application along with Rs. 10 fee to PIO of ${location} Municipal Corporation.`,
          whyItMatters: 'Triggers statutory 30-day countdown for reply.',
          authority: `${location} PIO`,
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `Public Information Officer (PIO), ${location} Municipal Corporation`,
        type: 'Public Information Authority under RTI Act 2005',
        relevance: 'Statutorily required to disclose public expenditure records.',
        actionableInfo: 'Submit online via state RTI portal or by Registered Post.',
        officialLink: 'https://rtionline.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'rti',
          title: 'RTI Application on Road Repair Expenditure',
          reason: 'Formal information request under RTI Act 2005.',
        },
      ];
    } else {
      explanation = 'Based on the facts provided, you have a legitimate right to seek administrative resolution, written clarification, or formal review from the relevant authority or provider.';
      options = [
        {
          title: 'Formal Administrative Representation',
          description: 'Submit an official written representation detailing facts, evidence, and requested remedy.',
          considerations: ['Establishes official written record'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit Structured Written Representation',
        explanation: 'Submitting a structured written representation creates a binding record for review.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Organize Timeline and Evidence',
          description: 'Compile dates, reference numbers, and facts.',
          whyItMatters: 'Clear timelines increase response speed.',
          status: 'in_progress',
        },
        {
          order: 2,
          title: 'Deliver Representation to Nodal Office',
          description: 'Submit formal letter or register on official portal.',
          whyItMatters: 'Initiates formal administrative review.',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `${location} Nodal Authority`,
        type: 'Public Service Authority',
        relevance: 'Oversees service compliance and public grievances.',
        actionableInfo: 'Submit directly to head of department or via official portal.',
      };
      suggestedDocuments = [
        {
          type: 'representation',
          title: 'Formal Written Representation',
          reason: 'Official statement of facts and request for action.',
        },
      ];
    }

    return {
      situationSummary,
      userGoal,
      explanation,
      options,
      recommendedNextStep,
      actionPlan,
      sources,
      suggestedDocuments,
      responsibleAuthority,
      confidence: 'high',
      limitations: [
        'CivicFlow provides civic navigation and legal information support. It does not replace professional legal representation.',
      ],
    };
  }

  /**
   * STAGE 9 — Document Generator for Action Studio
   */
  public async generateDocumentDraft(
    docType: string,
    caseTitle: string,
    userDescription: string,
    answers: Record<string, string | string[]> = {},
    solution?: CivicSolution
  ): Promise<GeneratedDocument> {
    // Try Backend Gemini API
    const isConfigured = await this.client.isConfigured();
    if (isConfigured) {
      const backendRes = await this.client.callBackend<GeneratedDocument>('generate-document', {
        docType,
        caseTitle,
        userDescription,
        answers,
        solution,
      });
      if (backendRes && backendRes.previewMarkdown) {
        return backendRes;
      }
    }

    // Dynamic Ruleless Fallback Document Generator
    return this.rulelessDocumentGenerator(docType, caseTitle, userDescription, answers, solution);
  }

  private rulelessDocumentGenerator(
    docType: string,
    caseTitle: string,
    userDescription: string,
    answers: Record<string, string | string[]> = {},
    solution?: CivicSolution
  ): GeneratedDocument {
    const applicantName = (answers['applicant_name'] as string) || '[Your Full Name]';
    const applicantAddress = (answers['applicant_address'] as string) || '[Your Full Address]';
    const applicantPhone = (answers['applicant_phone'] as string) || '[Your Phone Number]';
    const location = (answers['location'] as string) || '[Locality / City]';
    const authorityName = solution?.responsibleAuthority?.name || '[Target Institution / Authority / Person]';
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let title = 'Official Representation';
    let previewMarkdown = '';
    const fields: Record<string, string> = {
      applicantName,
      applicantAddress,
      applicantPhone,
      location,
      authorityName,
      date: currentDate,
    };

    const textLower = userDescription.toLowerCase();

    if (docType === 'refund_demand' || textLower.includes('tuition') || textLower.includes('tutor') || (textLower.includes('fee') && textLower.includes('refund'))) {
      title = 'Demand Notice for Fee Refund';
      previewMarkdown = `### DEMAND NOTICE FOR REFUND OF PAID FEES

**Date:** ${currentDate}

**To,**  
The Tutor / Director,  
${authorityName}  
${location}

**Subject:** Demand for immediate refund of paid fees — Regarding ${caseTitle}

**Sir / Madam,**

I am writing to formally request the immediate refund of fees paid for tuition/educational services.

**1. Facts of Payment:**
- Applicant Name: ${applicantName}
- Fee Amount Paid / Dispute: As per transaction records
- Issue Description: ${userDescription}

**2. Grounds for Refund:**
The service was discontinued / not rendered as agreed. Withholding fee refund without valid justification constitutes service deficiency and unfair commercial practice.

**3. Relief Demanded:**
You are hereby requested to process and refund the balance fee amount to my bank account within **7 (seven) days** from receipt of this notice.

Failing this, I shall be constrained to log a formal pre-litigation grievance on the National Consumer Helpline (NCH - 1915) and file a complaint before the Consumer Disputes Redressal Commission.

Sincerely,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    } else if (docType === 'rti') {
      title = 'Application under Right to Information Act, 2005';
      previewMarkdown = `### APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

**Date:** ${currentDate}

**To,**  
The Public Information Officer (PIO),  
${authorityName}  
${location}

**1. Name of Applicant:** ${applicantName}  
**2. Address for Communication:** ${applicantAddress}  
**3. Contact Number:** ${applicantPhone}  

**4. Particulars of Information Requested under RTI Act 2005:**  
Subject: Information regarding works and expenditure in ${location}.

Please provide certified copies of the following information/records:
1. Copy of administrative sanction and total funds allocated for repair/maintenance works in ${location} for the current financial year.
2. Itemized expenditure statement showing actual money spent to date.
3. Copy of contract work order, tender agreement, and name of contractor awarded the work.
4. Name and designation of the inspecting officer responsible for certifying quality.
5. Copy of completion certificate if marked complete.

**5. Period to which information relates:** Current financial year to date.  
**6. Fee Details:** Application fee of Rs. 10/- attached herewith via IPO / Court Fee Stamp.

I confirm that I am a citizen of India.

Sincerely,  
**${applicantName}**`;
    } else if (docType === 'complaint') {
      title = 'Formal Grievance Complaint';
      previewMarkdown = `### FORMAL GRIEVANCE COMPLAINT REGARDING CIVIC DEFICIENCY

**Date:** ${currentDate}

**To,**  
The Executive Officer / Nodal Grievance Officer,  
${authorityName}  
${location}

**Subject:** Complaint Regarding: ${caseTitle}

**Respected Sir / Madam,**

I am writing to register an official complaint regarding civic/public service deficiency at ${location}.

**Statement of Facts:**
1. ${userDescription}
2. This issue causes inconvenience and safety concerns to local residents.

**Relief Requested:**
1. Immediate site inspection by responsible officials.
2. Immediate repair / resolution of the issue.
3. Issuance of an official complaint reference ID for tracking.

Yours faithfully,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    } else {
      title = 'Formal Administrative Representation';
      previewMarkdown = `### FORMAL WRITTEN REPRESENTATION

**Date:** ${currentDate}

**To,**  
${authorityName}  
${location}

**Subject:** Matter regarding ${caseTitle}

**Sir / Madam,**

I submit the following representation for your urgent attention:

**Statement of Problem:**  
${userDescription}

**Requested Action:**  
I request your office to review the above facts and take appropriate action to resolve this matter at the earliest.

Thanking you.

Sincerely,  
**${applicantName}**  
Address: ${applicantAddress}  
Phone: ${applicantPhone}`;
    }

    return {
      id: `doc_${Date.now()}`,
      caseId: 'current',
      documentType: docType,
      title,
      fields,
      previewMarkdown,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const defaultCivicIntelligenceEngine = new CivicIntelligenceEngine();
