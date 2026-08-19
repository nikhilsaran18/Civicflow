import { CivicWorkflow } from '../../types';

export const consumerWorkflow: CivicWorkflow = {
  id: 'wf_consumer',
  category: 'consumer',
  title: 'Consumer Dispute & Refund Pathway',
  description: 'Guided escalation pathway for defective goods, refused refunds, or non-delivered services.',
  sourceLabel: 'National Consumer Helpline & Consumer Protection Act 2019',
  sourceUrl: 'https://consumerhelpline.gov.in',
  lastVerified: '2025-01-15',
  questions: [
    {
      id: 'cons_proof_purchase',
      title: 'Do you have proof of purchase for the product or service?',
      subtitle: 'e.g. Tax Invoice, Bill, Payment Screenshot, Order Receipt',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, I have an invoice or receipt',
          evidenceProvided: ['cons_invoice']
        },
        {
          value: 'partial',
          label: 'I only have a bank/UPI payment record',
          evidenceProvided: ['cons_bank_record'],
          evidenceMissing: ['cons_invoice']
        },
        {
          value: 'no',
          label: 'No purchase proof available',
          evidenceMissing: ['cons_invoice', 'cons_bank_record']
        }
      ]
    },
    {
      id: 'cons_seller_contacted',
      title: 'Have you already contacted the seller or service provider?',
      subtitle: 'Direct communication is the necessary first step in consumer grievances',
      type: 'single',
      options: [
        {
          value: 'yes_written',
          label: 'Yes, I sent an email or written complaint',
          evidenceProvided: ['cons_written_complaint']
        },
        {
          value: 'yes_verbal',
          label: 'Yes, I spoke to them in person or by phone',
          evidenceMissing: ['cons_written_complaint']
        },
        {
          value: 'no',
          label: 'No, I have not contacted them yet',
          evidenceMissing: ['cons_written_complaint']
        }
      ]
    },
    {
      id: 'cons_seller_response',
      title: 'Did the seller respond to your complaint?',
      subtitle: 'Recorded seller responses help establish refusal or negligence',
      type: 'single',
      dependsOn: {
        questionId: 'cons_seller_contacted',
        value: ['yes_written', 'yes_verbal']
      },
      options: [
        {
          value: 'refused',
          label: 'They explicitly refused to refund or replace',
          evidenceProvided: ['cons_seller_reply']
        },
        {
          value: 'ignored',
          label: 'They ignored my messages or promised and delayed',
          evidenceMissing: ['cons_seller_reply']
        },
        {
          value: 'partial_offer',
          label: 'They offered partial resolution that I rejected'
        }
      ]
    },
    {
      id: 'cons_financial_impact',
      title: 'What is the approximate financial amount involved?',
      subtitle: 'Helps determine priority and the appropriate dispute forum level',
      type: 'single',
      options: [
        { value: 'under_5k', label: 'Under ₹5,000' },
        { value: '5k_50k', label: '₹5,000 - ₹50,000' },
        { value: '50k_5l', label: '₹50,000 - ₹5,000,000' },
        { value: 'above_5l', label: 'Above ₹5,000,000' }
      ]
    },
    {
      id: 'cons_defect_photos',
      title: 'Do you have physical photos or videos of the defect/issue?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, I have photos or video evidence',
          evidenceProvided: ['cons_defect_photos']
        },
        {
          value: 'no',
          label: 'No, not applicable or unavailable'
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'cons_invoice',
      title: 'Tax Invoice or Purchase Receipt',
      description: 'Official bill showing transaction date, seller details, amount paid, and serial/item details.',
      weight: 30,
      isRequired: true,
      category: 'consumer'
    },
    {
      id: 'cons_bank_record',
      title: 'Bank Statement / UPI Transaction Proof',
      description: 'Proof of money debited for the purchase.',
      weight: 20,
      isRequired: true,
      category: 'consumer'
    },
    {
      id: 'cons_written_complaint',
      title: 'Written Complaint Record to Seller',
      description: 'Email, registered post, or formal helpdesk ticket showing you notified the seller.',
      weight: 25,
      isRequired: true,
      category: 'consumer'
    },
    {
      id: 'cons_seller_reply',
      title: 'Seller Response / Refusal Notice',
      description: 'Email or message where seller rejected your claim or acknowledged failure.',
      weight: 15,
      isRequired: false,
      category: 'consumer'
    },
    {
      id: 'cons_defect_photos',
      title: 'Defect / Damage Photographs',
      description: 'Clear photos/videos demonstrating the flaw or non-delivery.',
      weight: 10,
      isRequired: false,
      category: 'consumer'
    }
  ],

  rules: [
    {
      id: 'rule_no_written_notice',
      condition: (answers) => answers['cons_seller_contacted'] !== 'yes_written',
      priorityAdjustment: 10,
      reasoningSignal: {
        type: 'warning',
        text: 'No formal written complaint record exists. Creating a written record is required before legal escalation.'
      },
      recommendedNextAction: 'Send a formal written complaint (via Email or Registered Post) to the seller.'
    },
    {
      id: 'rule_seller_refused',
      condition: (answers) => answers['cons_seller_response'] === 'refused',
      priorityAdjustment: 25,
      reasoningSignal: {
        type: 'positive',
        text: 'Seller has explicitly refused resolution. Your case is eligible for National Consumer Helpline / Forum escalation.'
      },
      recommendedNextAction: 'Register a complaint on the National Consumer Helpline portal (NCH) or INGRAM.'
    },
    {
      id: 'rule_high_value',
      condition: (answers) => answers['cons_financial_impact'] === '50k_5l' || answers['cons_financial_impact'] === 'above_5l',
      priorityAdjustment: 20,
      reasoningSignal: {
        type: 'info',
        text: 'Significant financial value involved. Preparing a legal notice may be beneficial if helpline mediation fails.'
      }
    }
  ],

  actionSteps: [
    {
      id: 'step_1',
      stepNumber: 1,
      title: 'Consolidate Purchase & Payment Evidence',
      description: 'Gather invoice, bank transaction receipt, warranty card, and photos of the defective item into one digital folder.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'step_2',
      stepNumber: 2,
      title: 'Issue Formal Written Notice to Seller',
      description: 'Send a clear email or registered letter stating the issue, purchase date, and requesting a full refund or replacement within 7 days.',
      status: 'not_started',
      estimatedDays: '7 Days'
    },
    {
      id: 'step_3',
      stepNumber: 3,
      title: 'File Complaint on National Consumer Helpline (NCH)',
      description: 'Lodge your complaint online at consumerhelpline.gov.in or call 1915 with your invoice and seller response details.',
      status: 'not_started',
      estimatedDays: '15-30 Days'
    },
    {
      id: 'step_4',
      stepNumber: 4,
      title: 'Escalate to District Consumer Disputes Redressal Commission',
      description: 'If NCH mediation fails, file an e-daakhil petition on edaakhil.nic.in for formal adjudication.',
      status: 'not_started',
      estimatedDays: '60+ Days'
    }
  ]
};
