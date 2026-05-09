import type { CertificationKind, Material, Passport, ProductionStep } from '@lumiris/types';

export interface SimulatorChanges {
    addGotsCertOnFiber?: number;
    markInvoiceVerified?: boolean;
    addProductionStep?: boolean;
    fillCare?: boolean;
}

export function applySimulatorChanges(passport: Passport, changes: SimulatorChanges): Passport {
    let composition: readonly Material[] = passport.materials.map((m) => ({
        ...m,
        certifications: m.certifications.map((c) => ({ ...c })),
    }));

    if (changes.addGotsCertOnFiber !== undefined) {
        const idx = changes.addGotsCertOnFiber;
        if (composition[idx]) {
            composition = composition.map(
                (m, i): Material =>
                    i === idx
                        ? {
                              ...m,
                              certifications: [
                                  ...m.certifications,
                                  {
                                      id: `sim-gots-${Date.now()}`,
                                      kind: 'GOTS' as CertificationKind,
                                      issuer: 'Control Union (sim)',
                                      issuedAt: '2025-09-01',
                                      expiresAt: '2027-09-01',
                                      verified: true,
                                      fileUrl: 'simulated://gots',
                                      scope: `Fibre ${m.fiber} - simulation`,
                                  },
                              ],
                          }
                        : m,
            );
        }
    }

    if (changes.markInvoiceVerified) {
        composition = composition.map(
            (m): Material => ({
                ...m,
                certifications: m.certifications.map((c) => ({ ...c, verified: true })),
            }),
        );
    }

    let manufacturingSteps = passport.steps;
    if (changes.addProductionStep) {
        const newStep: ProductionStep = {
            id: `sim-step-${Date.now()}`,
            kind: 'assembly',
            label: 'Assemblage final (simulation)',
            performedBy: passport.artisanId,
            locationCity: 'Atelier',
            locationCountry: 'FR',
            photos: ['simulated://photo'],
            performedAt: '2026-04-29T10:00:00Z',
        };
        manufacturingSteps = [...passport.steps, newStep];
    }

    let care = passport.care;
    if (changes.fillCare) {
        care = {
            washing: 'Lavage à 30°C, programme délicat (simulation).',
            drying: 'Séchage à plat à l’ombre.',
            ironing: 'Repassage à basse température.',
            storage: 'Conserver à l’abri de la lumière directe.',
        };
    }

    return {
        ...passport,
        materials: composition,
        steps: manufacturingSteps,
        ...(care !== undefined ? { care } : {}),
    };
}
