import { CivicCase, CivicCategory } from '../types';
import { storageService } from './storageService';
import { DEMO_CASES } from '../data/demoCases';
import { analysisService } from './analysisService';

const CASES_KEY = 'civicflow_cases';

export const caseService = {
  getCases(): CivicCase[] {
    return storageService.getItem<CivicCase[]>(CASES_KEY, DEMO_CASES);
  },

  getCaseById(id: string): CivicCase | null {
    const cases = this.getCases();
    return cases.find(c => c.id === id) || null;
  },

  createCase(
    title: string,
    category: CivicCategory,
    answers: Record<string, any>,
    userDescription?: string
  ): CivicCase {
    const cases = this.getCases();
    const newId = `case_${Date.now()}`;
    const analysis = analysisService.analyseCase(category, answers, []);

    const newCase: CivicCase = {
      id: newId,
      title: title || `${category.toUpperCase()} Case #${cases.length + 1}`,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      userDescription,
      answers,
      analysis,
      completedSteps: [],
      evidenceChecked: {}
    };

    cases.unshift(newCase);
    storageService.setItem(CASES_KEY, cases);
    return newCase;
  },

  updateCase(updated: CivicCase): CivicCase {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === updated.id);

    // Re-run analysis engine to recalculate priority, readiness, and action plan
    const refreshedAnalysis = analysisService.analyseCase(
      updated.category,
      updated.answers,
      updated.completedSteps,
      updated.evidenceChecked
    );

    const refreshedCase: CivicCase = {
      ...updated,
      updatedAt: new Date().toISOString(),
      analysis: refreshedAnalysis
    };

    if (index !== -1) {
      cases[index] = refreshedCase;
    } else {
      cases.unshift(refreshedCase);
    }

    storageService.setItem(CASES_KEY, cases);
    return refreshedCase;
  },

  toggleStepCompleted(caseId: string, stepId: string): CivicCase {
    const existing = this.getCaseById(caseId);
    if (!existing) throw new Error('Case not found');

    const completed = new Set(existing.completedSteps || []);
    if (completed.has(stepId)) {
      completed.delete(stepId);
    } else {
      completed.add(stepId);
    }

    const updated: CivicCase = {
      ...existing,
      completedSteps: Array.from(completed)
    };

    return this.updateCase(updated);
  },

  toggleEvidenceChecked(caseId: string, evidenceId: string): CivicCase {
    const existing = this.getCaseById(caseId);
    if (!existing) throw new Error('Case not found');

    const evidenceChecked = { ...(existing.evidenceChecked || {}) };
    evidenceChecked[evidenceId] = !evidenceChecked[evidenceId];

    const updated: CivicCase = {
      ...existing,
      evidenceChecked
    };

    return this.updateCase(updated);
  },

  deleteCase(id: string): void {
    const cases = this.getCases().filter(c => c.id !== id);
    storageService.setItem(CASES_KEY, cases);
  },

  resetDemoData(): void {
    storageService.setItem(CASES_KEY, DEMO_CASES);
  }
};
