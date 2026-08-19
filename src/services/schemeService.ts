import { Scheme, SCHEMES_DATA } from '../data/schemes/schemesData';
import { storageService } from './storageService';

const PROFILE_KEY = 'civicflow_user_profile';
const SAVED_SCHEMES_KEY = 'civicflow_saved_schemes';

export interface UserCivicProfile {
  fullName: string;
  ageRange: string;
  state: string;
  areaType: 'rural' | 'urban';
  occupationCategory: string;
  incomeRange: string;
  studentStatus: boolean;
  preferredLanguage: 'en' | 'ta' | 'hi';
}

export interface SchemeMatchResult {
  scheme: Scheme;
  matchPercentage: number;
  eligibilityPassCount: number;
  totalRulesCount: number;
  documentReadinessScore: number;
  missingDocuments: string[];
  matchedRules: string[];
  unmatchedRules: string[];
}

export const schemeService = {
  getProfile(): UserCivicProfile {
    return storageService.getItem<UserCivicProfile>(PROFILE_KEY, {
      fullName: 'Arun Kumar',
      ageRange: '18_35',
      state: 'Tamil Nadu',
      areaType: 'urban',
      occupationCategory: 'self_employed',
      incomeRange: '1l_2.5l',
      studentStatus: true,
      preferredLanguage: 'en'
    });
  },

  saveProfile(profile: UserCivicProfile): void {
    storageService.setItem(PROFILE_KEY, profile);
  },

  getAllSchemes(): Scheme[] {
    return SCHEMES_DATA;
  },

  getSchemeById(id: string): Scheme | null {
    return SCHEMES_DATA.find(s => s.id === id) || null;
  },

  evaluateMatches(profile: UserCivicProfile): SchemeMatchResult[] {
    return SCHEMES_DATA.map(scheme => {
      const matchedRules: string[] = [];
      const unmatchedRules: string[] = [];

      scheme.eligibilityRules.forEach(rule => {
        if (rule.check(profile)) {
          matchedRules.push(rule.label);
        } else {
          unmatchedRules.push(rule.label);
        }
      });

      const totalRules = scheme.eligibilityRules.length;
      const passCount = matchedRules.length;
      const matchPercentage = totalRules > 0 ? Math.round((passCount / totalRules) * 100) : 50;

      // Default document readiness (70% base for prototype)
      const documentReadinessScore = matchPercentage >= 80 ? 75 : 50;
      const missingDocs = scheme.requiredDocuments.filter(d => d.isRequired).map(d => d.title);

      return {
        scheme,
        matchPercentage,
        eligibilityPassCount: passCount,
        totalRulesCount: totalRules,
        documentReadinessScore,
        missingDocuments: missingDocs,
        matchedRules,
        unmatchedRules
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  },

  getSavedSchemeIds(): string[] {
    return storageService.getItem<string[]>(SAVED_SCHEMES_KEY, ['scheme_pm_jay', 'scheme_post_matric']);
  },

  toggleSaveScheme(schemeId: string): string[] {
    const saved = new Set(this.getSavedSchemeIds());
    if (saved.has(schemeId)) {
      saved.delete(schemeId);
    } else {
      saved.add(schemeId);
    }
    const updated = Array.from(saved);
    storageService.setItem(SAVED_SCHEMES_KEY, updated);
    return updated;
  }
};
