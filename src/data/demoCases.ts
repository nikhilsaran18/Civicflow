import { CivicCase } from '../types';
import { analysisService } from '../services/analysisService';

const demoAnswers1 = {
  cons_proof_purchase: 'yes',
  cons_seller_contacted: 'yes_verbal',
  cons_seller_response: 'refused',
  cons_financial_impact: '5k_50k',
  cons_defect_photos: 'yes'
};

const demoAnalysis1 = analysisService.analyseCase(
  'consumer',
  demoAnswers1,
  ['step_1'],
  {
    cons_invoice: true,
    cons_bank_record: true,
    cons_written_complaint: false,
    cons_seller_reply: false,
    cons_defect_photos: true
  }
);

const demoAnswers2 = {
  muni_issue_type: 'streetlight',
  muni_duration: '1w_1m',
  muni_photos_location: 'photo_only',
  muni_prior_complaint: 'no',
  muni_hazard_level: 'medium_hazard'
};

const demoAnalysis2 = analysisService.analyseCase(
  'municipal',
  demoAnswers2,
  [],
  {
    muni_photo_proof: true,
    muni_location_proof: false,
    muni_complaint_ref: false,
    muni_community_support: false
  }
);

export const DEMO_CASES: CivicCase[] = [
  {
    id: 'case_demo_101',
    title: 'Defective Smartphone Refund',
    category: 'consumer',
    createdAt: '2025-01-18T10:30:00Z',
    updatedAt: '2025-01-19T14:20:00Z',
    status: 'active',
    userDescription: 'Purchased a brand new smartphone online. The touch screen stopped working on day 2. Seller refuses to refund or replace.',
    answers: demoAnswers1,
    analysis: demoAnalysis1,
    completedSteps: ['step_1'],
    evidenceChecked: {
      cons_invoice: true,
      cons_bank_record: true,
      cons_written_complaint: false,
      cons_seller_reply: false,
      cons_defect_photos: true
    }
  },
  {
    id: 'case_demo_102',
    title: 'Streetlight Not Working in Ward 14',
    category: 'municipal',
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-15T11:10:00Z',
    status: 'active',
    userDescription: 'Main street light near the public park has been dark for 3 weeks, creating safety risks for evening commuters.',
    answers: demoAnswers2,
    analysis: demoAnalysis2,
    completedSteps: [],
    evidenceChecked: {
      muni_photo_proof: true,
      muni_location_proof: false,
      muni_complaint_ref: false,
      muni_community_support: false
    }
  }
];
