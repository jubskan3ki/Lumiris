import type { AuditLogEntry } from '@lumiris/types';

export const mockAuditLog: AuditLogEntry[] = [
    {
        timestamp: '2024-12-15T16:45:12Z',
        auditorId: 'AUD-001',
        action: 'Verified Carbon Proof',
        recordId: 'DPP-2024-003',
        details: 'Carbon footprint documentation verified against ISO 14064-1 standards.',
    },
    {
        timestamp: '2024-12-15T15:30:00Z',
        auditorId: 'AUD-003',
        action: 'Flagged Anomaly',
        recordId: 'DPP-2024-002',
        details: 'Missing critical EU mandatory fields: carbon_footprint_kg, repairability_index, durability_score.',
    },
    {
        timestamp: '2024-12-15T14:12:33Z',
        auditorId: 'AUD-002',
        action: 'Published DPP',
        recordId: 'DPP-2024-005',
        details: 'All mandatory fields verified. DPP published to B2C consumer access layer.',
    },
    {
        timestamp: '2024-12-15T12:05:47Z',
        auditorId: 'AUD-001',
        action: 'Grade E Assigned',
        recordId: 'DPP-2024-006',
        details: '7 mandatory EU fields missing. Auto-graded E. Supplier notification sent.',
    },
    {
        timestamp: '2024-12-15T10:22:19Z',
        auditorId: 'SYSTEM',
        action: 'Certificate Expiry Alert',
        recordId: 'CERT-002',
        details: 'ISO 14001 certification for Nordic Textiles AB expired on 2024-12-31.',
    },
    {
        timestamp: '2024-12-15T09:15:00Z',
        auditorId: 'AUD-002',
        action: 'Cross-Check Flag',
        recordId: 'CERT-004',
        details:
            'EcoWeave Portugal Lda reports carbon score 3.8 (Lux Fabrica) vs 1.8 (Verde Collective). Discrepancy flagged.',
    },
    {
        timestamp: '2024-12-14T17:33:41Z',
        auditorId: 'AUD-001',
        action: 'Initiated Audit',
        recordId: 'DPP-2024-001',
        details: 'Audit workflow started for Maison Lumiere Silk Draped Blazer.',
    },
    {
        timestamp: '2024-12-14T16:10:55Z',
        auditorId: 'SYSTEM',
        action: 'New Submission',
        recordId: 'DPP-2024-004',
        details: 'Draft DPP received from Maison Lumiere. Data integrity: 34%.',
    },
];
