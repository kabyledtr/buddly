# Buddly

> **Swipez, Matchez, Sortez !** Buddly trouve la sortie qui plaît à tout votre groupe d'amis.

🔗 **Site en ligne : [buddly.io](https://buddly.io)**

Projet réalisé pendant la **FounderRace**, du samedi 21 novembre 2026 à 09:00 au dimanche 22 novembre 2026 à 09:00 (heure de Paris).
Thème de la saison : **Intelligence artificielle**. Sous-thème de l'édition : **Relation humaine**.

---

## Le problème

Organiser une sortie entre amis tourne vite à la galère. La conversation de groupe s'étire sur des dizaines de messages et personne ne tranche (« je sais pas, comme vous voulez »). Il faut composer avec le budget de l'un, le régime alimentaire de l'autre, celui qui habite loin et celle qui n'est libre que le samedi. Au final, la sortie est repoussée, puis annulée, ou alors le groupe retourne toujours au même endroit.

**Pour qui ?** Les groupes d'amis de 18 à 30 ans, en ville (étudiants, jeunes actifs), qui sortent régulièrement (restos, bars, activités) et organisent tout dans une conversation de groupe.

## La solution

Buddly est une application web (SaaS) qui simplifie l'organisation des sorties entre amis :

1. **Créer une sortie en 3 questions** : quand, où, ce qui tente le groupe et le budget. Buddly trouve de vrais restos, bars et activités ouverts sur ce créneau (Google Places), plus les ateliers du jour (Tavily).
2. **Partager le lien** : les amis rejoignent depuis leur téléphone, sans application ni mot de passe, avec leurs envies et leur budget.
3. **Swiper** : chacun vote oui ou non sur les mêmes lieux, de son côté.
4. **Le match** : un lieu aimé par tout le monde est un match. Sinon, le classement équilibre votes, envies et budgets, et l'IA (« le mot de Bud », Claude) recommande le meilleur compromis pour tout le groupe.

**Fonctionnalité essentielle :** le swipe de groupe avec matching. Une vidéo de démo est visible dès la page d'accueil, et l'application est utilisable gratuitement sur [buddly.io/app](https://buddly.io/app).

## Modèle économique

Freemium avec paywall, uniquement des paiements uniques (aucun abonnement) :

| Offre | Prix | Contenu |
|---|---|---|
| Gratuit | 0 € | 2 personnes par sortie, 10 lieux + 1 atelier du jour, le meilleur lieu et le conseil IA de Bud |
| Pass Sortie | 2,99 € par sortie | 4 personnes, 15 lieux + 3 ateliers du jour, tous les résultats |
| **Buddly+** | **3,99 €, à vie** | Toutes les sorties, 15 personnes, 40 lieux + tous les ateliers du jour, tous les résultats, plan B de Bud, relance par e-mail des retardataires |

Le Pass Sortie sert de prix d'ancrage : pour 1 € de plus, Buddly+ débloque toutes les sorties à vie (« divisé par une bande de 6, ça fait 67 centimes chacun »). Buddly+ est rattaché à l'adresse e-mail de l'acheteur, sans mot de passe.

Paiement via **Stripe Checkout** (outil partenaire de la FounderRace).

---

## Transparence et respect du règlement

Cette section détaille tout ce qui n'a pas été écrit par l'équipe pendant la course, pour se conformer au règlement de la FounderRace.

### Boilerplate utilisé

Le projet part du **boilerplate public officiel de Next.js, `create-next-app`**. Il a été généré **après le départ**, le 21 novembre 2026, puis ajouté au dépôt par un commit séparé :

| Commit | Date (Paris) | Contenu |
|---|---|---|
| `af35b00` *Initial commit from Create Next App* | 21/11/2026 10:40 | Boilerplate brut, non modifié |
| `314485e` | 21/11/2026 10:42 | Premier code de l'équipe : landing page Buddly |

Commande exacte utilisée :

```bash
npx create-next-app@15 . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm --turbopack
```

**Ce que le boilerplate fournit** (fichiers de configuration uniquement) : `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, ainsi qu'une page d'exemple Next.js et des icônes SVG d'exemple.

**Ce que l'équipe a remplacé ou supprimé** : la page d'exemple (`app/page.tsx`), la mise en page (`app/layout.tsx`), les styles (`app/globals.css`), ce README, le favicon et les icônes SVG d'exemple de `public/`. Ces éléments ont été remplacés par le code de Buddly ou supprimés.

Le détail exact de chaque modification est visible dans l'historique Git, en comparant le commit `af35b00` au reste de l'historique.

### Code produit pendant la course

Tout le code applicatif a été écrit pendant la course (80 commits entre le 21/11 à 10h40 et l'arrivée) :

- la landing page (`app/page.tsx`, `app/Hero.tsx`, animations, vidéo de démo, tarifs, FAQ) ;
- l'application : création de sortie en 3 étapes (`app/app/`), sortie partagée, swipe, résultats et paywall (`app/g/[id]/`) ;
- les API : création et partage de sortie, votes, recherche de lieux, conseil IA, cinémas, ateliers du jour, paiements Stripe et webhook, relance (`app/api/`) ;
- la logique métier : recherche Google Places, classement du groupe, offres, paiements, API Conversions (`lib/`) ;
- les pages de contenu et le référencement : guides, pages villes, sitemap, robots, données structurées (`app/idees/`, `app/sortie-entre-amis/`, `lib/seo.ts`) ;
- les pages légales (`app/mentions-legales/`, `app/cgv/`).

Aucun code, aucune maquette et aucun contenu n'a été produit avant le départ. Aucun projet existant n'a été repris. Le dépôt GitHub a été créé le jour de la course.

### Outils d'IA

L'équipe a développé avec l'aide d'un assistant de code IA (**Claude Code**). Le règlement autorise les outils d'IA.

### Ressources tierces

- **Polices** : Fredoka et DM Sans (Google Fonts), hébergées dans le projet (`app/fonts`), sous licence SIL Open Font License.
- **Logo, mascotte Bud et visuels** (`public/logo.png`, `public/pet*.png`, icônes de l'app) : réalisés pendant la course pour Buddly.
- **Vidéo de démo** (`public/demo.mp4`, `public/demo.webm`) et **captures de téléphone** (`public/phone-*.webp`) : réalisées pendant la course à partir de l'application.
- **Démo interactive** (`app/SwipeDemo.tsx`, affichée si la vidéo est absente) : les lieux qu'elle montre (noms, quartiers, prix) sont fictifs et servent uniquement d'illustration.
- **Données des lieux** : Google Places (photos, notes, avis) et OpenStreetMap (© contributeurs OSM, ODbL) ; elles appartiennent à leurs sources.

### Outils partenaires FounderRace

- **Stripe** : paiement du Pass Sortie et de Buddly+ (Stripe Checkout).
- **Tavily** : recherche web des séances de cinéma du jour et des ateliers datés (poterie, cuisine, dégustation…) publiés sur les sites d'ateliers.

---

## L'application (MVP)

1. **Créer une sortie** (`/app`) : prénom, quartier ou position, distance, envies, budget. Buddly récupère de vrais lieux autour du point de rendez-vous.
2. **Inviter** : un lien `/g/<id>` à partager (WhatsApp, etc.). Les amis rejoignent sans mot de passe (prénom + e-mail), avec leurs envies et leur budget.
3. **Swiper** : chacun vote oui / non sur les mêmes adresses. Les résultats se mettent à jour en direct.
4. **Matching** : un lieu aimé par tout le monde est un match. Sinon, un score combine les votes, les envies et le budget de chacun, puis la distance.
5. **Le mot de Bud (IA)** : un modèle Claude (Anthropic) explique quel lieu choisir et pourquoi, à partir des votes et des préférences du groupe.
6. **Paywall** : **Pass Sortie à 2,99 €** (une sortie) ou **Buddly+ à 3,99 € à vie** (toutes les sorties liées à l'e-mail), paiements uniques via Stripe Checkout.
7. **Relance (Buddly+)** : un bouton relance les amis qui n'ont pas fini de swiper, par e-mail si Resend est configuré, sinon par un message WhatsApp prêt à envoyer.
8. **Ateliers du jour** : Tavily cherche les ateliers datés du jour de la sortie, Claude les extrait, Google Places retrouve le vrai lieu ; ils arrivent en bonus dans le deck (1 / 3 / 5 selon l'offre).
9. **Plan B (Buddly+)** : Bud tranche les égalités et propose une solution de repli.
10. **Guides et référencement** : 8 guides de sorties et 12 pages villes (`/idees`, `/sortie-entre-amis/<ville>`), sitemap et données structurées.
11. **Mesure d'audience** : pixels Meta et TikTok et API Conversions de Meta, chargés **uniquement après accord** du visiteur (bandeau de consentement).

### Sources de données
- Lieux : Google Places (photos, notes, avis, horaires ; seuls les lieux ouverts sur le créneau choisi et bien notés sont proposés). Secours : Geoapify, Nominatim puis Overpass (OpenStreetMap, © contributeurs OSM, ODbL).
- Cinémas et ateliers du jour : recherche web via Tavily, puis extraction structurée par Claude.
- Stockage : Upstash Redis (intégration Vercel). En local sans configuration, stockage en mémoire.

### Variables d'environnement
| Variable | Rôle |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (posées automatiquement par l'intégration Vercel) |
| `STRIPE_SECRET_KEY` | Paiement du Pass Sortie et de Buddly+ |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe (`/api/stripe/webhook`) : active l'achat même si l'acheteur ferme l'onglet avant de revenir |
| `META_CAPI_TOKEN` | API Conversions de Meta : Prospect et Achat envoyés par le serveur (seulement avec le consentement du visiteur) |
| `RESEND_API_KEY` | Relance des retardataires par e-mail (Buddly+), expéditeur `bud@buddly.io` |
| `ANTHROPIC_API_KEY` | « Le mot de Bud » (sinon texte calculé) |
| `GOOGLE_MAPS_API_KEY` | Google Places (New) : photos, notes, avis, horaires d'ouverture, autocomplétion d'adresse |
| `TAVILY_API_KEY` | Films à l'affiche dans un cinéma précis (recherche web, outil partenaire) |
| `GEOAPIFY_KEY` | Source de lieux de secours (optionnelle) |

## Stack technique

- [Next.js 15](https://nextjs.org) (App Router) avec React 19 et TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- Upstash Redis, Stripe Checkout, API Claude (Anthropic), Tavily, Google Places, données OpenStreetMap
- Hébergement sur [Vercel](https://vercel.com), domaine `buddly.io`
- Déploiement continu : chaque push sur `main` redéploie le site

## Lancer le projet en local

Prérequis : Node.js 20 ou plus récent.

```bash
git clone https://github.com/kabyledtr/buddly.git
cd buddly
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Structure

```
app/
  page.tsx, Hero.tsx         Landing page (hero, démo vidéo, problème, pour qui, fonctionnement, tarifs, FAQ)
  DemoVideo.tsx              Vidéo de démo sans lecteur (lecture et pause selon la visibilité)
  PhoneScroll.tsx            Téléphone qui change d'écran au scroll
  app/                       Création d'une sortie en 3 étapes (calendrier, adresse, envies)
  g/[id]/                    Sortie partagée : invitation, swipe, résultats, paywall, aperçu de partage
  idees/, sortie-entre-amis/ Guides et pages villes (référencement)
  SeoShell.tsx               Gabarit des pages guides
  MetaPixel.tsx              Bandeau de consentement + pixels Meta et TikTok
  LegalPage.tsx, SupportButton.tsx, mentions-legales/, cgv/   Pages légales, pied de page, support
  sitemap.ts, robots.ts, manifest.ts, opengraph-image.png      Référencement, écran d'accueil, aperçu
  api/                       Sorties, votes, IA, cinémas, ateliers, Stripe (checkout, verify, webhook), photos, Meta
lib/
  types.ts                   Modèles et offres (Gratuit, Pass Sortie, Buddly+)
  group.ts                   Stockage des sorties, classement du groupe, Buddly+ par e-mail
  google.ts, places.ts       Recherche de lieux (Google Places, repli OpenStreetMap, cache)
  events.ts                  Ateliers du jour (Tavily + Claude + Google Places)
  fulfill.ts                 Activation des achats (retour Stripe et webhook)
  capi.ts, track.ts          Mesure publicitaire (avec consentement)
  seo.ts                     Contenus des guides et des pages villes
  store.ts                   Upstash Redis (repli mémoire en local)
public/                      Logo, mascotte, captures, vidéo de démo, icônes
```

## Équipe

Équipe Buddly, FounderRace 2026.
