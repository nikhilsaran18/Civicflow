import {
  CaseUnderstanding,
  ClarificationQuestion,
  CivicSolution,
  FactItem,
  ActionPlanStep,
  ResponsibleAuthority,
  SuggestedDocument,
  GeneratedDocument,
  RightsDomain,
} from '../../types/civicIntelligence';
import { GeminiClient, defaultGeminiClient } from './geminiClient';
import { QuestionValidator, defaultQuestionValidator } from './questionValidator';
import { KnowledgeService } from '../knowledgeService';
import { classifyCivicCase } from '../../engine/hierarchicalClassifier';

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

const DOMAIN_FRIENDLY_NAMES: Record<RightsDomain, string> = {
  healthcare_patient: 'Healthcare & Patient Rights',
  consumer: 'Consumer Protection',
  housing_tenant: 'Housing & Tenancy Rights',
  workplace_labour: 'Workplace & Labour Rights',
  education: 'Education & Student Rights',
  municipal_utility: 'Municipal & Public Utilities',
  rti_information: 'RTI & Public Information Access',
  banking_financial: 'Banking & Financial Grievances',
  welfare_entitlement: 'Welfare, Pensions & Entitlements',
  public_government_service: 'Public & Government Services',
  police_legal_grievance: 'Police & Criminal Justice Grievances',
  power_electricity_utility: 'Electricity & Power Utility Grievances',
  environment_civic_hazard: 'Environmental & Pollution Hazards',
  cyber_digital_fraud: 'Cyber Crime & Online Financial Fraud',
  other_civic_legal: 'Civic Rights & Legal Access Matter',
};

