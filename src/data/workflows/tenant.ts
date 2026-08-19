import { CivicWorkflow } from '../../types';

export const tenantWorkflow: CivicWorkflow = {
  id: 'wf_tenant',
  category: 'tenant',
  title: 'Tenant Security Deposit & Rental Dispute Pathway',
  description: 'Informational guidance for security deposit withholding, maintenance disputes, and rental agreement issues.',
  sourceLabel: 'Model Tenancy Act & Rent Control Guidelines',
  sourceUrl: 'https://mohua.gov.in',
  lastVerified: '2025-01-05',
  questions: [
    {
      id: 'tenant_issue_type',
      title: 'What primary rental issue are you experiencing?',
      type: 'single',
      options: [
        { value: 'deposit_withheld', label: 'Landlord refusing/delaying security deposit refund' },
        { value: 'repair_dispute', label: 'Urgent structural/plumbing repairs ignored by owner' },
        { value: 'unlawful_eviction', label: 'Improper vacate notice or verbal eviction threat' },
        { value: 'rent_hike', label: 'Sudden arbitrary rent increase during lease term' }
      ]
    },
    {
      id: 'tenant_has_agreement',
      title: 'Do you have a written, signed Rental Agreement?',
      type: 'single',
      options: [
        {
          value: 'registered',
          label: 'Yes, registered written lease agreement',
          evidenceProvided: ['tenant_lease_doc']
        },
        {
          value: 'notarized',
          label: 'Yes, notarized/stamp paper agreement',
          evidenceProvided: ['tenant_lease_doc']
        },
        {
          value: 'verbal',
          label: 'No, only verbal agreement or WhatsApp chats',
          evidenceMissing: ['tenant_lease_doc']
        }
      ]
    },
    {
      id: 'tenant_rent_receipts',
      title: 'Do you have bank transfer records / receipts for rent and deposit payments?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, complete bank statements and UPI payment records',
          evidenceProvided: ['tenant_payment_proof']
        },
        {
          value: 'partial',
          label: 'Some payments were cash without receipt',
          evidenceMissing: ['tenant_payment_proof']
        }
      ]
    },
    {
      id: 'tenant_vacate_notice',
      title: 'Was a formal written notice given by either party?',
      type: 'single',
      options: [
        {
          value: 'yes_written',
          label: 'Yes, formal notice given according to agreement terms',
          evidenceProvided: ['tenant_notice_doc']
        },
        {
          value: 'verbal_only',
          label: 'Only verbal requests or informal phone calls',
          evidenceMissing: ['tenant_notice_doc']
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'tenant_lease_doc',
      title: 'Signed Rental / Lease Agreement',
      description: 'Document specifying security deposit amount, notice period, and repair terms.',
      weight: 35,
      isRequired: true,
      category: 'tenant'
    },
    {
      id: 'tenant_payment_proof',
      title: 'Security Deposit & Rent Payment Bank Statements',
      description: 'Bank statements or UPI receipts showing initial deposit payment.',
      weight: 30,
      isRequired: true,
      category: 'tenant'
    },
    {
      id: 'tenant_notice_doc',
      title: 'Written Vacate / Move-out Notice Record',
      description: 'Email, WhatsApp message, or notice letter adhering to notice period.',
      weight: 20,
      isRequired: true,
      category: 'tenant'
    },
    {
      id: 'tenant_condition_photos',
      title: 'Property Condition Photos on Handover',
      description: 'Photos taken on move-out to counter false damage claims by landlord.',
      weight: 15,
      isRequired: false,
      category: 'tenant'
    }
  ],

  rules: [
    {
      id: 'rule_no_lease',
      condition: (answers) => answers['tenant_has_agreement'] === 'verbal',
      priorityAdjustment: 15,
      reasoningSignal: {
        type: 'warning',
        text: 'No formal written rental agreement. Bank payment logs are critical to prove tenancy.'
      },
      recommendedNextAction: 'Compile all bank transaction statements showing regular rent transfers to the landlord.'
    },
    {
      id: 'rule_deposit_withheld',
      condition: (answers) => answers['tenant_issue_type'] === 'deposit_withheld',
      priorityAdjustment: 20,
      reasoningSignal: {
        type: 'info',
        text: 'Unlawful security deposit retention. Send a formal legal notice for refund before filing court claim.'
      }
    }
  ],

  actionSteps: [
    {
      id: 'tstep_1',
      stepNumber: 1,
      title: 'Gather Rental Agreement & Payment Proof',
      description: 'Organize your signed lease agreement, deposit transaction receipt, and move-out photos.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'tstep_2',
      stepNumber: 2,
      title: 'Issue Formal Deposit Settlement Letter',
      description: 'Send a detailed email or registered letter outlining agreed move-out terms, bank account for refund, and 14-day deadline.',
      status: 'not_started',
      estimatedDays: '14 Days'
    },
    {
      id: 'tstep_3',
      stepNumber: 3,
      title: 'Advise Advocate Notice / Mediation',
      description: 'If landlord refuses, engage legal counsel to send a formal legal demand notice under contract law.',
      status: 'not_started',
      estimatedDays: '30 Days'
    },
    {
      id: 'tstep_4',
      stepNumber: 4,
      title: 'File Petition in Rent Authority / Small Causes Court',
      description: 'File petition with your local Rent Authority under the Rent Control Act or summary suit for money recovery.',
      status: 'not_started',
      estimatedDays: '60+ Days'
    }
  ]
};
