import { describe, it, expect } from 'vitest';
import { defaultCivicIntelligenceEngine } from '../services/ai/civicIntelligenceEngine';
import { defaultQuestionValidator } from '../services/ai/questionValidator';
import { KnowledgeService } from '../services/knowledgeService';

describe('CRITICAL ACCEPTANCE TEST SUITE — CIVICFLOW AI', () => {
  it('TEST 0: Tuition Teacher Fee Refund (CRITICAL BUG REPAIR VERIFICATION)', async () => {
    const input = "my tuition teacher is not refunding my fees";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    // Must NOT assume higher education, university, UGC, or certificates!
    const summaryLower = (result.understanding.situationSummary || result.understanding.summary || '').toLowerCase();
    const descLower = (result.understanding.aiCaseDescription || '').toLowerCase();

    expect(summaryLower).not.toContain('university');
    expect(summaryLower).not.toContain('ugc');
    expect(summaryLower).not.toContain('certificate');
    expect(descLower).not.toContain('higher education');

    // Questions must be relevant to tuition / fee refund
    const qTexts = result.questions.map(q => q.question.toLowerCase()).join(' ');
    expect(qTexts).not.toContain('vice-chancellor');
    expect(qTexts).not.toContain('registrar');
    expect(qTexts).not.toContain('original certificates');

    // Solution generation & document generation verification
    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { receipt_or_proof: 'Yes, UPI receipt' });
    const suggestedDocTypes = solution.suggestedDocuments.map(d => d.title.toLowerCase()).join(' ');
    expect(suggestedDocTypes).not.toContain('release of original certificates');

    const docDraft = await defaultCivicIntelligenceEngine.generateDocumentDraft(
      solution.suggestedDocuments[0]?.type || 'refund_demand',
      result.understanding.aiCaseDescription,
      input,
      { receipt_or_proof: 'Yes, UPI receipt' },
      solution
    );

    expect(docDraft.previewMarkdown).not.toContain('RELEASE OF ORIGINAL CERTIFICATES');
    expect(docDraft.previewMarkdown).not.toContain('University Grants Commission');
  });

  it('TEST 1: Street Light 10 days outage (No receipt/invoice questions allowed!)', async () => {
    const input = "The street light outside my house hasn't worked for 10 days.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    // Must understand municipal public infrastructure context
    expect(result.understanding.aiCaseDescription).toContain('Lighting');

    // Check all generated candidate questions
    const questionTexts = result.questions.map(q => q.question.toLowerCase());
    const illegalTerms = ['receipt', 'invoice', 'seller', 'purchase', 'warranty', 'refund amount', 'product price'];

    questionTexts.forEach(qText => {
      illegalTerms.forEach(term => {
        expect(qText).not.toContain(term);
      });
    });
  });

  it('TEST 2: University Certificates Withheld', async () => {
    const input = "My university won't return my original certificates.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.aiCaseDescription).toContain('Certificate');

    const questionTexts = result.questions.map(q => q.question.toLowerCase());
    const illegalTerms = ['receipt', 'landlord', 'electricity account', 'seller'];

    questionTexts.forEach(qText => {
      illegalTerms.forEach(term => {
        expect(qText).not.toContain(term);
      });
    });
  });

  it('TEST 3: Father Pension Stopped', async () => {
    const input = "My father's pension stopped three months ago.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.aiCaseDescription).toContain('Pension');
    expect(result.questions.length).toBeGreaterThan(0);
  });

  it('TEST 4: Road Repair Expenditure Inquiry (Identifies RTI / Information Pathway)', async () => {
    const input = "I want to know how much the municipality spent repairing my road.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.aiCaseDescription).toContain('Transparency');
    
    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'Ward 10' });
    const rtiDoc = solution.suggestedDocuments.find(d => d.type === 'rti');
    expect(rtiDoc).toBeDefined();
  });

  it('TEST 5: Ambiguous Case ("They haven\'t paid me")', async () => {
    const input = "They haven't paid me.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    // Must NOT be classified as fixed consumer/tenant domain immediately
    expect(result.understanding.readyForSolution).toBe(false);

    // Must ask who was supposed to pay
    const payerQuestion = result.questions.find(q => q.id === 'payer_identity');
    expect(payerQuestion).toBeDefined();
  });

  it('TEST 6: Novel Unseen Civic Issue (No "Unsupported domain" error)', async () => {
    const input = "The local public library in my ward has been closed for 4 months without any official notice.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.summary).not.toContain('Unsupported domain');
    expect(result.understanding.aiCaseDescription).toBeDefined();
  });

  it('TEST 7: Cross-Case Isolation (Zero contamination across sequential cases)', async () => {
    // Case A: Certificates
    const caseA = await defaultCivicIntelligenceEngine.analyzeCase("My university won't return my original certificates.", {});
    
    // Case B: Streetlight
    const caseB = await defaultCivicIntelligenceEngine.analyzeCase("The street light outside my house is broken.", {});
    expect(JSON.stringify(caseB)).not.toContain('university');
    expect(JSON.stringify(caseB)).not.toContain('certificates');
    expect(JSON.stringify(caseB)).not.toContain('UGC');

    // Case C: Pension
    const caseC = await defaultCivicIntelligenceEngine.analyzeCase("My father's pension stopped.", {});
    expect(JSON.stringify(caseC)).not.toContain('street light');
    expect(JSON.stringify(caseC)).not.toContain('university');
  });
});
