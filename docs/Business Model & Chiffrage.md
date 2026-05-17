# LUMIRIS | Business Model & Chiffrage

Compétence visée : structurer un modèle économique, estimer CAC et
ARPU, défendre un pricing, démontrer la viabilité.

---

## 1. L'équipe

| Rôle                         | Responsabilités principales                                |
| ---------------------------- | ---------------------------------------------------------- |
| Chef de projet / fullstack   | Pilotage produit, animation réseau artisans, dev fullstack |
| Développeur back-end         | API, OCR factures, intégration GS1/DPP                     |
| DevOps                       | Infra cloud, CI/CD, monitoring, sécurité                   |
| Design & marketing front-end | UI app + site, identité, acquisition, communication        |

Quatre profils complémentaires couvrant produit, back, infra, front
et marketing.

---

## 2. Modèle économique

LUMIRIS combine **deux faces complémentaires** (ATELIER pour les
artisans textile, VISION pour les clients tous secteurs) avec **cinq
lignes de revenus** qui ne touchent jamais à l'évaluation des
passeports.

| Ligne                           | Type             | Cible                                     | Modèle                        |
| ------------------------------- | ---------------- | ----------------------------------------- | ----------------------------- |
| ATELIER Solo / Studio / Maison  | B2B abonnement   | Artisans textile (V1) puis multi-secteurs | 29 / 79 / 149 €/mois          |
| ATELIER+ (option)               | B2B add-on       | Artisans abonnés ATELIER                  | 19 €/mois ou 190 €/an         |
| Affiliation à l'achat           | B2C → artisan    | Tous utilisateurs                         | Commission 3-7% du panier     |
| Affiliation retouche/réparation | B2C → pro        | Utilisateurs avec compte                  | Forfait 4-10 € ou 8% du devis |
| LUMIRIS Local                   | B2B2C abonnement | Retoucheurs, couturiers, réparateurs      | 19 €/mois ou 190 €/an         |

**Règle non négociable** : aucun acteur ne peut payer pour modifier,
masquer ou améliorer son score Iris.

---

## 3. Charges complètes | phase de lancement (mois 0-18)

Hypothèse : amorçage ~150 k€ + revenus précoces. Salaires fondateurs
très modestes au démarrage, montée progressive.

| Poste                        | Détail                                          | Mois 0-5     | Mois 6-11     | Mois 12-18    |
| ---------------------------- | ----------------------------------------------- | ------------ | ------------- | ------------- |
| Salaires fondateurs (×4)     | 0 puis 1 200 net puis 1 800 net par mois        | 0 €          | ~7 200 €      | ~10 800 €     |
| Infrastructure cloud         | Hébergement, DB, OCR, stockage médias           | 150 €        | 350 €         | 700 €         |
| Outils & SaaS                | GitHub, Notion, Sentry, Stripe                  | 200 €        | 350 €         | 500 €         |
| Marketing & acquisition B2C  | Paid social, presse, contenus                   | 500 €        | 1 500 €       | 3 000 €       |
| Animation réseau B2B         | Démarchage artisans, salons CMA, INMA, contenus | 800 €        | 1 800 €       | 2 500 €       |
| Frais légaux & RGPD          | Création société, CGU, DPO mutualisé            | 400 €        | 500 €         | 600 €         |
| Comptabilité & assurance     | Cabinet comptable, RC pro                       | 250 €        | 350 €         | 400 €         |
| Bureau & frais généraux      | Coworking 4 postes, déplacements                | 400 €        | 800 €         | 1 200 €       |
| **Total charges mensuelles** |                                                 | **~2 700 €** | **~12 850 €** | **~19 700 €** |

**Charges cumulées sur 18 mois : environ 235 k€.**

Modèle compatible avec un amorçage modeste : 150-180 k€ via
subventions, prêts d'honneur et family & friends + autofinancement
progressif via revenus précoces ATELIER (qui rentrent dès le mois 3-4).

---

## 4. CAC | Coût d'Acquisition Client

Trois CAC distincts à isoler.

### CAC artisan ATELIER (B2B)

