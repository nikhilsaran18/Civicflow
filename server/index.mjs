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
    // 1. Initial Case Understanding
    if (action === 'understand-case' || action === 'understand') {
      const { userDescription, answers = {} } = payload || {};
      const prompt = `Analyze this citizen case narrative and any provided context:
Narrative: "${userDescription}"
Current Answers: ${JSON.stringify(answers)}

Return ONLY a JSON object matching this exact schema:
{
  "caseTitle": "Specific descriptive title derived strictly from case facts (3-8 words, e.g. Unexpected Cessation of Father's Pension, Rental Security Deposit Dispute)",
  "categoryBadge": "Concise 1-3 word badge describing category (e.g. PENSION / ADMINISTRATIVE, TENANCY, MUNICIPAL SERVICE, EDUCATION, CASTE CERTIFICATE, CONSUMER DISPUTE)",
  "situationSummary": "Plain language overview of the citizen's situation",
  "confirmedFacts": [
    { "id": "f1", "fact": "Declarative factual statement extracted from narrative (e.g. The father receives a Government Employee Pension which stopped 3 months ago)", "source": "initial_statement" }
  ],
  "inferences": ["Reasonable inference 1"],
  "unknowns": ["Missing fact 1"],
  "parties": [
    { "name": "Party name if known, else role", "type": "landlord | employer | seller | municipal_corporation | government_department | institute | utility_provider | individual | unknown" }
  ],
  "responsiblePartyType": "private | government | individual | commercial",
  "likelyGoal": "Specific citizen objective derived from narrative (e.g. Restore pension payments and recover outstanding pension arrears)",
  "jurisdictionRelevant": true,
  "confidence": "low" | "medium" | "high"
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 2. Dynamic Sequential Question Generation (Q1, Q2, Q3)
    if (action === 'generate-next-question') {
      const { userDescription, confirmedFacts = [], previousQA = [], questionNumber = 1 } = payload || {};
      const prompt = `Generate ONE single, essential clarification question for Question #${questionNumber} of 3.

Original Narrative: "${userDescription}"
Confirmed Facts: ${JSON.stringify(confirmedFacts)}
Previous Questions & Answers: ${JSON.stringify(previousQA)}

RULES:
1. Generate EXACTLY ONE question.
2. DO NOT repeat any previous question or ask facts already answered in original narrative.
3. Make question specific to the situation (e.g. for pension, ask about PPO/bank/department; for caste cert, ask about portal/acknowledgment number/authority; for university, ask about written reason/course status).
4. DO NOT use generic terms like "opposing party" unless there is a private counterparty.
5. Must materially improve case understanding, jurisdiction, authority selection, evidence recommendation, or remedy.

Return ONLY JSON matching schema:
{
  "question": {
    "id": "q_${questionNumber}_${Date.now()}",
    "question": "Clear, specific question text",
    "reason": "Why this specific answer is necessary for the case",
    "type": "single_select" | "yes_no" | "text" | "textarea",
    "options": ["Option 1", "Option 2", "Option 3"],
    "required": true
  }
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 3. Question Validation
    if (action === 'validate-question') {
      const { caseNarrative, question } = payload || {};
      const prompt = `Review this proposed question against case narrative:
Narrative: "${caseNarrative}"
Question: "${question?.question}"

Return JSON:
{
  "relevant": true,
  "duplicate": false,
  "assumesUnsupportedFact": false,
  "reason": "Validation details"
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 4. Recommend Dynamic Case-Specific Evidence
    if (action === 'recommend-evidence') {
      const { userDescription, confirmedFacts = [], qAndA = [] } = payload || {};
      const prompt = `Based on this case, recommend 1 to 4 useful evidence items that the citizen could upload to strengthen their case.

Narrative: "${userDescription}"
Confirmed Facts: ${JSON.stringify(confirmedFacts)}
Clarification Q&A: ${JSON.stringify(qAndA)}

Return ONLY JSON matching schema:
{
  "recommendedEvidence": [
    {
      "id": "ev1",
      "title": "Short evidence title (e.g., Pension Payment Order (PPO), Rent Agreement, Caste Application Acknowledgment)",
      "reason": "Why this evidence is helpful for this case",
      "priority": "recommended" | "optional"
    }
  ]
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 5. Evidence Analysis Layer
    if (action === 'analyze-evidence') {
      const { evidenceList = [], existingFacts = [] } = payload || {};
      const prompt = `Analyze uploaded evidence metadata/notes and extract confirmed facts:
Evidence Items: ${JSON.stringify(evidenceList)}
Existing Facts: ${JSON.stringify(existingFacts)}

Return ONLY JSON:
{
  "extractedFacts": [
    { "fact": "Extracted fact detail", "source": "evidence_file", "confidence": "high" }
  ]
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 6. Full Case Analysis & Solution Generation
    if (action === 'solve-case' || action === 'research-and-solve') {
      const { userDescription, understanding = {}, qAndA = [], evidenceFacts = [] } = payload || {};
      const prompt = `Generate a complete, practical CivicSolution for this case.

Original Narrative: "${userDescription}"
Case Understanding: ${JSON.stringify(understanding)}
All 3 Clarification Q&A: ${JSON.stringify(qAndA)}
Evidence Facts: ${JSON.stringify(evidenceFacts)}

CRITICAL INSTRUCTIONS:
- DO NOT use generic default names such as "Nodal Public Authority / Service Provider" or "Formal Administrative Representation".
- DO NOT invent fake authority names, statutory laws, portal URLs, or deadlines.
- If responsible authority requires location/jurisdiction verification, set authority name to "Requires jurisdiction verification" and state what details are needed.
- Derive a specific citizen goal (e.g. "Restore pension payments and recover outstanding pension arrears").
- Derive a specific category badge (e.g. "PENSION / ADMINISTRATIVE", "TENANCY", "MUNICIPAL SERVICE", "EDUCATION", "CASTE CERTIFICATE").

Return ONLY JSON matching schema:
{
  "caseTitle": "Descriptive Case Title (3-8 words, specific)",
  "categoryBadge": "Category badge e.g. PENSION / ADMINISTRATIVE",
  "situationSummary": "Plain language summary of situation",
  "userGoal": "Derived primary citizen objective",
  "whatCivicFlowFound": "Civic, legal or practical context explained simply",
  "rightsAndConsiderations": ["Case-specific right/consideration 1", "Case-specific right/consideration 2"],
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
    "name": "Exact Official Authority Name (e.g. Pension Disbursing Bank / CPPC, District Revenue Office, Municipal Electrical Ward Office) or null",
    "type": "Public Authority | Statutory Body | Municipal | Regulator | Educational Body | Private Entity",
    "relevance": "Why responsible for this issue",
    "actionableInfo": "How to contact or submit grievance",
    "officialLink": "https://official-domain.gov.in or omit if unverified",
    "confidence": "high" | "medium" | "low"
  },
  "sources": [
    { "id": "s1", "title": "Official Source / Portal Name", "url": "https://...", "relevance": "Why relevant" }
  ],
  "suggestedDocuments": [
    { "id": "doc_1", "documentType": "representation | rti | complaint | demand_notice", "title": "Specific Document Title", "reason": "Why useful for this case", "recommended": true }
  ],
  "limitations": ["CivicFlow provides civic and legal navigation information and does not replace qualified legal counsel."],
  "confidence": "high" | "medium" | "low"
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 7. Dynamic Action Studio Document Generation
    if (action === 'generate-document') {
      const { docType, caseTitle, userDescription, answers = {}, solution = {} } = payload || {};
      const prompt = `Generate a dynamic, case-specific document draft for documentType: "${docType}"

Case Title: "${caseTitle}"
Original Narrative: "${userDescription}"
Answers & Facts: ${JSON.stringify(answers)}
Case Solution: ${JSON.stringify(solution)}

CRITICAL INSTRUCTIONS:
- Use ONLY confirmed case facts.
- Insert editable placeholders like [Landlord Name], [Invoice Number], [Property Address] for missing details.
- Provide a dynamic list of fields metadata so the frontend can render input fields dynamically.

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
    },
    {
      "id": "opposing_party_name",
      "label": "Opposing Party / Recipient Name",
      "value": "${answers.opposing_party_name || ''}",
      "placeholder": "Enter recipient or organization name",
      "required": false,
      "type": "text"
    },
    {
      "id": "address_details",
      "label": "Property / Incident Address",
      "value": "${answers.location || ''}",
      "placeholder": "Enter relevant address or locality",
      "required": false,
      "type": "text"
    }
  ],
  "previewMarkdown": "Full formatted Markdown draft..."
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    // 8. Generate Professional Case File
    if (action === 'generate-case-file') {
      const { caseData = {} } = payload || {};
      const prompt = `Generate a complete Professional Case File in Markdown for this CivicFlow case:

Case Data: ${JSON.stringify(caseData)}

Format as a comprehensive CIVICFLOW AI CASE FILE with all key sections:
- Case Metadata (ID, Title, Created Date, Status, Confidence)
- Original Statement
- AI Understanding & Confirmed Facts
- Sequential Clarification Q&A (Question 1-3 & Answers)
- Evidence Summary
- Citizen Objective & Rights
- Practical Options & Recommended Next Step
- Action Plan
- Responsible Authority
- Suggested Documents & Sources
- Official Safety Disclaimer

Return ONLY JSON:
{
  "caseFileMarkdown": "Markdown content..."
}`;

      const result = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      return res.json(result);
    }

    return res.status(400).json({ success: false, errorCode: 'UNKNOWN_ACTION', error: `Unknown action: ${action}` });
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

