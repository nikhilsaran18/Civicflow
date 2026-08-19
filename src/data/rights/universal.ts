import { CivicWorkflow } from '../../types';

export const universalFallbackWorkflow: CivicWorkflow = {
  id: 'wf_universal_fallback',
  category: 'other_civic_legal',
  title: 'Universal General Civic Pathway',
  description: 'General decision-support pathway for civic grievances and public service issues.',
  isFallbackWorkflow: true,
  sourceLabel: 'Central Public Grievances Portal & General Rights Framework',
  sourceUrl: 'https://pgportal.gov.in',
  questions: [
    {
      id: 'univ_org_type',
      title: '1. What organization or entity is involved in this issue?',
      subtitle: 'e.g. Government Department, Private Company, School/College, Service Provider, Owner',
      type: 'single',
      options: [
        { value: 'govt_dept', label: 'Government Office / Municipal Corporation' },
        { value: 'pvt_company', label: 'Private Business / Commercial Service' },
        { value: 'institution', label: 'Educational Institution / Healthcare Facility' },
        { value: 'individual', label: 'Individual / Property Owner' }
      ]
    },
    {
      id: 'univ_action_expected',
      title: '2. What specific action, service, or entitlement was expected?',
      subtitle: 'What was promised or legally required?',
      type: 'single',
      options: [
        { value: 'refund_payment', label: 'Refund, Salary, Deposit, or Financial Disbursement' },
        { value: 'service_delivery', label: 'Medical, Municipal, or Professional Service' },
        { value: 'doc_issuance', label: 'Issuance of Certificate, License, or Official Document' },
        { value: 'info_disclosure', label: 'Public Information or Inspection of Records' }
      ]
    },
    {
      id: 'univ_written_evidence',
      title: '3. Do you have written proof or communication records?',
      subtitle: 'e.g. Emails, Receipts, Letters, Applications, Bank Statements',
      type: 'single',
      options: [
        {
          value: 'yes_written',
          label: 'Yes, I have written documents / payment proof',
          evidenceProvided: ['univ_proof_doc']
        },
        {
          value: 'verbal_only',
          label: 'No, only verbal conversations or messages',
          evidenceMissing: ['univ_proof_doc']
        }
      ]
    },
    {
      id: 'univ_prior_contact',
      title: '4. Have you formally notified the opposing party in writing?',
      type: 'single',
      options: [
        {
          value: 'yes_notified',
          label: 'Yes, formal complaint or notice submitted',
          evidenceProvided: ['univ_notice_ack']
        },
        {
          value: 'not_notified',
          label: 'No formal written notice sent yet',
          evidenceMissing: ['univ_notice_ack']
        }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'univ_proof_doc',
      title: 'Transaction / Receipt / Agreement Record',
      description: 'Document establishing your relationship, purchase, or entitlement.',
      weight: 40,
      isRequired: true,
      category: 'other_civic_legal'
    },
    {
      id: 'univ_notice_ack',
      title: 'Written Complaint Record / Acknowledgement',
      description: 'Proof that you formally notified the responsible entity.',
      weight: 35,
      isRequired: true,
      category: 'other_civic_legal'
    },
    {
      id: 'univ_response_reply',
      title: 'Response / Refusal Letter (if received)',
      description: 'Any written reply or rejection notice from the entity.',
      weight: 25,
      isRequired: false,
      category: 'other_civic_legal'
    }
  ],

  rules: [
    {
      id: 'rule_univ_no_notice',
      condition: (answers) => answers['univ_prior_contact'] !== 'yes_notified',
      priorityAdjustment: 15,
      reasoningSignal: {
        type: 'warning',
        text: 'Detailed domain-specific pack is not available. Showing Universal Civic Pathway. Creating a written record is your essential first step.'
      },
      recommendedNextAction: 'Create a formal written complaint letter/email to the responsible organization.'
    }
  ],

  actionSteps: [
    {
      id: 'ustep_1',
      stepNumber: 1,
      title: 'Document the Situation & Gather Proof',
      description: 'Compile dates, receipts, communications, and names involved into one folder.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'ustep_2',
      stepNumber: 2,
      title: 'Identify Responsible Organization & Officer',
      description: 'Locate official grievance address or head office contact for formal notice.',
      status: 'not_started',
      estimatedDays: '2 Days'
    },
    {
      id: 'ustep_3',
      stepNumber: 3,
      title: 'Send Formal Written Complaint',
      description: 'Dispatch registered post or email stating the issue and requesting resolution within 14 days.',
      status: 'not_started',
      estimatedDays: '14 Days'
    },
    {
      id: 'ustep_4',
      stepNumber: 4,
      title: 'Escalate to Regulatory Body or Public Ombudsman',
      description: 'If unresolved, lodge an escalation ticket on the relevant state grievance portal or regulatory commission.',
      status: 'not_started',
      estimatedDays: '30 Days'
    }
  ]
};
