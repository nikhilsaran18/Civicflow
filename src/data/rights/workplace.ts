import { CivicWorkflow } from '../../types';

export const workplaceWorkflow: CivicWorkflow = {
  id: 'wf_workplace',
  category: 'workplace_labour',
  title: 'Workplace & Labour Rights Pathway',
  description: 'Guidance for unpaid wages, salary delays, wrongful termination, PF non-deposit, and relieving letter disputes under the Payment of Wages Act and Industrial Disputes Act.',
  sourceLabel: 'Ministry of Labour and Employment & Shram Suvidha Portal',
  sourceUrl: 'https://labour.gov.in',
  questions: [
    {
      id: 'wp_issue_type',
      title: 'What primary workplace issue are you facing?',
      type: 'single',
      options: [
        { value: 'unpaid_salary', label: 'Unpaid salary or delayed wages for one or more months' },
        { value: 'wrongful_termination', label: 'Termination without notice, severance, or due process' },
        { value: 'relieving_withheld', label: 'Relieving / Experience letter or PF money withheld' },
        { value: 'pf_non_deposit', label: 'PF deducted from salary but not deposited in EPFO' }
      ]
    },
    {
      id: 'wp_appointment_letter',
      title: 'Do you have a written Appointment Letter or Employment Contract?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, formal appointment letter / contract',
          evidenceProvided: ['wp_offer_letter']
        },
        {
          value: 'no',
          label: 'No written offer, but have bank salary deposit statements',
          evidenceProvided: ['wp_bank_salary']
        }
      ]
    },
    {
      id: 'wp_resignation_notice',
      title: 'Did you serve notice according to employment terms?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, served notice period or accepted buyout',
          evidenceProvided: ['wp_resignation_ack']
        },
        {
          value: 'terminated_abruptly',
          label: 'I was terminated abruptly without notice'
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'wp_offer_letter',
      title: 'Appointment Letter / Employment Contract',
      description: 'Document stating designated salary, notice period, and terms.',
      weight: 35,
      isRequired: true,
      category: 'workplace_labour'
    },
    {
      id: 'wp_bank_salary',
      title: 'Bank Salary Credit Statements / Payslips',
      description: 'Proof of past monthly salary payments to establish employment relationship.',
      weight: 30,
      isRequired: true,
      category: 'workplace_labour'
    },
    {
      id: 'wp_resignation_ack',
      title: 'Resignation Email & HR Acknowledgement',
      description: 'Email thread confirming notice period completion and handover.',
      weight: 20,
      isRequired: false,
      category: 'workplace_labour'
    },
    {
      id: 'wp_legal_notice_hr',
      title: 'Written Legal Notice to Employer HR / Management',
      description: 'Formal letter demanding unpaid salary settlement within 15 days.',
      weight: 15,
      isRequired: false,
      category: 'workplace_labour'
    }
  ],

  rules: [
    {
      id: 'rule_salary_unpaid',
      condition: (answers) => answers['wp_issue_type'] === 'unpaid_salary',
      priorityAdjustment: 25,
      reasoningSignal: {
        type: 'warning',
        text: 'Unpaid wages violate the Payment of Wages Act. Issue a formal advocate demand notice to management.'
      },
      recommendedNextAction: 'Send a formal legal notice for salary recovery to HR and Company Directors.'
    }
  ],

  actionSteps: [
    {
      id: 'wstep_1',
      stepNumber: 1,
      title: 'Consolidate Payslips & Bank Transfer Records',
      description: 'Download 6 months of bank statements showing monthly salary credits and PF deductions.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'wstep_2',
      stepNumber: 2,
      title: 'Send Formal Demand Notice to HR & Directors',
      description: 'Email HR stating exact unpaid dues and requesting full & final settlement within 7 days.',
      status: 'not_started',
      estimatedDays: '7 Days'
    },
    {
      id: 'wstep_3',
      stepNumber: 3,
      title: 'Lodge Grievance with Labour Commissioner / Samadhan Portal',
      description: 'File petition under Payment of Wages Act with the District Labour Commissioner.',
      status: 'not_started',
      estimatedDays: '30 Days'
    },
    {
      id: 'wstep_4',
      stepNumber: 4,
      title: 'File EPFO Complaint for Undeposited Provident Fund',
      description: 'If PF was deducted but not remitted, lodge ticket on epfigms.gov.in for audit inspection.',
      status: 'not_started',
      estimatedDays: '45 Days'
    }
  ]
};
