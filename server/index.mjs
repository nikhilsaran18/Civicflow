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
  "caseTitle": "Specific descriptive title derived strictly from case facts (e.g., Security Deposit Refund Dispute)",
  "situationSummary": "Plain language overview of the citizen's situation",
  "confirmedFacts": [
    { "id": "f1", "fact": "Fact text", "source": "initial_statement" }
  ],
  "inferences": ["Reasonable inference 1"],
  "unknowns": ["Missing fact 1"],
  "parties": [
    { "name": "Party name if known, else role", "type": "landlord | employer | seller | municipal_corporation | government_department | institute | utility_provider | individual | unknown" }
  ],
  "responsiblePartyType": "private | government | individual | commercial",
  "likelyGoal": "Citizen objective derived strictly from narrative",
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
2. DO NOT repeat any previous question.
3. Consider previous answers when framing Question #${questionNumber}.
4. Must materially improve case understanding, jurisdiction, authority selection, evidence recommendation, or remedy.
5. If Question #${questionNumber} is 3, make it the final clarification step.

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
      "title": "Short evidence title (e.g., Rental Agreement, Receipt, Photos)",
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
- DO NOT force into preset categories.
- DO NOT invent authorities, laws, portal URLs, or deadlines.
- If responsible authority cannot be determined with confidence, set "responsibleAuthority": null and explain why verification is needed.

Return ONLY JSON matching schema:
{
  "caseTitle": "Descriptive Case Title",
  "situationSummary": "Plain language summary of situation",
  "userGoal": "Primary citizen objective",
  "whatCivicFlowFound": "Civic, legal or practical context explained simply",
  "rightsAndConsiderations": ["Right/consideration 1", "Right/consideration 2"],
  "options": [
    {
      "id": "opt1",
      "title": "Option Title",
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
    "name": "Exact Official Authority Name or null",
    "type": "Public Authority | Private Entity | Municipal | Regulator | Service Provider",
    "relevance": "Why responsible",
    "actionableInfo": "How to contact or submit",
    "officialLink": "https://official-domain.gov.in or omit if unverified",
    "confidence": "high" | "medium" | "low"
  },
  "sources": [
    { "id": "s1", "title": "Official Source Name", "url": "https://...", "relevance": "Why relevant" }
  ],
  "suggestedDocuments": [
    { "id": "doc_1", "documentType": "security_deposit_refund_demand", "title": "Security Deposit Refund Demand Letter", "reason": "Useful for formally requesting repayment", "recommended": true }
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

