import { CivicWorkflow } from '../../types';

export const publicServiceWorkflow: CivicWorkflow = {
  id: 'wf_public_service',
  category: 'public_government_service',
  title: 'Public & Government Services Grievance Pathway',
  description: 'Navigating delayed passport processing, certificate issuance delays, driving license corrections, and public office grievances under the Right to Service Act.',
  sourceLabel: 'Centralized Public Grievance Redress and Monitoring System (CPGRAMS)',
  sourceUrl: 'https://pgportal.gov.in',
  questions: [
    {
      id: 'ps_issue_type',
      title: 'What specific public service is delayed or malfunctioning?',
      type: 'single',
      options: [
        { value: 'cert_delay', label: 'Government Certificate (Birth, Income, Caste, Community) delayed' },
        { value: 'passport_delay', label: 'Passport application stuck or police verification pending' },
        { value: 'license_delay', label: 'Driving License / Vehicle Registration issue' },
        { value: 'ration_card', label: 'Ration card application / name addition pending' }
      ]
    },
    {
      id: 'ps_has_ack',
      title: 'Do you have an Application Reference Number / Acknowledgement Receipt?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, official acknowledgement receipt with date stamp',
          evidenceProvided: ['ps_ack_receipt']
        },
        {
          value: 'no',
          label: 'No reference number provided',
          evidenceMissing: ['ps_ack_receipt']
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'ps_ack_receipt',
      title: 'Application Reference Number / Acknowledgement Receipt',
      description: 'Official ticket showing submission date.',
      weight: 45,
      isRequired: true,
      category: 'public_government_service'
    },
    {
      id: 'ps_id_proof',
      title: 'Government Identity Proof (Aadhaar / Voter ID)',
      description: 'Standard applicant identity proof.',
      weight: 30,
      isRequired: true,
      category: 'public_government_service'
    },
    {
      id: 'ps_previous_status',
      title: 'Online Application Status Screenshot',
      description: 'Proof showing application stuck beyond prescribed statutory period.',
      weight: 25,
      isRequired: false,
      category: 'public_government_service'
    }
  ],

  rules: [
    {
      id: 'rule_ps_delay',
      condition: (answers) => answers['ps_has_ack'] === 'yes',
      priorityAdjustment: 20,
      reasoningSignal: {
        type: 'info',
        text: 'Application reference number available. Under the Right to Public Services Act, designated officers are bound by statutory timelines.'
      },
      recommendedNextAction: 'File first appeal with the Designated Appeal Officer under Right to Service Act.'
    }
  ],

  actionSteps: [
    {
      id: 'psstep_1',
      stepNumber: 1,
      title: 'Check Status & Prescribed Service Timeline',
      description: 'Verify if statutory deadline (e.g. 15-30 days) under Right to Service Act has expired.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'psstep_2',
      stepNumber: 2,
      title: 'Submit Grievance on State / Central PG Portal (CPGRAMS)',
      description: 'Lodge complaint on pgportal.gov.in quoting your initial application reference number.',
      status: 'not_started',
      estimatedDays: '7 Days'
    },
    {
      id: 'psstep_3',
      stepNumber: 3,
      title: 'Escalate to District Collectorate / Public Grievance Officer',
      description: 'Attend weekly District Collectorate Public Grievance Day to present your case directly.',
      status: 'not_started',
      estimatedDays: '15 Days'
    }
  ]
};
