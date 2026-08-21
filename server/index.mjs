import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { geminiService } from './geminiService.mjs';
import { CIVIC_SYSTEM_PROMPT } from './prompts/civicSystemPrompt.mjs';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Health Check Endpoint (Never exposes key!)
app.get('/api/health', (req, res) => {
  res.json({
    server: true,
    geminiConfigured: geminiService.isConfigured(),
    model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
  });
});

// Civic AI API Endpoint
app.post('/api/civic-ai', async (req, res) => {
  const { action, payload } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required.' });
  }

  try {
    if (action === 'understand') {
      const { userDescription, answers } = payload;
      const prompt = `Analyze this citizen case narrative and provided clarification answers:
Narrative: "${userDescription}"
Answers: ${JSON.stringify(answers || {})}

Return JSON matching schema:
{
  "situationSummary": "plain language overview",
  "confirmedFacts": [{"id": "f1", "fact": "Fact detail", "source": "initial_statement" | "clarification_answer"}],
  "missingCriticalInformation": ["item 1"],
  "aiCaseDescription": "Concise specific label derived strictly from facts (e.g., Teaching Service Fee Refund Dispute)",
  "inferredGoal": "Primary goal if stated or clear",
  "goalNeedsClarification": boolean,
  "clarificationQuestions": [
    {
      "id": "q1",
      "question": "Case-specific follow up question",
      "reason": "Why this matters",
      "type": "text" | "textarea" | "yes_no" | "single_select" | "multi_select" | "date" | "number" | "location",
      "options": ["Option 1"],
      "required": true
    }
  ],
  "readyForSolution": boolean,
  "readinessReason": "Why case is ready or needs more facts",
  "confidence": "low" | "medium" | "high"
}`;

      const data = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      if (data) return res.json({ success: true, data });
      return res.json({ success: false, fallback: true });
    }

    if (action === 'validate-question') {
      const { caseNarrative, question } = payload;
      const prompt = `Review this proposed question against case narrative:
Narrative: "${caseNarrative}"
Question: "${question.question}"

Return JSON:
{
  "relevant": boolean,
  "duplicate": boolean,
  "assumesUnsupportedFact": boolean,
  "reason": "Validation details"
}`;

      const data = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      if (data) return res.json({ success: true, data });
      return res.json({ success: false, fallback: true });
    }

    if (action === 'research-and-solve') {
      const { userDescription, understanding, answers } = payload;
      const prompt = `Generate a complete CivicSolution for this case:
Description: "${userDescription}"
Understanding: ${JSON.stringify(understanding)}
Answers: ${JSON.stringify(answers || {})}

Return JSON matching schema:
{
  "situationSummary": "Plain language summary",
  "userGoal": "Primary goal",
  "whatCivicFlowFound": "Civic/legal context",
  "possibleOptions": [{"id": "opt1", "title": "Option name", "explanation": "Details"}],
  "recommendedNextStep": {"title": "Action title", "explanation": "Why first"},
  "actionPlan": [{"order": 1, "title": "Step 1", "description": "Details", "whyItMatters": "Reason", "evidenceNeeded": ["Doc 1"]}],
  "likelyAuthority": {"name": "Authority Name", "type": "Provider / Department", "reason": "Why responsible", "confidence": "low" | "medium" | "high"},
  "relevantEvidence": ["Evidence item"],
  "suggestedDocuments": [{"type": "complaint" | "rti" | "request" | "appeal", "title": "Doc title", "reason": "Why useful"}],
  "sources": [{"id": "s1", "title": "Source name", "url": "https://...", "relevance": "Why relevant to THIS case"}],
  "limitations": ["CivicFlow provides civic navigation support and does not replace formal legal counsel."],
  "confidence": "low" | "medium" | "high"
}`;

      const data = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      if (data) return res.json({ success: true, data });
      return res.json({ success: false, fallback: true });
    }

    if (action === 'validate-solution') {
      const { confirmedFacts, proposedSolution } = payload;
      const prompt = `Validate proposed solution against confirmed facts:
Confirmed Facts: ${JSON.stringify(confirmedFacts)}
Proposed Solution: ${JSON.stringify(proposedSolution)}

Return JSON:
{
  "valid": boolean,
  "unsupportedClaims": [],
  "irrelevantRecommendations": [],
  "unsupportedAuthorities": [],
  "unsupportedDocuments": [],
  "shouldRegenerate": boolean
}`;

      const data = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      if (data) return res.json({ success: true, data });
      return res.json({ success: false, fallback: true });
    }

    if (action === 'generate-document') {
      const { docType, caseTitle, userDescription, answers, solution } = payload;
      const prompt = `Generate a case-specific document draft for docType: "${docType}"
Case Title: "${caseTitle}"
Narrative: "${userDescription}"
Confirmed Answers: ${JSON.stringify(answers || {})}

IMPORTANT: Use ONLY confirmed facts. Insert editable placeholders like [Provider Name] when information is unknown. NEVER introduce university/UGC/certificate retention text unless the narrative explicitly concerns certificates.

Return JSON:
{
  "title": "Document Title",
  "fields": {"applicantName": "...", "applicantAddress": "..."},
  "previewMarkdown": "Markdown draft..."
}`;

      const data = await geminiService.generateJSON(CIVIC_SYSTEM_PROMPT, prompt);
      if (data) return res.json({ success: true, data });
      return res.json({ success: false, fallback: true });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('Error handling /api/civic-ai:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`CivicFlow AI Backend running on http://localhost:${PORT}`);
  console.log(`Gemini Configured: ${geminiService.isConfigured()}`);
});
