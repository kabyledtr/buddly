import type { Metadata } from "next";
import LegalPage, { CONTACT_EMAIL, Section } from "../LegalPage";

export const metadata: Metadata = { title: "Mentions légales · Buddly" };

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales">
      <Section title="Éditeur du site">
        <p>
          Le site <strong>buddly.io</strong> et le service Buddly sont édités par l&apos;équipe Buddly, à titre
          non professionnel, dans le cadre de la compétition FounderRace (novembre 2026). Conformément à
          l&apos;article 6, III, 2° de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie
          numérique (LCEN), les éditeurs non professionnels peuvent ne tenir à disposition du public que les
          coordonnées de leur hébergeur, l&apos;identité de l&apos;éditeur étant communiquée à celui-ci.
        </p>
        <p>
          Contact : <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>

      <Section title="Hébergement">
        <p>
          Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
          <br />
          Site : <a href="https://vercel.com" className="text-violet underline">vercel.com</a>
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          Le nom Buddly, le logo, la mascotte, les textes et le code du site sont la propriété de l&apos;équipe
          Buddly. Toute reproduction sans autorisation est interdite. Les polices Fredoka et DM Sans sont
          utilisées sous licence SIL Open Font License.
        </p>
      </Section>

      <Section title="Données personnelles">
        <p>
          Buddly collecte uniquement les données nécessaires au service : adresse e-mail, prénom, préférences
          de sortie (budget, zone, disponibilités, activités) et votes. Ces données servent à faire
          fonctionner les groupes et le matching. Elles ne sont jamais vendues.
        </p>
        <p>
          Les paiements sont traités par Stripe. Buddly ne stocke aucune donnée bancaire.
        </p>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et
          d&apos;opposition sur vos données. Pour l&apos;exercer, écrivez à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet underline">{CONTACT_EMAIL}</a>. Vous pouvez
          aussi saisir la CNIL (cnil.fr).
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Le site n&apos;utilise pas de cookies publicitaires ni de traceurs tiers. Seuls des cookies
          strictement nécessaires au fonctionnement du service (connexion) peuvent être déposés.
        </p>
      </Section>
    </LegalPage>
  );
}
