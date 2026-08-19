import { CivicWorkflow } from '../../types';

export const educationWorkflow: CivicWorkflow = {
  id: 'wf_education',
  category: 'education',
  title: 'Education & Institutional Rights Pathway',
  description: 'Navigating student rights, certificate withholding, capitation fee demands, and academic grievance resolution under UGC and Board guidelines.',
  sourceLabel: 'University Grants Commission (UGC) Student Grievance Redressal Regulations',
  sourceUrl: 'https://www.ugc.gov.in',
  questions: [
    {
      id: 'edu_issue_type',
      title: 'What specific institutional issue are you experiencing?',
      type: 'single',
      options: [
        { value: 'cert_withheld', label: 'School/College refusing to issue Degree, Mark Sheet, or Transfer Certificate' },
        { value: 'illegal_fee', label: 'Demand for extra capitation fee or unapproved charges' },
        { value: 'unlawful_expulsion', label: 'Arbitrary expulsion or suspension without fair hearing' },
        { value: 'admission_denied', label: 'Admission quota denial despite meeting criteria' }
      ]
    },
    {
      id: 'edu_has_receipts',
      title: 'Do you have fee payment receipts and your student Roll / Registration Number?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, I have complete fee receipts and ID card copy',
          evidenceProvided: ['edu_fee_receipts']
        },
        {
          value: 'no',
          label: 'I am missing some fee payment receipts',
          evidenceMissing: ['edu_fee_receipts']
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'edu_fee_receipts',
      title: 'Official Fee Payment Receipts & ID Card Copy',
      description: 'Proof of clearing all tuition dues.',
      weight: 40,
      isRequired: true,
      category: 'education'
    },
    {
      id: 'edu_written_request',
      title: 'Written Application to Principal / Vice Chancellor',
      description: 'Copy of letter requesting release of certificate.',
      weight: 35,
      isRequired: true,
      category: 'education'
    },
    {
      id: 'edu_refusal_letter',
      title: 'Written Refusal / Notice from Institution',
      description: 'Email or letter stating reason for delay/refusal.',
      weight: 25,
      isRequired: false,
      category: 'education'
    }
  ],

  rules: [
    {
      id: 'rule_cert_withheld',
      condition: (answers) => answers['edu_issue_type'] === 'cert_withheld',
      priorityAdjustment: 25,
      reasoningSignal: {
        type: 'warning',
        text: 'Under UGC directives, institutions cannot withhold original certificates or degrees over fee disputes.'
      },
      recommendedNextAction: 'File formal complaint on UGC e-Samadhan Grievance Portal.'
    }
  ],

  actionSteps: [
    {
      id: 'edstep_1',
      stepNumber: 1,
      title: 'Gather All Clearance & Fee Receipts',
      description: 'Organize no-dues receipts and library clearance slips.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'edstep_2',
      stepNumber: 2,
      title: 'Send Formal Representation to Principal / Registrar',
      description: 'Submit written letter citing UGC guidelines regarding certificate issuance.',
      status: 'not_started',
      estimatedDays: '7 Days'
    },
    {
      id: 'edstep_3',
      stepNumber: 3,
      title: 'Lodge Complaint on UGC e-Samadhan Portal',
      description: 'Register online grievance on samadhan.ugc.ac.in citing college registration number.',
      status: 'not_started',
      estimatedDays: '15 Days'
    },
    {
      id: 'edstep_4',
      stepNumber: 4,
      title: 'Escalate to State Education Ombudsman / University Vice Chancellor',
      description: 'File petition with the University Ombudsman for formal hearing.',
      status: 'not_started',
      estimatedDays: '30 Days'
    }
  ]
};