const DOMAIN_STATUTES: Record<RightsDomain, string[]> = {
  healthcare_patient: ['Charter of Patients\' Rights (NHRC/MOHFW)', 'Clinical Establishments (Registration and Regulation) Act, 2010', 'Consumer Protection Act, 2019'],
  consumer: ['Consumer Protection Act, 2019 (Section 35 & 38)', 'Consumer Protection (E-Commerce) Rules, 2020'],
  housing_tenant: ['Model Tenancy Act', 'State Rent Control Acts', 'Transfer of Property Act, 1882'],
  workplace_labour: ['Payment of Wages Act, 1936 (Section 15)', 'Industrial Disputes Act, 1947', 'Employees\' Provident Funds and Miscellaneous Provisions Act, 1952'],
  education: ['UGC (Redressal of Grievances of Students) Regulations, 2023', 'Right to Education (RTE) Act, 2009'],
  municipal_utility: ['State Municipal Corporation & Urban Local Bodies Acts', 'Solid Waste Management Rules, 2016'],
  rti_information: ['Right to Information Act, 2005 (Section 6(1) & Section 19)'],
  banking_financial: ['Reserve Bank of India (RBI) Integrated Ombudsman Scheme, 2021', 'Banking Regulation Act, 1949'],
  welfare_entitlement: ['National Food Security Act, 2013', 'Maintenance and Welfare of Parents and Senior Citizens Act, 2007', 'Central/State Pension Rules'],
  public_government_service: ['State Right to Public Services Legislation', 'Citizens\' Charter Scheme', 'Passports Act, 1967'],
  police_legal_grievance: ['Code of Criminal Procedure, 1973 (Section 154(3)) / BNSS (Section 175(3))', 'Lalita Kumari v. Govt of UP (Supreme Court Mandate on FIRs)'],
  power_electricity_utility: ['Electricity Act, 2003 (Section 42(5))', 'State Electricity Regulatory Commission Consumer Grievance Redressal Regulations'],
  environment_civic_hazard: ['Environment (Protection) Act, 1986', 'Noise Pollution (Regulation and Control) Rules, 2000', 'National Green Tribunal Act, 2010'],
  cyber_digital_fraud: ['Information Technology Act, 2000 (Section 43A & 66D)', 'Indian Penal Code (Section 419/420) / BNS', 'I4C Cyber Crime Helpline 1930 Framework'],
  other_civic_legal: ['Constitution of India (Article 14 & 21)', 'Principles of Natural Justice'],
};

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

    // Try Gemini API backend if key/server is active
    if (this.client.hasKey()) {
      const prompt = `Analyze this citizen case narrative and any provided follow-up answers:
Narrative: "${combinedText}"

Return JSON matching this schema:
{
  "understanding": {
    "situationSummary": "plain-language overview",
    "knownFacts": [{"label": "Fact name", "value": "Fact detail"}],
    "missingInformation": ["item 1", "item 2"],
    "desiredOutcomeKnown": boolean,
    "desiredOutcome": "optional goal if stated or clear",
    "aiCaseDescription": "dynamic descriptive label",
    "domain": "healthcare_patient" | "consumer" | "housing_tenant" | "workplace_labour" | "education" | "municipal_utility" | "rti_information" | "banking_financial" | "welfare_entitlement" | "public_government_service" | "police_legal_grievance" | "power_electricity_utility" | "environment_civic_hazard" | "cyber_digital_fraud" | "other_civic_legal",
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

      const res = await this.client.callBackend<{
        understanding: CaseUnderstanding;
        candidateQuestions: ClarificationQuestion[];
      }>('understand', { userDescription, answers });

      if (res && res.understanding) {
        const validatedQuestions = await this.validator.filterQuestions(
          combinedText,
          res.candidateQuestions || []
        );
        const classification = classifyCivicCase(userDescription);
        const domain = res.understanding.domain || classification.domain;
        return {
          understanding: {
            ...res.understanding,
            summary: res.understanding.situationSummary,
            domain,
            domainName: DOMAIN_FRIENDLY_NAMES[domain] || 'Civic Rights Matter',
            applicableLaws: DOMAIN_STATUTES[domain] || [],
            matchedSignals: classification.matchedSignals,
          },
          questions: res.understanding.readyForSolution ? [] : validatedQuestions,
        };
      }
    }

    // Dynamic Intelligent Multi-Domain Classifier Engine
    return this.rulelessDynamicAnalysis(userDescription, answers);
  }

  /**
   * Ruleless dynamic reasoning engine for Stage 1, 2, 3, 4 with comprehensive multi-domain intelligence
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
    if (answers['counterparty']) {
      knownFacts.push({
        label: 'Opposite Party / Institution',
        value: Array.isArray(answers['counterparty']) ? answers['counterparty'].join(', ') : answers['counterparty'],
      });
    }
    if (answers['prior_report']) {
      knownFacts.push({
        label: 'Prior Action Taken',
        value: Array.isArray(answers['prior_report']) ? answers['prior_report'].join(', ') : answers['prior_report'],
      });
    }
    if (answers['dispute_amount']) {
      knownFacts.push({
        label: 'Amount / Financial Impact',
        value: Array.isArray(answers['dispute_amount']) ? answers['dispute_amount'].join(', ') : answers['dispute_amount'],
      });
    }

    // Run multi-stage classification
    const classification = classifyCivicCase(text);
    const domain: RightsDomain = classification.domain;
    const domainName = DOMAIN_FRIENDLY_NAMES[domain] || 'Civic Rights Matter';
    const applicableLaws = DOMAIN_STATUTES[domain] || [];

    const candidateQuestions: ClarificationQuestion[] = [];
    let readyForSolution = false;
    let aiCaseDescription = 'Citizen Civic/Legal Concern';
    let summary = `Citizen reports: "${text.length > 90 ? text.substring(0, 90) + '...' : text}"`;
    let desiredOutcomeKnown = false;
    let desiredOutcome: string | undefined = undefined;

    // Domain Specific Case Structuring
    if (lower.includes('street light') || lower.includes('streetlamp') || lower.includes('light near my house') || (domain === 'municipal_utility' && lower.includes('light'))) {
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
    } else if (domain === 'education' || lower.includes('certificate') || lower.includes('marksheet') || lower.includes('college') || lower.includes('university')) {
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
    } else if (domain === 'welfare_entitlement' || lower.includes('pension')) {
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
    } else if (domain === 'rti_information' || (lower.includes('road') && (lower.includes('spent') || lower.includes('money') || lower.includes('repair') || lower.includes('cost') || lower.includes('allocated')))) {
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
      // Ambiguous case requirement
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
    } else if (domain === 'healthcare_patient') {
      aiCaseDescription = 'Healthcare & Patient Rights Grievance';
      summary = 'Grievance concerning hospital or physician service deficiency, denial of treatment, or patient rights violation.';
      desiredOutcome = 'Investigation of medical deficiency and relief under Patient Rights Charter';
      desiredOutcomeKnown = true;

      if (!answers['hospital_type']) {
        candidateQuestions.push({
          id: 'hospital_type',
          question: 'Is this a Government Hospital or a Private Hospital / Clinic?',
          reason: 'Determines whether the grievance lies before the State Health Department or District Consumer Commission / Medical Council.',
          type: 'single_select',
          options: ['Government / Public Hospital', 'Private Hospital / Nursing Home', 'Private Clinic / Doctor'],
          required: true,
        });
      }
      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'In which city and district did this medical issue take place?',
          reason: 'Identifies the competent State Medical Council and District Health Officer.',
          type: 'text',
          required: true,
        });
      }
      if (answers['hospital_type'] || answers['location']) {
        readyForSolution = true;
      }
    } else if (domain === 'housing_tenant') {
      aiCaseDescription = 'Housing & Tenancy Rights Dispute';
      summary = 'Dispute between tenant and landlord regarding rental agreement, withheld security deposit, or eviction.';
      desiredOutcome = 'Refund of security deposit and enforcement of tenancy rights';
      desiredOutcomeKnown = true;

      if (!answers['deposit_details']) {
        candidateQuestions.push({
          id: 'deposit_details',
          question: 'Do you have a written rental agreement or proof of security deposit transfer?',
          reason: 'Essential documentary evidence required under the Model Tenancy Act / Rent Authority.',
          type: 'single_select',
          options: ['Yes, written lease agreement and bank transfer proof', 'Bank proof only (no written lease)', 'Cash payment without formal receipt', 'Other'],
          required: true,
        });
      }
      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'In which city / state is the rented property located?',
          reason: 'Determines the local Rent Control Authority jurisdiction.',
          type: 'text',
          required: true,
        });
      }
      if (answers['deposit_details'] || answers['location']) {
        readyForSolution = true;
      }
    } else if (domain === 'consumer') {
      aiCaseDescription = 'Consumer Protection & Product Defect Dispute';
      summary = 'Dispute concerning defective goods, warranty refusal, or deficient commercial service under Consumer Protection Act 2019.';
      desiredOutcome = 'Full refund, replacement, or repair of defective product/service';
      desiredOutcomeKnown = true;

      if (!answers['purchase_proof']) {
        candidateQuestions.push({
          id: 'purchase_proof',
          question: 'Do you have the invoice, order receipt, or warranty document for this transaction?',
          reason: 'Required to file a claim under Section 35 of the Consumer Protection Act, 2019.',
          type: 'single_select',
          options: ['Yes, full invoice and payment receipt available', 'Order confirmation / email / SMS only', 'No receipt available'],
          required: true,
        });
      }
      if (!answers['seller_name']) {
        candidateQuestions.push({
          id: 'seller_name',
          question: 'What is the name of the seller, brand, or e-commerce platform?',
          reason: 'Identifies the respondent party for legal notice or Consumer Commission filing.',
          type: 'text',
          required: false,
        });
      }
      if (answers['purchase_proof'] || answers['seller_name']) {
        readyForSolution = true;
      }
    } else if (domain === 'workplace_labour') {
      aiCaseDescription = 'Workplace & Labour Rights Claim';
      summary = 'Employment dispute regarding unpaid salary, wrongful termination, or withheld employee benefits.';
      desiredOutcome = 'Recovery of unpaid wages and issuance of employment relieving documents';
      desiredOutcomeKnown = true;

      if (!answers['employment_proof']) {
        candidateQuestions.push({
          id: 'employment_proof',
          question: 'Do you have an appointment letter, pay slips, or official email communication confirming your employment?',
          reason: 'Establishes employer-employee relationship under Payment of Wages Act 1936.',
          type: 'single_select',
          options: ['Yes, appointment letter and bank salary credits', 'Salary slips / emails only', 'Verbal employment agreement only'],
          required: true,
        });
      }
      if (answers['employment_proof']) {
        readyForSolution = true;
      }
    } else if (domain === 'police_legal_grievance') {
      aiCaseDescription = 'Police & Criminal Justice Grievance';
      summary = 'Citizen grievance regarding refusal of police station to register an FIR or take cognizance of an offence.';
      desiredOutcome = 'Registration of FIR under Section 154(3) CrPC / Section 175(3) BNSS';
      desiredOutcomeKnown = true;

      if (!answers['police_station']) {
        candidateQuestions.push({
          id: 'police_station',
          question: 'What is the name / jurisdiction of the local police station that refused the complaint?',
          reason: 'Required to escalate written representation to the Superintendent of Police (SP) or Deputy Commissioner of Police (DCP).',
          type: 'text',
          required: true,
        });
      }
      if (answers['police_station']) {
        readyForSolution = true;
      }
    } else if (domain === 'power_electricity_utility') {
      aiCaseDescription = 'Electricity & Power Utility Grievance';
      summary = 'Dispute concerning inflated electricity bill, faulty meter reading, or frequent unscheduled power outages.';
      desiredOutcome = 'Meter recalibration, billing rectification, and stable power supply';
      desiredOutcomeKnown = true;

      if (!answers['discom_name']) {
        candidateQuestions.push({
          id: 'discom_name',
          question: 'Which Electricity Distribution Company (DISCOM) or State Electricity Board provides your service?',
          reason: 'Identifies the appropriate Consumer Grievance Redressal Forum (CGRF).',
          type: 'text',
          required: true,
        });
      }
      if (answers['discom_name']) {
        readyForSolution = true;
      }
    } else if (domain === 'environment_civic_hazard') {
      aiCaseDescription = 'Environmental & Pollution Hazard Grievance';
      summary = 'Citizen complaint regarding illegal waste dumping, toxic pollution, or persistent noise violations.';
      desiredOutcome = 'Immediate inspection and statutory enforcement by State Pollution Control Board';
      desiredOutcomeKnown = true;

      if (!answers['location']) {
        candidateQuestions.push({
          id: 'location',
          question: 'Where is this pollution or hazard occurring (locality, landmark, and district)?',
          reason: 'Required to dispatch field inspection officers from the Pollution Control Board.',
          type: 'text',
          required: true,
        });
      }
      if (answers['location']) {
        readyForSolution = true;
      }
    } else if (domain === 'cyber_digital_fraud') {
      aiCaseDescription = 'Cyber Crime & Online Financial Fraud Incident';
      summary = 'Report of financial scam, phishing, fraudulent UPI transaction, or digital impersonation.';
      desiredOutcome = 'Immediate freeze of fraudulent beneficiary bank account and recovery of funds';
      desiredOutcomeKnown = true;

      if (!answers['transaction_time']) {
        candidateQuestions.push({
          id: 'transaction_time',
          question: 'Did this fraudulent transaction happen within the last 24–48 hours?',
          reason: 'Golden hours reporting to Helpline 1930 enables immediate inter-bank fund lien/freezing.',
          type: 'single_select',
          options: ['Yes, within the last 24 hours (Urgent)', 'Within the last week', 'More than a week ago'],
          required: true,
        });
      }
      if (answers['transaction_time']) {
        readyForSolution = true;
      }
    } else if (domain === 'public_government_service') {
      aiCaseDescription = 'Public & Government Service Grievance';
      summary = 'Delay or refusal in delivery of notified public services such as passport, certificate, or license.';
      desiredOutcome = 'Time-bound service delivery under Right to Public Services legislation';
      desiredOutcomeKnown = true;

      if (!answers['service_name']) {
        candidateQuestions.push({
          id: 'service_name',
          question: 'Which specific government service or certificate is delayed?',
          reason: 'Identifies the designated public delivery officer and statutory appellate timeline.',
          type: 'text',
          required: true,
        });
      }
      if (answers['service_name']) {
        readyForSolution = true;
      }
    } else if (domain === 'banking_financial') {
      aiCaseDescription = 'Banking & Financial Grievance';
      summary = 'Dispute with banking institution concerning unauthorized debits, ATM failures, or unfair charges.';
      desiredOutcome = 'Reversal of disputed bank charges and compensation under RBI Ombudsman Scheme';
      desiredOutcomeKnown = true;

      if (!answers['bank_name']) {
        candidateQuestions.push({
          id: 'bank_name',
          question: 'What is the name of your Bank and branch?',
          reason: 'Directs formal representation to the Bank Nodal Officer before RBI Ombudsman escalation.',
          type: 'text',
          required: true,
        });
      }
      if (answers['bank_name']) {
        readyForSolution = true;
      }
    } else {
      // Open-ended / Universal Civic & Legal Case
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

    // Pass candidates through Stage 2.5 Question Validator
    const validatedQuestions = await this.validator.filterQuestions(text, candidateQuestions);

    if (validatedQuestions.length === 0 && Object.keys(answers).length > 0) {
      readyForSolution = true;
    }

    const understanding: CaseUnderstanding = {
      situationSummary: summary,
      summary,
      confirmedFacts: knownFacts.map((f, i) => ({
        id: `f_${i}`,
        fact: `${f.label}: ${f.value}`,
        source: i === 0 ? 'initial_statement' : 'clarification_answer',
      })),
      knownFacts,
      missingCriticalInformation: readyForSolution ? [] : validatedQuestions.map(q => q.reason),
      missingInformation: readyForSolution ? [] : validatedQuestions.map(q => q.reason),
      desiredOutcomeKnown,
      desiredOutcome,
      aiCaseDescription,
      domain,
      domainName,
      domainConfidence: classification.domainConfidence,
      applicableLaws,
      matchedSignals: classification.matchedSignals,
      jurisdictionNeeded: !answers['location'],
      urgency: lower.includes('urgent') || lower.includes('emergency') || domain === 'cyber_digital_fraud' || domain === 'healthcare_patient' ? 'high' : 'medium',
      confidence: 'high',
      readyForSolution,
      readinessReason: readyForSolution ? 'Sufficient facts gathered to prepare actionable legal strategy.' : 'Gathering key jurisdiction or counterparty details.',
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
    // Try Gemini API if key is present
    if (this.client.hasKey()) {
      const res = await this.client.callBackend<CivicSolution>('research-and-solve', {
        userDescription,
        understanding,
        answers,
      });
      if (res) {
        return res;
      }
    }

    // Intelligent Multi-Domain Deterministic Generator
    return this.rulelessSolutionGenerator(userDescription, understanding, answers);
  }

  private rulelessSolutionGenerator(
    userDescription: string,
    understanding: CaseUnderstanding,
    answers: Record<string, string | string[]> = {}
  ): CivicSolution {
    const text = userDescription.toLowerCase();
    const domain: RightsDomain = understanding.domain || classifyCivicCase(userDescription).domain;
    const sources = KnowledgeService.getRelevantSources(userDescription);
    const location = (answers['location'] as string) || (answers['counterparty'] as string) || 'Your Local Jurisdiction';

    let situationSummary = understanding.summary || understanding.situationSummary;
    let userGoal = understanding.desiredOutcome || 'Resolve civic issue and enforce statutory rights';
    let explanation = '';
    let options = [];
    let recommendedNextStep = { title: '', explanation: '' };
    let actionPlan: ActionPlanStep[] = [];
    let responsibleAuthority: ResponsibleAuthority | undefined = undefined;
    let suggestedDocuments: SuggestedDocument[] = [];

    // 1. Healthcare / Patient Rights
    if (domain === 'healthcare_patient') {
      explanation = 'Under the Charter of Patients\' Rights (NHRC/MOHFW) and the Clinical Establishments Act 2010, patients have enforceable rights to receive emergency medical care without pre-payment, transparent itemized billing, copies of case summaries within 24 hours, and dignified treatment without arbitrary denial of service.';
      options = [
        {
          title: 'Direct Representation to Medical Superintendent / Grievance Committee',
          description: 'Submit an official representation detailing treatment denial, billing discrepancy, or negligence.',
          considerations: ['Fastest internal remedy', 'Mandates written response from hospital management'],
        },
        {
          title: 'Complaint to State Medical Council & District Consumer Commission',
          description: 'File a formal disciplinary grievance against treating practitioners or file a consumer petition for medical deficiency.',
          considerations: ['Binding regulatory scrutiny and compensation under CPA 2019'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit Formal Medical Grievance to Hospital Superintendent & State Health Cell',
        explanation: 'Creates an official record citing the Charter of Patients\' Rights and demands clinical case records.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Preserve Treatment & Billing Documents',
          description: 'Collect all discharge summaries, prescriptions, diagnostic reports, and payment receipts.',
          whyItMatters: 'Essential documentary evidence of the doctor-patient relationship and medical sequence.',
          evidenceNeeded: ['Hospital admission/OPD slip', 'Prescriptions & test reports', 'Payment receipts'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Serve Formal Representation to Medical Authority',
          description: `Deliver formal notice to Medical Superintendent at ${location}.`,
          whyItMatters: 'Provides 7-day opportunity for administrative rectification before statutory escalation.',
          authority: `${location} Hospital Administration`,
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Escalate to State Medical Council / Consumer Forum if Unresolved',
          description: 'Lodge formal complaint with State Medical Council or Consumer Commission for deficiency in service.',
          whyItMatters: 'Enforces statutory liability under Medical Ethics Regulations and Consumer Protection Act.',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `Medical Superintendent / District Chief Medical Officer (CMO), ${location}`,
        type: 'Healthcare Regulatory & Hospital Authority',
        relevance: 'Statutorily responsible for hospital clinical standards and patient grievance resolution.',
        actionableInfo: 'Submit written representation in person or via registered post to the Superintendent\'s office.',
        officialLink: 'https://main.mohfw.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'Medical Grievance & Service Deficiency Notice',
          reason: 'Formal representation demanding clinical audit and resolution under Patient Rights Charter.',
        },
        {
          type: 'representation',
          title: 'Patient Rights Representation to Medical Council',
          reason: 'Statutory petition to State Medical Council for inquiry into medical misconduct.',
        },
      ];
    }
    // 2. Consumer Protection
    else if (domain === 'consumer') {
      explanation = 'Under Section 2(11) and Section 35 of the Consumer Protection Act, 2019, consumers have a statutory right against deficiency in service and defective goods. Sellers, manufacturers, and e-commerce platforms are legally required to provide defect-free goods, honor warranties, and refund payments for undelivered or faulty products.';
      options = [
        {
          title: 'Issue Formal Legal Notice under Consumer Protection Act 2019',
          description: 'Serve a 15-day statutory demand notice calling for immediate refund or replacement.',
          considerations: ['Pre-requisite for Consumer Commission proceedings', 'Resolves over 70% of disputes directly'],
        },
        {
          title: 'National Consumer Helpline (NCH - 1915) Grievance Registration',
          description: 'Lodge pre-litigation complaint on the Ministry of Consumer Affairs portal (consumerhelpline.gov.in).',
          considerations: ['Free government mediation service with tracking number'],
        },
      ];
      recommendedNextStep = {
        title: 'Serve Formal Consumer Demand Notice & Log on National Consumer Helpline',
        explanation: 'Statutory notice creates legal liability on the seller with interest and penalties for non-compliance.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Consolidate Invoice & Communication Timeline',
          description: 'Save invoice, warranty card, product photos showing defect, and written refusal emails/chats.',
          whyItMatters: 'Conclusive proof of transaction and merchant default.',
          evidenceNeeded: ['Purchase Invoice / Order confirmation', 'Photos/videos of defect', 'Communication logs'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Serve Formal Consumer Notice to Seller / Merchant',
          description: 'Send formal demand notice giving 15 days to refund or replace the defective product.',
          whyItMatters: 'Mandatory legal notice establishing formal cause of action.',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'File Case on e-Daakhil Consumer Commission Portal',
          description: 'If unresolved in 15 days, file consumer case on edaakhil.nic.in for refund plus compensation.',
          whyItMatters: 'Triggers judicial summons to the seller from the District Consumer Commission.',
          authority: 'District Consumer Disputes Redressal Commission',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: 'District Consumer Disputes Redressal Commission (DCDRC) & National Consumer Helpline',
        type: 'Statutory Consumer Forum under CPA 2019',
        relevance: 'Adjudicates consumer disputes and orders refunds, replacements, and damages.',
        actionableInfo: 'File online via edaakhil.nic.in or register grievance at consumerhelpline.gov.in (Helpline: 1915).',
        officialLink: 'https://consumerhelpline.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'Formal Consumer Notice under Consumer Protection Act 2019',
          reason: '15-day statutory demand notice claiming refund, replacement, and compensation.',
        },
        {
          type: 'representation',
          title: 'Pre-Litigation Consumer Settlement Demand',
          reason: 'Notice to company management citing Consumer Protection (E-Commerce) Rules 2020.',
        },
      ];
    }
    // 3. Housing & Tenant Rights
    else if (domain === 'housing_tenant') {
      explanation = 'Under the Model Tenancy Act and State Rent Control legislation, landlords cannot arbitrarily withhold tenant security deposits without itemized receipts for actual damage. Tenancy deposits must be refunded upon handing over vacant possession, and illegal eviction or utility disruption is strictly prohibited.';
      options = [
        {
          title: 'Serve Formal Legal Demand Notice for Return of Security Deposit',
          description: 'Send formal legal notice demanding refund of security deposit with statutory interest.',
          considerations: ['Direct legal demand establishing deadline', 'Creates enforceable paper trail'],
        },
        {
          title: 'Petition before Rent Authority / Civil Court',
          description: 'Approach the designated Rent Authority or District Civil Court for recovery of withheld tenancy dues.',
          considerations: ['Enforceable recovery order with penal interest'],
        },
      ];
      recommendedNextStep = {
        title: 'Serve Formal Legal Demand Notice for Return of Security Deposit',
        explanation: 'Gives landlord a strict 7-day deadline to refund the balance deposit, failing which legal proceedings commence.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Collate Tenancy Agreement & Handover Proof',
          description: 'Organize rental agreement, security deposit payment receipts, and handover photographs/keys receipt.',
          whyItMatters: 'Proves timely vacation of property in good condition.',
          evidenceNeeded: ['Rental agreement', 'Bank transfer receipt of deposit', 'Property handover photos / keys acknowledgement'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Serve Formal Legal Notice to Landlord / Property Owner',
          description: 'Deliver formal legal notice via Registered Post with Acknowledgment Due (RPAD) and email.',
          whyItMatters: 'Starts statutory interest accrual under tenancy laws.',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'File Claim with Local Rent Authority',
          description: 'If unresolved within 7 days, submit claim before local Rent Tribunal for deposit recovery.',
          whyItMatters: 'Legal order for recovery with damages.',
          authority: 'Designated Rent Authority / Rent Tribunal',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `Rent Authority & Rent Court, ${location}`,
        type: 'Tenancy Regulatory Tribunal',
        relevance: 'Statutory authority governing rental contracts and security deposit disputes.',
        actionableInfo: 'File petition with the Rent Authority or District Civil Judge having jurisdiction.',
        officialLink: 'https://mohua.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'representation',
          title: 'Legal Demand Notice for Return of Security Deposit',
          reason: 'Formal demand citing Model Tenancy Act provisions and setting a 7-day refund deadline.',
        },
        {
          type: 'complaint',
          title: 'Tenancy Grievance Petition to Rent Authority',
          reason: 'Statutory petition for deposit recovery and relief against landlord default.',
        },
      ];
    }
    // 4. Workplace & Labour Rights
    else if (domain === 'workplace_labour') {
      explanation = 'Under Section 15 of the Payment of Wages Act 1936 and the Industrial Disputes Act 1947, employers are legally required to disburse earned wages and clear full-and-final dues without unauthorized deductions. Withholding salary or statutory relieving documents is a punishable labour offense.';
      options = [
        {
          title: 'Issue Formal Legal Demand Notice under Payment of Wages Act',
          description: 'Serve official notice demanding disbursement of unpaid salary arrears and relieving letter within 7 days.',
          considerations: ['Pre-requisite for Labour Commissioner conciliation'],
        },
        {
          title: 'Lodge Grievance with District Labour Commissioner & Shram Suvidha Portal',
          description: 'File petition before the Labour Conciliation Officer for non-payment of wages.',
          considerations: ['Government conciliation officer summons employer'],
        },
      ];
      recommendedNextStep = {
        title: 'Serve Statutory Wage Demand Notice & File Labour Commissioner Petition',
        explanation: 'Formal legal notice citing the Payment of Wages Act creates immediate legal and financial exposure for the employer.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Collect Employment Records & Timesheets',
          description: 'Preserve appointment letter, salary slips, attendance logs, and resignation/relieving correspondence.',
          whyItMatters: 'Establishes clear employment relationship and exact unpaid salary calculation.',
          evidenceNeeded: ['Appointment letter / Offer letter', 'Salary account bank statements', 'Email communications on dues'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Deliver Statutory Demand Notice to Employer Management',
          description: 'Serve formal notice to HR / Managing Director demanding clearance of dues in 7 days.',
          whyItMatters: 'Mandatory notice under labour dispute regulations.',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Initiate Conciliation before Labour Commissioner',
          description: 'Submit formal claim under Section 15 of Payment of Wages Act at District Labour Office.',
          whyItMatters: 'Labour Officer initiates recovery proceedings with penalty against employer.',
          authority: 'Office of the District Labour Commissioner',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `District Labour Commissioner & Conciliation Officer, ${location}`,
        type: 'State Labour Department',
        relevance: 'Statutorily mandated to enforce wage payments, settlement of dues, and labour dispute conciliation.',
        actionableInfo: 'Submit petition at the District Labour Office or online via state labour grievance portal / shramsuvidha.gov.in.',
        officialLink: 'https://labour.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'representation',
          title: 'Formal Demand Notice for Unpaid Wages & Relieving Documents',
          reason: 'Statutory demand under Payment of Wages Act 1936 claiming salary arrears with interest.',
        },
        {
          type: 'complaint',
          title: 'Labour Commissioner Grievance Petition',
          reason: 'Official complaint requesting summons and conciliation for wage recovery.',
        },
      ];
    }
    // 5. Police & Criminal Justice Grievance
    else if (domain === 'police_legal_grievance') {
      explanation = 'Under Section 154(1) of the Code of Criminal Procedure (CrPC) and the landmark Supreme Court ruling in *Lalita Kumari v. Govt of UP (2014)*, police officers are statutorily mandated to register a First Information Report (FIR) upon receiving information about a cognizable offence. If the station SHO refuses, Section 154(3) CrPC / Section 175(3) BNSS empowers the citizen to submit the complaint in writing to the Superintendent of Police (SP) or Commissioner of Police.';
      options = [
        {
          title: 'Submit Written Representation to Superintendent of Police (SP / DCP)',
          description: 'Send registered complaint under Section 154(3) CrPC / Section 175(3) BNSS to the district SP/Commissioner.',
          considerations: ['Direct statutory escalation route under criminal law'],
        },
        {
          title: 'Petition before State Police Complaints Authority (PCA)',
          description: 'File complaint against errant police officers for dereliction of duty and refusal to register FIR.',
          considerations: ['Disciplinary oversight over police conduct'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit Written Representation under Section 154(3) to Superintendent of Police',
        explanation: 'The SP is empowered under law to either investigate the case personally or direct a subordinate officer to register the FIR immediately.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Document Crime Timeline & Police Station Details',
          description: 'Record date, time, names of officers contacted, and chronological narrative of the incident.',
          whyItMatters: 'Essential for establishing station refusal and cognizable nature of the offence.',
          status: 'completed',
        },
        {
          order: 2,
          title: 'Dispatch Section 154(3) Representation to Superintendent of Police',
          description: `Send written representation via Registered Post with Acknowledgment Due to SP / DCP ${location}.`,
          whyItMatters: 'Creates statutory proof of refusal and invokes SP direct supervisory powers.',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Section 156(3) CrPC Application before Judicial Magistrate',
          description: 'If unresolved within 15 days, advocate can file Section 156(3) application before Magistrate to direct FIR registration.',
          whyItMatters: 'Judicial order mandating police investigation.',
          authority: 'Chief Judicial Magistrate / Metropolitan Magistrate',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `Superintendent of Police (SP) / Commissioner of Police, ${location}`,
        type: 'District Police Headquarters',
        relevance: 'Statutory supervisory authority under Section 154(3) CrPC / Section 175(3) BNSS.',
        actionableInfo: 'Deliver in person at SP Office Grievance Cell or dispatch via Registered Post.',
        officialLink: 'https://mha.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'representation',
          title: 'Section 154(3) Written Representation to Superintendent of Police',
          reason: 'Statutory petition demanding registration of FIR citing Supreme Court Lalita Kumari mandate.',
        },
        {
          type: 'complaint',
          title: 'Grievance to Police Complaints Authority',
          reason: 'Disciplinary complaint against station officer for non-registration of cognizable offence.',
        },
      ];
    }
    // 6. Electricity & Power Utility Grievance
    else if (domain === 'power_electricity_utility') {
      explanation = 'Under Section 42(5) of the Electricity Act 2003, all Electricity Distribution Companies (DISCOMs) are required to maintain a Consumer Grievance Redressal Forum (CGRF). Consumers are protected against faulty meters, inflated estimated bills, and arbitrary disconnection without 15-day prior written notice.';
      options = [
        {
          title: 'Submit Formal Billing Dispute to DISCOM Assistant Engineer',
          description: 'Submit written objection challenging bill calculation and demanding meter testing.',
          considerations: ['Mandatory first step before CGRF escalation'],
        },
        {
          title: 'File Petition before Consumer Grievance Redressal Forum (CGRF)',
          description: 'Lodge formal complaint with the independent CGRF for bill revision and refund.',
          considerations: ['Quasi-judicial forum with power to stay disconnection'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit Formal Billing Dispute & Register Complaint with CGRF',
        explanation: 'Filing an active dispute prevents disconnection of power supply while meter audit is underway.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Analyze Electricity Bills & Meter Readings',
          description: 'Compare current disputed bill with previous 6 months average consumption history.',
          whyItMatters: 'Demonstrates unreasonable spike or faulty meter multiplication factor.',
          evidenceNeeded: ['Copy of disputed electricity bill', 'Past 6 months billing receipts', 'Photo of current meter reading'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Lodge Written Dispute with DISCOM Sub-Division Office',
          description: 'Submit dispute letter requesting meter recalibration and revised bill.',
          whyItMatters: 'Creates official dispute ticket.',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Escalate to Electricity Ombudsman',
          description: 'If CGRF does not resolve within 60 days, appeal to the State Electricity Ombudsman.',
          whyItMatters: 'Final binding order on DISCOM.',
          authority: 'State Electricity Ombudsman',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `Consumer Grievance Redressal Forum (CGRF) & Executive Engineer, ${location} DISCOM`,
        type: 'Statutory Electricity Redressal Forum',
        relevance: 'Statutorily mandated under Electricity Act 2003 to resolve consumer billing and supply disputes.',
        actionableInfo: 'Submit at DISCOM circle office or file online via state power portal.',
        officialLink: 'https://powermin.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'Electricity Billing & Service Dispute Complaint to CGRF',
          reason: 'Formal complaint demanding meter inspection, bill revision, and stay on disconnection.',
        },
      ];
    }
    // 7. Cyber Crime & Online Fraud
    else if (domain === 'cyber_digital_fraud') {
      explanation = 'Under the Information Technology Act 2000 and the National Cyber Crime Reporting framework, victims of cyber financial fraud have a right to immediate incident logging. Reporting via Helpline 1930 enables the Indian Cyber Crime Coordination Centre (I4C) to coordinate with banks to freeze destination beneficiary accounts before stolen funds are withdrawn.';
      options = [
        {
          title: 'Immediate Registration on National Cyber Crime Portal (1930 / cybercrime.gov.in)',
          description: 'Log transaction IDs, bank details, and suspect numbers on national portal.',
          considerations: ['Enables inter-bank lien/freeze on fraudulent accounts'],
        },
        {
          title: 'Serve Formal Representation to Bank Nodal Officer',
          description: 'Submit notice citing RBI guidelines on zero liability for unauthorized electronic banking transactions.',
          considerations: ['Mandatory under RBI Customer Protection Master Circular'],
        },
      ];
      recommendedNextStep = {
        title: 'Call 1930 Helpline Immediately & File National Cyber Crime Portal Report',
        explanation: 'Immediate reporting within golden hours maximizes probability of successfully freezing funds in the destination account.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Preserve Transaction & Chat Evidence',
          description: 'Take screenshots of UPI transaction IDs, bank debit SMS, fake portal links, and suspect phone numbers.',
          whyItMatters: 'Critical evidence for police cyber cell and bank fraud audit.',
          evidenceNeeded: ['Bank statement showing debit', 'Screenshots of fraudulent link / chat', 'Transaction UTR / Ref Number'],
          status: 'completed',
        },
        {
          order: 2,
          title: 'Register Complaint on cybercrime.gov.in & Helpline 1930',
          description: 'Submit complaint under Financial Frauds category and obtain Cyber Crime Acknowledgement Number.',
          whyItMatters: 'Triggers instant bank alerts to stop outbound transfers.',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Submit Fraud Dispute Form to Remitting Bank',
          description: 'Submit copy of Cyber FIR Acknowledgement to home bank branch demanding chargeback / reversal.',
          whyItMatters: 'Invokes RBI Limited Liability framework.',
          authority: 'Home Bank Fraud Monitoring Cell',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: 'National Cyber Crime Reporting Portal (I4C) & District Cyber Police Station',
        type: 'Cyber Law Enforcement Authority',
        relevance: 'Authorized to investigate digital financial crimes and freeze fraudulent bank accounts.',
        actionableInfo: 'Lodge immediately at cybercrime.gov.in or dial national helpline 1930.',
        officialLink: 'https://cybercrime.gov.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'Cyber Financial Fraud Incident Complaint & Bank Freeze Request',
          reason: 'Formal incident report detailing unauthorized electronic debit and demanding fund hold.',
        },
      ];
    }
    // 8. Environmental & Pollution Hazard
    else if (domain === 'environment_civic_hazard') {
      explanation = 'Under the Environment (Protection) Act 1986, Air (Prevention and Control of Pollution) Act 1981, and Noise Pollution Rules 2000, citizens have a constitutional right under Article 21 to a clean and pollution-free environment. State Pollution Control Boards are legally empowered to seal polluting commercial units and stop illegal waste dumping.';
      options = [
        {
          title: 'Lodge Formal Complaint with State Pollution Control Board & District Magistrate',
          description: 'Submit formal grievance detailing source of pollution, affected residents, and violation of environmental standards.',
          considerations: ['Triggers statutory field inspection and closure notice'],
        },
        {
          title: 'Petition before National Green Tribunal (NGT)',
          description: 'Approach NGT for judicial orders against unchecked industrial pollution or civic waste mismanagement.',
          considerations: ['High-level environmental court with penal powers'],
        },
      ];
      recommendedNextStep = {
        title: 'Submit Environmental Grievance Notice to State Pollution Control Board & District Magistrate',
        explanation: 'Demands immediate ambient monitoring and issuance of show-cause notice to violators under environmental laws.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Document Source & Environmental Impact',
          description: 'Record location, photos/videos of dumping or smoke emissions, audio/decibel logs of noise, and date-time frequency.',
          whyItMatters: 'Demonstrates persistent non-compliance with statutory pollution limits.',
          status: 'completed',
        },
        {
          order: 2,
          title: 'Submit Written Complaint to Regional Pollution Control Officer',
          description: `Deliver representation to State Pollution Control Board Regional Office at ${location}.`,
          whyItMatters: 'Statutory mandate for board to conduct inspection within 7 days.',
          status: 'in_progress',
        },
        {
          order: 3,
          title: 'Escalate to District Magistrate / NGT Nodal Cell',
          description: 'If unresolved within 14 days, file representation with DM for Section 133 CrPC public nuisance action.',
          whyItMatters: 'Executive Magistrate powers for immediate cessation of nuisance.',
          authority: 'District Magistrate Office',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `State Pollution Control Board (SPCB) Regional Office & District Magistrate, ${location}`,
        type: 'State Environmental Enforcement Authority',
        relevance: 'Statutorily empowered to enforce environmental standards and penalize polluting entities.',
        actionableInfo: 'Submit complaint at SPCB regional office or online via state pollution grievance portal.',
        officialLink: 'https://cpcb.nic.in',
      };
      suggestedDocuments = [
        {
          type: 'complaint',
          title: 'Environmental Pollution Notice to State Pollution Control Board',
          reason: 'Formal notice demanding site inspection, emission testing, and enforcement action under EPA 1986.',
        },
      ];
    }
    // 9. Streetlight / Municipal Utility
    else if (text.includes('street light') || text.includes('lamp') || domain === 'municipal_utility') {
      explanation = 'Municipal bodies have a statutory obligation under State Urban Local Bodies Acts to maintain public street lighting, sanitation, and civic infrastructure for safety and public convenience.';
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
          title: 'Gather Landmark & Location Details',
          description: 'Note exact street location, nearest pole number (if marked), and duration of outage.',
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
    }
    // 10. Education / Student Certificates
    else if (domain === 'education' || text.includes('certificate') || text.includes('marksheet') || text.includes('college')) {
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
    }
    // 11. Pension / Welfare
    else if (domain === 'welfare_entitlement' || text.includes('pension')) {
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
    }
    // 12. RTI / Public Records
    else if (domain === 'rti_information' || (text.includes('road') && (text.includes('spent') || text.includes('money') || text.includes('repair')))) {
      explanation = 'Under Section 6 of the Right to Information Act 2005, every citizen has a legal right to inspect public works records, obtain certified copies of contracts, sanctioned budgets, and measurement books for municipal road repairs and public spending.';
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
    }
    // 13. Universal / General Fallback
    else {
      explanation = 'Based on the facts provided, you have a legitimate right to seek transparency, administrative review, and grievance redressal from the competent authority or service provider under the principles of administrative accountability and citizen charters.';
      options = [
        {
          title: 'Submit Formal Written Representation',
          description: 'Submit an official representation detailing the facts, chronology, and requested relief.',
          considerations: ['Establishes binding written record and statutory cause of action'],
        },
        {
          title: 'Grievance Portal Escalation',
          description: 'File an online complaint with the nodal oversight body or administrative tribunal.',
          considerations: ['Official tracking ID and mandated resolution timeline'],
        },
      ];
      recommendedNextStep = {
        title: 'Prepare Formal Representation & Serve Nodal Authority',
        explanation: 'Submitting a structured written representation creates a binding record for administrative review and statutory action.',
      };
      actionPlan = [
        {
          order: 1,
          title: 'Organize Timeline and Supporting Documentation',
          description: 'Gather dates, reference numbers, communication history, and proof related to this matter.',
          whyItMatters: 'Clear timelines significantly increase response speed and clarity.',
          status: 'in_progress',
        },
        {
          order: 2,
          title: 'Submit Representation to Responsible Department',
          description: 'Deliver formal letter or register on the official portal of the competent authority.',
          whyItMatters: 'Commences official administrative and legal review process.',
          status: 'not_started',
        },
      ];
      responsibleAuthority = {
        name: `${location} Competent Nodal Authority`,
        type: 'Public Administrative Authority',
        relevance: 'Oversees public service compliance and citizen grievances in this jurisdiction.',
        actionableInfo: 'Submit directly to head of department or via official portal.',
      };
      suggestedDocuments = [
        {
          type: 'representation',
          title: 'Formal Administrative Representation & Notice of Grievance',
          reason: 'Official statement of facts, applicable rights, and formal request for action.',
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
   * STAGE 9 — Dynamic Domain-Accurate Document Generator for Action Studio
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

    const lower = userDescription.toLowerCase();
    const classification = classifyCivicCase(userDescription);
    const domain: RightsDomain = classification.domain;

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

    // 1. RTI Application
    if (docType === 'rti') {
      title = 'Application under Right to Information Act, 2005';
      const isRoadRepair = lower.includes('road') || lower.includes('spent') || lower.includes('repair');
      
      const rtiQueries = isRoadRepair
        ? `1. Copy of administrative sanction and total funds allocated for road repair / works in ${location} for the current financial year.
2. Itemized expenditure statement showing actual money spent to date.
3. Copy of contract work order, tender agreement, and name of contractor awarded the work.
4. Name and designation of the inspecting engineer responsible for certifying quality.
5. Copy of Measurement Book (MB) entries and completion certificate if marked complete.
6. Details of daily progress logs and inspection reports.`
        : `1. Certified copies of all official records, file notings, and work orders related to: "${userDescription}".
2. Name, designation, and contact details of the public officer currently handling this matter.
3. Daily progress report and action taken report (ATR) on complaints/files submitted regarding this issue.
4. Copy of sanctioned budget, fund allocations, and expenditure records pertaining to this matter.
5. Citizen charter timeline mandated for resolution of this category of civic service.`;

      previewMarkdown = `### APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

**Date:** ${currentDate}

**To,**  
The Public Information Officer (PIO),  
${authorityName}  
${location}

**1. Name of Applicant:** ${applicantName}  
**2. Address for Communication:** ${applicantAddress}  
**3. Contact Number:** ${applicantPhone}  

**4. Particulars of Information Requested under Section 6(1) of RTI Act, 2005:**  
**Subject:** Information request regarding: ${caseTitle}

Please provide certified copies of the following official information/records:
${rtiQueries}

**5. Period to which information relates:** Current financial year / Recent relevant period.  
**6. Mode of Information Delivery:** By Registered Post / Speed Post to the address mentioned above.  
**7. Fee Details:** Application fee of Rs. 10/- attached herewith via Indian Postal Order / Court Fee Stamp.

I confirm that I am a citizen of India.

Sincerely,  
**${applicantName}**`;
    }
    // 2. Healthcare Grievance
    else if (domain === 'healthcare_patient') {
      title = 'Medical Grievance & Service Deficiency Notice';
      previewMarkdown = `### FORMAL MEDICAL GRIEVANCE UNDER PATIENT RIGHTS CHARTER & CLINICAL ESTABLISHMENTS ACT

**Date:** ${currentDate}

**To,**  
The Medical Superintendent / Grievance Redressal Committee,  
${authorityName}  
${location}

**Subject:** Urgent Grievance regarding Deficiency in Medical Care & Patient Rights Violation — Case: ${caseTitle}

**Respected Authority,**

I am writing to lodge a formal medical grievance regarding deficiency of service and denial of patient rights at your facility.

**1. Patient / Complainant Details:**
- Complainant Name: ${applicantName}
- Contact Number: ${applicantPhone}
- Address: ${applicantAddress}
- Facility / Department: ${authorityName}

**2. Statement of Facts:**
${userDescription}

**3. Statutory & Legal Basis:**
- **Charter of Patients' Rights (NHRC/MOHFW):** Guarantees right to emergency medical care, transparent billing, non-discrimination, and access to all medical records/case sheets within 24 hours.
- **Clinical Establishments (Registration and Regulation) Act, 2010:** Mandates clinical standards of care and functional grievance redressal.
- **Consumer Protection Act, 2019:** Medical services rendered by private and public hospitals fall within the ambit of statutory service deficiency.

**4. Relief & Action Demanded:**
1. Immediate clinical audit and inquiry into the incident by the Hospital Medical Board.
2. Complete certified copies of patient OPD slips, case sheets, nursing notes, and diagnostic test reports.
3. Rectification / waiver of unauthorized charges and appropriate remedial action.

Kindly acknowledge receipt of this grievance in writing and intimate the findings of the inquiry within 7 working days.

Yours sincerely,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    }
    // 3. Consumer Protection Notice
    else if (domain === 'consumer') {
      title = 'Formal Legal Notice under Consumer Protection Act, 2019';
      previewMarkdown = `### FORMAL LEGAL NOTICE UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

**Date:** ${currentDate}

**To,**  
The Managing Director / Customer Grievance Officer,  
${authorityName}  
${location}

**Subject:** Legal Notice for Deficiency in Service & Defective Goods — Regarding: ${caseTitle}

**Sir / Madam,**

Under instructions from and on behalf of my client/consumer **${applicantName}**, resident of ${applicantAddress}, I hereby serve you with this formal Legal Notice under the *Consumer Protection Act, 2019*:

**1. Facts of the Dispute:**
1. That the consumer engaged your services / purchased products from you as a bona fide consumer.
2. That the following defect / service deficiency occurred:
   "${userDescription}"
3. That despite repeated requests and notifications, your office has failed to rectify the defect, provide a replacement, or issue a full refund.

**2. Violation of Consumer Protection Act, 2019:**
Your refusal constitutes a clear deficiency of service under Section 2(11) and unfair trade practice under Section 2(47) of the Consumer Protection Act, 2019, causing severe financial loss, harassment, and mental agony.

**3. Demands & Notice Period:**
You are hereby called upon to comply with the following demands within **15 (fifteen) days** from the receipt of this notice:
1. Issue a full refund of the amount paid along with interest @ 18% per annum from the date of payment until realization.
2. Pay a sum of Rs. 25,000/- towards damages for mental agony and deficiency of service.

Failing compliance within 15 days, my client shall initiate formal legal proceedings before the competent **District Consumer Disputes Redressal Commission (DCDRC)** under Section 35 of the Consumer Protection Act, 2019, at your sole risk, cost, and consequence.

Yours faithfully,  
**${applicantName}**  
Address: ${applicantAddress}  
Contact: ${applicantPhone}`;
    }
    // 4. Housing & Tenant Deposit Demand
    else if (domain === 'housing_tenant') {
      title = 'Legal Demand Notice for Return of Security Deposit';
      previewMarkdown = `### FORMAL LEGAL DEMAND NOTICE FOR RETURN OF TENANCY SECURITY DEPOSIT

**Date:** ${currentDate}

**To,**  
${authorityName}  
${location}

**Subject:** Demand for immediate refund of Tenancy Security Deposit with statutory interest — ${caseTitle}

**Sir / Madam,**

I hereby serve you with this formal Legal Demand Notice regarding the unlawful retention of my tenancy security deposit:

**1. Tenancy Background & Facts:**
1. I was a tenant occupying the residential premises located at ${location}.
2. Upon vacating the premises and handing over peaceful vacant possession and keys to you, you were legally obligated to return the balance security deposit.
3. Particulars of Issue:
   "${userDescription}"

**2. Legal Position under Model Tenancy Act & State Rent Control Laws:**
- Under the *Model Tenancy Act* and settled tenancy jurisprudence, security deposits must be refunded upon handover of vacant possession after adjusting only mutually verified and itemized repairs.
- Withholding the deposit arbitrarily without valid inspection reports constitutes illegal retention of tenant funds and breach of contract.

**3. Mandatory Demand:**
You are hereby called upon to transfer the full security deposit amount to my bank account within **7 (seven) days** of receipt of this notice.

Failing repayment within 7 days, I shall be constrained to institute legal recovery proceedings before the designated **Rent Authority / Rent Court** and Civil Court, claiming the principal amount along with penal interest @ 18% p.a. and legal costs.

Yours sincerely,  
**${applicantName}**  
Address: ${applicantAddress}  
Phone: ${applicantPhone}`;
    }
    // 5. Workplace & Unpaid Wages Notice
    else if (domain === 'workplace_labour') {
      title = 'Formal Demand Notice for Unpaid Salary & Labour Dues';
      previewMarkdown = `### STATUTORY DEMAND NOTICE UNDER PAYMENT OF WAGES ACT, 1936

**Date:** ${currentDate}

**To,**  
The Management / Human Resources / Managing Director,  
${authorityName}  
${location}

**Subject:** Legal Demand Notice for payment of unpaid salary, settlement of dues, and release of employment certificates — ${caseTitle}

**Sir / Madam,**

I was employed with your organization and have rendered dedicated service. This notice is served regarding the unlawful withholding of my earned wages and employment dues.

**1. Statement of Employment & Unpaid Dues:**
- Employee Name: ${applicantName}
- Organization: ${authorityName}
- Statement of Grievance:
  "${userDescription}"

**2. Statutory Provisions & Violations:**
- Under **Section 15 of the Payment of Wages Act, 1936**, wages must be disbursed on or before the statutory due date without unauthorized deductions.
- Under the **Industrial Disputes Act, 1947**, withholding full-and-final settlement or statutory relieving certificates upon completion of service is an unfair labour practice.

**3. Requisitions:**
You are hereby given **7 (seven) days** notice from receipt hereof to:
1. Credit all pending salary arrears and full-and-final settlement dues to my bank account.
2. Issue my formal Experience Letter, Relieving Certificate, and PF transfer records.

In default, I shall file a formal complaint before the **District Labour Commissioner** and initiate recovery proceedings under the Payment of Wages Act, holding the management personally liable for costs and penalties.

Yours faithfully,  
**${applicantName}**  
Address: ${applicantAddress}  
Phone: ${applicantPhone}`;
    }
    // 6. Police Section 154(3) Representation
    else if (domain === 'police_legal_grievance') {
      title = 'Written Representation under Section 154(3) CrPC / Section 175(3) BNSS';
      previewMarkdown = `### FORMAL WRITTEN REPRESENTATION UNDER SECTION 154(3) Cr.P.C. / SECTION 175(3) BNSS

**Date:** ${currentDate}

**To,**  
The Superintendent of Police (SP) / Deputy Commissioner of Police (DCP),  
District Headquarters,  
${location}

**Subject:** Representation under Section 154(3) Cr.P.C. / Section 175(3) BNSS regarding refusal by local Police Station to register FIR for cognizable offence — Case: ${caseTitle}

**Respected Sir / Madam,**

I am constrained to approach your good office under Section 154(3) of the Code of Criminal Procedure (CrPC) / Section 175(3) of the Bharatiya Nagarik Suraksha Sanhita (BNSS) due to the refusal of the local Police Station to register an FIR regarding a cognizable offence.

**1. Complainant Information:**
- Name: ${applicantName}
- Address: ${applicantAddress}
- Phone Number: ${applicantPhone}
- Police Station Jurisdiction: ${authorityName}

**2. Chronological Statement of Cognizable Offence:**
${userDescription}

**3. Refusal by Police Station:**
Despite disclosing clear ingredients of a cognizable offence, the station officer refused to register an FIR or issue an official receipt, in direct violation of law.

**4. Binding Law — Supreme Court Mandate:**
In the Constitution Bench judgment of ***Lalita Kumari vs. Govt. of U.P. (2014) 2 SCC 1***, the Hon'ble Supreme Court held:
> *"Registration of FIR is mandatory under Section 154 of the Code, if the information discloses commission of a cognizable offence and no preliminary inquiry is permissible in such a situation."*

**5. Prayer / Relief Sought:**
I earnestly request your good office to:
1. Direct the registration of an FIR immediately under relevant penal sections.
2. Direct an impartial and prompt investigation into the matter.

Yours faithfully,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    }
    // 7. Electricity Grievance to CGRF
    else if (domain === 'power_electricity_utility') {
      title = 'Electricity Billing Dispute Complaint to CGRF';
      previewMarkdown = `### FORMAL COMPLAINT UNDER SECTION 42(5) OF THE ELECTRICITY ACT, 2003

**Date:** ${currentDate}

**To,**  
The Consumer Grievance Redressal Forum (CGRF),  
${authorityName}  
${location}

**Subject:** Complaint regarding erroneous/inflated electricity billing and meter discrepancy — ${caseTitle}

**Respected Members of the Forum,**

I am a registered electricity consumer and submit this complaint under the Electricity Act, 2003 regarding billing irregularities and service deficiency:

**1. Consumer Particulars:**
- Consumer Name: ${applicantName}
- Service Location: ${location}
- Distribution Licensee (DISCOM): ${authorityName}
- Description of Issue:
  "${userDescription}"

**2. Grounds of Complaint:**
1. The disputed bill exhibits an unreasonable and arbitrary spike inconsistent with verified historical consumption.
2. Under Section 42(5) of the Electricity Act, 2003, the licensee is duty-bound to supply accurate meter readings.
3. The DISCOM has failed to conduct a proper meter accuracy test or revise the inflated provisional assessment.

**3. Relief Claimed:**
1. Order immediate inspection and meter testing by an independent meter testing laboratory.
2. Issue a revised bill based on actual average recorded consumption.
3. Stay disconnection of electricity supply pending disposal of this grievance.

Yours sincerely,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    }
    // 8. Education / Student Certificates
    else if (domain === 'education' || lower.includes('certificate') || lower.includes('marksheet') || lower.includes('university')) {
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

**1. Details of Student & Issue:**
- Student Name: ${applicantName}
- Institution: ${authorityName}
- Issue Summary: ${userDescription}

**2. Legal & Regulatory Position:**
Under the *University Grants Commission (Redressal of Grievances of Students) Regulations 2023*, higher educational institutions are strictly prohibited from withholding original educational certificates, marksheets, or transfer certificates of students under any circumstances, including fee disputes.

**3. Demands:**
I request you to kindly hand over my original certificates within **3 (three) working days** from receipt of this representation. Failing this, I shall report this non-compliance to the **UGC Ombudsman portal (e-Samadhan)** and state higher education department.

Thanking you.

Sincerely,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    }
    // 9. Municipal Street Light / Civic Infrastructure
    else if (domain === 'municipal_utility' || lower.includes('street light') || lower.includes('lamp') || lower.includes('pothole') || lower.includes('garbage')) {
      title = 'Formal Municipal / Service Complaint';
      previewMarkdown = `### FORMAL GRIEVANCE COMPLAINT REGARDING CIVIC DEFICIENCY

**Date:** ${currentDate}

**To,**  
The Executive Officer / Public Grievance Nodal Officer,  
${authorityName}  
${location}

**Subject:** Urgent Complaint Regarding Civic Infrastructure Deficiency: ${caseTitle}

**Respected Sir / Madam,**

I am writing to register an official grievance regarding civic service deficiency in my locality at ${location}.

**1. Statement of Facts:**
1. ${userDescription}
2. The issue has been persisting and causes significant inconvenience and safety hazards to residents and commuters.
3. Details of location / landmark: ${location}.

**2. Statutory Duty:**
Under State Municipal Corporation and Urban Local Bodies legislation, the municipal administration has a mandatory statutory duty to maintain public street lighting, road safety, and civic infrastructure.

**3. Relief / Action Requested:**
1. Immediate site inspection by the responsible ward engineer.
2. Immediate repair / restoration of service without further delay.
3. Issuance of an official complaint tracking reference number for this matter.

Kindly acknowledge receipt of this complaint and intimate the expected resolution timeframe.

Yours faithfully,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    }
    // 10. Pension / Welfare
    else if (domain === 'welfare_entitlement' || lower.includes('pension')) {
      title = 'CPGRAMS Pension / Welfare Entitlement Grievance';
      previewMarkdown = `### FORMAL GRIEVANCE REGARDING DISRUPTION OF STATUTORY PENSION / WELFARE ENTITLEMENT

**Date:** ${currentDate}

**To,**  
The Nodal Pension Officer / Director of Social Welfare,  
${authorityName}  
${location}

**Subject:** Urgent Grievance for Resumption of Stopped Pension and Payment of Arrears — ${caseTitle}

**Respected Sir / Madam,**

I submit this formal grievance regarding the unexpected discontinuation of monthly pension disbursements:

**1. Beneficiary Particulars:**
- Beneficiary Name: ${applicantName}
- Address: ${applicantAddress}
- Contact Number: ${applicantPhone}
- Disbursing Authority / Treasury: ${authorityName}

**2. Facts & Disruption Details:**
${userDescription}

**3. Statutory Entitlement:**
Pensions and welfare entitlements are recognized statutory rights. Non-disbursement without prior written notice or due hearing causes grave financial distress to senior citizens and vulnerable beneficiaries.

**4. Prayers:**
1. Audit the pension account records to identify and rectify any technical or data verification freeze.
2. Resume regular monthly pension disbursement immediately.
3. Release all accumulated arrears from the date of stoppage into the registered bank account.

Yours faithfully,  
**${applicantName}**  
Contact: ${applicantPhone}  
Address: ${applicantAddress}`;
    }
    // 11. Universal / Open-Ended Formal Representation
    else {
      title = 'Formal Administrative Representation & Notice of Grievance';
      previewMarkdown = `### FORMAL ADMINISTRATIVE REPRESENTATION & NOTICE OF GRIEVANCE

**Date:** ${currentDate}

**To,**  
The Competent Administrative Officer / Head of Department,  
${authorityName}  
${location}

**Subject:** Formal Representation Regarding: ${caseTitle}

**Respected Sir / Madam,**

I am submitting this formal representation to your office for kind consideration and timely administrative action:

**1. Complainant Details:**
- Full Name: ${applicantName}
- Address: ${applicantAddress}
- Phone Number: ${applicantPhone}
- Jurisdiction / Location: ${location}

**2. Statement of Facts & Chronology:**
${userDescription}

**3. Applicable Principles & Citizens' Rights:**
Under the Principles of Natural Justice, Citizens' Charters, and applicable administrative regulations, public authorities and service providers are duty-bound to act fairly, transparently, and within reasonable timeframes.

**4. Relief / Action Demanded:**
1. Review the facts set out above and initiate appropriate corrective administrative action.
2. Provide a written response intimating the action taken within 15 working days.

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
