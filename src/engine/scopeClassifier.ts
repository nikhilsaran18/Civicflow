import { ScopeResult } from '../types';

const MEDICAL_TREATMENT_TRIGGERS = [
  'want medicine', 'need medicine', 'give me medicine', 'prescribe', 'what medicine',
  'how to cure', 'treatment for fever', 'medicine for fever', 'headache medicine',
  'pills for', 'remedy for', 'cough syrup', 'tablet for', 'cure my', 'diagnose me'
];

const CRIMINAL_LITIGATION_TRIGGERS = [
  'how to hide', 'bypass law', 'evade tax', 'fake document', 'illegal weapon'
];

const CIVIC_RIGHTS_KEYWORDS = [
  'refuse', 'refused', 'denied', 'delay', 'pending', 'complaint', 'rights', 'grievance',
  'helpline', 'rti', 'information', 'deposit', 'refund', 'salary', 'bill', 'service',
  'doctor', 'hospital', 'landlord', 'tenant', 'employer', 'government', 'police', 'court',
  'municipality', 'corporation', 'pothole', 'garbage', 'certificate', 'school', 'college'
];

export function classifyScope(text: string): ScopeResult {
  const cleanText = text.toLowerCase().trim();

  if (cleanText.length < 5) {
    return {
      inCivicScope: false,
      confidence: 0.1,
      reason: 'Input text is too short to determine civic intent.'
    };
  }

  // Check explicit medical treatment/prescription requests (Out of Scope!)
  const isMedicalTreatment = MEDICAL_TREATMENT_TRIGGERS.some(trigger => cleanText.includes(trigger));
  if (isMedicalTreatment) {
    return {
      inCivicScope: false,
      confidence: 0.95,
      reason: 'Medical treatment or prescription request detected. CivicFlow provides civic & patient-rights navigation, not medical diagnosis or treatment advice.',
      isMedicalDiagnosisAttempt: true
    };
  }

  // Check criminal/illegal requests
  const isIllegal = CRIMINAL_LITIGATION_TRIGGERS.some(trigger => cleanText.includes(trigger));
  if (isIllegal) {
    return {
      inCivicScope: false,
      confidence: 0.9,
      reason: 'Request involves illegal activities or law evasion, which is outside CivicFlow scope.'
    };
  }

  // Check if text has civic or rights navigation signals
  const matchedCivicSignals = CIVIC_RIGHTS_KEYWORDS.filter(kw => cleanText.includes(kw));

  if (matchedCivicSignals.length > 0 || cleanText.length >= 15) {
    return {
      inCivicScope: true,
      confidence: Math.min(0.98, 0.6 + matchedCivicSignals.length * 0.1),
      reason: 'Civic or legal rights situation detected.'
    };
  }

  return {
    inCivicScope: false,
    confidence: 0.4,
    reason: 'The description does not appear to relate to a supported civic, consumer, or legal-rights issue.'
  };
}
