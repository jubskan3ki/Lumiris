# LUMIRIS | Cahier des charges v6.3

Le passeport numérique du textile artisanal français, et le scanner
universel des DPP européens.

---

## 1. Le projet

Aujourd'hui, quand un client achète un pull en laine, une chemise en
lin ou une paire de chaussures cousue main chez un artisan français,
il n'a aucun moyen simple de prouver l'origine, la provenance des
matières, le savoir-faire mis en œuvre. La marque dit "fait main",
"made in France", "laine de Lozère" personne ne contrôle, et le
client doit faire confiance.

Pendant ce temps, l'Europe prépare une révolution réglementaire. À
partir de 2026, tout produit textile vendu en Europe devra avoir un
Digital Product Passport (DPP) : composition, origine, conditions de
fabrication, fin de vie. Les vagues suivantes concerneront la tech,
l'électroménager, les meubles, les jouets. Les grandes marques s'y
préparent avec des cabinets de conseil et des PLM industriels. Les
TPE et PME artisanales, elles, n'ont ni les moyens ni les outils.

LUMIRIS comble ce vide.

LUMIRIS est une plateforme qui permet aux artisans de créer facilement
le passeport numérique de chacune de leurs pièces, et aux clients de
scanner n'importe quel DPP européen pour découvrir l'histoire complète
d'un produit et garder trace de ses achats.

**Stratégie en deux temps.** Le MVP B2B est focalisé sur le **textile
artisanal français** : c'est notre porte d'entrée, le segment le plus
mature réglementairement (acte délégué textile attendu en 2027) et le
plus en demande de valorisation. À long terme, ATELIER s'étend
naturellement aux autres secteurs concernés par l'ESPR (tech,
électroménager, mobilier, jouets) au fur et à mesure des actes
délégués.

Côté client, l'app **VISION est dès le départ universelle** : elle lit
tous les DPP européens (textile, tech, électroménager, mobilier,
batteries) peu importe le secteur. La **Garde-Robe** est elle aussi un
**inventaire global de consommation** dès le V0 : l'utilisateur y
centralise tous ses produits, scanne ce qu'il achète, joint ses
factures et garanties.

Pour l'artisan : un outil qui transforme son savoir-faire en preuve
vendable, et qui anticipe la conformité DPP avant qu'elle devienne
obligatoire.

Pour le client : la révélation de la valeur réelle d'une pièce qui
l'a faite, où, avec quelles matières, dans quelles conditions en un
scan. Et un coffre-fort numérique qui centralise toute sa
consommation, pas seulement le textile.

Objectif à cinq ans : devenir l'infrastructure DPP de référence pour
les TPE et PME artisanales européennes, en démarrant par le textile
français et en étendant progressivement à tous les secteurs concernés
par l'ESPR.

---

## 2. Le moment idéal

Trois forces convergent sur 2026-2030.

**La réglementation européenne ESPR.** Le registre central DPP ouvre
le 19 juillet 2026. L'acte délégué textile sera adopté en 2027, avec
application 18 mois plus tard (mi-2028 à début 2029). Les vagues
suivantes électronique, batteries, électroménager, meubles sont
échelonnées entre 2027 et 2030. À chaque échéance, tout produit
concerné vendu en Europe devra porter un DPP. Les TPE et micro-
entreprises sont exemptées de l'interdiction de destruction des
invendus, mais devront fournir le DPP au même titre que les grandes
marques.

**La loi AGEC en France.** Depuis 2023, les marques textiles
françaises ont des obligations d'étiquetage environnemental et de
traçabilité. L'écotaxe Refashion structure le marché de la fin de vie
depuis 2007.

**La défiance envers le marketing déclaratif.** "Made in France" est
devenu un terme galvaudé. Les clients premium veulent la **preuve**,
pas la promesse. Les artisans qui font vraiment du français complet
cherchent un moyen de le démontrer.

Entre 2026 et 2028, il existe une fenêtre où les artisans cherchent
une solution simple, où la réglementation pousse à la traçabilité, et
où les clients sont prêts à payer pour la preuve.

---

## 3. Les deux faces du produit

### LUMIRIS ATELIER | l'outil des artisans (B2B)

L'outil de création du passeport. L'artisan documente son travail
comme un journal de bord numérique : photos de l'atelier, scan des
factures fournisseurs, certificats artisanaux, étapes de production,
temps passé, signature numérique de la pièce.

Le passeport ainsi créé est conforme aux exigences ESPR : composition,
origine, traçabilité, fin de vie.

**Au démarrage, ATELIER est conçu pour les artisans textile français.**
Le formulaire de création, les catégories de matières, les
certifications proposées (GOTS, OEKO-TEX, Origine France Garantie),
le vocabulaire tout est calibré pour le textile. L'architecture de
la plateforme est conçue pour accueillir d'autres secteurs : il
suffira d'ajouter de nouveaux templates de passeport (cuir, bois,
électronique, etc.) au fur et à mesure des actes délégués ESPR.

