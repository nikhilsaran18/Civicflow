import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. MUST load .env BEFORE importing services
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import { geminiService } from './geminiService.mjs';
import { CIVIC_SYSTEM_PROMPT } from './prompts/civicSystemPrompt.mjs';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  try {
    res.json({
      server: true,
      geminiConfigured: geminiService.isConfigured(),
      model: geminiService.getModel(),
    });
  } catch (err) {
    console.error('Error in /api/health:', err);
    res.status(200).json({
      server: true,
      geminiConfigured: false,
      model: geminiService.getModel(),
      error: err?.message || 'Health check error',
    });
  }
});

// Civic AI API Endpoint
app.post('/api/civic-ai', async (req, res) => {
  const { action, payload } = req.body || {};

  if (!action) {
    return res.status(400).json({ success: false, errorCode: 'MISSING_ACTION', error: 'Action is required.' });
  }

  try {
    // 1. Initial Case Understanding with Relationship-First Classification
    if (action === 'understand-case' || action === 'understand') {
      const { userDescription, answers = {} } = payload || {};
      const prompt = `Analyze this citizen narrative using Relationship-First Classification:
Narrative: "${userDescription}"
Answers: ${JSON.stringify(answers)}

Determine:
1. relationship: GOVERNMENT_PUBLIC_AUTHORITY | PRIVATE_INDIVIDUAL | BUSINESS_SELLER | ONLINE_PLATFORM | BANK_FINANCIAL_INSTITUTION | UPI_PAYMENT_PROVIDER | EMPLOYER | LANDLORD | EDUCATIONAL_INSTITUTION | HOSPITAL_HEALTHCARE_PROVIDER | POLICE_LAW_ENFORCEMENT | OTHER
2. issueCategory: CONSUMER_REFUND | PRIVATE_FINANCIAL_DISPUTE | UNAUTHORIZED_TRANSFER | UPI_FRAUD | BANKING_FRAUD | LANDLORD_DEPOSIT | WORKPLACE_DISPUTE | PENSION_ISSUE | PUBLIC_SERVICE_FAILURE | HEALTHCARE_SERVICE_DISPUTE | OTHER
3. rtiApplicable: true ONLY if information/records are sought from a Public Authority. FALSE for private individuals, girlfriends, landlords, sellers, banks.

Return ONLY JSON matching schema:
{
  "caseTitle": "Neutral descriptive title (3-8 words, e.g. Suspected Unauthorized UPI Transaction, Private Money Dispute, Consumer Refund Dispute)",
  "categoryBadge": "Concise 1-3 word badge describing relationship/issue",
  "relationship": "PRIVATE_INDIVIDUAL | BUSINESS_SELLER | BANK_FINANCIAL_INSTITUTION | GOVERNMENT_PUBLIC_AUTHORITY | LANDLORD | EMPLOYER | HOSPITAL_HEALTHCARE_PROVIDER | UNKNOWN",
  "issueCategory": "PRIVATE_FINANCIAL_DISPUTE | CONSUMER_REFUND | UNAUTHORIZED_TRANSFER | LANDLORD_DEPOSIT | PENSION_ISSUE | PUBLIC_SERVICE_FAILURE | UNKNOWN",
  "situationSummary": "Plain language overview of the citizen's situation",
  "confirmedFacts": [
    { "id": "f1", "fact": "Declarative factual statement extracted from narrative", "source": "initial_statement" }
  ],
  "rtiApplicable": false,
  "likelyGoal": "Specific citizen objective derived from narrative",
  "confidence": "low" | "medium" | "high"
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 2. Dynamic Sequential Question Generation with Predefined Selectable Choices
    if (action === 'generate-next-question') {
      const { userDescription, confirmedFacts = [], previousQA = [], questionNumber = 1, relationship = 'UNKNOWN' } = payload || {};
      const prompt = `Generate ONE single, decision-changing clarification question for Question #${questionNumber}.

Original Narrative: "${userDescription}"
Relationship Identified: "${relationship}"
Confirmed Facts: ${JSON.stringify(confirmedFacts)}
Previous Questions & Answers: ${JSON.stringify(previousQA)}

CRITICAL REQUIREMENTS:
1. Provide 3 to 7 structured, selectable answer choices (options) for this question.
2. DO NOT assume a government authority or CPGRAMS unless relationship is GOVERNMENT_PUBLIC_AUTHORITY or POLICE_LAW_ENFORCEMENT.
3. Include choices like "I am not sure" or "None of these" where appropriate.
4. DO NOT repeat any previous question or fact already provided.

Return ONLY JSON matching schema:
{
  "question": {
    "id": "q_${questionNumber}_${Date.now()}",
    "question": "Clear, specific question text",
    "reason": "Why this answer is necessary to clarify the classification or route",
    "type": "single_select",
    "options": [
      { "id": "opt1", "label": "Option 1 label", "value": "VALUE_1" },
      { "id": "opt2", "label": "Option 2 label", "value": "VALUE_2" },
      { "id": "opt3", "label": "I am not sure", "value": "UNSURE" }
    ],
    "required": true
  }
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 3. Evidence Sufficiency Evaluation
    if (action === 'evaluate-sufficiency') {
      const { userDescription, relationship, issueCategory, confirmedFacts = [], previousQA = [] } = payload || {};
      const prompt = `Evaluate evidence sufficiency for this case:
Narrative: "${userDescription}"
Relationship: "${relationship}"
Issue Category: "${issueCategory}"
Confirmed Facts: ${JSON.stringify(confirmedFacts)}
Q&A History: ${JSON.stringify(previousQA)}

Determine whether sufficient facts exist to select a valid route without guessing.

Return ONLY JSON:
{
  "sufficient": true | false,
  "classificationConfidence": 0.85,
  "routeConfidence": 0.80,
  "missingCriticalFacts": ["List of missing facts if insufficient, else empty array"],
  "readinessReason": "Explanation of why case is ready or what fact remains missing"
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 4. Recommend Dynamic Case-Specific Evidence
    if (action === 'recommend-evidence') {
      const { userDescription, confirmedFacts = [], qAndA = [] } = payload || {};
      const prompt = `Based on this case, recommend 1 to 4 case-specific evidence items.

Narrative: "${userDescription}"
Confirmed Facts: ${JSON.stringify(confirmedFacts)}
Clarification Q&A: ${JSON.stringify(qAndA)}

Return ONLY JSON matching schema:
{
  "recommendedEvidence": [
    {
      "id": "ev1",
      "title": "Short evidence title (e.g., Bank Statement, UPI Receipt, Screenshots, Rent Agreement)",
      "reason": "Why this evidence is helpful for this case",
      "priority": "recommended" | "optional"
    }
  ]
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 5. Full Case Analysis & Solution Generation
    if (action === 'solve-case' || action === 'research-and-solve') {
      const { userDescription, understanding = {}, qAndA = [], evidenceFacts = [] } = payload || {};
      const prompt = `Generate a complete CivicSolution for this case strictly adhering to Relationship-First rules.

Original Narrative: "${userDescription}"
Case Understanding: ${JSON.stringify(understanding)}
Clarification Q&A: ${JSON.stringify(qAndA)}
Evidence Facts: ${JSON.stringify(evidenceFacts)}

CRITICAL SAFETY RULES:
1. If relationship is PRIVATE_INDIVIDUAL, BUSINESS_SELLER, LANDLORD, EMPLOYER, or BANK:
   - DO NOT suggest CPGRAMS or Nodal Public Grievance Officer.
   - DO NOT set rtiApplicable to true.
   - Suggest appropriate routes (e.g. Bank Support, Cybercrime Portal, Consumer Commission, Police Station, Civil Dispute).
2. Set rtiApplicable to TRUE ONLY IF the issue involves seeking records/information from a Public Authority.
3. If authority is private or unknown, set responsibleAuthority.name to null or appropriate private entity. NEVER invent fake government department titles.

Return ONLY JSON matching schema:
{
  "caseTitle": "Descriptive Case Title (3-8 words, neutral)",
  "categoryBadge": "Category badge e.g. PRIVATE DISPUTE, CONSUMER, TENANCY, PENSION",
  "relationship": "PRIVATE_INDIVIDUAL | BUSINESS_SELLER | BANK_FINANCIAL_INSTITUTION | GOVERNMENT_PUBLIC_AUTHORITY | LANDLORD | EMPLOYER | UNKNOWN",
  "issueCategory": "PRIVATE_FINANCIAL_DISPUTE | CONSUMER_REFUND | UNAUTHORIZED_TRANSFER | LANDLORD_DEPOSIT | PENSION_ISSUE | UNKNOWN",
  "rtiApplicable": false,
  "situationSummary": "Plain language summary of situation",
  "userGoal": "Derived primary citizen objective",
  "whatCivicFlowFound": "Civic, legal or practical context explained simply",
  "rightsAndConsiderations": ["Case-specific consideration 1", "Case-specific consideration 2"],
  "potentialRoutes": ["Primary Route", "Secondary Route"],
  "inappropriateRoutes": ["CPGRAMS", "RTI"],
  "options": [
    {
      "id": "opt1",
      "title": "Specific Option Title",
      "description": "Details of option",
      "considerations": ["Key consideration 1"]
    }
  ],
  "recommendedNextStep": {
    "title": "Action title",
    "explanation": "Why this step comes first"
  },
  "actionPlan": [
    {
      "order": 1,
      "title": "Step Title",
      "description": "Step detail",
      "whyItMatters": "Reason",
      "evidenceNeeded": ["Item 1"],
      "status": "not_started"
    }
  ],
  "responsibleAuthority": {
    "name": "Exact Authority Name or null",
    "type": "Public Authority | Statutory Body | Bank / Financial | Cybercrime Portal | Police / Law Enforcement | Private Entity",
    "relevance": "Why responsible",
    "actionableInfo": "How to contact or proceed",
    "officialLink": "https://official-domain.gov.in or omit if private/unverified",
    "confidence": "high" | "medium" | "low"
  },
  "sources": [
    { "id": "s1", "title": "Official Source / Portal Name", "url": "https://...", "relevance": "Why relevant" }
  ],
  "suggestedDocuments": [
    { "id": "doc_1", "documentType": "complaint | dispute_summary | demand_notice | representation", "title": "Specific Document Title", "reason": "Why useful", "recommended": true }
  ],
  "limitations": ["CivicFlow provides civic navigation support and does not replace qualified legal counsel."],
  "confidence": "high" | "medium" | "low"
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 6. Dynamic Action Studio Document Generation
    if (action === 'generate-document') {
      const { docType, caseTitle, userDescription, answers = {}, solution = {} } = payload || {};
      const prompt = `Generate a dynamic, case-specific document draft for documentType: "${docType}"

Case Title: "${caseTitle}"
Original Narrative: "${userDescription}"
Answers & Facts: ${JSON.stringify(answers)}
Case Solution: ${JSON.stringify(solution)}

Return ONLY JSON matching schema:
{
  "title": "Document Title",
  "documentType": "${docType}",
  "fields": [
    {
      "id": "applicant_name",
      "label": "Your Full Name",
      "value": "${answers.applicant_name || ''}",
      "placeholder": "Enter your full name",
      "required": true,
      "type": "text"
    }
  ],
  "previewMarkdown": "Full formatted Markdown draft..."
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 7. Generate Professional Case File
    if (action === 'generate-case-file') {
      const { caseData = {} } = payload || {};
      const prompt = `Generate a complete Professional Case File in Markdown for this CivicFlow case:

Case Data: ${JSON.stringify(caseData)}

Format as a comprehensive CIVICFLOW AI CASE FILE:
- Case Metadata (ID, Title, Category, Relationship, RTI Applicable)
- Original Statement
- Confirmed Facts (Only citizen-provided facts)
- Sequential Clarification Q&A Record
- Recommended Evidence
- Available Options & Recommended Next Step
- Action Plan
- Responsible Authority / Where to Go
- Authoritative Sources
- Official Safety Disclaimer

Return ONLY JSON:
{
  "caseFileMarkdown": "Markdown content..."
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 8. Question Validation
    if (action === 'validate-question') {
      const { caseNarrative, question } = payload || {};
      const prompt = `Validate if this clarification question is strictly relevant to the user's case narrative:
Case Narrative: "${caseNarrative}"
Question: ${JSON.stringify(question)}

Return ONLY JSON:
{
  "relevant": true,
  "duplicate": false,
  "assumesUnsupportedFact": false,
  "reason": "Valid question"
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    return res.status(400).json({ success: false, errorCode: 'UNKNOWN_ACTION', error: 'Unsupported CivicFlow AI action.' });
  } catch (err) {
    console.error('Error handling /api/civic-ai:', err);
    return res.status(500).json({ success: false, errorCode: 'SERVER_ERROR', error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`CivicFlow AI Backend running on http://localhost:${PORT}`);
  console.log(`Gemini Configured: ${geminiService.isConfigured()}`);
  if (!geminiService.isConfigured()) {
    console.warn(`WARNING: GEMINI_API_KEY is missing or invalid in .env! Configure GEMINI_API_KEY in project root .env file.`);
  }
});
