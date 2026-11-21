# Buddly

> **Swipez ensemble, sortez ensemble.** Buddly trouve la sortie qui plaît à tout votre groupe d'amis.

🔗 **Site en ligne : [buddly.io](https://buddly.io)**

Projet réalisé pendant la **FounderRace**, du samedi 21 novembre 2026 à 09:00 au dimanche 22 novembre 2026 à 09:00 (heure de Paris).
Thème de la saison : **Intelligence artificielle**. Sous-thème de l'édition : **Relation humaine**.

---

## Le problème

Organiser une sortie entre amis tourne vite à la galère. La conversation de groupe s'étire sur des dizaines de messages et personne ne tranche (« je sais pas, comme vous voulez »). Il faut composer avec le budget de l'un, le régime alimentaire de l'autre, celui qui habite loin et celle qui n'est libre que le samedi. Au final, la sortie est repoussée, puis annulée, ou alors le groupe retourne toujours au même endroit.

**Pour qui ?** Les groupes d'amis de 18 à 35 ans, en ville, qui sortent régulièrement (restos, bars, activités) et organisent tout par messagerie.

## La solution

Buddly est une application web (SaaS) qui simplifie l'organisation des sorties entre amis :

1. **Créer un groupe** : un utilisateur partage un lien d'invitation, et ses amis rejoignent le groupe.
2. **Donner ses préférences** : chacun indique son budget, sa localisation, la distance maximale, ses disponibilités et les activités qui lui plaisent.
3. **Swiper** : chacun swipe des restaurants et des activités réels à proximité, à la manière de Tinder.
4. **Le match** : un matching intelligent fait ressortir les lieux qui plaisent à tout le monde. L'IA personnalise les recommandations selon les envies du groupe.

**Fonctionnalité essentielle :** le swipe de groupe avec matching. Une démo interactive est visible et utilisable dès la page d'accueil.

## Modèle économique

Freemium avec paywall, uniquement des paiements uniques (aucun abonnement) :

| Offre | Prix | Contenu |
|---|---|---|
| Gratuit | 0 € | 2 personnes par sortie, 10 lieux, le meilleur lieu et le conseil IA de Bud |
| Pass Sortie | 2,99 € par sortie | 4 personnes, 20 lieux, tous les résultats |
| **Buddly+** | **3,99 €, à vie** | Toutes les sorties, 15 personnes, 40 lieux, tous les résultats, plan B de Bud, relance par e-mail des retardataires |

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

Tout le code applicatif a été écrit pendant la course, notamment :

- `app/page.tsx` : la landing page (problème, démo, fonctionnement, tarifs) ;
- `app/SwipeDemo.tsx` : la démo interactive de swipe et de match ;
- `app/layout.tsx` et `app/globals.css` : la mise en page, les métadonnées, les polices et la charte de couleurs.

Aucun code, aucune maquette et aucun contenu n'a été produit avant le départ. Aucun projet existant n'a été repris. Le dépôt GitHub a été créé le jour de la course.

### Outils d'IA

L'équipe a développé avec l'aide d'un assistant de code IA (**Claude Code**). Le règlement autorise les outils d'IA.

### Ressources tierces

- **Polices** : Fredoka et DM Sans (Google Fonts), hébergées dans le projet (`app/fonts`), sous licence SIL Open Font License.
- **Logo et mascotte Bud** (`public/logo.png`, `public/pet*.png`) : créés par l'équipe Buddly.
- **Données de la démo** : les lieux affichés dans la démo de la page d'accueil (noms, quartiers, prix) sont fictifs et servent uniquement d'illustration.

### Outils partenaires FounderRace

- **Stripe** : paiement du Pass Sortie et de Buddly+ (Stripe Checkout).
- **Tavily** : recherche des séances de cinéma du jour.

---

## L'application (MVP)

1. **Créer une sortie** (`/app`) : prénom, quartier ou position, distance, envies, budget. Buddly récupère de vrais lieux autour du point de rendez-vous.
2. **Inviter** : un lien `/g/<id>` à partager (WhatsApp, etc.). Les amis rejoignent sans mot de passe (prénom + e-mail), avec leurs envies et leur budget.
3. **Swiper** : chacun vote oui / non sur les mêmes adresses. Les résultats se mettent à jour en direct.
4. **Matching** : un lieu aimé par tout le monde est un match. Sinon, un score combine les votes, les envies et le budget de chacun, puis la distance.
5. **Le mot de Bud (IA)** : un modèle Claude (Anthropic) explique quel lieu choisir et pourquoi, à partir des votes et des préférences du groupe.
6. **Paywall** : **Pass Sortie à 2,99 €** (une sortie) ou **Buddly+ à 3,99 € à vie** (toutes les sorties liées à l'e-mail), paiements uniques via Stripe Checkout.
7. **Relance (Buddly+)** : un bouton envoie un e-mail aux amis qui n'ont pas fini de swiper (Resend), avec un message WhatsApp en secours.

### Sources de données
- Lieux : Google Places (photos, notes, avis, horaires ; seuls les lieux ouverts sur le créneau choisi et bien notés sont proposés). Secours : Geoapify, Nominatim puis Overpass (OpenStreetMap, © contributeurs OSM, ODbL).
- Cinémas : séances du jour choisi via Tavily (recherche web) puis extraction structurée par Claude.
- Stockage : Upstash Redis (intégration Vercel). En local sans configuration, stockage en mémoire.

### Variables d'environnement
| Variable | Rôle |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (posées automatiquement par l'intégration Vercel) |
| `STRIPE_SECRET_KEY` | Paiement du Pass Sortie et de Buddly+ |
| `RESEND_API_KEY` | Relance des retardataires par e-mail (Buddly+), expéditeur `bud@buddly.io` |
| `ANTHROPIC_API_KEY` | « Le mot de Bud » (sinon texte calculé) |
| `GOOGLE_MAPS_API_KEY` | Google Places (New) : photos, notes, avis, horaires d'ouverture, autocomplétion d'adresse |
| `TAVILY_API_KEY` | Films à l'affiche dans un cinéma précis (recherche web, outil partenaire) |
| `GEOAPIFY_KEY` | Source de lieux de secours (optionnelle) |

## Stack technique

- [Next.js 15](https://nextjs.org) (App Router) avec React 19 et TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- Upstash Redis, Stripe Checkout, API Claude (Anthropic), données OpenStreetMap
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
  layout.tsx      Mise en page, polices, métadonnées SEO
  page.tsx        Landing page
  Hero.tsx        Navbar, hero, mascotte SVG, vagues
  LegalPage.tsx   Gabarit des pages légales + footer
  mentions-legales/page.tsx  Mentions légales
  cgv/page.tsx    Conditions générales de vente
  SwipeDemo.tsx   Démo interactive du swipe de groupe
  globals.css     Charte de couleurs (Tailwind)
public/
  logo.png        Logo Buddly
  pet.png         Mascotte et icône de l'app
  pet-phones.png  Mascotte qui tient 2 téléphones (hero)
```

## Équipe

Équipe Buddly, FounderRace 2026.
