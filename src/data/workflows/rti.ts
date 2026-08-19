import { CivicWorkflow } from '../../types';

export const rtiWorkflow: CivicWorkflow = {
  id: 'wf_rti',
  category: 'rti',
  title: 'Right to Information (RTI) Application Pathway',
  description: 'Structured methodology for preparing, filing, and tracking an RTI request under the Right to Information Act 2005.',
  sourceLabel: 'RTI Online Portal & Central Information Commission',
  sourceUrl: 'https://rtionline.gov.in',
  lastVerified: '2025-01-10',
  questions: [
    {
      id: 'rti_authority_identified',
      title: 'Have you identified the specific Public Authority / Department?',
      subtitle: 'e.g. Public Works Dept, Public Distribution System, Education Board',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, I know the exact ministry/department',
          evidenceProvided: ['rti_dept_details']
        },
        {
          value: 'partial',
          label: 'I know the topic but not the exact Public Information Officer (PIO)',
          evidenceMissing: ['rti_dept_details']
        },
        {
          value: 'no',
          label: 'Not sure which department holds the information',
          evidenceMissing: ['rti_dept_details']
        }
      ]
    },
    {
      id: 'rti_info_clarity',
      title: 'Is your requested information clear, specific, and bounded by time?',
      subtitle: 'RTI questions must seek records/certified copies, not opinions or advice',
      type: 'single',
      options: [
        {
          value: 'clear',
          label: 'Yes, seeking specific certified documents/records with date range',
          evidenceProvided: ['rti_draft_text']
        },
        {
          value: 'vague',
          label: 'Need help sharpening the specific questions',
          evidenceMissing: ['rti_draft_text']
        }
      ]
    },
    {
      id: 'rti_fee_exemption',
      title: 'Do you qualify for Below Poverty Line (BPL) fee exemption?',
      type: 'single',
      options: [
        {
          value: 'yes_bpl',
          label: 'Yes, I have a valid BPL card',
          evidenceProvided: ['rti_bpl_card']
        },
        {
          value: 'no',
          label: 'No, I will pay standard RTI application fee (₹10)',
          evidenceProvided: ['rti_fee_receipt']
        }
      ]
    },
    {
      id: 'rti_prior_appeal',
      title: 'Is this an original application or a First Appeal for non-response?',
      type: 'single',
      options: [
        {
          value: 'fresh',
          label: 'Fresh original RTI application'
        },
        {
          value: 'appeal',
          label: 'First Appeal (30 days passed without response or unsatisfactory reply)',
          evidenceProvided: ['rti_ack_receipt']
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'rti_dept_details',
      title: 'Public Authority & CPIO Office Address',
      description: 'Name and official address of Central/State Public Information Officer.',
      weight: 30,
      isRequired: true,
      category: 'rti'
    },
    {
      id: 'rti_draft_text',
      title: 'Clear & Specific Query Draft',
      description: 'Structured query list referencing specific files, tenders, or audit reports.',
      weight: 35,
      isRequired: true,
      category: 'rti'
    },
    {
      id: 'rti_fee_receipt',
      title: 'RTI Application Fee Proof (IPO / Court Fee Stamp / Online Ack)',
      description: 'Payment of ₹10 application fee or BPL exemption certificate.',
      weight: 20,
      isRequired: true,
      category: 'rti'
    },
    {
      id: 'rti_bpl_card',
      title: 'BPL Ration Card (If claiming fee waiver)',
      description: 'Proof of BPL status if application fee waiver requested.',
      weight: 15,
      isRequired: false,
      category: 'rti'
    },
    {
      id: 'rti_ack_receipt',
      title: 'Postal Ack / Online Registration Number',
      description: 'Proof of submission for tracking 30-day statutory response window.',
      weight: 15,
      isRequired: false,
      category: 'rti'
    }
  ],

  rules: [
    {
      id: 'rule_first_appeal',
      condition: (answers) => answers['rti_prior_appeal'] === 'appeal',
      priorityAdjustment: 25,
      reasoningSignal: {
        type: 'warning',
        text: 'First Appeal stage active. 30-day statutory response limit exceeded.'
      },
      recommendedNextAction: 'File First Appeal to First Appellate Authority (FAA) citing Section 19(1) of RTI Act.'
    }
  ],

  actionSteps: [
    {
      id: 'rtistep_1',
      stepNumber: 1,
      title: 'Draft Structured RTI Questions',
      description: 'Use CivicFlow RTI Builder to generate a concise, unambiguous application draft.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'rtistep_2',
      stepNumber: 2,
      title: 'Identify Concerned CPIO & Attach Fee',
      description: 'Locate PIO address and obtain ₹10 Postal Order or use online portal rtionline.gov.in.',
      status: 'not_started',
      estimatedDays: '2 Days'
    },
    {
      id: 'rtistep_3',
      stepNumber: 3,
      title: 'Submit Application & Save Acknowledgement',
      description: 'Send via Registered AD post or submit online. Save tracking receipt date for 30-day clock.',
      status: 'not_started',
      estimatedDays: '30 Days'
    },
    {
      id: 'rtistep_4',
      stepNumber: 4,
      title: 'Review Reply or Prepare First Appeal',
      description: 'If no reply within 30 days, file First Appeal with Appellate Authority.',
      status: 'not_started',
      estimatedDays: '45 Days'
    }
  ]
};
