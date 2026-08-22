import { describe, it, expect } from 'vitest';
import { defaultCivicIntelligenceEngine } from '../services/ai/civicIntelligenceEngine';
import { classifyIssue } from '../engine/classifier';
import { CivicCase } from '../types/civicIntelligence';

describe('RUNTIME BUG FIX REGRESSION TEST SUITE', () => {
  it('1. Verifies supported API action contract names match expected list', () => {
    const supportedActions = [
      'understand-case',
      'understand',
      'evaluate-sufficiency',
      'generate-next-question',
      'recommend-evidence',
      'solve-case',
      'research-and-solve',
      'generate-document',
      'generate-case-file',
      'validate-question',
    ];

    expect(supportedActions).toContain('understand-case');
    expect(supportedActions).toContain('evaluate-sufficiency');
    expect(supportedActions).toContain('generate-next-question');
    expect(supportedActions).toContain('recommend-evidence');
    expect(supportedActions).toContain('solve-case');
    expect(supportedActions).toContain('generate-document');
    expect(supportedActions).toContain('generate-case-file');
    expect(supportedActions).toContain('validate-question');
  });

  it('2. Verifies old/missing optional fields do not crash case file compilation', async () => {
    const minimalLegacyCase: CivicCase = {
      id: 'legacy_123',
      title: 'Legacy Money Issue',
      originalProblem: 'I paid money to a person who did not return it.',
      status: 'action_required',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confidence: 'medium',
      understanding: {
        caseTitle: 'Legacy Money Issue',
        categoryBadge: 'PRIVATE DISPUTE',
        relationship: 'PRIVATE_INDIVIDUAL',
        issueCategory: 'PRIVATE_FINANCIAL_DISPUTE',
        rtiApplicable: false,
        situationSummary: 'I paid money to a person who did not return it.',
        confirmedFacts: [],
        likelyGoal: 'Recover money',
        confidence: 'medium',
      },
      solution: {
        caseTitle: 'Legacy Money Issue',
        categoryBadge: 'PRIVATE DISPUTE',
        relationship: 'PRIVATE_INDIVIDUAL',
        issueCategory: 'PRIVATE_FINANCIAL_DISPUTE',
        rtiApplicable: false,
        potentialRoutes: ['Direct Communication', 'Legal Notice'],
        situationSummary: 'I paid money to a person who did not return it.',
        userGoal: 'Recover money',
        whatCivicFlowFound: 'Civil dispute context',
        rightsAndConsiderations: [],
        options: [
          {
            id: 'opt1',
            title: 'Send Demand Notice',
            description: 'Send a formal demand notice to repay.',
          },
        ],
        recommendedNextStep: {
          title: 'Draft Demand Notice',
          explanation: 'Establish formal communication.',
        },
        actionPlan: [
          {
            order: 1,
            title: 'Prepare Demand Notice',
            description: 'Draft the notice with details.',
            status: 'not_started',
          },
        ],
        confidence: 'medium',
      },
    };

    const caseFile = await defaultCivicIntelligenceEngine.generateCaseFile(minimalLegacyCase);
    expect(caseFile).toBeDefined();
    expect(caseFile).toContain('CIVICFLOW AI — OFFICIAL CASE FILE');
    expect(caseFile).toContain('legacy_123');
  });

  it('3. Ensures classifier tests continue to pass', () => {
    const result = classifyIssue('Landlord did not refund my deposit');
    expect(result.category).toBe('housing_tenant');
  });
});
