import { CivicWorkflow } from '../../types';

export const healthcareWorkflow: CivicWorkflow = {
  id: 'wf_healthcare',
  category: 'healthcare_patient',
  title: 'Healthcare & Patient Rights Pathway',
  description: 'Navigating patient rights, medical service refusal grievances, and healthcare facility complaint mechanisms under the Clinical Establishments Act and Charter of Patients Rights.',
  sourceLabel: 'National Health Portal & Charter of Patients Rights (NHRC / Ministry of Health)',
  sourceUrl: 'https://main.mohfw.gov.in',
  questions: [
    {
      id: 'hc_facility_type',
      title: 'Is this issue related to a public (government) or private healthcare facility?',
      type: 'single',
      options: [
        { value: 'public', label: 'Public / Government Hospital or Health Centre' },
        { value: 'private', label: 'Private Hospital, Nursing Home, or Clinic' },
        { value: 'lab_diagnostic', label: 'Diagnostic Centre / Pharmacy / Lab' }
      ]
    },
    {
      id: 'hc_reason_given',
      title: 'Were you provided a written or verbal reason for treatment refusal / delay?',
      subtitle: 'e.g. Lack of bed, financial advance required, non-availability of doctor',
      type: 'single',
      options: [
        { value: 'advance_money', label: 'Demanded advance financial payment before emergency care' },
        { value: 'no_bed', label: 'Claimed non-availability of bed or specialist without referral' },
        { value: 'arbitrary', label: 'Arbitrary refusal without explaining any reason' }
      ]
    },
    {
      id: 'hc_referral_given',
      title: 'Were you officially referred to another medical facility with transfer notes?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, formal referral slip provided',
          evidenceProvided: ['hc_referral_slip']
        },
        {
          value: 'no',
          label: 'No referral or transfer documentation given'
        }
      ]
    },
    {
      id: 'hc_visit_record',
      title: 'Do you have an Outpatient (OPD) slip, hospital receipt, or prescription record?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, I have OPD slip / discharge summary / receipt',
          evidenceProvided: ['hc_visit_record']
        },
        {
          value: 'no',
          label: 'No written record given by facility',
          evidenceMissing: ['hc_visit_record']
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'hc_visit_record',
      title: 'OPD Slip / Registration Record / Medical Prescription',
      description: 'Proof of visiting the healthcare establishment on the stated date.',
      weight: 35,
      isRequired: true,
      category: 'healthcare_patient'
    },
    {
      id: 'hc_referral_slip',
      title: 'Referral Slip / Transfer Note',
      description: 'Official transfer memo if facility transferred care.',
      weight: 25,
      isRequired: false,
      category: 'healthcare_patient'
    },
    {
      id: 'hc_written_complaint',
      title: 'Written Complaint to Hospital Medical Superintendent (MS)',
      description: 'Formal complaint letter handed to hospital administration.',
      weight: 25,
      isRequired: true,
      category: 'healthcare_patient'
    },
    {
      id: 'hc_bills_receipts',
      title: 'Medical Bills & Test Receipts',
      description: 'Financial receipts for diagnostic tests, medicine, or advance deposit.',
      weight: 15,
      isRequired: false,
      category: 'healthcare_patient'
    }
  ],

  rules: [
    {
      id: 'rule_emergency_refusal',
      condition: (answers) => answers['hc_reason_given'] === 'advance_money',
      priorityAdjustment: 35,
      reasoningSignal: {
        type: 'warning',
        text: 'Under the Charter of Patient Rights and Supreme Court rulings, emergency medical stabilization cannot be denied due to financial advance demands.'
      },
      recommendedNextAction: 'Lodge an immediate complaint with the State Medical Council & District Health Officer.'
    }
  ],

  actionSteps: [
    {
      id: 'hcstep_1',
      stepNumber: 1,
      title: 'Preserve OPD Slip & Medical Records',
      description: 'Gather registration slips, diagnostic reports, and notes written by attending staff.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'hcstep_2',
      stepNumber: 2,
      title: 'Submit Grievance to Hospital Grievance Officer / MS',
      description: 'Hand in a written complaint to the Medical Superintendent or Hospital Patient Relations Officer.',
      status: 'not_started',
      estimatedDays: '3 Days'
    },
    {
      id: 'hcstep_3',
      stepNumber: 3,
      title: 'Escalate to State Clinical Establishment Authority / Medical Council',
      description: 'Lodge complaint with the District Registrar of Clinical Establishments or State Medical Council.',
      status: 'not_started',
      estimatedDays: '15 Days'
    },
    {
      id: 'hcstep_4',
      stepNumber: 4,
      title: 'File Consumer Forum Petition for Deficiency in Service',
      description: 'If financial damage or medical negligence occurred, file petition under Consumer Protection Act.',
      status: 'not_started',
      estimatedDays: '60+ Days'
    }
  ]
};
