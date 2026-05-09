/**
 * Annuaire fournisseurs partagé entre les étapes 5.2 (composition) et 5.3 (invoice).
 * En V5 backend, cette table sera servie par apps/api ; pour l'instant elle vit ici
 * (référencée par mockPassports / mockInvoices dans @lumiris/mock-data).
 */
interface SupplierRef {
    id: string;
    name: string;
    /** Pays ISO 3166-1 alpha-2. */
    country: string;
    fibers: readonly string[];
}

export const SUPPLIERS: readonly SupplierRef[] = [
    { id: 'sup-filature-bretagne', name: 'Filature de Bretagne', country: 'FR', fibers: ['linen'] },
    { id: 'sup-laine-arles', name: "Coopérative Laine d'Arles", country: 'FR', fibers: ['wool'] },
    { id: 'sup-soie-cevennes', name: 'Magnanerie des Cévennes', country: 'FR', fibers: ['silk'] },
    { id: 'sup-tannerie-roux', name: 'Tannerie Roux', country: 'FR', fibers: ['leather'] },
    {
        id: 'sup-coton-bio-belgique',
        name: 'BioCotton BV — Gent',
        country: 'BE',
        fibers: ['cotton', 'recycled-polyester'],
    },
    { id: 'sup-chanvre-allier', name: "Chanvre de l'Allier", country: 'FR', fibers: ['hemp'] },
    { id: 'sup-cachemire-mongolie', name: 'Mongolian Cashmere Coop', country: 'MN', fibers: ['cashmere'] },
    { id: 'sup-laine-tarn', name: 'Filature du Tarn', country: 'FR', fibers: ['wool'] },
];