- Canaux : démarchage direct par le chef de projet, salons (Maison &
  Objet, Made in France Première Vision, Salons des Métiers d'Art),
  partenariats CMA, INMA, contenu LinkedIn et presse spécialisée.
- Budget cumulé sur 18 mois : ~25 000 €.
- Objectif : 130 artisans abonnés à 18 mois.
- **CAC artisan ≈ 190 € par artisan signé**, raisonnable pour un B2B
  avec un ARPU de 440 €/an.

### CAC utilisateur VISION (B2C)

- Canaux : paid social, presse mode-artisanat, partenariats créateurs,
  bouche-à-oreille, ASO, RP autour du DPP textile et de la Garde-Robe
  multi-secteurs.
- Budget cumulé sur 18 mois : ~25 000 €.
- Objectif : **25 000 utilisateurs actifs** France à 18 mois.
- **CAC B2C ≈ 1,00 € par utilisateur**, prudent vu l'absence de
  notoriété initiale.

### CAC LUMIRIS Local (retoucheurs)

- Canaux : démarchage direct, partenariats CMA.
- Budget cumulé : ~3 500 €.
- Objectif : 60 retoucheurs à 18 mois.
- **CAC Local ≈ 60 € par retoucheur signé**.

---

## 5. ARPU | Revenu moyen par segment

| Segment                  | ARPU annuel par actif                       |
| ------------------------ | ------------------------------------------- |
| Utilisateur sans compte  | ~2,00 €/an (affiliation occasionnelle)      |
| Utilisateur avec compte  | ~3,80 €/an (affiliation achat + retouche)   |
| Artisan ATELIER Solo     | 290 €/an + ~50 € d'affiliation = ~340 €/an  |
| Artisan ATELIER Studio   | 790 €/an + ~150 € d'affiliation = ~940 €/an |
| Abonné ATELIER+          | +190 €/an supplémentaires                   |
| Retoucheur LUMIRIS Local | 190 €/an + ~40 € d'affiliation = ~230 €/an  |

---

## 6. LTV et règle d'or LTV ≥ 3 × CAC

| Segment                 | ARPU annuel | Durée de vie | LTV     | CAC    | Ratio LTV/CAC |
| ----------------------- | ----------- | ------------ | ------- | ------ | ------------- |
| Utilisateur sans compte | 2,00 €      | 2 ans        | 4,00 €  | 1,00 € | **4×** ✅     |
| Utilisateur avec compte | 3,80 €      | 3 ans        | 11,40 € | 1,00 € | **11×** ✅    |
| Artisan ATELIER Solo    | 340 €       | 3 ans        | 1 020 € | 190 €  | **5×** ✅     |
| Artisan ATELIER Studio  | 940 €       | 4 ans        | 3 760 € | 190 €  | **20×** ✅    |
| Retoucheur Local        | 230 €       | 3 ans        | 690 €   | 60 €   | **11×** ✅    |

Tous les ratios respectent la règle des 3×. Modèle viable même en
stress-test à -30%.

---

## 7. Pricing | structure et justification

| Tier                         | Prix                     | Inclus                                                                          |
| ---------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| VISION sans compte           | 0 €                      | Scan illimité de tous DPP européens, score Iris, marketplace curatée            |
| VISION avec compte           | 0 €                      | Tout + Garde-Robe inventaire global, surcouche documentaire, retoucheurs locaux |
| ATELIER Solo                 | 29 €/mois ou 290 €/an    | 1 artisan, 50 passeports actifs                                                 |
| ATELIER Studio               | 79 €/mois ou 790 €/an    | 2-5 personnes, 300 passeports                                                   |
| ATELIER Maison               | 149 €/mois ou 1 490 €/an | 6-20 personnes, illimité                                                        |
| ATELIER+ option              | 19 €/mois ou 190 €/an    | Mise en avant prioritaire dans VISION, statistiques avancées                    |
| LUMIRIS Local                | 19 €/mois ou 190 €/an    | Profil enrichi, badge partenaire, remontée prioritaire                          |
| Affiliation artisan/marchand | 0 € côté user            | Commission 3-7% côté vendeur                                                    |
| Affiliation retouche/répa    | 0 € côté user            | Forfait 4-10 € ou 8% du devis côté pro                                          |

### Justifications

**ATELIER Solo à 290 €/an** se positionne très accessible. Largement
sous les solutions DPP industrielles (TextileGenesis, Crystalchain :
5 000 à 50 000 €/an). Pricing identique pour tous les secteurs lors
de l'extension multi-secteurs en V2.

**ATELIER Studio à 790 €/an** vise les studios DNVB en croissance.

**Affiliation à 5% moyen** est inférieur à Etsy (6,5% + frais fixes).

**LUMIRIS Local à 190 €/an** se cale très en dessous des plateformes
existantes type Stootie (commission 25%).

---

## 8. EBITDA simplifié | démonstration de viabilité

### Trajectoire revenus annualisés

| Échéance | Artisans ATELIER | Affiliation B2C | Retoucheurs Local | Revenus annualisés |
| -------- | ---------------- | --------------- | ----------------- | ------------------ |
| Mois 6   | 25 (~9 k€)       | ~3 k€           | 8 (~1,5 k€)       | ~13 k€             |
| Mois 12  | 70 (~30 k€)      | ~30 k€          | 30 (~6 k€)        | ~66 k€             |
| Mois 18  | 130 (~64 k€)     | ~95 k€          | 60 (~11 k€)       | **~170 k€**        |
| Mois 24  | 250 (~125 k€)    | ~225 k€         | 120 (~23 k€)      | ~400 k€            |
| Mois 36  | 550 (~290 k€)    | ~600 k€         | 250 (~48 k€)      | ~1 M€              |

### Charges et EBITDA

| Échéance | Revenus annualisés | Charges annualisées | EBITDA    |
| -------- | ------------------ | ------------------- | --------- |
| Mois 12  | ~66 k€             | ~155 k€             | ~ −90 k€  |
| Mois 18  | ~170 k€            | ~235 k€             | ~ −65 k€  |
| Mois 24  | ~400 k€            | ~340 k€             | ~ +60 k€  |
| Mois 36  | ~1 M€              | ~600 k€             | ~ +400 k€ |

**Point mort atteint vers le mois 22-24.** Le modèle devient rentable
quand la base ATELIER atteint ~200 abonnés et VISION ~50 000
utilisateurs actifs. Plus prudent que les projections initiales mais
défendable.

### Stress-test (hypothèse pessimiste)

Si on rate 30% des objectifs B2B et qu'on divise par 1,5 les volumes
B2C :

- Revenus mois 18 ≈ 105 k€
- Charges réduites à ~190 k€ (gel d'embauches, marketing rogné)
- EBITDA ≈ −85 k€

Couvert par le runway initial. Point mort décalé au mois 28-30.

---

## 9. Plan de financement

### Amorçage : 150-180 k€ au mois 0

| Source                             | Montant cible | Conditions                               |
| ---------------------------------- | ------------- | ---------------------------------------- |
| Bourse French Tech Émergence (BPI) | 30 000 €      | Subvention non dilutive, projet innovant |
| Concours i-Lab / Pépite            | 15 000 €      | Subvention non dilutive                  |
| Aide INMA / Métiers d'Art          | 10 000 €      | Subvention secteur artisanat             |
| Prêt d'honneur Réseau Entreprendre | 50 000 €      | Prêt 0% sur l'équipe                     |
| Family & friends                   | 50 000 €      | SAFE ou equity, conditions amicales      |
| **Total**                          | **155 000 €** |                                          |

### Affectation des fonds

| Poste                         | Montant  | Rationale                            |
| ----------------------------- | -------- | ------------------------------------ |
| Salaires équipe 18 mois       | 95 000 € | 60% modeste, montée progressive      |
| Marketing & acquisition B2C   | 25 000 € | Construction de la base utilisateurs |
| Animation réseau B2B artisans | 25 000 € | Démarchage, salons, partenariats     |
| Infra & outils                | 15 000 € | Hosting, OCR, médias                 |
| Légal & comptable             | 10 000 € | Société, contrats, RGPD              |
| Réserve                       | 5 000 €  | Imprévus                             |

### Levée Seed envisagée

Au mois 18, sur la base d'une traction prouvée (130+ artisans, 25k+
utilisateurs, MRR récurrent), tour Seed à viser : **400 à 700 k€**
auprès de business angels et fonds early-stage spécialisés mode-impact.
Objectif : passer le point mort sereinement et préparer l'expansion
multi-secteurs.

---

## 10. Pourquoi ce modèle convainc

Quatre arguments à défendre à l'oral.

**Une fenêtre réglementaire précise et inéluctable.** Le registre
central DPP ouvre le 19 juillet 2026. L'acte délégué textile entre en
application mi-2028. Les vagues suivantes (électronique, électroménager,
mobilier) arrivent entre 2027 et 2030. LUMIRIS se positionne sur 24 à
30 mois pour s'imposer comme la solution naturelle des TPE et PME
artisanales sur le textile, puis étend méthodiquement aux autres
secteurs.

**Cinq revenus indépendants qui se renforcent.** ATELIER pour le
récurrent prévisible, ATELIER+ pour l'upsell, l'affiliation pour le
scale, Local pour les retoucheurs.

**LTV/CAC supérieur à 3× sur tous les segments.** Le B2B artisan est
particulièrement solide.

**Un positionnement défendable et une vision long terme.** Aucun
concurrent DPP ne s'adresse aux TPE artisanales avec une UX simple et
un prix accessible. VISION universelle dès le V0 et la Garde-Robe
multi-secteurs donnent une valeur immédiate côté B2C, indépendamment
du périmètre B2B textile.

---

LUMIRIS · Business Model & Chiffrage · MT5 HETIC 2025-26
