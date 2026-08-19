import { describe, it, expect } from 'vitest';
import { classifyCivicCase } from '../engine/hierarchicalClassifier';

describe('Hierarchical Case Understanding Pipeline', () => {
  it('Test Case 1: Consumer refund complaint', () => {
    const text = 'I bought a phone and the seller refuses to refund me.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('consumer');
    expect(result.pattern).toBe('financial_dispute');
  });

  it('Test Case 2: Tenant deposit dispute', () => {
    const text = 'My landlord has not returned my deposit.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('housing_tenant');
    expect(result.pattern).toBe('financial_dispute');
  });

  it('Test Case 3: Healthcare doctor refusal', () => {
    const text = 'I have fever and the doctor is refusing to treat me.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('healthcare_patient');
    expect(result.pattern).toBe('service_denied');
  });

  it('Test Case 4: Workplace unpaid salary', () => {
    const text = 'My salary has not been paid for two months.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('workplace_labour');
    expect(result.pattern).toBe('financial_dispute');
  });

  it('Test Case 5: Pending government certificate', () => {
    const text = 'My government certificate application has been pending.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('public_government_service');
    expect(result.pattern).toBe('delay_no_response');
  });

  it('Test Case 6: RTI road expenditure request', () => {
    const text = 'I want information about road repair expenditure.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('rti_information');
    expect(result.pattern).toBe('information_request');
  });

  it('Test Case 7: Municipal uncollected garbage', () => {
    const text = 'The municipality isn’t collecting garbage.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('municipal_utility');
    expect(result.pattern).toBe('service_not_provided');
  });

  it('Test Case 8: Education certificate withholding', () => {
    const text = 'My college refuses to issue my certificate.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('education');
  });

  it('Test Case 9: Medical prescription request OUT OF SCOPE', () => {
    const text = 'What medicine should I take for fever?';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(false);
    expect(result.scopeResult.isMedicalDiagnosisAttempt).toBe(true);
  });

  it('Paraphrase Test: Physician refusal maps to Healthcare', () => {
    const text = 'The physician wouldn’t see me at the clinic.';
    const result = classifyCivicCase(text);
    expect(result.inScope).toBe(true);
    expect(result.domain).toBe('healthcare_patient');
    expect(result.pattern).toBe('service_denied');
  });
});
