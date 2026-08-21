import { CivicSource } from '../types/civicIntelligence';

export interface AuthoritativeSource {
  id: string;
  title: string;
  authority: string;
  url: string;
  description: string;
  keywords: string[];
  lastChecked: string;
}

export const AUTHORITATIVE_SOURCES: AuthoritativeSource[] = [
  {
    id: 'rti-2005',
    title: 'Right to Information Act, 2005 (Section 6 & Section 7)',
    authority: 'Government of India / Department of Personnel & Training',
    url: 'https://rtionline.gov.in',
    description: 'Empowers Indian citizens to request information from any public authority within 30 days.',
    keywords: ['rti', 'information', 'spending', 'fund', 'allocation', 'records', 'contractor', 'road', 'municipality', 'work order', 'delay'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'cpgrams',
    title: 'CPGRAMS — Centralised Public Grievance Redress and Monitoring System',
    authority: 'Department of Administrative Reforms and Public Grievances (DARPG)',
    url: 'https://pgportal.gov.in',
    description: 'National portal for lodging grievances related to Central and State Ministries, pension, banking, and public services.',
    keywords: ['pension', 'father pension', 'bank', 'passport', 'postal', 'central government', 'grievance', 'delay', 'provident fund', 'epfo'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'ugc-redressal-2023',
    title: 'UGC (Redressal of Grievances of Students) Regulations, 2023',
    authority: 'University Grants Commission (UGC)',
    url: 'https://www.ugc.gov.in',
    description: 'Strictly prohibits higher education institutions from retaining original student certificates or withholding fee refunds.',
    keywords: ['college', 'university', 'certificates', 'marksheet', 'original certificates', 'degree', 'admission', 'tc', 'transfer certificate', 'fees'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'municipal-acts',
    title: 'State Municipal Corporation & Urban Local Bodies Acts',
    authority: 'Ministry of Housing and Urban Affairs / State Urban Development Departments',
    url: 'https://mohua.gov.in',
    description: 'Mandates local municipal bodies to maintain street lighting, road repairs, sanitation, water supply, and public amenities.',
    keywords: ['street light', 'light', 'lamp', 'road', 'pothole', 'drainage', 'garbage', 'water supply', 'municipal', 'corporation', 'ward'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'consumer-protection-2019',
    title: 'Consumer Protection Act, 2019',
    authority: 'Central Consumer Protection Authority (CCPA) / District Consumer Commission',
    url: 'https://consumerhelpline.gov.in',
    description: 'Protects consumers against deficiency of service, defective products, misleading advertisements, and unfair trade practices.',
    keywords: ['product', 'defect', 'warranty', 'purchase', 'seller', 'e-commerce', 'refund', 'invoice', 'receipt', 'faulty item', 'phone', 'laptop', 'merchant', 'store'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'model-tenancy-act',
    title: 'Model Tenancy Act & State Rent Control Acts',
    authority: 'Ministry of Housing and Urban Affairs / State Rent Authorities',
    url: 'https://mohua.gov.in',
    description: 'Regulates tenant-landlord agreements, mandates refund of security deposits, and prohibits unlawful eviction.',
    keywords: ['landlord', 'tenant', 'rent', 'deposit', 'security deposit', 'lease', 'eviction', 'flat', 'apartment', 'house owner'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'payment-wages-1936',
    title: 'Payment of Wages Act, 1936 & Industrial Disputes Act, 1947',
    authority: 'Ministry of Labour & Employment / District Labour Commissioner',
    url: 'https://labour.gov.in',
    description: 'Protects employees against unauthorized salary withholding, delayed wage payments, and unlawful termination.',
    keywords: ['salary', 'wages', 'unpaid salary', 'employer', 'workplace', 'job', 'termination', 'provident fund', 'pf', 'gratuity', 'haven\'t paid', 'not paid me'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'patient-rights-charter',
    title: 'Charter of Patients\' Rights & Clinical Establishments Act, 2010',
    authority: 'National Human Rights Commission (NHRC) / Ministry of Health & Family Welfare',
    url: 'https://main.mohfw.gov.in',
    description: 'Guarantees emergency medical care without upfront payment, right to patient medical records, informed consent, and grievance redressal.',
    keywords: ['hospital', 'doctor', 'patient', 'medical', 'clinic', 'treatment', 'surgery', 'negligence', 'physician', 'medicine', 'health'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'rbi-integrated-ombudsman',
    title: 'Reserve Bank of India (RBI) Integrated Ombudsman Scheme, 2021',
    authority: 'Reserve Bank of India (RBI)',
    url: 'https://cms.rbi.org.in',
    description: 'Free grievance redressal mechanism for bank customers regarding unauthorized debits, ATM failures, loan disputes, and digital payment frauds.',
    keywords: ['bank', 'atm', 'unauthorized debit', 'credit card', 'loan', 'emi', 'branch', 'account frozen', 'upi transaction', 'banking'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'police-fir-rights',
    title: 'Code of Criminal Procedure (Section 154(3)) / BNSS (Section 175(3))',
    authority: 'Ministry of Home Affairs / State Police Complaints Authority',
    url: 'https://mha.gov.in',
    description: 'Empowers citizens to petition the Superintendent of Police / DCP or Magistrate when a local police station refuses to register an FIR for a cognizable offence.',
    keywords: ['police', 'fir', 'police station', 'sho', 'sp office', 'refused fir', 'crime', 'theft', 'harassment', 'constable'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'electricity-act-2003',
    title: 'Electricity Act, 2003 & Consumer Grievance Redressal Forum (CGRF) Regulations',
    authority: 'State Electricity Regulatory Commission (SERC) / DISCOM Ombudsman',
    url: 'https://powermin.gov.in',
    description: 'Statutory framework protecting electricity consumers against faulty metering, inflated bills, unscheduled outages, and delays in connection.',
    keywords: ['electricity', 'power', 'eb bill', 'meter', 'discom', 'transformer', 'voltage', 'power cut', 'outage'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'cybercrime-portal',
    title: 'National Cyber Crime Reporting Portal & IT Act, 2000',
    authority: 'Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs',
    url: 'https://cybercrime.gov.in',
    description: 'National portal and Helpline 1930 for reporting online financial frauds, account hacks, phishing, and digital identity theft.',
    keywords: ['cyber', 'scam', 'fraud', 'phishing', 'hacked', 'otp', 'upi fraud', 'telegram scam', 'online fraud'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'environment-act-1986',
    title: 'Environment (Protection) Act, 1986 & Noise Pollution Rules, 2000',
    authority: 'Central Pollution Control Board (CPCB) / State Pollution Control Boards',
    url: 'https://cpcb.nic.in',
    description: 'Statutory framework for redressing industrial effluent discharge, illegal garbage burning, toxic air pollution, and prohibited noise levels.',
    keywords: ['pollution', 'noise', 'smoke', 'toxic', 'effluent', 'garbage dumping', 'industrial waste', 'loudspeaker'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'national-consumer-helpline',
    title: 'National Consumer Helpline (NCH - 1915)',
    authority: 'Department of Consumer Affairs',
    url: 'https://consumerhelpline.gov.in',
    description: 'Free pre-litigation grievance registration portal and toll-free helpline for consumer disputes.',
    keywords: ['consumer', 'refund', 'service deficiency', 'bill', 'telecom', 'flight', 'booking'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'rera-2016',
    title: 'Real Estate (Regulation and Development) Act, 2016 (RERA)',
    authority: 'State RERA Authorities',
    url: 'https://smartcities.gov.in',
    description: 'Protects home buyers against delayed possession, structural defects, and builder non-compliance.',
    keywords: ['builder', 'flat', 'possession', 'real estate', 'apartment', 'housing', 'rera'],
    lastChecked: '2026-08-01',
  },
];

export class KnowledgeService {
  public static getRelevantSources(text: string): CivicSource[] {
    const lower = text.toLowerCase();
    const matched = AUTHORITATIVE_SOURCES.filter(src =>
      src.keywords.some(kw => lower.includes(kw))
    );

    if (matched.length === 0) {
      // Return general governance source
      return [
        {
          title: AUTHORITATIVE_SOURCES[0].title,
          authority: AUTHORITATIVE_SOURCES[0].authority,
          url: AUTHORITATIVE_SOURCES[0].url,
          relevance: 'Applicable for information requests and procedural transparency.',
          lastChecked: AUTHORITATIVE_SOURCES[0].lastChecked,
        },
      ];
    }

    return matched.map(src => ({
      title: src.title,
      authority: src.authority,
      url: src.url,
      relevance: src.description,
      lastChecked: src.lastChecked,
    }));
  }
}
