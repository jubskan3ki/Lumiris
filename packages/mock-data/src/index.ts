/**
 * LUMIRIS Mock Data — pure fixtures, typed against `@lumiris/types`.
 * Admin demos, web journals, and the mobile reveal share the same SKUs so the
 * cross-surface story stays consistent.
 */

export { mockDpps, mockDppById, mockDppBySku } from './dpp';
export { mockCertificates, mockCertificatesByFactory } from './certificates';
export { mockAuditLog } from './audit-log';
export { mockJournalArticles, mockJournalArticleById } from './journal';
export { mockRegulatoryItems } from './regulatory';
export { mockTeamActivity, type MockTeamActivityEntry } from './team';
export { mockKpi, type MockKpi } from './kpi';
export {
    mockProducts,
    mockProductById,
    mockProductDpp,
    sampleProduct,
    type MockProduct,
    type ProductCategory,
    type PriceGradeRatio,
    type ProductCompositionPart,
    type ProductEnvironmentalStat,
    type ProductJourneyStep,
    type ProductCertificate,
} from './products';
