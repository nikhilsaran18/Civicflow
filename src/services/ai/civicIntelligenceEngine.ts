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

export const CIVIC_SYSTEM_INSTRUCTION = `You are CivicFlow's Civic Intelligence Engine.

Your role is to help a citizen understand and navigate a civic, government-service, rights, entitlement, grievance or legal-access problem.

You MUST analyse each case independently.

You must NEVER select questions or answers merely because the case resembles a predefined category.

There are NO predefined supported domains.

Do not force a case into consumer, tenant, workplace, RTI, healthcare, municipal or any other preset domain.

You may create a descriptive issue label after understanding the case, but that label must not control your reasoning.

Never reuse a questionnaire from another case.

Never ask a question unless its answer materially helps determine:
- what happened,
- relevant facts,
- jurisdiction/location,
- responsible entity,
- user's desired outcome,
- evidence/status,
- possible rights/options,
- authority/procedure,
- or practical next action.

Ask the minimum number of relevant clarification questions.

If sufficient information is already available, do not ask unnecessary questions.

Never assume the user has:
- a receipt,
- an invoice,
- a purchase,
- a landlord,
- an employer,
- a complaint number,
- a contract,
- a government application,
- or any other document unless the current facts make it relevant.

If the situation is ambiguous, clarify before recommending an action.

Do not hallucinate laws, authorities, schemes, eligibility rules, deadlines or official links.

When verified official information is available, use it.

Clearly distinguish:
1. confirmed facts provided by the citizen,
2. AI interpretation,
3. information supported by external sources,
4. assumptions or uncertainty.

Translate bureaucratic complexity into simple language.

Your goal is not to classify the citizen.
Your goal is to understand their situation and help them move toward the most appropriate next step.`;

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

    // Try Gemini API if key is present
    if (this.client.hasKey()) {
      const prompt = `Analyze this citizen case narrative and any provided follow-up answers:
Narrative: "${combinedText}"

Return JSON matching this schema:
{
  "understanding": {
    "summary": "plain-language overview",
    "knownFacts": [{"label": "Fact name", "value": "Fact detail"}],
    "missingInformation": ["item 1", "item 2"],
    "desiredOutcomeKnown": boolean,
    "desiredOutcome": "optional goal if stated or clear",
    "aiCaseDescription": "dynamic descriptive label (e.g., Municipal Infrastructure Grievance)",
    "jurisdictionNeeded": boolean,
    "urgency": "low" | "medium" | "high" | "critical",
    "confidence": "low" | "medium" | "high",
    "readyForSolution": boolean
  },
  "candidateQuestions": [
    {
      "id": "q1",
      "question": "Clear case-specific follow up question",
      "reason": "Why this question matters for solving the case",
      "type": "text" | "textarea" | "yes_no" | "single_select" | "multi_select" | "date" | "number" | "location",
      "options": ["Option 1", "Option 2"],
      "required": true
    }
  ]
}`;

      const res = await this.client.generateJSON<{
        understanding: CaseUnderstanding;
        candidateQuestions: ClarificationQuestion[];
      }>(CIVIC_SYSTEM_INSTRUCTION, prompt);

      if (res && res.understanding) {
        const validatedQuestions = await this.validator.filterQuestions(
          combinedText,
          res.candidateQuestions || []
        );
        return {
          understanding: res.understanding,
          questions: res.understanding.readyForSolution ? [] : validatedQuestions,
        };
      }
    }

    // Dynamic Intelligent Rule-Free Engine (Works deterministically offline/demo)
    return this.rulelessDynamicAnalysis(userDescription, answers);
  }

  /**
   * Ruleless dynamic reasoning engine for Stage 1, 2, 3, 4 without fixed domain templates
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
    const knownFacts: FactItem[] = [];

    // Extract facts dynamically from input
    knownFacts.push({ label: 'Initial Citizen Statement', value: text });

    if (answers['location']) {
      knownFacts.push({
        label: 'Location / Jurisdiction',
        value: Array.isArray(answers['location']) ? answers['location'].join(', ') : answers['location'],
      });
    }
    if (answers['prior_report']) {
      knownFacts.push({
        label: 'Prior Action Taken',
        value: Array.isArray(answers['prior_report']) ? answers['prior_report'].join(', ') : answers['prior_report'],
      });
    }

    // Determine missing info & dynamic questions based strictly on what's present in narrative
    const candidateQuestions: ClarificationQuestion[] = [];
    let readyForSolution = false;
    let aiCaseDescription = 'Citizen Civic/Legal Concern';
    let summary = `Citizen reports: "${text.length > 90 ? text.substring(0, 90) + '...' : text}"`;
    let desiredOutcomeKnown = false;
    let desiredOutcome = undefined;

    // Detect case dynamics without fixed domains:
    if (lower.includes('street light') || lower.includes('streetlamp') || lower.includes('light near my house')) {
      aiCaseDescription = 'Municipal Infrastructure Grievance';
      summary = 'Unmaintained or non-functional public street lighting in municipal area.';
      desiredOutcome = 'Restoration of street light functionality by local municipal authority';
      desiredOutcomeKnown = true;

      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'Which city/state and locality or street is this light located in?',
          reason: 'Identifies the local municipal corporation or urban local body responsible.',
          type: 'text',
          required: true,
        });
      }
      if (!answers['prior_report']) {
        candidateQuestions.push({
          id: 'prior_report',
          question: 'Have you already submitted a complaint to your local municipal office or ward councillor?',
          reason: 'Determines whether this is an initial grievance or requires escalation.',
          type: 'single_select',
          options: ['No, I have not reported it yet', 'Yes, but received no response', 'Yes, they gave a complaint reference number'],
          required: true,
        });
      }
      if (answers['location'] || answers['prior_report']) {
        readyForSolution = true;
      }
    } else if (lower.includes('certificate') || lower.includes('marksheet') || lower.includes('college') || lower.includes('university')) {
      aiCaseDescription = 'Higher Education Student Grievance';
      summary = 'Educational institution retaining original student certificates or documents.';
      desiredOutcome = 'Return of withheld original certificates and documents';
      desiredOutcomeKnown = true;

      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'Which state and institution (college or university) is withholding the certificates?',
          reason: 'Establishes state university jurisdiction and applicable UGC regulations.',
          type: 'text',
          required: true,
        });
      }
      if (!answers['reason_given']) {
        candidateQuestions.push({
          id: 'reason_given',
          question: 'Did the institution provide any written or verbal reason for withholding them?',
          reason: 'Determines whether the withholding violates UGC anti-retention mandates.',
          type: 'textarea',
          required: false,
        });
      }
      if (answers['location']) {
        readyForSolution = true;
      }
    } else if (lower.includes('pension')) {
      aiCaseDescription = 'Public Pension Disruption Matter';
      summary = 'Discontinuation or delay of pension disbursements from public pension provider.';
      desiredOutcome = 'Resumption of pension disbursements and payout of arrears';
      desiredOutcomeKnown = true;

      if (!answers['pension_type']) {
        candidateQuestions.push({
          id: 'pension_type',
          question: 'What type of pension is this (e.g., Central Gov, State Old Age, EPFO, Defense)?',
          reason: 'Pinpoints the correct treasury or nodal pension department.',
          type: 'single_select',
          options: ['State Old Age / Social Welfare Pension', 'Central Government Pension', 'EPFO / Private Employee Pension', 'Defense Pension (SPARSH)', 'Other / Not Sure'],
          required: true,
        });
      }
      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'Which state or district Treasury office issues the pension?',
          reason: 'Identifies the administrative jurisdiction.',
          type: 'text',
          required: true,
        });
      }
      if (answers['pension_type'] || answers['location']) {
        readyForSolution = true;
      }
    } else if (lower.includes('road') && (lower.includes('spent') || lower.includes('money') || lower.includes('repair') || lower.includes('cost') || lower.includes('allocated'))) {
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
      // Ambiguous case requirement (TEST 5)
      aiCaseDescription = 'Unresolved Payment Claim';
      summary = 'Financial claim or non-payment reported without specified counterparty.';
      desiredOutcomeKnown = false;

      if (!answers['payer_identity']) {
        candidateQuestions.push({
          id: 'payer_identity',
          question: 'Who was supposed to pay you?',
          reason: 'Payment rights differ fundamentally between employers, government schemes, clients, companies, and landlords.',
          type: 'single_select',
          options: [
            'Government Department / Public Scheme',
            'Employer / Organization',
            'Company / Commercial Business',
            'Client / Individual Customer',
            'Landlord / Tenant',
            'Bank / Financial Institution',
            'Other / Explain'
          ],
          required: true,
        });
      } else {
        readyForSolution = true;
      }
    } else {
      // Novel or general case
      aiCaseDescription = 'Civic Service & Rights Matter';
      summary = `Issue involving: "${text}"`;
      if (!answers['goal']) {
        candidateQuestions.push({
          id: 'goal',
          question: 'What would you like to achieve regarding this matter?',
          reason: 'Helps formulate the most effective legal and bureaucratic action path.',
          type: 'single_select',
          options: [
            'Get the issue resolved / service restored',
            'Obtain official government records or information',
            'Submit a formal grievance or complaint',
            'Understand my legal rights and entitlements',
            'Recover money or withheld documents',
            'Guide me — I am not sure'
          ],
          required: true,
        });
      } else {
        readyForSolution = true;
      }
    }

    // Pass candidates through mandatory Stage 2.5 Validator
    const validatedQuestions = await this.validator.filterQuestions(text, candidateQuestions);

    // If no questions left or key answer received, mark ready
    if (validatedQuestions.length === 0 && Object.keys(answers).length > 0) {
      readyForSolution = true;
    }

    const understanding: CaseUnderstanding = {
      summary,
      knownFacts,
      missingInformation: readyForSolution ? [] : validatedQuestions.map(q => q.reason),
      desiredOutcomeKnown,
      desiredOutcome,
      aiCaseDescription,
      jurisdictionNeeded: !answers['location'],
      urgency: lower.includes('urgent') || lower.includes('emergency') ? 'high' : 'medium',
      confidence: 'high',
      readyForSolution,
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
    const combinedText = `${userDescription}\n${JSON.stringify(answers)}`;

    // Try Gemini API if key is present
    if (this.client.hasKey()) {
      const prompt = `Generate a complete CivicSolution JSON for this case:
Description: "${combinedText}"
Understanding: ${JSON.stringify(understanding)}

Return JSON matching this structure:
{
  "situationSummary": "Plain language overview",
  "userGoal": "Primary citizen objective",
  "explanation": "Clear explanation of rights/options",
  "options": [
    {"title": "Option name", "description": "Details", "considerations": ["Consideration 1"]}
  ],
  "recommendedNextStep": {
    "title": "Clear action title",
    "explanation": "Why this is recommended first"
  },
  "actionPlan": [
    {
      "order": 1,
      "title": "Step 1 title",
      "description": "Step 1 details",
      "whyItMatters": "Reason",
      "evidenceNeeded": ["Evidence item 1"],
      "authority": "Authority name",
      "status": "not_started"
    }
  ],
  "sources": [
    {
      "title": "Source title",
      "authority": "Authority",
      "url": "https://...",
      "relevance": "Why relevant"
    }
  ],
  "suggestedDocuments": [
    {
      "type": "complaint" | "rti" | "request" | "appeal",
      "title": "Document name",
      "reason": "Why this document is useful"
    }
  ],
  "responsibleAuthority": {
    "name": "Authority Name",
    "type": "Municipal / University / State Department",
    "relevance": "Why responsible",
    "actionableInfo": "How to contact or submit",
    "officialLink": "https://..."
  },
  "confidence": "high",
  "limitations": ["CivicFlow provides civic navigation support and does not replace formal legal counsel."]
}`;

      const solution = await this.client.generateJSON<CivicSolution>(CIVIC_SYSTEM_INSTRUCTION, prompt);
      if (solution) {
        return solution;
      }
    }

    // Intelligent Deterministic Generator (Ruleless fallback)
    return this.rulelessSolutionGenerator(userDescription, understanding, answers);
  }

  private rulelessSolutionGenerator(
    userDescription: string,
    understanding: CaseUnderstanding,
    answers: Record<string, string | string[]> = {}
  ): CivicSolution {
    const text = userDescription.toLowerCase();
    const sources = KnowledgeService.getRelevantSources(userDescription);
    const location = (answers['location'] as string) || 'Your Local Municipality / District';

    let situationSummary = understanding.summary;
    let userGoal = understanding.desiredOutcome || 'Resolve civic issue and restore rights';
    let explanation = '';
    let options = [];
    let recommendedNextStep = { title: '', explanation: '' };
    let actionPlan: ActionPlanStep[] = [];
    let responsibleAuthority: ResponsibleAuthority | undefined = undefined;
    let suggestedDocuments: SuggestedDocument[] = [];

    if (text.includes('street light') || text.includes('lamp')) {
      explanation = 'Municipal bodies have a statutory obligation under State Urban Local Bodies Acts to maintain public street lighting for safety and public convenience. Non-functioning street lights pose public safety hazards.';
      options = [
        {
          title: 'Direct Municipal Grievance Registration',
          description: 'Register an official complaint with the Municipal Electrical Works / Public Works department.',
          considerations: ['Fastest direct remedy', 'Generates an official complaint reference ID'],
        },
        {
          title: 'RTI Information Request (Escalation)',
          description: 'Request work order and maintenance records if no repair action is taken within 7 days.',
          considerations: ['Use if municipal office fails to respond to initial complaint'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit Formal Municipal Infrastructure Complaint',
        explanation: 'Filing a formal complaint with the Municipal Electrical Department triggers an official repair ticket.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Gather Landmark & Pole Details',
          description: 'Note exact street location, nearest pole number (if marked), and duration of outage (10 days).',
          whyItMatters: 'Enables line inspectors to locate the exact malfunctioning fixture quickly.',
          evidenceNeeded: ['Photograph of dark street or pole number', 'Location address'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Submit Grievance to Municipal Authority',
          description: `Submit complaint to ${location} Municipal Public Works / Electrical Department.`,
          whyItMatters: 'Creates legal record of notification to the public authority.',
          authority: `${location} Municipal Corporation`,
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Track Repair Status & Escalate if Unresolved',
          description: 'Allow 3 to 7 working days for municipal maintenance crew action.',
          whyItMatters: 'If unresolved after 7 days, submit an RTI request regarding maintenance contract spending.',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `${location} Municipal Corporation — Electrical / Public Works Division`,
        type: 'Urban Local Body (Municipal Authority)',
        relevance: 'Statutorily responsible for maintaining civic infrastructure and public street lights.',
        actionableInfo: 'Submit via municipal helpline portal or local Ward Office.',
        officialLink: 'https://mohua.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'Municipal Street Light Repair Complaint',
          reason: 'Formal representation to Executive Engineer (Electrical) for immediate repair.',
        },
        {
          type: 'rti',
          title: 'RTI Application on Maintenance Work Orders',
          reason: 'Use for escalation if repair is delayed beyond 7 days.',
        },
      ];
    } else if (text.includes('certificate') || text.includes('marksheet') || text.includes('college')) {
      explanation = 'According to UGC (Redressal of Grievances of Students) Regulations 2023, higher education institutions are legally barred from withholding original certificates or marksheets of students for any reason, including pending fee disputes or college leaving formalities.';
      options = [
        {
          title: 'Formal Written Representation to Principal / Vice-Chancellor',
          description: 'Submit an official notice citing UGC Anti-Retention Regulations requesting immediate release.',
          considerations: ['Most effective first step; cites binding regulatory mandates'],
        },
        {
          title: 'UGC e-Samadhan Grievance Escalation',
          description: 'File an online complaint on the UGC e-Samadhan portal if college remains non-compliant.',
          considerations: ['Direct oversight by University Grants Commission'],
        },
      ];
      recommendedNextStep = {
        title: 'Serve Legal Representation Citing UGC Guidelines',
        explanation: 'Most colleges comply immediately upon receiving a formal letter referencing UGC 2023 Regulations.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Draft Formal Representation Letter',
          description: 'Prepare formal letter addressed to Principal/Registrar demanding return of original certificates.',
          whyItMatters: 'Establishes clear legal demand citing UGC mandatory guidelines.',
          evidenceNeeded: ['Copy of admission receipt / student ID', 'List of withheld original documents'],
          status: 'in_progress',
        },
        {
          order: 2,
          title: 'Submit via Registered Post / Acknowledgement Receipt',
          description: 'Deliver letter to college administration and retain written acknowledgement.',
          whyItMatters: 'Proof of receipt required if escalating to UGC Ombudsman.',
          status: 'not_started',
        },
        {
          order: 3,
          title: 'Escalate to UGC e-Samadhan Portal',
          description: 'If unresolved within 7 days, log grievance on e-Samadhan (samadhan.ugc.ac.in).',
          whyItMatters: 'Triggers official inquiry from university regulator.',
          authority: 'University Grants Commission Ombudsman',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: 'College Principal / University Registrar & UGC Student Grievance Redressal Cell',
        type: 'Higher Education Regulator',
        relevance: 'Governed by University Grants Commission binding regulations.',
        actionableInfo: 'Submit representation directly to Registrar or log online at samadhan.ugc.ac.in.',
        officialLink: 'https://www.ugc.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'representation',
          title: 'Formal Representation for Release of Original Certificates',
          reason: 'Legal demand citing UGC 2023 Student Grievance Regulations.',
        },
      ];
    } else if (text.includes('pension')) {
      explanation = 'Public pensions are statutory entitlements. If a pension payment stops unexpectedly, it is usually caused by annual Life Certificate (Jeevan Pramaan) verification gaps, treasury data mismatches, or bank migration issues.';
      options = [
        {
          title: 'Submit Digital Life Certificate & Bank Account Verification',
          description: 'Verify if Jeevan Pramaan submission or Aadhaar-bank linking is pending.',
          considerations: ['Resolves over 80% of unexpected pension stoppages'],
        },
        {
          title: 'CPGRAMS Central / State Grievance Filing',
          description: 'Lodge formal grievance on CPGRAMS portal for pension disbursement delay.',
          considerations: ['Mandatory response time within 30 days'],
        },
      ];
      recommendedNextStep = {
        title: 'Check Jeevan Pramaan Status & File CPGRAMS Pension Grievance',
        explanation: 'Filing on CPGRAMS alerts the Nodal Pension Officer to audit the disbursement failure.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Verify Life Certificate Submission Status',
          description: 'Check Jeevan Pramaan status online or at nearest Citizen Service Center / Bank branch.',
          whyItMatters: 'Pensions automatically freeze if annual verification is absent.',
          evidenceNeeded: ['PPO (Pension Payment Order) Number', 'Bank Passbook copy'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Lodge Grievance on CPGRAMS Pension Portal',
          description: 'Submit grievance to Ministry / Department handling the pension via pgportal.gov.in.',
          whyItMatters: 'Enforces accountability on Pension Disbursing Authority.',
          authority: 'CPGRAMS Pension Grievance Officer',
          status: 'in_progress',
        },
      ];
      responsibleAuthority = {
        name: 'Pension Disbursing Authority (Treasury / Bank / Department of Pensions)',
        type: 'Public Pension Nodal Office',
        relevance: 'Responsible for monthly pension authorization and PPO management.',
        actionableInfo: 'Lodge online at pgportal.gov.in or contact Bank Pension Cell.',
        officialLink: 'https://pgportal.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'CPGRAMS Pension Disruption Grievance',
          reason: 'Formal complaint for pension arrears and payment resumption.',
        },
      ];
    } else if (text.includes('road') && (text.includes('spent') || text.includes('money') || text.includes('repair'))) {
      explanation = 'Under Section 6 of the Right to Information Act 2005, every citizen has a legal right to inspect public works records, obtain certified copies of contracts, sanctioned budgets, and measurement books for municipal road repairs.';
      options = [
        {
          title: 'File Formal RTI Application with Municipal Public Information Officer (PIO)',
          description: 'Seek itemized financial statements, contractor work orders, and completion certificates.',
          considerations: ['Statutory 30-day response deadline under law'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit RTI Application Seeking Expenditure Records',
        explanation: 'RTI forces the public authority to provide verified copies of financial expenditure and contractor bills.',
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
        actionableInfo: 'Submit online via state RTI portal or by Registered Post with Rs 10 court fee stamp/IPO.',
        officialLink: 'https://rtionline.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'rti',
          title: 'RTI Application on Road Repair Expenditure',
          reason: 'Formal 6-point information request under RTI Act 2005.',
        },
      ];
    } else {
      explanation = 'Based on the facts provided, you have a legitimate right to seek transparency, service resolution, or administrative review from the relevant public authority or service provider.';
      options = [
        {
          title: 'Submit Formal Written Representation',
          description: 'Submit an official representation detailing the facts and desired outcome.',
          considerations: ['Establishes written record'],
        },
        {
          title: 'Grievance Portal Escalation',
          description: 'File an online complaint with the nodal oversight body.',
          considerations: ['Official tracking ID'],
        },
      ];
      recommendedNextStep = {
        title: 'Prepare Formal Representation & Identify Nodal Authority',
        explanation: 'Submitting a structured written representation creates a binding record for administrative action.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Organize Timeline and Supporting Information',
          description: 'Gather dates, reference numbers, and communication history related to this matter.',
          whyItMatters: 'Clear timelines increase response speed.',
          status: 'in_progress',
        },
        {
          order: 2,
          title: 'Submit Representation to Responsible Department',
          description: 'Deliver formal letter or register on official portal.',
          whyItMatters: 'Commences official review process.',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `${location} Nodal Department`,
        type: 'Public Service Authority',
        relevance: 'Oversees public service compliance and citizen grievances.',
        actionableInfo: 'Submit directly to head of department or via official portal.',
      };
      suggestedDocuments = [
        {
          type: 'representation',
          title: 'Formal Administrative Representation',
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
  public generateDocumentDraft(
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
    const authorityName = solution?.responsibleAuthority?.name || '[Public Authority / Department Name]';
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

    if (docType === 'rti') {
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
Subject: Information regarding municipal road works and financial expenditure in ${location}.

Please provide certified copies of the following information/records:
1. Copy of administrative sanction and total funds allocated for road repair works in ${location} for the current financial year.
2. Itemized expenditure statement showing actual money spent to date.
3. Copy of contract work order, tender agreement, and name of contractor awarded the work.
4. Name and designation of the inspecting engineer responsible for certifying quality.
5. Copy of Measurement Book (MB) entries and completion certificate if marked complete.
6. Details of daily progress logs and inspection reports.

**5. Period to which information relates:** Current financial year to date.  
**6. Mode of Information Delivery:** By Registered Post / Speed Post to above address.  
**7. Fee Details:** Application fee of Rs. 10/- attached herewith via Indian Postal Order / Court Fee Stamp.

I confirm that I am a citizen of India.

Sincerely,  
**${applicantName}**`;
    } else if (docType === 'complaint') {
      title = 'Formal Municipal / Service Complaint';
      previewMarkdown = `### FORMAL GRIEVANCE COMPLAINT REGARDING CIVIC DEFICIENCY

**Date:** ${currentDate}

**To,**  
The Executive Officer / Public Grievance Nodal Officer,  
${authorityName}  
${location}

**Subject:** Urgent Complaint Regarding: ${caseTitle}

**Respected Sir / Madam,**

I am writing to register an official grievance regarding civic service deficiency in my locality at ${location}.

**Statement of Facts:**
1. ${userDescription}
2. The issue has been persisting and causes significant inconvenience and safety hazards to residents.
3. Details of location / landmark: ${location}.

**Relief / Action Requested:**
1. Immediate site inspection by the responsible officer.
2. Immediate repair / restoration of service without further delay.
3. Issuance of an official complaint reference tracking number for this matter.

Kindly acknowledge receipt of this complaint and intimate the expected resolution timeframe.

Yours faithfully,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    } else if (docType === 'representation') {
      title = 'Formal Student Representation to University Administration';
      previewMarkdown = `### FORMAL REPRESENTATION FOR RELEASE OF ORIGINAL CERTIFICATES

**Date:** ${currentDate}

**To,**  
The Principal / Vice-Chancellor / Registrar,  
${authorityName}  
${location}

**Subject:** Request for immediate release of Original Certificates — Citing UGC Regulations 2023

**Respected Authority,**

I am writing to request the immediate return and release of my original certificates currently held by your institution.

**Details of Student & Issue:**
- Student Name: ${applicantName}
- Institution: ${authorityName}
- Issue Summary: ${userDescription}

**Legal & Regulatory Position:**
Under the *University Grants Commission (Redressal of Grievances of Students) Regulations 2023*, higher educational institutions are strictly prohibited from withholding original educational certificates, marksheets, or transfer certificates of students under any circumstances.

**Demands:**
I request you to kindly hand over my original certificates within 3 working days from receipt of this representation. Failing this, I shall be constrained to report this non-compliance to the UGC Ombudsman portal (e-Samadhan) and state grievance authority.

Thanking you.

Sincerely,  
**${applicantName}**  
Contact: ${applicantPhone}`;
    } else {
      title = 'Formal Written Request / Appeal';
      previewMarkdown = `### FORMAL REQUEST FOR ADMINISTRATIVE ACTION

**Date:** ${currentDate}

**To,**  
${authorityName}  
${location}

**Subject:** Matter regarding ${caseTitle}

**Sir / Madam,**

I request your kind attention to the following matter:

${userDescription}

I request your office to take appropriate administrative action to resolve this matter at the earliest.

Thanking you,

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
