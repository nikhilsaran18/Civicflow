export interface FormStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'date';
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }[];
}

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: FormStep[];
  generatePreview: (data: Record<string, any>) => string;
}

export const FORMS_TEMPLATES: FormTemplate[] = [
  {
    id: 'form_public_grievance',
    title: 'Public Service & Municipal Grievance Petition',
    category: 'Municipal & Public Services',
    description: 'Official grievance petition for reporting broken infrastructure, streetlight failure, water logging, or delayed civic services.',
    steps: [
      {
        id: 'step_applicant',
        stepNumber: 1,
        title: 'Applicant Information',
        subtitle: 'Enter your personal details for official record',
        fields: [
          { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Arun Kumar', required: true },
          { id: 'address', label: 'Postal Address & Ward No', type: 'text', placeholder: '123 Gandhi Street, Ward 14', required: true },
          { id: 'phone', label: 'Contact Phone Number', type: 'text', placeholder: '+91 98765 43210', required: true }
        ]
      },
      {
        id: 'step_service',
        stepNumber: 2,
        title: 'Service & Incident Details',
        subtitle: 'Provide details about the civic issue',
        fields: [
          { id: 'authority', label: 'Public Authority / Corporation Name', type: 'text', placeholder: 'Greater Chennai Corporation', required: true },
          { id: 'category', label: 'Grievance Category', type: 'select', options: ['Streetlight Non-Functional', 'Damaged Public Road / Pothole', 'Uncollected Garbage Overflow', 'Drainage / Sewage Leak'], required: true },
          { id: 'location', label: 'Exact Spot Landmark', type: 'text', placeholder: 'Near Public Park, Ward 14 Main Road', required: true },
          { id: 'description', label: 'Detailed Problem Description', type: 'textarea', placeholder: 'Describe the issue and how long it has been persisting...', required: true }
        ]
      }
    ],
    generatePreview: (data) => `
OFFICIAL PUBLIC SERVICE GRIEVANCE PETITION

To,
The Public Grievance Officer / Municipal Commissioner,
${data.authority || '[Public Authority]'}

APPLICANT DETAILS:
Name: ${data.name || '[Applicant Name]'}
Address: ${data.address || '[Address]'}
Phone: ${data.phone || '[Phone]'}

SUBJECT: Formal Petition regarding ${data.category || 'Civic Issue'} at ${data.location || '[Location]'}

Respected Sir/Madam,

I am bringing to your urgent attention the following civic grievance:

Location / Landmark: ${data.location || '[Location]'}
Details: ${data.description || '[Description]'}

I request your office to inspect the spot and initiate necessary repair/corrective action within statutory service timelines.

Place: __________________
Date: ${new Date().toLocaleDateString('en-IN')}

___________________________
Signature (${data.name || 'Applicant'})
    `.trim()
  },
  {
    id: 'form_consumer_notice',
    title: 'Consumer Legal Notice to Seller / Vendor',
    category: 'Consumer Rights',
    description: 'Formal legal notice demanding full refund or replacement for defective goods or service failure before filing Consumer Court petition.',
    steps: [
      {
        id: 'step_parties',
        stepNumber: 1,
        title: 'Parties & Purchase Information',
        subtitle: 'Details of seller and transaction',
        fields: [
          { id: 'name', label: 'Consumer Full Name', type: 'text', placeholder: 'Arun Kumar', required: true },
          { id: 'seller', label: 'Seller / Merchant Business Name', type: 'text', placeholder: 'ABC Electronics Ltd', required: true },
          { id: 'invoiceNo', label: 'Tax Invoice / Order Reference Number', type: 'text', placeholder: 'INV-2025-9912', required: true },
          { id: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
          { id: 'amount', label: 'Amount Paid (₹)', type: 'text', placeholder: '15000', required: true }
        ]
      },
      {
        id: 'step_dispute',
        stepNumber: 2,
        title: 'Defect & Remedy Demanded',
        subtitle: 'Explain product defect and expected settlement',
        fields: [
          { id: 'defect', label: 'Defect / Deficiency Explanation', type: 'textarea', placeholder: 'Explain the flaw, non-performance, or service failure...', required: true },
          { id: 'remedy', label: 'Demanded Remedy', type: 'select', options: ['Full Refund of Purchase Price', 'Replacement with New Unit', 'Free Authorized Repair'], required: true }
        ]
      }
    ],
    generatePreview: (data) => `
LEGAL DEMAND NOTICE UNDER CONSUMER PROTECTION ACT, 2019

To,
${data.seller || '[Seller Name]'}
(Through Authorized Representative / Manager)

From,
${data.name || '[Consumer Name]'}

NOTICE OF DEFICIENCY IN SERVICE AND DEMAND FOR SETTLEMENT

1. I purchased an item under Invoice / Order Reference: ${data.invoiceNo || '[Invoice]'} dated ${data.purchaseDate || '[Date]'} for a total consideration of ₹${data.amount || '0'}.

2. NATURE OF DEFECT / DEFICIENCY:
   ${data.defect || '[Defect Description]'}

3. DEMAND:
   You are hereby called upon to grant: ${data.remedy || 'Full Refund'} within 7 days from the receipt of this notice.

4. FAIL NOT:
   If you fail to comply, I will be constrained to file a petition before the District Consumer Disputes Redressal Commission for compensation and costs.

Date: ${new Date().toLocaleDateString('en-IN')}

___________________________
(${data.name || 'Consumer'})
    `.trim()
  }
];
