import { describe, it, expect } from 'vitest';
import { defaultCivicIntelligenceEngine } from '../services/ai/civicIntelligenceEngine';
import { defaultQuestionValidator } from '../services/ai/questionValidator';

describe('CRITICAL ACCEPTANCE TEST SUITE — CIVICFLOW AI', () => {
  it('TEST 1: Street Light 10 days outage (No receipt/invoice questions allowed!)', async () => {
    const input = "The street light outside my house hasn't worked for 10 days.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    // Must understand municipal public infrastructure context
    expect(result.understanding.aiCaseDescription).toContain('Municipal');

    // Check all generated candidate questions
    const questionTexts = result.questions.map(q => q.question.toLowerCase());
    const illegalTerms = ['receipt', 'invoice', 'seller', 'purchase', 'warranty', 'refund amount', 'product price'];

    questionTexts.forEach(qText => {
      illegalTerms.forEach(term => {
        expect(qText).not.toContain(term);
      });
    });
  });

  it('TEST 2: University Certificates Withheld (No landlord/receipt questions allowed!)', async () => {
    const input = "My university won't return my original certificates.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.aiCaseDescription).toContain('Education');

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
});
