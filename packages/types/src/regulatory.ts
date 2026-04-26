export type RegulatoryStatus = 'Active' | 'Pending' | 'Draft';
export type RegulatoryImpact = 'High' | 'Medium' | 'Low';

export interface RegulatoryItem {
    id: string;
    regulation: string;
    region: string;
    effectiveDate: string;
    status: RegulatoryStatus;
    impactLevel: RegulatoryImpact;
    summary: string;
}
