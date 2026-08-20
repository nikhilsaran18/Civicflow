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
    authority: 'Central Consumer Protection Authority (CCPA)',
    url: 'https://consumerhelpline.gov.in',
    description: 'Protects consumers against deficiency of service, defective products, misleading advertisements, and unfair trade practices.',
    keywords: ['product', 'defect', 'warranty', 'purchase', 'seller', 'e-commerce', 'refund', 'invoice', 'receipt', 'faulty item'],
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
