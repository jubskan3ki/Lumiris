import type { RegulatoryItem } from '@lumiris/types';

export const mockRegulatoryItems: RegulatoryItem[] = [
    {
        id: 'REG-001',
        regulation: 'EU ESPR Digital Product Passport',
        region: 'European Union',
        effectiveDate: '2027-01-01',
        status: 'Active',
        impactLevel: 'High',
        summary:
            'Mandatory digital product passports for textiles and footwear. Requires full supply chain transparency, material composition, carbon footprint, and repairability data.',
    },
    {
        id: 'REG-002',
        regulation: 'French Anti-Waste Law (AGEC)',
        region: 'France',
        effectiveDate: '2025-01-01',
        status: 'Active',
        impactLevel: 'High',
        summary:
            'Prohibits destruction of unsold non-food goods. Requires traceability and environmental impact labeling for fashion products.',
    },
    {
        id: 'REG-003',
        regulation: 'EU Corporate Sustainability Due Diligence',
        region: 'European Union',
        effectiveDate: '2026-07-01',
        status: 'Pending',
        impactLevel: 'High',
        summary:
            'Large companies must identify, prevent, and mitigate adverse human rights and environmental impacts throughout their value chains.',
    },
    {
        id: 'REG-004',
        regulation: 'UK Extended Producer Responsibility',
        region: 'United Kingdom',
        effectiveDate: '2027-04-01',
        status: 'Draft',
        impactLevel: 'Medium',
        summary:
            'Proposed textile EPR scheme requiring producers to fund end-of-life management and recycling infrastructure for textile products.',
    },
    {
        id: 'REG-005',
        regulation: 'German Supply Chain Due Diligence Act',
        region: 'Germany',
        effectiveDate: '2024-01-01',
        status: 'Active',
        impactLevel: 'Medium',
        summary:
            'Companies with 1000+ employees must ensure human rights and environmental standards across supply chains with mandatory reporting.',
    },
];
