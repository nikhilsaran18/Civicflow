import { RightsDomain, IssuePattern } from '../types';

export interface DomainVocabulary {
  domain: RightsDomain;
  name: string;
  nouns: string[];
  verbs: string[];
  phrases: string[];
  negativeWords: string[];
  examplePhrases: string[];
}

export interface PatternVocabulary {
  pattern: IssuePattern;
  name: string;
  keywords: string[];
  phrases: string[];
}

export const DOMAIN_VOCABULARIES: DomainVocabulary[] = [
  {
    domain: 'healthcare_patient',
    name: 'Healthcare / Patient Rights',
    nouns: [
      'doctor', 'physician', 'hospital', 'clinic', 'patient', 'treatment', 'medical',
      'medicine', 'nurse', 'health', 'healthcare', 'facility', 'surgery', 'admission',
      'ward', 'prescription', 'diagnostic', 'scan', 'test', 'ambulance', 'emergency'
    ],
    verbs: ['treat', 'admit', 'operate', 'prescribe', 'diagnose', 'examine', 'discharge', 'consult'],
    phrases: [
      'medical treatment', 'doctor refused', 'denied admission', 'refused to treat',
      'hospital bill', 'patient rights', 'medical negligence', 'physician refused',
      'clinic denied', 'turned away by hospital', 'health care service', 'physician wouldn’t see me', 'physician wouldnt see me'
    ],
    negativeWords: ['consumer', 'refund', 'tenant', 'deposit', 'landlord', 'salary', 'pothole'],
    examplePhrases: [
      'The hospital refused to provide service.',
      'A doctor refused to see me.',
      'I was denied treatment at a clinic.',
      'The government hospital is not responding to my complaint.',
      'I need help understanding my patient grievance options.',
      'The physician wouldn’t see me.',
      'The clinic denied me service.',
      'I was turned away by the hospital.',
      'I have fever and a doctor is refusing to treat me.',
      'Hospital refusing emergency treatment to patient.'
    ]
  },
  {
    domain: 'consumer',
    name: 'Consumer Complaint',
    nouns: [
      'seller', 'merchant', 'store', 'shop', 'product', 'item', 'device', 'phone',
      'smartphone', 'laptop', 'appliance', 'goods', 'purchase', 'receipt', 'invoice',
      'bill', 'warranty', 'guarantee', 'order', 'delivery', 'vendor', 'online'
    ],
    verbs: ['buy', 'bought', 'purchase', 'refund', 'replace', 'deliver', 'charge', 'return', 'repair'],
    phrases: [
      'defective product', 'refund refused', 'replace item', 'seller refused',
      'refuses to refund', 'warranty claimed', 'overcharged on bill', 'non-delivery of order',
      'bad product quality', 'store refused replacement', 'merchant ignored'
    ],
    negativeWords: ['doctor', 'hospital', 'patient', 'landlord', 'tenant', 'rent', 'salary', 'employer'],
    examplePhrases: [
      'The seller refuses my refund.',
      'I received a defective product.',
      'The shop will not replace my device.',
      'I was charged for a service I did not receive.',
      'I purchased a phone but the seller refuses to refund me.'
    ]
  },
  {
    domain: 'housing_tenant',
    name: 'Housing & Tenant Rights',
    nouns: [
      'landlord', 'tenant', 'rent', 'rental', 'deposit', 'advance', 'lease', 'agreement',
      'house', 'flat', 'apartment', 'property', 'owner', 'broker', 'maintenance', 'building'
    ],
    verbs: ['evict', 'vacate', 'withhold', 'lease', 'rent out', 'repay', 'increase rent'],
    phrases: [
      'security deposit', 'landlord refused', 'return deposit', 'vacate notice',
      'rental agreement', 'illegal eviction', 'deposit refund', 'house owner disputes'
    ],
    negativeWords: ['doctor', 'hospital', 'patient', 'seller', 'product', 'invoice', 'pothole'],
    examplePhrases: [
      'My landlord has not returned my security deposit.',
      'Landlord threatening illegal eviction without notice.'
    ]
  },
  {
    domain: 'workplace_labour',
    name: 'Workplace & Labour Rights',
    nouns: [
      'employer', 'employee', 'salary', 'wages', 'job', 'workplace', 'company',
      'firm', 'manager', 'hr', 'employment', 'contract', 'termination', 'provident fund', 'pf'
    ],
    verbs: ['pay', 'withhold', 'terminate', 'fire', 'resign', 'deduct', 'work'],
    phrases: [
      'unpaid salary', 'salary not paid', 'wrongful termination', 'unpaid wages',
      'experience letter withheld', 'pf contribution not deposited', 'salary has not been paid'
    ],
    negativeWords: ['landlord', 'rent', 'doctor', 'hospital', 'seller', 'product', 'pothole'],
    examplePhrases: [
      'My salary has not been paid for two months.'
    ]
  },
  {
    domain: 'public_government_service',
    name: 'Public & Government Service',
    nouns: [
      'government office', 'department', 'official', 'certificate', 'application',
      'public authority', 'bureaucrat', 'officer', 'passport', 'license', 'ration card', 'aadhaar'
    ],
    verbs: ['apply', 'issue', 'delay', 'reject', 'process', 'verify', 'renew'],
    phrases: [
      'certificate application pending', 'passport delayed', 'license not issued',
      'government office delay', 'official refusing service', 'application stuck'
    ],
    negativeWords: ['seller', 'product', 'landlord', 'rent', 'doctor', 'treatment'],
    examplePhrases: [
      'My government certificate application has been pending for weeks.',
      'My government certificate application has been pending.'
    ]
  },
  {
    domain: 'municipal_utility',
    name: 'Municipal & Public Utility',
    nouns: [
      'street', 'road', 'pothole', 'drainage', 'gutter', 'water', 'pipe', 'garbage',
      'trash', 'waste', 'dumping', 'streetlight', 'lamp', 'light', 'corporation', 'municipality'
    ],
    verbs: ['clean', 'repair', 'collect', 'fix', 'overflow', 'dump'],
    phrases: [
      'garbage uncollected', 'broken streetlight', 'road pothole', 'drainage overflow',
      'water supply disruption', 'sewage pipeline leak', 'street light dark', 'isn’t collecting garbage', 'isnt collecting garbage'
    ],
    negativeWords: ['doctor', 'patient', 'landlord', 'rent', 'salary', 'employer'],
    examplePhrases: [
      'The municipality hasn’t collected garbage from our street.',
      'The municipality isn’t collecting garbage.'
    ]
  },
  {
    domain: 'rti_information',
    name: 'RTI & Public Information Access',
    nouns: [
      'rti', 'information', 'public record', 'records', 'file', 'application',
      'pio', 'cpio', 'department', 'tender', 'budget', 'expenditure', 'sanctioned'
    ],
    verbs: ['request', 'seek', 'disclose', 'file', 'inspect', 'obtain'],
    phrases: [
      'rti application', 'information request', 'road repair expenditure',
      'seeking public records', 'certified copies of tender', 'budget allocation details'
    ],
    negativeWords: ['doctor', 'treatment', 'hospital', 'seller', 'refund', 'rent'],
    examplePhrases: [
      'I want information about road repair expenditure.'
    ]
  },
  {
    domain: 'education',
    name: 'Education & Institutional Rights',
    nouns: [
      'school', 'college', 'university', 'student', 'institution', 'certificate',
      'degree', 'mark sheet', 'fee', 'admission', 'teacher', 'principal', 'board'
    ],
    verbs: ['admit', 'issue', 'withhold', 'expel', 'examine', 'charge'],
    phrases: [
      'college refusing certificate', 'degree withheld', 'extra fee demand',
      'school refusing transfer certificate', 'unlawful expulsion from college', 'college refuses to issue'
    ],
    negativeWords: ['doctor', 'patient', 'hospital', 'landlord', 'rent', 'seller'],
    examplePhrases: [
      'My college is refusing to issue my certificate.',
      'My college refuses to issue my certificate.'
    ]
  },
  {
    domain: 'banking_financial',
    name: 'Banking & Financial Grievances',
    nouns: [
      'bank', 'branch', 'account', 'atm', 'credit card', 'loan', 'emi', 'charge', 'fraud', 'manager'
    ],
    verbs: ['deduct', 'charge', 'freeze', 'debit', 'sanction', 'block'],
    phrases: [
      'unauthorized bank debit', 'hidden bank charges', 'loan emi dispute',
      'atm cash not dispensed but debited', 'account frozen illegally'
    ],
    negativeWords: ['doctor', 'hospital', 'landlord', 'pothole', 'garbage'],
    examplePhrases: []
  },
  {
    domain: 'welfare_entitlement',
    name: 'Welfare & Entitlements',
    nouns: [
      'ration', 'pension', 'subsidy', 'scheme', 'bpl card', 'scholarship', 'welfare', 'benefit', 'dbt', 'epfo', 'aadhaar link'
    ],
    verbs: ['apply', 'receive', 'deny', 'stop', 'disburse', 'suspend', 'block'],
    phrases: [
      'pension stopped', 'ration shop denial', 'scholarship not disbursed',
      'welfare scheme benefit denied', 'bpl card application rejected', 'discontinued pension',
      'stopped three months ago'
    ],
    negativeWords: ['seller', 'product', 'landlord', 'rent', 'doctor'],
    examplePhrases: [
      "My father's pension stopped three months ago unexpectedly."
    ]
  },
  {
    domain: 'police_legal_grievance',
    name: 'Police & Criminal Justice Grievances',
    nouns: [
      'police', 'station', 'cop', 'constable', 'fir', 'complaint', 'officer', 'sho', 'inspector',
      'sp', 'commissioner', 'harassment', 'extortion', 'theft', 'assault', 'bribe', 'investigation'
    ],
    verbs: ['refuse', 'register', 'investigate', 'harass', 'demand', 'extort', 'threaten', 'arrest', 'detain'],
    phrases: [
      'police refusing fir', 'refused to register fir', 'police station refused complaint',
      'sho refused to take complaint', 'police harassment', 'no action taken by police',
      'police demanded bribe to register fir', 'refusing to lodge fir'
    ],
    negativeWords: ['landlord', 'tenant', 'product', 'seller', 'pothole', 'hospital'],
    examplePhrases: [
      'The local police station is refusing to register an FIR for my stolen vehicle.',
      'Police refused to take my complaint.'
    ]
  },
  {
    domain: 'power_electricity_utility',
    name: 'Electricity & Power Utility Grievances',
    nouns: [
      'electricity', 'power', 'current', 'meter', 'eb bill', 'discom', 'transformer',
      'voltage', 'outage', 'blackout', 'tariff', 'reading', 'wire', 'grid', 'substation'
    ],
    verbs: ['cut', 'disconnect', 'overcharge', 'fluctuate', 'surge', 'burn', 'replace'],
    phrases: [
      'excessive electricity bill', 'faulty electricity meter', 'unscheduled power outage',
      'power cut for hours', 'inflated power bill', 'electricity disconnected without notice',
      'meter fast reading', 'discom overcharged'
    ],
    negativeWords: ['doctor', 'hospital', 'tenant', 'salary', 'marksheet'],
    examplePhrases: [
      'The electricity board sent an exorbitant bill of Rs 50,000 for a locked house.',
      'Frequent power cuts in our area without any maintenance schedule.'
    ]
  },
  {
    domain: 'environment_civic_hazard',
    name: 'Environmental & Pollution Hazards',
    nouns: [
      'pollution', 'noise', 'smoke', 'fumes', 'garbage dumping', 'waste', 'industrial',
      'factory', 'effluent', 'toxic', 'air quality', 'loudspeaker', 'tree', 'greenery'
    ],
    verbs: ['pollute', 'dump', 'burn', 'release', 'cut', 'disturb', 'contaminate'],
    phrases: [
      'illegal garbage burning', 'noise pollution from commercial unit', 'factory releasing toxic effluents',
      'open dumping of hazardous waste', 'illegal tree felling in colony', 'industrial smoke causing breathing problem'
    ],
    negativeWords: ['seller', 'product', 'invoice', 'salary', 'exam'],
    examplePhrases: [
      'A commercial workshop is running high-decibel machinery all night causing severe noise pollution.',
      'Illegal garbage burning near our residential apartments.'
    ]
  },
  {
    domain: 'cyber_digital_fraud',
    name: 'Cyber Crime & Online Financial Fraud',
    nouns: [
      'cyber', 'fraud', 'scam', 'phishing', 'hacked', 'otp', 'upi', 'impersonation',
      'online fraud', 'apk', 'fake app', 'telegram scam', 'identity theft', 'extortion', 'blackmail'
    ],
    verbs: ['scam', 'cheat', 'hack', 'steal', 'drain', 'threaten', 'defraud'],
    phrases: [
      'lost money in online scam', 'unauthorized upi transaction', 'fake investment app fraud',
      'blackmailed online with morph photos', 'otp scam drained bank balance', 'cyber financial fraud'
    ],
    negativeWords: ['pothole', 'street light', 'water pipeline', 'landlord'],
    examplePhrases: [
      'I was scammed of Rs 25,000 through a fraudulent UPI payment link on an online marketplace.',
      'My phone was hacked and money was transferred via unauthorized banking transactions.'
    ]
  }
];

