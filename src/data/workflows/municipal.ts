import { CivicWorkflow } from '../../types';

export const municipalWorkflow: CivicWorkflow = {
  id: 'wf_municipal',
  category: 'municipal',
  title: 'Municipal & Public Services Grievance Pathway',
  description: 'Step-by-step guidance for reporting broken streetlights, damaged roads, garbage overflow, or water supply failures to your local municipal corporation.',
  sourceLabel: 'Centralised Public Grievance Redress and Monitoring System (CPGRAMS)',
  sourceUrl: 'https://pgportal.gov.in',
  lastVerified: '2025-01-20',
  questions: [
    {
      id: 'muni_issue_type',
      title: 'What specific public service issue are you reporting?',
      type: 'single',
      options: [
        { value: 'streetlight', label: 'Broken or non-functioning Streetlight' },
        { value: 'road_pothole', label: 'Damaged public road or dangerous pothole' },
        { value: 'garbage_waste', label: 'Uncollected garbage or open waste dumping' },
        { value: 'drainage_water', label: 'Blocked drainage, water logging, or contaminated water' },
        { value: 'other_muni', label: 'Other public amenity issue' }
      ]
    },
    {
      id: 'muni_duration',
      title: 'How long has this issue been persisting?',
      type: 'single',
      options: [
        { value: 'less_1w', label: 'Less than 1 week' },
        { value: '1w_1m', label: '1 week to 1 month' },
        { value: 'more_1m', label: 'More than 1 month' }
      ]
    },
    {
      id: 'muni_photos_location',
      title: 'Do you have photos of the issue with exact location details?',
      type: 'single',
      options: [
        {
          value: 'yes',
          label: 'Yes, clear photos with geotag/street address',
          evidenceProvided: ['muni_photo_proof', 'muni_location_proof']
        },
        {
          value: 'photo_only',
          label: 'I have photos but no exact landmark address',
          evidenceProvided: ['muni_photo_proof'],
          evidenceMissing: ['muni_location_proof']
        },
        {
          value: 'no',
          label: 'No photos taken yet',
          evidenceMissing: ['muni_photo_proof', 'muni_location_proof']
        }
      ]
    },
    {
      id: 'muni_prior_complaint',
      title: 'Have you filed a complaint with the municipal helpline/app previously?',
      type: 'single',
      options: [
        {
          value: 'yes_ref_no',
          label: 'Yes, I have an official complaint reference number',
          evidenceProvided: ['muni_complaint_ref']
        },
        {
          value: 'yes_no_ref',
          label: 'Yes, I complained but received no reference number',
          evidenceMissing: ['muni_complaint_ref']
        },
        {
          value: 'no',
          label: 'No, this is my first formal submission',
          evidenceMissing: ['muni_complaint_ref']
        }
      ]
    },
    {
      id: 'muni_hazard_level',
      title: 'Does this issue pose an immediate safety or public health hazard?',
      subtitle: 'e.g. Open drain near school, dark road causing accidents, sewage contamination',
      type: 'single',
      options: [
        { value: 'high_hazard', label: 'Yes, high immediate danger to residents' },
        { value: 'medium_hazard', label: 'Moderate inconvenience/health concern' },
        { value: 'low_hazard', label: 'Minor inconvenience' }
      ]
    }
  ],

  evidenceItems: [
    {
      id: 'muni_photo_proof',
      title: 'Photographs of the Damage / Spot',
      description: 'Clear photos showing the severity of the issue.',
      weight: 35,
      isRequired: true,
      category: 'municipal'
    },
    {
      id: 'muni_location_proof',
      title: 'Exact Street Landmark & Ward Number',
      description: 'Specific address, ward details, or GPS coordinates for municipal staff dispatch.',
      weight: 25,
      isRequired: true,
      category: 'municipal'
    },
    {
      id: 'muni_complaint_ref',
      title: 'Previous Complaint Reference / Token Number',
      description: 'Ack number from municipal portal or mobile app (e.g. Swachhata app ticket).',
      weight: 25,
      isRequired: false,
      category: 'municipal'
    },
    {
      id: 'muni_community_support',
      title: 'Neighborhood / Resident Signatures or Endorsements',
      description: 'Multiple resident signatures boost escalation priority.',
      weight: 15,
      isRequired: false,
      category: 'municipal'
    }
  ],

  rules: [
    {
      id: 'rule_high_hazard',
      condition: (answers) => answers['muni_hazard_level'] === 'high_hazard',
      priorityAdjustment: 30,
      reasoningSignal: {
        type: 'warning',
        text: 'Immediate safety hazard declared. Priority is elevated to High for urgent municipal intervention.'
      },
      recommendedNextAction: 'Submit direct complaint via Municipal Mobile App / Helpline and notify Ward Engineer.'
    },
    {
      id: 'rule_long_pending',
      condition: (answers) => answers['muni_duration'] === 'more_1m',
      priorityAdjustment: 20,
      reasoningSignal: {
        type: 'negative',
        text: 'Issue pending for over 1 month without resolution. Escalate to Municipal Commissioner or CPGRAMS.'
      }
    }
  ],

  actionSteps: [
    {
      id: 'mstep_1',
      stepNumber: 1,
      title: 'Document Spot with Photos & Landmark Address',
      description: 'Take 2-3 clear photographs of the spot and note down the exact Ward Number, Street Name, and nearest landmark.',
      status: 'current',
      estimatedDays: '1 Day'
    },
    {
      id: 'mstep_2',
      stepNumber: 2,
      title: 'Lodge Grievance on Municipal Portal / Mobile App',
      description: 'Submit ticket via your city corporation app or Swachhata app and save the generated Complaint Reference Number.',
      status: 'not_started',
      estimatedDays: '3-7 Days'
    },
    {
      id: 'mstep_3',
      stepNumber: 3,
      title: 'Follow Up with Ward Officer / Sanitary Inspector',
      description: 'Provide the complaint reference number to your local ward office if resolution exceeds 7 days.',
      status: 'not_started',
      estimatedDays: '7-14 Days'
    },
    {
      id: 'mstep_4',
      stepNumber: 4,
      title: 'Escalate to State Public Grievance Portal / CPGRAMS',
      description: 'If unresolved by local municipality, lodge an escalation grievance on pgportal.gov.in quoting your initial ticket number.',
      status: 'not_started',
      estimatedDays: '15-30 Days'
    }
  ]
};
