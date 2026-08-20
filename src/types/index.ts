export * from './civicIntelligence';

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: 'en' | 'ta' | 'hi';
  isDemo?: boolean;
}

export interface RTIDraft {
  applicantName: string;
  applicantAddress: string;
  applicantPhone: string;
  publicAuthority: string;
  department: string;
  informationRequested: string;
  periodYears: string;
  isBPL: boolean;
  bplCardNumber?: string;
  preferredFormat: 'Inspection' | 'Hard Copies' | 'Digital / Email';
  createdDate: string;
}
