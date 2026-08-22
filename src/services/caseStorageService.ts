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
      const parsed = JSON.parse(data) as CivicCase[];

      // Normalize cases safely
      return parsed.map(c => this.normalizeCase(c));
    } catch {
      return [];
    }
  }

  public static normalizeCase(c: CivicCase): CivicCase {
    if (!c) return c;
    const text = (c.originalProblem || c.title || '').toLowerCase();
    
    let derivedBadge = c.categoryBadge || c.solution?.categoryBadge || c.understanding?.categoryBadge;
    if (!derivedBadge) {
      if (text.includes('pension')) derivedBadge = 'PENSION / ADMINISTRATIVE';
      else if (text.includes('rent') || text.includes('deposit') || text.includes('landlord') || text.includes('tenant')) derivedBadge = 'TENANCY';
      else if (text.includes('light') || text.includes('lamp') || text.includes('road') || text.includes('water') || text.includes('garbage')) derivedBadge = 'MUNICIPAL SERVICE';
      else if (text.includes('university') || text.includes('college') || text.includes('marksheet') || text.includes('tuition') || text.includes('fee')) derivedBadge = 'EDUCATION';
      else if (text.includes('caste') || text.includes('certificate') || text.includes('aadhaar') || text.includes('passport')) derivedBadge = 'DOCUMENTATION';
      else if (text.includes('product') || text.includes('seller') || text.includes('phone') || text.includes('refund')) derivedBadge = 'CONSUMER DISPUTE';
      else derivedBadge = 'CIVIC MATTER';
    }

    // Clean up confirmed facts if questions were stored as facts
    const cleanedFacts = (c.understanding?.confirmedFacts || []).map(f => {
      let factStr = f.fact;
      if (factStr.includes('?: ') || factStr.includes('?:')) {
        const parts = factStr.split('?:');
        const ansPart = parts[parts.length - 1].trim();
        factStr = `The citizen stated: ${ansPart}`;
      }
      return { ...f, fact: factStr };
    });

    return {
      ...c,
      categoryBadge: derivedBadge,
      analysisVersion: c.analysisVersion || 3,
      understanding: {
        ...c.understanding,
        categoryBadge: derivedBadge,
        confirmedFacts: cleanedFacts,
      },
    };
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
