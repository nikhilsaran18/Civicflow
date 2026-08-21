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
    keywords: ['rti', 'right to information', 'public information officer', 'pio', 'inspection of records', 'work order records'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'cpgrams',
    title: 'CPGRAMS — Centralised Public Grievance Redress and Monitoring System',
    authority: 'Department of Administrative Reforms and Public Grievances (DARPG)',
    url: 'https://pgportal.gov.in',
    description: 'National portal for lodging grievances related to Central and State Ministries, pension, banking, and public services.',
    keywords: ['pension', 'father pension', 'old age pension', 'disbursement delay', 'epfo pension', 'jeevan pramaan'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'ugc-redressal-2023',
    title: 'UGC (Redressal of Grievances of Students) Regulations, 2023',
    authority: 'University Grants Commission (UGC)',
    url: 'https://www.ugc.gov.in',
    description: 'Strictly prohibits higher education institutions (colleges/universities) from retaining original student certificates or withholding marksheets.',
    keywords: ['college certificates', 'university certificates', 'withheld marksheets', 'degree withholding', 'ugc regulation', 'original certificates', 'transfer certificate withholding'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'municipal-acts',
    title: 'State Municipal Corporation & Urban Local Bodies Acts',
    authority: 'Ministry of Housing and Urban Affairs / State Urban Development Departments',
    url: 'https://mohua.gov.in',
    description: 'Mandates local municipal bodies to maintain street lighting, road repairs, sanitation, water supply, and public amenities.',
    keywords: ['street light', 'street lamp', 'public streetlight', 'pothole', 'municipal road', 'ward lighting', 'garbage collection', 'sewage leak'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'consumer-protection-2019',
    title: 'Consumer Protection Act, 2019',
    authority: 'Central Consumer Protection Authority (CCPA)',
    url: 'https://consumerhelpline.gov.in',
    description: 'Protects consumers against deficiency of service, defective products, misleading advertisements, and unfair trade practices.',
    keywords: ['defective product', 'warranty repair', 'e-commerce seller', 'deficiency of commercial service', 'commercial receipt', 'product defect'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'national-consumer-helpline',
    title: 'National Consumer Helpline (NCH - 1915)',
    authority: 'Department of Consumer Affairs',
    url: 'https://consumerhelpline.gov.in',
    description: 'Free pre-litigation grievance registration portal and toll-free helpline for consumer disputes.',
    keywords: ['consumer helpline', 'nch 1915', 'consumer complaint', 'commercial refund dispute'],
    lastChecked: '2026-08-01',
  },
  {
    id: 'rera-2016',
    title: 'Real Estate (Regulation and Development) Act, 2016 (RERA)',
    authority: 'State RERA Authorities',
    url: 'https://smartcities.gov.in',
    description: 'Protects home buyers against delayed possession, structural defects, and builder non-compliance.',
    keywords: ['real estate builder', 'flat possession', 'apartment developer', 'rera complaint'],
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
      // General governance / administrative remedy source
      return [
        {
          id: 'general-administrative-grievance',
          title: 'Administrative Representation & Public Grievance Navigation',
          authority: 'State & Central Public Administration Guidelines',
          url: 'https://pgportal.gov.in',
          relevance: 'Applicable for formal written representations and administrative grievance filings.',
          lastChecked: '2026-08-01',
        },
      ];
    }

    return matched.map(src => ({
      id: src.id,
      title: src.title,
      authority: src.authority,
      url: src.url,
      relevance: src.description,
      lastChecked: src.lastChecked,
    }));
  }
}

