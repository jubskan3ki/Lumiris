export interface MockTeamActivityEntry {
    user: string;
    role: string;
    action: string;
    time: string;
    avatar: string;
}

export const mockTeamActivity: MockTeamActivityEntry[] = [
    {
        user: 'Claire Dubois',
        role: 'Lead Auditor',
        action: 'Verified DPP-2024-003 and published to B2C layer',
        time: '12 min ago',
        avatar: 'CD',
    },
    {
        user: 'Maxime Laurent',
        role: 'Content Manager',
        action: 'Published article: How Transparency Builds Consumer Trust',
        time: '1h ago',
        avatar: 'ML',
    },
    {
        user: 'System',
        role: 'Automation',
        action: 'Certificate expiry alert sent for ISO 14001 (Nordic Textiles AB)',
        time: '2h ago',
        avatar: 'SY',
    },
    {
        user: 'Claire Dubois',
        role: 'Lead Auditor',
        action: 'Flagged DPP-2024-002 for missing carbon footprint data',
        time: '3h ago',
        avatar: 'CD',
    },
    {
        user: 'Maxime Laurent',
        role: 'Content Manager',
        action: 'Saved draft: Carbon Scoring Methodology',
        time: '5h ago',
        avatar: 'ML',
    },
];
