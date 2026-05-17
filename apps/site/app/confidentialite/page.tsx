import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Politique de confidentialité — LUMIRIS',
    description:
        'Données collectées, finalités, durée de conservation et droits RGPD pour les utilisateurs du site lumiris.fr. Version provisoire — à finaliser avant la mise en production publique.',
    alternates: { canonical: '/confidentialite' },
};

const LAST_REVIEWED = '2026-05-15';

export default function ConfidentialitePage() {
    return (
        <main className="bg-background min-h-screen pb-24 pt-28">
            <header className="mx-auto max-w-3xl px-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-grade-a h-6 w-6" aria-hidden="true" />
                    <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                        Politique de confidentialité
                    </h1>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                    Version provisoire — à finaliser avant la mise en production publique. Dernière revue&nbsp;:{' '}
                    <span className="text-foreground font-mono">
                        {new Date(LAST_REVIEWED).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                    .
                </p>
            </header>

            <section className="mx-auto mt-10 max-w-3xl space-y-8 px-6 text-sm leading-relaxed">
                <div>
                    <h2 className="text-foreground text-base font-semibold">Données collectées</h2>
                    <p className="text-muted-foreground mt-2">
                        Le site marketing ne demande aucun compte utilisateur et n&apos;utilise pas de cookie tiers à
                        des fins publicitaires. Seules des métriques Web Vitals anonymes (LCP, CLS, INP) sont remontées
                        pour suivre la qualité de service, sans identifiant personnel.
                    </p>
                </div>

                <div>
                    <h2 className="text-foreground text-base font-semibold">Finalités</h2>
                    <p className="text-muted-foreground mt-2">
                        Améliorer la qualité du site et détecter les régressions de performance. Aucune donnée
                        n&apos;est revendue ni partagée à des partenaires commerciaux. La liste exhaustive des
                        traitements RGPD sera publiée ici avant le lancement.
                    </p>
                </div>

                <div>
                    <h2 className="text-foreground text-base font-semibold">Droits RGPD</h2>
                    <p className="text-muted-foreground mt-2">
                        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
                        d&apos;effacement et d&apos;opposition au traitement de vos données personnelles. Pour exercer
                        ces droits, contactez&nbsp;:{' '}
                        <a
                            href="mailto:privacy@lumiris.fr"
                            className="text-foreground underline-offset-4 hover:underline"
                        >
                            privacy@lumiris.fr
                        </a>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="text-foreground text-base font-semibold">Cookies</h2>
                    <p className="text-muted-foreground mt-2">
                        Le site n&apos;utilise aucun cookie traceur, marketing ou analytique tiers. Si un dispositif de
                        mesure d&apos;audience est ajouté ultérieurement, un bandeau de consentement conforme aux
                        recommandations CNIL sera mis en place.
                    </p>
                </div>
            </section>
        </main>
    );
}
