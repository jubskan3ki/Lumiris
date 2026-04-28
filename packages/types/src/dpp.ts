// Mirrors EU ESPR mandatory fields for textile & footwear.

export type AuditStatus = 'Draft' | 'Audit_Pending' | 'Flagged_Anomalies' | 'Published_Live' | 'Grade_E';

export type DurabilityGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E' | null;

export interface DPPRawData {
    product_name: string | null;
    material_composition: string | null;
    country_of_origin: string | null;
    manufacturer: string | null;
    recycled_content_percentage: number | null;
    water_usage_liters: number | null;
    carbon_footprint_kg: number | null;
    durability_score: DurabilityGrade;
    repairability_index: number | null;
    eu_compliance_version: string | null;
}

export interface DPPRecord {
    id: string;
    brand: string;
    productName: string;
    sku: string;
    status: AuditStatus;
    submittedAt: string;
    auditorId: string | null;
    dataIntegrity: number;
    missingFields: string[];
    supplierFactory: string;
    carbonScore: number | null;
    rawData: DPPRawData | Record<string, unknown>;
}

export type CertificateStatus = 'Valid' | 'Expired' | 'Pending_Review';

export interface Certificate {
    id: string;
    brand: string;
    documentName: string;
    type: string;
    organization: string;
    expiryDate: string;
    scope: string;
    factory: string;
    carbonScore: number | null;
    status: CertificateStatus;
    crossCheckFlag: boolean;
}

export interface AuditLogEntry {
    timestamp: string;
    auditorId: string;
    action: string;
    recordId: string;
    details: string;
}