Interface dans la direction artistique Prismatic Clarity : claire,
lumineuse, en mode atelier. Pensée pour des artisans qui n'ont pas de
temps à perdre dans des formulaires et qui veulent des outils simples
qui mettent en valeur leur travail.

### LUMIRIS VISION | l'application client (B2C, multi-secteurs)

Ce que voit le client. Il scanne l'étiquette QR ou la puce NFC d'une
pièce textile, d'un appareil électronique, d'un meuble ou de
n'importe quel produit doté d'un DPP, et l'histoire complète apparaît :
origine, composition, étapes de fabrication, certifications, note de
transparence.

VISION est conçue dès le départ comme un **scanner universel de DPP**.
Tant que le passeport respecte les standards GS1 Digital Link et ESPR,
VISION sait le lire et l'afficher. Ça permet à l'app d'avoir une
valeur immédiate pour le client, dans tous les secteurs concernés par
le DPP.

Le client peut aussi consulter sa **Garde-Robe**, qui est en réalité
un **inventaire global de consommation** : tous les produits qu'il
possède (textile, tech, électroménager, mobilier), leur histoire,
leurs garanties, les retoucheurs et réparateurs de confiance proches
de chez lui (voir section 6).

Interface claire et sensorielle, avec un effet de prisme au moment du
scan.

### LUMIRIS WEB | le site vitrine et la consultation publique

Site qui présente la mission, les artisans partenaires, et qui sert
aussi de moteur de consultation publique : n'importe qui peut chercher
un artisan ou une pièce, voir son passeport, sans installer
l'application.

---

## 4. La création d'un passeport (côté ATELIER)

L'artisan crée le DPP d'une pièce en suivant un parcours guidé.

**Identification de la pièce.** Type de produit, référence, photo
principale, dimensions, prix de vente.

**Composition matérielle.** Pour chaque matière : fibre, pourcentage,
fournisseur, origine géographique, certifications éventuelles (GOTS,
OEKO-TEX, Origine France Garantie, etc.).

**Le scan de facture comme accélérateur.** Quand l'artisan reçoit une
facture de son fournisseur, il la scanne dans l'application. Un OCR
extrait automatiquement les informations clés et pré-remplit une
amorce de passeport matière. L'artisan complète juste les champs
manuels.

**Étapes de fabrication.** L'artisan documente les grandes étapes :
tissage, teinture, coupe, couture, finitions. Pour chaque étape :
qui l'a réalisée, où, et idéalement quelques photos.

**Certifications et garanties.** L'artisan joint ses propres
certifications et précise sa garantie sur la pièce.

**Génération du QR code et du NFC.** Une fois validé, le passeport
reçoit un identifiant unique conforme aux standards GS1 Digital Link.
L'artisan peut imprimer l'étiquette QR ou intégrer une puce NFC.

---

## 5. La consultation d'un passeport (côté VISION)

Le client scanne le QR code ou approche son téléphone d'une étiquette
NFC. Peu importe le secteur : textile artisanal LUMIRIS, smartphone,
appareil électroménager, meuble tout DPP standard est lu.

**L'identité de la pièce** s'affiche en grand : type de produit, nom
de la marque ou de l'artisan, photo principale, score Iris (pour les
DPP LUMIRIS) ou score de transparence calculé à partir des données
DPP officielles (pour les autres).

**L'histoire de la pièce.** Pour les DPP LUMIRIS, une page dédiée
présente l'artisan (atelier, méthode, parcours, spécialités). Pour
les autres DPP, les informations standardisées du passeport sont
affichées dans la même mise en forme.

**La carte des matières et de la fabrication.** Un visuel
cartographique montre d'où viennent les matières premières, où se
sont faites les étapes de fabrication.

**Les certificats vérifiés et la facture éventuelle** sont listés.

**L'entretien et la garantie.** Comment laver, entretenir, conserver
la pièce. Quelles sont les garanties proposées par l'artisan ou la
marque.

**Les retoucheurs et réparateurs proches.** Si la pièce est textile et
a besoin d'une retouche, LUMIRIS propose une liste de retoucheurs et
couturiers de confiance proches du domicile du client. La fonction
s'étend à la réparation pour les autres secteurs (électronique,
meubles) à mesure que le réseau de partenaires se construit.

---

## 6. La Garde-Robe | inventaire global de consommation

Le client connecté constitue son **inventaire numérique global** dès
l'inscription. Cet espace centralise **tous ses produits**, peu importe
le secteur : vêtements, smartphones, électroménager, meubles, jouets,
batteries.

