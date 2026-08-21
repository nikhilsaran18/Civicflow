import { CivicCase } from '../types/civicIntelligence';

const STORAGE_KEY = 'civicflow_cases_v3';

export class CaseStorageService {
  public static getCases(): CivicCase[] {
    try {
      // Clear legacy storage versions if present
      if (localStorage.getItem('civicflow_cases_v2')) {
        localStorage.removeItem('civicflow_cases_v2');
      }
      if (localStorage.getItem('civicflow_cases')) {
        localStorage.removeItem('civicflow_cases');
      }

      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as CivicCase[];
    } catch {
      return [];
    }
  }

  public static getCaseById(id: string): CivicCase | null {
    if (!id) return null;
    const cases = this.getCases();
    return cases.find(c => c.id === id) || null;
  }

  public static saveCase(c: CivicCase): void {
    if (!c || !c.id) return;
    const cases = this.getCases();
    const index = cases.findIndex(existing => existing.id === c.id);
    if (index >= 0) {
      cases[index] = { ...c, updatedAt: new Date().toISOString() };
    } else {
      cases.unshift({ ...c, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.warn('Failed to save case to localStorage', e);
    }
  }

  public static deleteCase(id: string): void {
    const cases = this.getCases().filter(c => c.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.warn('Failed to delete case', e);
    }
  }

  public static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('civicflow_cases_v2');
      localStorage.removeItem('civicflow_cases');
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  }
}
