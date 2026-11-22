/**
 * Contenus des pages « guides » (référencement). Rédigés à la main, sans chiffres inventés ni faux avis :
 * des conseils concrets et les quartiers de sortie connus de chaque ville.
 */

export const SITE = "https://buddly.io";

export type City = {
  slug: string;
  name: string;
  /** « à Lyon », « à Paris »… */
  at: string;
  intro: string;
  quartiers: { name: string; text: string }[];
};

export const CITIES: City[] = [
  {
    slug: "paris",
    name: "Paris",
    at: "à Paris",
    intro:
      "À Paris, le problème n'est jamais de trouver un lieu : c'est d'en choisir un parmi des milliers, en tenant compte du budget de chacun et de la ligne de métro de tout le monde.",
    quartiers: [
      { name: "Oberkampf", text: "des bars à la chaîne et des restos pas chers, parfait pour enchaîner apéro et dîner." },
      { name: "Le Marais", text: "des terrasses, des petites adresses et beaucoup de choix pour tous les régimes." },
      { name: "Canal Saint-Martin", text: "l'apéro au bord de l'eau dès les beaux jours, et des bars plus calmes autour." },
      { name: "Bastille", text: "une valeur sûre pour les grands groupes : bars, karaokés et salles de jeux." },
    ],
  },
  {
    slug: "lyon",
    name: "Lyon",
    at: "à Lyon",
    intro:
      "Lyon se prête parfaitement aux sorties entre amis : une ville compacte, des bouchons, des bars sur les quais et des quartiers où l'on passe facilement d'un lieu à l'autre.",
    quartiers: [
      { name: "Vieux Lyon", text: "les bouchons et les traboules, idéal pour un dîner typiquement lyonnais." },
      { name: "La Croix-Rousse", text: "une ambiance de village, des bars de quartier et des petits restos." },
      { name: "La Presqu'île", text: "le centre névralgique : restos, bars et activités à deux pas les uns des autres." },
      { name: "La Guillotière", text: "des cuisines du monde et des adresses abordables pour les petits budgets." },
    ],
  },
  {
    slug: "marseille",
    name: "Marseille",
    at: "à Marseille",
    intro:
      "À Marseille, une sortie entre amis peut commencer sur une terrasse au soleil et finir dans un bar du Cours Julien. Encore faut-il se mettre d'accord sur le point de départ.",
    quartiers: [
      { name: "Le Cours Julien", text: "le quartier alternatif : bars, street art et restos variés." },
      { name: "Le Vieux-Port", text: "les terrasses et les restos de poisson, le classique pour l'apéro." },
      { name: "Le Panier", text: "des ruelles, des petites adresses et une ambiance de village." },
      { name: "La Plaine", text: "des bars animés et des prix doux, parfait pour les grands groupes." },
    ],
  },
  {
    slug: "toulouse",
    name: "Toulouse",
    at: "à Toulouse",
    intro:
      "Ville étudiante par excellence, Toulouse regorge de bars et de restos abordables. Le plus dur, c'est de choisir entre la place Saint-Pierre et le Capitole.",
    quartiers: [
      { name: "Saint-Pierre", text: "la place étudiante par excellence, avec ses bars au bord de la Garonne." },
      { name: "Le Capitole", text: "le cœur de la ville, pratique pour retrouver tout le monde." },
      { name: "Les Carmes", text: "des restos et des bars à vin plus posés, pour les dîners." },
      { name: "Saint-Cyprien", text: "de l'autre côté du fleuve, des adresses plus locales et abordables." },
    ],
  },
  {
    slug: "bordeaux",
    name: "Bordeaux",
    at: "à Bordeaux",
    intro:
      "Bordeaux, c'est les quais, les bars à vin et une vie étudiante animée. Pour une sortie qui plaît à tout le groupe, mieux vaut savoir où chercher.",
    quartiers: [
      { name: "Saint-Pierre", text: "des ruelles pleines de restos et de bars, en plein centre historique." },
      { name: "Les Chartrons", text: "des bars à vin, des brunchs et une ambiance plus chic." },
      { name: "La Victoire", text: "le quartier étudiant, avec ses bars pas chers et animés." },
      { name: "Saint-Michel", text: "un quartier vivant, des cuisines du monde et des prix doux." },
    ],
  },
  {
    slug: "lille",
    name: "Lille",
    at: "à Lille",
    intro:
      "À Lille, on sort beaucoup et on sort en groupe. Entre estaminets, bars étudiants et activités, il y a de quoi faire, à condition que tout le monde soit d'accord.",
    quartiers: [
      { name: "Le Vieux-Lille", text: "des estaminets, des restos et des bars dans de belles rues pavées." },
      { name: "La rue Masséna", text: "la rue des bars étudiants, idéale pour les soirées en grand groupe." },
      { name: "Wazemmes", text: "un quartier populaire et vivant, avec des adresses abordables." },
    ],
  },
  {
    slug: "nantes",
    name: "Nantes",
    at: "à Nantes",
    intro:
      "Nantes mélange vieilles rues animées et lieux plus créatifs. Pour une sortie entre amis, le choix ne manque pas, le consensus un peu plus.",
    quartiers: [
      { name: "Le Bouffay", text: "le quartier historique, plein de bars et de restos." },
      { name: "L'île de Nantes", text: "des lieux plus créatifs et des espaces pour les grands groupes." },
      { name: "Graslin", text: "des restos et des bars plus posés, pour un dîner entre amis." },
    ],
  },
  {
    slug: "strasbourg",
    name: "Strasbourg",
    at: "à Strasbourg",
    intro:
      "Entre winstubs, bars étudiants et activités, Strasbourg se prête aux sorties de groupe. Reste à trouver le lieu qui convient à tout le monde.",
    quartiers: [
      { name: "La Petite France", text: "des winstubs et des restos alsaciens dans un cadre carte postale." },
      { name: "La Krutenau", text: "le quartier étudiant, avec ses bars animés et abordables." },
      { name: "Autour de la place Kléber", text: "le centre, pratique pour retrouver tout le monde." },
    ],
  },
  {
    slug: "montpellier",
    name: "Montpellier",
    at: "à Montpellier",
    intro:
      "Montpellier vit dehors : terrasses, places animées et une population très étudiante. Une ville idéale pour sortir entre amis, souvent au dernier moment.",
    quartiers: [
      { name: "L'Écusson", text: "le centre historique, ses places et ses terrasses." },
      { name: "Les Beaux-Arts", text: "un quartier de village, avec des bars et des restos de quartier." },
      { name: "Antigone", text: "plus calme, pratique pour un dîner avant de sortir." },
    ],
  },
  {
    slug: "nice",
    name: "Nice",
    at: "à Nice",
    intro:
      "À Nice, les sorties entre amis se jouent souvent en terrasse, entre le Vieux-Nice et le port. Le plus dur reste de trouver une table qui convient à tout le monde.",
    quartiers: [
      { name: "Le Vieux-Nice", text: "des ruelles pleines de bars et de restos, l'endroit classique pour sortir." },
      { name: "Le port Lympia", text: "des terrasses et des restos face aux bateaux." },
      { name: "La Libération", text: "un quartier plus local, autour du marché, avec des adresses abordables." },
    ],
  },
  {
    slug: "rennes",
    name: "Rennes",
    at: "à Rennes",
    intro:
      "Rennes est l'une des villes les plus étudiantes de France. On y sort beaucoup, en groupe, et souvent sans savoir où aller avant le dernier moment.",
    quartiers: [
      { name: "La place Sainte-Anne", text: "le point de rendez-vous de toutes les soirées." },
      { name: "La rue Saint-Michel", text: "la célèbre « rue de la Soif », bar après bar." },
      { name: "Le Colombier", text: "plus calme, avec des restos pratiques pour un dîner de groupe." },
    ],
  },
  {
    slug: "grenoble",
    name: "Grenoble",
    at: "à Grenoble",
    intro:
      "Grenoble, ses montagnes et sa vie étudiante : entre bars du centre et activités, il y a de quoi occuper une soirée entre amis.",
    quartiers: [
      { name: "Le quartier Notre-Dame", text: "des bars et des restos dans le centre ancien." },
      { name: "La place Saint-André", text: "les terrasses au cœur de la ville." },
      { name: "Championnet", text: "un quartier vivant, avec des adresses de quartier abordables." },
    ],
  },
];

