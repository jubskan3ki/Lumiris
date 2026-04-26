import type { JournalArticle } from '@lumiris/types';

export const mockJournalArticles: JournalArticle[] = [
    {
        id: 'ART-001',
        title: 'Understanding the EU ESPR: What Fashion Brands Need to Know',
        category: 'Regulation',
        status: 'Published',
        author: 'Claire Dubois',
        createdAt: '2024-12-10T08:00:00Z',
        updatedAt: '2024-12-12T14:30:00Z',
        excerpt:
            'A deep dive into the European Sustainability Product Regulation and its implications for the fashion industry.',
        readTime: '8 min',
    },
    {
        id: 'ART-002',
        title: 'How Transparency Builds Consumer Trust in 2025',
        category: 'Lifestyle',
        status: 'Published',
        author: 'Maxime Laurent',
        createdAt: '2024-12-08T10:15:00Z',
        updatedAt: '2024-12-08T10:15:00Z',
        excerpt:
            'Exploring the growing demand for supply chain visibility and how brands can leverage DPP data to connect with conscious consumers.',
        readTime: '5 min',
    },
    {
        id: 'ART-003',
        title: 'Inside Our Audit Process: From Raw Data to Published Passport',
        category: 'Audit',
        status: 'Draft',
        author: 'Claire Dubois',
        createdAt: '2024-12-14T09:00:00Z',
        updatedAt: '2024-12-15T11:22:00Z',
        excerpt:
            'A behind-the-scenes look at how LUMIRIS verifies supplier data, cross-checks certificates, and ensures compliance.',
        readTime: '12 min',
    },
    {
        id: 'ART-004',
        title: 'Carbon Scoring Methodology: Our Approach Explained',
        category: 'Sustainability',
        status: 'Draft',
        author: 'Maxime Laurent',
        createdAt: '2024-12-15T14:00:00Z',
        updatedAt: '2024-12-15T14:00:00Z',
        excerpt: 'Breaking down how carbon footprint scores are calculated and verified across the supply chain.',
        readTime: '10 min',
    },
    {
        id: 'ART-005',
        title: 'The Rise of Circular Fashion: Repair, Reuse, Recycle',
        category: 'Lifestyle',
        status: 'Scheduled',
        author: 'Claire Dubois',
        createdAt: '2024-12-13T16:45:00Z',
        updatedAt: '2024-12-14T09:10:00Z',
        excerpt: 'How the repairability index is changing the way consumers think about fashion longevity.',
        readTime: '6 min',
    },
];

export function mockJournalArticleById(id: string): JournalArticle | undefined {
    return mockJournalArticles.find((a) => a.id === id);
}