Pour chaque produit ajouté à l'inventaire, l'utilisateur a accès à :

- **Le passeport DPP** s'il existe (LUMIRIS ou autre source ESPR
  européenne).
- **L'historique d'entretien** ou de maintenance.
- **Les garanties** restantes.
- **Le réseau de réparateurs ou retoucheurs** locaux adaptés au type
  de produit.

### La surcouche documentaire utilisateur

Au-delà du DPP officiel, l'utilisateur peut **joindre lui-même des
documents personnels** à n'importe quel produit de son inventaire :

- **Sa facture d'achat** (PDF ou photo)
- **Son contrat d'assurance** ou la fiche d'extension de garantie
- **Sa garantie constructeur** ou ses bons de SAV
- **Ses tickets de caisse** pour les achats en magasin
- **Ses tickets de réparation** précédents
- **Toute autre pièce justificative** utile (notice, certificat de
  conformité, etc.)

Ces documents sont stockés de façon chiffrée et accessibles uniquement
à l'utilisateur. Quand il revend la pièce, fait jouer une garantie ou
déclare un sinistre, tout est centralisé au même endroit.

C'est une vraie valeur ajoutée pour les utilisateurs : aujourd'hui ces
documents traînent dans des tiroirs, des emails ou des photos floues
sur le téléphone. LUMIRIS les organise par produit, les conserve
durablement, et facilite leur réutilisation.

LUMIRIS propose aussi des **pièces équivalentes d'artisans français**
quand l'utilisateur scanne un vêtement de fast-fashion noté E. Cette
mise en avant fait partie de l'option payante ATELIER+ pour les
artisans qui veulent apparaître prioritairement dans les suggestions.

---

## 7. Le réseau de retoucheurs, couturiers et réparateurs

LUMIRIS référence des retoucheurs, couturiers, brodeurs et cordonniers
artisanaux. Quand un client a une pièce qui a besoin d'un ajustement,
l'app lui propose une liste filtrée par localisation et spécialité.

Sources de la base : annuaire CMA France, recommandations des artisans
ATELIER, retoucheurs labellisés inscrits via LUMIRIS Local.

Pour chaque retoucheur : distance, spécialités, certifications, note
moyenne donnée par les utilisateurs, délai moyen, fourchette de prix.

L'utilisateur prend contact directement depuis l'app. La mise en
relation alimente une commission versée par le retoucheur.

À long terme, le même mécanisme s'étendra aux **autres secteurs** :
réparateurs électronique, ébénistes pour les meubles, etc.

---

## 8. Le score Iris

Le score Iris note la transparence et la traçabilité d'une pièce sur
une échelle de A à E.

| Critère                     | Poids | Ce qu'on mesure                                                        |
| --------------------------- | ----- | ---------------------------------------------------------------------- |
| Transparence et traçabilité | 40%   | Origine prouvée des matières et étapes, qualité des justificatifs      |
| Savoir-faire et fabrication | 25%   | Part artisanale réelle, certifications du créateur, garanties offertes |
| Impact environnemental      | 25%   | Empreinte matières, distances de transport, fin de vie, écoconception  |
| Réparabilité et durabilité  | 10%   | Couture solide, accès aux retouches, disponibilité des matières        |

Règles non négociables :

- Une donnée non certifiée pèse deux fois moins dans le calcul.
- Si une information obligatoire selon AGEC ou ESPR est absente ou
  non vérifiable, la pièce est plafonnée à D.
- Un certificat expiré est traité comme un certificat inexistant.

Pour les DPP non-LUMIRIS lus par VISION (autres secteurs, autres
émetteurs), un **score équivalent** est calculé à partir des données
standardisées du passeport, en suivant la même grille adaptée au
secteur.

---

## 9. Stratégie de lancement

**Phase 1 (mois 0-6) : artisans textile pilotes.** Recrutement de 15 à
25 artisans pilotes via démarchage direct et partenariats avec les
chambres syndicales (CMA, INMA). Cible : créateurs déjà engagés sur
la traçabilité. Bêta fermée côté client. VISION fonctionne déjà comme
scanner DPP universel et la Garde-Robe inventaire global est
opérationnelle.

