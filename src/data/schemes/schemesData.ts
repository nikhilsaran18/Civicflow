export interface EligibilityRule {
  id: string;
  field: 'age' | 'income' | 'occupation' | 'areaType' | 'studentStatus' | 'gender';
  label: string;
  conditionDescription: string;
  check: (profile: Record<string, any>) => boolean;
}

export interface SchemeDocument {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  category: 'agriculture' | 'healthcare' | 'education' | 'housing' | 'employment' | 'welfare' | 'pension';
  summary: string;
  benefitsSummary: string;
  eligibilityRules: EligibilityRule[];
  requiredDocuments: SchemeDocument[];
  applicationSteps: string[];
  sourceLabel: string;
  sourceUrl: string;
  lastVerified: string;
}

export const SCHEMES_DATA: Scheme[] = [
  {
    id: 'scheme_pm_jay',
    name: 'Ayushman Bharat PM-JAY Health Coverage',
    category: 'healthcare',
    summary: 'Free cashless health insurance coverage up to ₹500,000 per family per year for secondary and tertiary hospitalization.',
    benefitsSummary: '₹500,000 per family/year cashless hospital coverage across empaneled public & private hospitals.',
    sourceLabel: 'National Health Authority (NHA)',
    sourceUrl: 'https://pmjay.gov.in',
    lastVerified: '2025-01-15',
    eligibilityRules: [
      {
        id: 'rule_income',
        field: 'income',
        label: 'Low / Economically Weaker Section Income',
        conditionDescription: 'Annual household income under ₹250,000 or SECC census eligibility.',
        check: (profile) => profile.incomeRange === 'under_1l' || profile.incomeRange === '1l_2.5l'
      },
      {
        id: 'rule_occupation',
        field: 'occupation',
        label: 'Unorganized / Informal / Agricultural Occupation',
        conditionDescription: 'Informal workers, daily wagers, marginal farmers, or unemployed.',
        check: (profile) => profile.occupationCategory !== 'formal_govt'
      }
    ],
    requiredDocuments: [
      { id: 'doc_aadhaar', title: 'Aadhaar Card of Applicant', description: 'Biometric verified ID card.', isRequired: true },
      { id: 'doc_ration', title: 'Ration Card / Family Member Proof', description: 'Proof of family roster.', isRequired: true },
      { id: 'doc_income', title: 'Income Certificate / BPL Card', description: 'Certified annual income proof.', isRequired: false }
    ],
    applicationSteps: [
      'Check SECC name inclusion on beneficiary portal pmjay.gov.in.',
      'Visit nearest Common Service Centre (CSC) or empaneled hospital with Aadhaar & Ration Card.',
      'Complete biometric e-KYC verification to generate Ayushman Card.'
    ]
  },
  {
    id: 'scheme_post_matric',
    name: 'Post-Matric Scholarship for SC/ST/OBC Students',
    category: 'education',
    summary: 'Financial assistance for tuition fees, maintenance allowance, and book grants for post-secondary education.',
    benefitsSummary: 'Full tuition fee reimbursement + monthly maintenance allowance up to ₹1,200/month.',
    sourceLabel: 'National Scholarship Portal (NSP)',
    sourceUrl: 'https://scholarships.gov.in',
    lastVerified: '2025-01-10',
    eligibilityRules: [
      {
        id: 'rule_student',
        field: 'studentStatus',
        label: 'Currently Enrolled Student',
        conditionDescription: 'Pursuing Post-Matric / Higher Education in recognized college.',
        check: (profile) => profile.studentStatus === true
      },
      {
        id: 'rule_income_schol',
        field: 'income',
        label: 'Annual Family Income Limit',
        conditionDescription: 'Annual family income under ₹250,000.',
        check: (profile) => profile.incomeRange === 'under_1l' || profile.incomeRange === '1l_2.5l'
      }
    ],
    requiredDocuments: [
      { id: 'doc_schol_id', title: 'College Student ID Card', description: 'Current academic year ID.', isRequired: true },
      { id: 'doc_caste', title: 'Community / Caste Certificate', description: 'Competent revenue officer issued certificate.', isRequired: true },
      { id: 'doc_bank', title: 'Bank Account Passbook (Aadhaar Seeded)', description: 'Bank details for DBT transfer.', isRequired: true }
    ],
    applicationSteps: [
      'Register on National Scholarship Portal (scholarships.gov.in).',
      'Upload caste, income, and previous mark sheets.',
      'Submit application to college nodal officer for online verification.'
    ]
  },
  {
    id: 'scheme_eshram',
    name: 'e-Shram Social Security Card for Unorganized Workers',
    category: 'employment',
    summary: 'National database of unorganized workers with accidental insurance cover of ₹200,000 and direct social welfare linkages.',
    benefitsSummary: '₹200,000 accidental death/disability insurance + priority access to social welfare schemes.',
    sourceLabel: 'Ministry of Labour and Employment',
    sourceUrl: 'https://eshram.gov.in',
    lastVerified: '2025-01-05',
    eligibilityRules: [
      {
        id: 'rule_age_eshram',
        field: 'age',
        label: 'Age between 16 and 59 years',
        conditionDescription: 'Applicant age must be within 16-59 range.',
        check: (profile) => profile.ageRange === '18_35' || profile.ageRange === '36_59'
      },
      {
        id: 'rule_occ_eshram',
        field: 'occupation',
        label: 'Unorganized / Self-Employed / Domestic Worker',
        conditionDescription: 'Not an Income Tax payer or EPF/ESIC member.',
        check: (profile) => profile.occupationCategory !== 'formal_govt'
      }
    ],
    requiredDocuments: [
      { id: 'doc_eshram_aadhaar', title: 'Aadhaar Card Linked to Mobile', description: 'Mobile linked Aadhaar for OTP.', isRequired: true },
      { id: 'doc_eshram_bank', title: 'Bank Account Passbook', description: 'For direct benefit transfer.', isRequired: true }
    ],
    applicationSteps: [
      'Visit eshram.gov.in or nearest CSC.',
      'Enter Aadhaar linked mobile number for OTP authentication.',
      'Select occupation details and download instant Universal Account Number (UAN) Card.'
    ]
  },
  {
    id: 'scheme_pm_kisan',
    name: 'PM-Kisan Samman Nidhi (Farmer Income Support)',
    category: 'agriculture',
    summary: 'Direct income support of ₹6,000 per year in three equal instalments of ₹2,000 directly to landholding farmer families.',
    benefitsSummary: '₹6,000 annual direct cash transfer credited to bank account.',
    sourceLabel: 'PM-Kisan Official Portal',
    sourceUrl: 'https://pmkisan.gov.in',
    lastVerified: '2025-01-20',
    eligibilityRules: [
      {
        id: 'rule_farmer_occ',
        field: 'occupation',
        label: 'Landholding Farmer Family',
        conditionDescription: 'Cultivable land ownership registered in state land records.',
        check: (profile) => profile.occupationCategory === 'farmer_agricultural' || profile.areaType === 'rural'
      }
    ],
    requiredDocuments: [
      { id: 'doc_land_patta', title: 'Land Ownership Record (Patta/Chitta)', description: 'Certified land document.', isRequired: true },
      { id: 'doc_kisan_aadhaar', title: 'Aadhaar Card', description: 'Mandatory Aadhaar seeding.', isRequired: true }
    ],
    applicationSteps: [
      'Self-register on pmkisan.gov.in Farmers Corner.',
      'Enter land registration ID and bank details.',
      'Complete e-KYC biometric verification.'
    ]
  }
];