export const PATTERN_VOCABULARIES: PatternVocabulary[] = [
  {
    pattern: 'financial_dispute',
    name: 'Financial Dispute / Unpaid Funds',
    keywords: ['refund', 'deposit', 'salary', 'wages', 'charge', 'fee', 'debit', 'pay', 'overcharged', 'money'],
    phrases: [
      'refuses to refund', 'refuse to refund', 'won\'t return money', 'wont return money',
      'refuses refund', 'security deposit withheld', 'salary not paid', 'salary has not been paid',
      'unpaid salary', 'deposit refund', 'returned my deposit', 'return my deposit'
    ]
  },
  {
    pattern: 'service_denied',
    name: 'Service Denied / Refused',
    keywords: ['refuse', 'refused', 'refuses', 'refusing', 'deny', 'denied', 'denying', 'turn away', 'turned away', 'reject'],
    phrases: [
      'refused service', 'denied treatment', 'refused admission', 'turned away', 'refusing to see',
      'refusing to treat', 'refuses to treat', 'wouldn’t see', 'wouldnt see', 'college refuses'
    ]
  },
  {
    pattern: 'service_not_provided',
    name: 'Service Not Provided / Interrupted',
    keywords: ['uncollected', 'broken', 'dark', 'interrupted', 'stopped', 'dirty', 'leak', 'pothole', 'collecting', 'garbage'],
    phrases: [
      'garbage uncollected', 'isn’t collecting garbage', 'isnt collecting garbage', 'not collecting garbage',
      'streetlight broken', 'service non delivery', 'water supply stopped'
    ]
  },
  {
    pattern: 'delay_no_response',
    name: 'Delay / No Response',
    keywords: ['pending', 'delay', 'delayed', 'weeks', 'months', 'ignoring', 'no response', 'waiting', 'slow'],
    phrases: ['pending for weeks', 'has been pending', 'no reply received', 'delay in processing', 'application pending']
  },
  {
    pattern: 'information_request',
    name: 'Information Request',
    keywords: ['information', 'rti', 'records', 'expenditure', 'budget', 'details', 'copies'],
    phrases: ['want information', 'seeking public records', 'certified copies', 'expenditure details']
  },
  {
    pattern: 'document_problem',
    name: 'Document / Certificate Withheld',
    keywords: ['certificate', 'degree', 'license', 'passport', 'receipt', 'noc', 'document'],
    phrases: ['refusing certificate', 'degree withheld', 'noc not issued', 'document pending', 'issue my certificate']
  }
];