**Phase 2 (mois 6-12) : ouverture publique.** Lancement de l'app
VISION. Communication ciblée sur les médias mode-artisanat et les
salons. Lancement de la fonction surcouche documentaire utilisateur
(ajout factures, assurances, garanties par l'utilisateur). Objectif :
50 à 80 artisans ATELIER, 10 000 utilisateurs VISION.

**Phase 3 (mois 12-18) : densification textile.** Lancement ATELIER+.
Extension du réseau retoucheurs. Objectif : 120 à 150 artisans ATELIER,
25 000 utilisateurs VISION, 60 retoucheurs partenaires.

**Phase 4 (mois 18-30) : extension multi-secteurs B2B.** Ouverture
d'ATELIER aux artisans d'autres secteurs (cuir, maroquinerie, mobilier,
électronique réparable). Templates de passeport adaptés à chaque
filière. Cette phase suit le rythme des actes délégués ESPR.

**Niveau de passeport honnête plutôt que blocage.** Quand une pièce
est mal documentée, le passeport est noté avec une mention claire
("Passeport en cours de complétion"). Le client n'est jamais bloqué.

---

## 10. Modèle économique

LUMIRIS ne vend jamais de scores. Les revenus viennent de cinq lignes,
toutes en dehors de l'évaluation des passeports.

### LUMIRIS ATELIER (abonnement B2B)

Trois paliers selon la taille de l'atelier.

- **ATELIER Solo** (29 €/mois ou 290 €/an) : artisan seul, jusqu'à
  50 passeports actifs.
- **ATELIER Studio** (79 €/mois ou 790 €/an) : 2-5 personnes, jusqu'à
  300 passeports.
- **ATELIER Maison** (149 €/mois ou 1 490 €/an) : 6-20 personnes,
  passeports illimités.

Les paliers sont identiques quel que soit le secteur. L'extension
multi-secteurs n'introduit pas de pricing différencié, juste de
nouveaux templates de passeport.

### ATELIER+ (option payante)

Module complémentaire à 19 €/mois. Donne droit à la mise en avant
prioritaire dans VISION et à des statistiques détaillées.

### Affiliation à l'achat (B2C)

Quand un client achète une pièce d'artisan suggérée via l'app,
LUMIRIS perçoit une commission classique d'affiliation (3-7%). Le tri
des suggestions ne dépend jamais de la commission.

### Affiliation retouche et réparation (B2C)

Quand un client prend rendez-vous avec un retoucheur ou un réparateur
via LUMIRIS, le professionnel verse une commission de mise en relation
(forfait fixe 4-10 € ou pourcentage du devis accepté).

### LUMIRIS Local (B2B2C léger)

Abonnement pour les retoucheurs, couturiers et plus tard réparateurs
qui veulent un profil enrichi et la remontée prioritaire. Tarif :
19 €/mois ou 190 €/an.

### Règles absolues

- Aucun acteur ne peut payer pour modifier ou masquer son score Iris.
- L'algorithme de tri ne dépend jamais des commissions ni d'ATELIER+
  (mise en avant à score équivalent uniquement).
- L'utilisateur peut désactiver les liens d'affiliation.

---

## 11. Risques identifiés

**Greenwashing artisanal.** Un artisan qui surdéclare son "made in
France". Protection : équipe de vérification, croisement avec les
registres officiels (CMA, RCS), demande de factures fournisseurs,
déclarations sur l'honneur juridiquement opposables.

**Faible adoption B2B initiale.** Les artisans textile sont peu
digitalisés. Protection : interface volontairement simple, scan de
factures pour limiter la saisie, démo en présentiel pendant la phase
pilote, partenariats CMA et chambres syndicales.

**Conflit d'intérêts lié à ATELIER+.** Risque d'accusation que les
artisans qui paient apparaissent en premier. Protection : règle gravée
dans la charte (mise en avant à score équivalent uniquement),
algorithme de tri auditable.

**Concurrence des PLM industriels.** Ils ciblent les grands groupes,
pas les TPE. Protection : prix accessible, simplicité d'usage,
ancrage France-artisanat.

**Retard de l'acte délégué textile ESPR.** Si le calendrier glisse,
l'argument réglementaire perd en force. Protection : ne pas dépendre
uniquement du DPP, l'argument central reste la valorisation du
savoir-faire. La capacité de VISION à lire tout DPP préserve aussi la
valeur côté B2C.

**Complexité de l'extension multi-secteurs.** Chaque nouveau secteur
demande des templates spécifiques, des certifications différentes, et
une nouvelle base d'organismes à reconnaître. Protection : architecture
modulaire dès le départ, extension progressive secteur par secteur,
pas de bascule brutale.

---

## 12. Identité visuelle

Direction artistique unique pour tout l'écosystème : Prismatic Clarity.

VISION (application client). Claire et sensorielle. Effet de prisme
au moment du scan, animations fluides, mise en valeur des photos
d'atelier et des matières.

WEB (site vitrine). Même direction que VISION. Clair, lumineux, aéré.

ATELIER (outil interne des artisans). Même langage visuel clair et
lumineux mais en mode atelier. Densité d'information adaptée au
travail quotidien.

Couleurs du score Iris :

- A | Émeraude
- B | Cyan
- C | Ambre
- D | Orange
- E | Cramoisi

---

LUMIRIS · Cahier des Charges v6.3 · Confidentiel
