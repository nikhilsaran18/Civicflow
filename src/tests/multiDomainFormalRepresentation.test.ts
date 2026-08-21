import { describe, it, expect } from 'vitest';
import { defaultCivicIntelligenceEngine } from '../services/ai/civicIntelligenceEngine';

describe('MULTI-DOMAIN AI CLASSIFICATION & FORMAL REPRESENTATION TESTS', () => {
  it('1. Healthcare Domain: Generates Medical Grievance & Patient Rights Representation (no UGC/consumer text)', async () => {
    const input = 'The private hospital refused emergency treatment to my mother and demanded an exorbitant upfront deposit.';
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.domain).toBe('healthcare_patient');
    expect(result.understanding.domainName).toContain('Healthcare');

    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'Apollo Hospital, Chennai' });
    expect(solution.suggestedDocuments.length).toBeGreaterThan(0);

    const docType = solution.suggestedDocuments[0].type;
    const doc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      docType,
      'Emergency Treatment Denial',
      input,
      { applicant_name: 'Anand Kumar', location: 'Apollo Hospital, Chennai' },
      solution
    );

    // Verify document contains healthcare statutory citations and NO certificate/university/pothole text
    expect(doc.previewMarkdown).toContain('Charter of Patients\' Rights');
    expect(doc.previewMarkdown).toContain('Clinical Establishments');
    expect(doc.previewMarkdown).not.toContain('University Grants Commission');
    expect(doc.previewMarkdown).not.toContain('road repair');
  });

  it('2. Housing & Tenant Domain: Generates Tenancy Deposit Legal Notice (no certificate/road text)', async () => {
    const input = 'My landlord is refusing to return my security deposit of Rs 60,000 even after I vacated the flat.';
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.domain).toBe('housing_tenant');
    expect(result.understanding.domainName).toContain('Housing');

    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'Indiranagar, Bangalore' });
    expect(solution.suggestedDocuments.length).toBeGreaterThan(0);

    const repDoc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      'representation',
      'Security Deposit Refund',
      input,
      { applicant_name: 'Priya Sharma', location: 'Indiranagar, Bangalore' },
      solution
    );

    expect(repDoc.title).toContain('Security Deposit');
    expect(repDoc.previewMarkdown).toContain('Model Tenancy Act');
    expect(repDoc.previewMarkdown).not.toContain('University Grants Commission');
    expect(repDoc.previewMarkdown).not.toContain('hospital bill');
  });

  it('3. Consumer Domain: Generates Consumer Protection Act 2019 Legal Notice (no streetlight text)', async () => {
    const input = 'I bought a laptop online that broke on day 3, and the seller refused to replace or refund it.';
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.domain).toBe('consumer');
    expect(result.understanding.domainName).toContain('Consumer');

    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'Delhi' });
    const complaintDoc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      'complaint',
      'Defective Laptop Refund Dispute',
      input,
      { applicant_name: 'Rahul Verma', location: 'Delhi' },
      solution
    );

    expect(complaintDoc.previewMarkdown).toContain('Consumer Protection Act, 2019');
    expect(complaintDoc.previewMarkdown).toContain('Section 35');
    expect(complaintDoc.previewMarkdown).not.toContain('street light');
    expect(complaintDoc.previewMarkdown).not.toContain('UGC');
  });

  it('4. Workplace & Labour Domain: Generates Payment of Wages Act Demand Notice', async () => {
    const input = 'My employer has not paid my salary for the last two months and is withholding my relieving letter.';
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.domain).toBe('workplace_labour');
    expect(result.understanding.domainName).toContain('Workplace');

    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'Hyderabad' });
    const doc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      'representation',
      'Unpaid Wages & Relieving Letter Dispute',
      input,
      { applicant_name: 'Karthik Rao', location: 'Hyderabad' },
      solution
    );

    expect(doc.previewMarkdown).toContain('Payment of Wages Act');
    expect(doc.previewMarkdown).toContain('District Labour Commissioner');
    expect(doc.previewMarkdown).not.toContain('UGC');
  });

  it('5. Police / FIR Domain: Generates Section 154(3) CrPC Written Representation to SP', async () => {
    const input = 'The local police station refused to register an FIR for my stolen two-wheeler.';
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.domain).toBe('police_legal_grievance');
    expect(result.understanding.domainName).toContain('Police');

    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'Pune' });
    const doc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      'representation',
      'Refusal to Register FIR for Stolen Vehicle',
      input,
      { applicant_name: 'Suresh Patil', location: 'Pune' },
      solution
    );

    expect(doc.previewMarkdown).toContain('Section 154(3) Cr.P.C.');
    expect(doc.previewMarkdown).toContain('Lalita Kumari');
    expect(doc.previewMarkdown).not.toContain('University Grants Commission');
  });

  it('6. Electricity & Utility Domain: Generates Electricity Billing Dispute Complaint to CGRF', async () => {
    const input = 'The electricity department sent an inflated power bill of Rs 45,000 for a residential house with a faulty meter.';
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.domain).toBe('power_electricity_utility');
    expect(result.understanding.domainName).toContain('Electricity');

    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'Jaipur' });
    const doc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      'complaint',
      'Inflated Electricity Bill Dispute',
      input,
      { applicant_name: 'Meena Sharma', location: 'Jaipur' },
      solution
    );

    expect(doc.previewMarkdown).toContain('Electricity Act, 2003');
    expect(doc.previewMarkdown).toContain('Consumer Grievance Redressal Forum');
  });

  it('7. Education Domain: Generates UGC 2023 Student Representation for Release of Original Certificates', async () => {
    const input = "My university won't return my original certificates.";
    const result = await defaultCivicIntelligenceEngine.analyzeCase(input, {});

    expect(result.understanding.domain).toBe('education');

    const solution = await defaultCivicIntelligenceEngine.generateSolution(input, result.understanding, { location: 'State University' });
    const doc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      'representation',
      'Withheld Certificates',
      input,
      { applicant_name: 'Deepak Raj', location: 'State University' },
      solution
    );

    expect(doc.previewMarkdown).toContain('University Grants Commission (Redressal of Grievances of Students) Regulations 2023');
    expect(doc.previewMarkdown).toContain('original certificates');
  });
});
