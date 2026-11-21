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

Freemium avec paywall :

| Offre | Prix | Contenu |
|---|---|---|
| Gratuit | 0 € | 1 groupe actif, 4 amis par groupe, 20 lieux par sortie, matching de base |
| Premium | 4,99 € / mois | Groupes et swipes illimités, 15 amis par groupe, recommandations IA, point de rendez-vous équitable |

Paiement prévu via **Stripe** (outil partenaire de la FounderRace).

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

- **Polices** : Fredoka et DM Sans, chargées via Google Fonts (`next/font`), sous licence SIL Open Font License.
- **Logo et mascotte** (`public/logo.png`, `public/pet.png`) : créés par l'équipe Buddly.
- **Données de la démo** : les lieux affichés dans la démo de la page d'accueil (noms, quartiers, prix) sont fictifs et servent uniquement d'illustration.

### Outils partenaires FounderRace

- **Stripe** : paiement de l'abonnement Premium (intégration en cours).

---

## L'application (MVP)

1. **Créer une sortie** (`/app`) : prénom, quartier ou position, distance, envies, budget. Buddly récupère de vrais lieux autour du point de rendez-vous.
2. **Inviter** : un lien `/g/<id>` à partager (WhatsApp, etc.). Les amis rejoignent sans compte, avec leurs envies et leur budget.
3. **Swiper** : chacun vote oui / non sur les mêmes adresses. Les résultats se mettent à jour en direct.
4. **Matching** : un lieu aimé par tout le monde est un match. Sinon, un score combine les votes, les envies et le budget de chacun, puis la distance.
5. **Le mot de Buddy (IA)** : un modèle Claude (Anthropic) explique quel lieu choisir et pourquoi, à partir des votes et des préférences du groupe.
6. **Paywall** : le **Pass Sortie à 0,99 €** (paiement unique via Stripe Checkout) débloque le classement complet, 40 adresses au lieu de 15 et jusqu'à 15 amis.

### Sources de données
- Lieux : Geoapify Places (si `GEOAPIFY_KEY`), sinon Nominatim puis Overpass. Toutes basées sur OpenStreetMap (© contributeurs OSM, ODbL).
- Stockage : Upstash Redis (intégration Vercel). En local sans configuration, stockage en mémoire.

### Variables d'environnement
| Variable | Rôle |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (posées automatiquement par l'intégration Vercel) |
| `STRIPE_SECRET_KEY` | Paiement du Pass Sortie |
| `ANTHROPIC_API_KEY` | « Le mot de Buddy » (sinon texte calculé) |
| `GEOAPIFY_KEY` | Source de lieux rapide (optionnelle) |

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