export type Theme = {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  sections: { h: string; p: string }[];
  faq: { q: string; a: string }[];
};

export const THEMES: Theme[] = [
  {
    slug: "idees-sortie-entre-amis",
    h1: "Idées de sorties entre amis",
    title: "Idées de sorties entre amis : restos, bars, activités originales",
    description:
      "Des idées de sorties entre amis pour tous les budgets : restos, bars, escape games, ateliers, karaoké. Et une méthode simple pour que tout le groupe soit d'accord.",
    intro:
      "Une bonne sortie entre amis, ce n'est pas forcément un lieu exceptionnel : c'est un lieu qui plaît à tout le monde, au bon prix et pas trop loin. Voici des idées pour varier, et une façon simple de choisir ensemble.",
    sections: [
      { h: "Les classiques qui marchent toujours", p: "Un resto où chacun trouve son plat, un bar avec de la place pour tout le groupe, un brunch le week-end. Simple, mais efficace quand le groupe a des envies différentes." },
      { h: "Les activités pour changer", p: "Escape game, karaoké, bowling, laser game, bar à jeux de société, blind test : idéal pour briser la routine et pour les groupes qui ne se connaissent pas tous." },
      { h: "Les ateliers et expériences", p: "Atelier poterie, cours de cuisine, dégustation de vin, atelier bougie ou peinture : des sorties plus originales, souvent à réserver, qui laissent un vrai souvenir." },
      { h: "Comment se mettre d'accord", p: "Le plus long, c'est de choisir. Avec Buddly, chacun swipe de vrais lieux autour de vous, selon son budget et ses envies, et le lieu qui plaît à tous ressort tout seul." },
    ],
    faq: [
      { q: "Quelle sortie entre amis quand on a des budgets différents ?", a: "Privilégiez les lieux où chacun choisit sa dépense (bars, street food, restos à petits prix) ou des activités à prix fixe. Sur Buddly, chacun indique son budget et le classement en tient compte." },
      { q: "Que faire entre amis quand il pleut ?", a: "Escape game, karaoké, bowling, bar à jeux, cinéma ou atelier créatif : toutes ces activités se font à l'intérieur et marchent très bien en groupe." },
      { q: "Comment éviter les débats sans fin pour choisir ?", a: "Laissez chacun voter de son côté plutôt que de débattre dans la conversation de groupe. C'est exactement le principe de Buddly : un swipe par lieu, et le match apparaît." },
    ],
  },
  {
    slug: "que-faire-ce-soir-entre-amis",
    h1: "Que faire ce soir entre amis ?",
    title: "Que faire ce soir entre amis ? Des idées ouvertes maintenant",
    description:
      "Envie de sortir ce soir entre amis ? Des idées de bars, restos et activités ouverts à l'heure qui vous arrange, et une façon rapide de choisir à plusieurs.",
    intro:
      "« On fait quoi ce soir ? » La question tombe souvent à 19h, et la réponse arrive parfois à 22h. Voici comment trouver vite une sortie qui plaît à tout le monde, ouverte au bon moment.",
    sections: [
      { h: "Vérifier ce qui est ouvert", p: "Le piège d'une sortie de dernière minute : arriver devant un lieu fermé. Buddly ne propose que des lieux ouverts sur votre créneau, pendant au moins une heure." },
      { h: "Choisir un point de rendez-vous", p: "Partez d'un endroit pratique pour tout le monde, puis limitez la distance : à pied, à vélo ou en métro. Moins de trajet, plus de temps ensemble." },
      { h: "Des idées pour ce soir", p: "Un apéro en terrasse, un bar à cocktails, un karaoké, un stand-up ou un cinéma : des sorties qui se décident vite et qui se font sans réservation la plupart du temps." },
      { h: "Décider en quelques minutes", p: "Créez une sortie sur Buddly, partagez le lien dans la conversation, et chacun swipe de son côté. Dès qu'un lieu plaît à tout le monde, c'est un match." },
    ],
    faq: [
      { q: "Comment trouver un bar ouvert tard ce soir ?", a: "Choisissez le créneau « Tard » dans Buddly : seuls les lieux ouverts à ce moment-là vous sont proposés, avec leur heure de fermeture." },
      { q: "Faut-il réserver pour une sortie le soir même ?", a: "Pour les bars et la plupart des restos, rarement. Pour un grand groupe, un escape game ou un atelier, mieux vaut appeler ou réserver en ligne." },
      { q: "Mes amis doivent-ils installer une application ?", a: "Non. Buddly fonctionne dans le navigateur : vos amis ouvrent le lien et votent tout de suite, sans mot de passe." },
    ],
  },
  {
    slug: "sortie-pas-chere-entre-amis",
    h1: "Sortir entre amis sans se ruiner",
    title: "Sortie pas chère entre amis : idées à petit budget",
    description:
      "Des idées de sorties pas chères entre amis : bars abordables, street food, activités gratuites. Et comment choisir un lieu qui respecte le budget de chacun.",
    intro:
      "Dans chaque groupe, il y a quelqu'un qui est un peu juste ce mois-ci. Une bonne sortie, c'est une sortie où personne ne se sent mal à l'aise au moment de l'addition.",
    sections: [
      { h: "Les sorties à petit prix", p: "Street food, happy hours, bars de quartier, pique-nique dans un parc, soirée jeux dans un bar à jeux : on peut passer une excellente soirée pour quelques euros." },
      { h: "Les activités à prix fixe", p: "Bowling, karaoké en box, laser game : un prix connu à l'avance, que l'on peut diviser par le nombre de participants." },
      { h: "Respecter le budget de chacun", p: "Sur Buddly, chacun indique son budget (petit, raisonnable ou plus large). Le classement pénalise les lieux trop chers pour quelqu'un et met en avant ceux qui conviennent à tout le groupe." },
    ],
    faq: [
      { q: "Comment proposer une sortie pas chère sans gêner personne ?", a: "En laissant chacun indiquer son budget en privé. Sur Buddly, personne ne voit le budget des autres : le classement s'adapte simplement." },
      { q: "Quelles activités gratuites entre amis ?", a: "Pique-nique, balade, musées gratuits certains jours, concerts en plein air, soirée jeux chez quelqu'un : de bonnes options quand le budget est serré." },
      { q: "Buddly est-il gratuit ?", a: "Oui, la version gratuite permet de créer une sortie et de swiper avec un ami. Des options payantes débloquent plus de personnes et de lieux." },
    ],
  },
  {
    slug: "activite-originale-entre-amis",
    h1: "Activités originales entre amis",
    title: "Activités originales entre amis : ateliers, jeux, expériences",
    description:
      "Envie de changer du bar habituel ? Ateliers poterie, cours de cuisine, escape game, karaoké, stand-up : des activités originales à faire entre amis près de chez vous.",
    intro:
      "Toujours le même bar, toujours la même table ? Une activité originale change complètement une soirée entre amis, et c'est souvent celle dont on se souvient le plus.",
    sections: [
      { h: "Les ateliers créatifs", p: "Poterie, céramique, peinture, bougie, parfum : on repart avec sa création. Idéal pour un anniversaire ou une sortie un peu différente." },
      { h: "Les expériences gourmandes", p: "Cours de cuisine, atelier pâtisserie, dégustation de vin ou de bière : on apprend quelque chose et on mange bien." },
      { h: "Les activités qui font bouger", p: "Escalade, karting, accrobranche, lancer de hache, laser game : pour les groupes qui ont de l'énergie à revendre." },
      { h: "Les soirées spectacle et jeux", p: "Stand-up, théâtre d'impro, blind test, karaoké, salle d'arcade : parfait pour rire ensemble." },
      { h: "Les ateliers du jour avec Buddly", p: "Buddly cherche aussi les ateliers datés publiés sur le web pour le jour de votre sortie, et retrouve le vrai lieu avec photos et avis." },
    ],
    faq: [
      { q: "Quelle activité originale pour un grand groupe ?", a: "Escape game (plusieurs salles), karaoké en box, bowling, laser game ou bar à jeux : ces lieux accueillent facilement 8 à 15 personnes." },
      { q: "Faut-il réserver un atelier à l'avance ?", a: "Oui, la plupart des ateliers ont un nombre de places limité. Buddly affiche un bouton pour réserver directement sur le site de l'atelier." },
      { q: "Comment trouver des activités originales près de chez moi ?", a: "Créez une sortie sur Buddly en cochant « Activités » : escape games, ateliers, stand-up et autres idées autour de vous apparaissent dans le deck." },
    ],
  },
  {
    slug: "organiser-afterwork",
    h1: "Organiser un afterwork qui plaît à tout le monde",
    title: "Organiser un afterwork : idées de lieux et méthode simple",
    description:
      "Organiser un afterwork entre collègues ou amis : trouver un bar ou un resto qui convient à tous, près du bureau, au bon budget. Méthode et idées.",
    intro:
      "L'afterwork parfait : proche du bureau, ouvert dès 18h, avec de la place pour tout le monde et des prix qui conviennent à chacun. Facile à dire, moins à organiser.",
    sections: [
      { h: "Choisir le bon créneau", p: "Entre 18h30 et 20h30, c'est le créneau « Apéro » : Buddly ne propose que les lieux ouverts à ce moment-là." },
      { h: "Rester près du bureau", p: "Indiquez l'adresse du bureau et une distance à pied : personne n'a envie de traverser la ville un jeudi soir." },
      { h: "Mettre tout le monde d'accord", p: "Partagez le lien dans le canal de l'équipe : chacun swipe en deux minutes, et le lieu qui plaît au plus grand nombre ressort." },
    ],
    faq: [
      { q: "Quel lieu pour un afterwork en grand groupe ?", a: "Un bar avec terrasse ou grande salle, une brasserie, ou un lieu avec activité (karaoké, bar à jeux). Pensez à prévenir le lieu si vous êtes nombreux." },
      { q: "Combien de personnes peuvent voter sur Buddly ?", a: "Deux en gratuit, jusqu'à quatre avec le Pass Sortie, et jusqu'à quinze avec Buddly+." },
      { q: "Faut-il un compte pour voter ?", a: "Non : un prénom et un e-mail suffisent, sans mot de passe ni application à installer." },
    ],
  },
  {
    slug: "anniversaire-entre-amis",
    h1: "Où fêter un anniversaire entre amis ?",
    title: "Où fêter son anniversaire entre amis ? Idées de lieux",
    description:
      "Idées de lieux pour fêter un anniversaire entre amis : resto, bar, karaoké, atelier, escape game. Et comment trouver un lieu qui plaît à tous les invités.",
    intro:
      "Pour un anniversaire, on veut un lieu qui fait plaisir à la personne fêtée, sans que les invités se ruinent ou fassent une heure de trajet. Voici des idées et une méthode simple.",
    sections: [
      { h: "Les idées qui marchent", p: "Un resto convivial, un bar avec un coin réservé, un karaoké privatisé, un atelier créatif ou un escape game : à choisir selon l'ambiance voulue." },
      { h: "Penser à tout le monde", p: "Budgets différents, régimes alimentaires, distance : sur Buddly, chacun indique ses contraintes et le classement en tient compte (halal, végétarien, vegan, sans gluten…)." },
      { h: "Garder la surprise", p: "Créez la sortie sans la personne fêtée, partagez le lien aux invités, et laissez le groupe choisir. Le jour J, il ne reste plus qu'à réserver." },
    ],
    faq: [
      { q: "Quelle activité pour un anniversaire original ?", a: "Atelier poterie ou cuisine, karaoké en box, escape game, stand-up ou dégustation : des idées qui changent du simple dîner." },
      { q: "Comment organiser un anniversaire surprise entre amis ?", a: "Créez une sortie sur Buddly et partagez le lien seulement aux invités : chacun vote, et la personne fêtée découvre le lieu le jour J." },
      { q: "Combien d'invités peuvent participer ?", a: "Jusqu'à quinze personnes avec Buddly+, à vie pour 3,99 €." },
    ],
  },
  {
    slug: "organiser-sortie-groupe",
    h1: "Organiser une sortie de groupe sans prise de tête",
    title: "Comment organiser une sortie entre amis sans prise de tête",
    description:
      "Organiser une sortie de groupe : choisir la date, le lieu et le budget sans débat interminable. La méthode, les pièges à éviter et un outil pour décider ensemble.",
    intro:
      "Une conversation de groupe, quinze messages, trois « comme vous voulez » et toujours pas de plan. Organiser une sortie à plusieurs n'a pas à être aussi compliqué.",
    sections: [
      { h: "1. Fixer le créneau d'abord", p: "Une date et une plage horaire. C'est la seule chose à trancher seul : le reste se décide ensemble." },
      { h: "2. Définir une zone", p: "Un point de rendez-vous pratique et une distance maximale. Ça évite les propositions à l'autre bout de la ville." },
      { h: "3. Laisser chacun voter de son côté", p: "Plutôt que débattre, chacun donne son avis sur de vrais lieux. Sur Buddly, c'est un swipe : oui ou non." },
      { h: "4. Laisser le match trancher", p: "Le lieu aimé par tout le monde l'emporte. S'il n'y en a pas, Bud, l'IA de Buddly, choisit le meilleur compromis selon les votes, les envies et le budget de chacun." },
    ],
    faq: [
      { q: "Comment éviter que personne ne se décide ?", a: "En remplaçant le débat par un vote. Chacun swipe les lieux de son côté, et le résultat apparaît en direct." },
      { q: "Comment relancer les amis qui ne répondent pas ?", a: "Avec Buddly+, un bouton envoie un rappel par e-mail aux retardataires qui n'ont pas encore swipé." },
      { q: "Buddly marche-t-il dans ma ville ?", a: "Oui, partout en France : Buddly s'appuie sur Google Places pour proposer de vrais lieux autour de l'adresse choisie." },
    ],
  },
  {
    slug: "sortie-etudiante",
    h1: "Sorties entre étudiants",
    title: "Sorties entre étudiants : idées pas chères et faciles à organiser",
    description:
      "Des idées de sorties entre étudiants : bars pas chers, activités en groupe, soirées à petit budget. Et comment choisir à plusieurs sans débat.",
    intro:
      "Entre étudiants, on sort souvent, en grand groupe, avec des budgets serrés et des envies qui partent dans tous les sens. Exactement le cas pour lequel Buddly a été pensé.",
    sections: [
      { h: "Les sorties étudiantes classiques", p: "Bars de quartier, happy hours, street food, soirées jeux : des valeurs sûres pour les petits budgets." },
      { h: "Les activités en groupe", p: "Bowling, karaoké, laser game, escape game ou blind test : parfaits pour les promos et les colocs." },
      { h: "Petit budget, grand groupe", p: "Chacun indique son budget en privé sur Buddly, et le classement fait remonter les lieux qui conviennent à tout le monde." },
    ],
    faq: [
      { q: "Quelle sortie pas chère entre étudiants ?", a: "Bars de quartier en happy hour, street food, bar à jeux ou pique-nique : de bonnes options pour quelques euros." },
      { q: "Comment organiser une sortie de promo ?", a: "Créez une sortie sur Buddly, partagez le lien dans le groupe de la promo, et laissez chacun swiper. Jusqu'à quinze personnes avec Buddly+." },
      { q: "Buddly est-il adapté aux étudiants ?", a: "Oui : gratuit pour commencer, sans application à installer, et le Pass Sortie coûte 2,99 € pour toute une sortie." },
    ],
  },
];

export const cityPath = (c: City) => `/sortie-entre-amis/${c.slug}`;
export const themePath = (t: Theme) => `/idees/${t.slug}`;
