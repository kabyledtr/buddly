import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { CONTACT_EMAIL, Section } from "../LegalPage";

export const metadata: Metadata = { title: "Conditions générales de vente · Buddly" };

export default function CGV() {
  return (
    <LegalPage title="Conditions générales de vente">
      <Section title="1. Objet">
        <p>
          Les présentes conditions régissent l&apos;utilisation du service Buddly, accessible sur buddly.io, et
          la souscription à l&apos;offre payante Buddly Premium. Toute souscription implique leur acceptation.
        </p>
      </Section>

      <Section title="2. Le service">
        <p>
          Buddly permet de créer des groupes d&apos;amis, d&apos;indiquer ses préférences de sortie et de voter
          (« swiper ») sur des restaurants et activités à proximité, afin de trouver un lieu qui convient à
          tout le groupe.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Offre Gratuite</strong> : 1 groupe actif, jusqu&apos;à 4 amis par groupe, 20 lieux par sortie.</li>
          <li>
            <strong>Offre Premium</strong> : groupes et swipes illimités, jusqu&apos;à 15 amis par groupe,
            recommandations personnalisées par IA, point de rendez-vous équitable.
          </li>
        </ul>
        <p>
          Les informations sur les lieux (horaires, prix, disponibilité) sont fournies à titre indicatif.
          Buddly n&apos;est pas responsable des prestations fournies par les établissements.
        </p>
      </Section>

      <Section title="3. Prix et paiement">
        <p>
          L&apos;offre Premium est proposée au prix de <strong>4,99 € TTC par mois</strong>. Le paiement
          s&apos;effectue par carte bancaire via Stripe, prestataire de paiement sécurisé. L&apos;abonnement est
          prélevé à la souscription puis chaque mois à la même date.
        </p>
      </Section>

      <Section title="4. Durée et résiliation">
        <p>
          L&apos;abonnement est sans engagement et se renouvelle chaque mois. Il peut être résilié à tout moment
          depuis votre compte ou en écrivant à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet underline">{CONTACT_EMAIL}</a>. La
          résiliation prend effet à la fin de la période en cours ; aucun prorata n&apos;est remboursé.
        </p>
      </Section>

      <Section title="5. Droit de rétractation">
        <p>
          Conformément à l&apos;article L221-18 du Code de la consommation, vous disposez de 14 jours après la
          souscription pour vous rétracter et être remboursé, sans justification, en écrivant à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet underline">{CONTACT_EMAIL}</a>.
        </p>
        <p>
          Si vous demandez à accéder immédiatement aux fonctionnalités Premium, vous reconnaissez que
          l&apos;exécution du service commence avant la fin de ce délai (article L221-28 du Code de la
          consommation). En cas de rétractation, le montant correspondant au service déjà fourni pourra être
          retenu.
        </p>
      </Section>

      <Section title="6. Obligations de l'utilisateur">
        <p>
          L&apos;utilisateur s&apos;engage à fournir des informations exactes et à utiliser Buddly de manière
          respectueuse envers les autres membres de ses groupes. Tout abus peut entraîner la suspension du
          compte.
        </p>
      </Section>

      <Section title="7. Responsabilité">
        <p>
          Buddly s&apos;efforce d&apos;assurer la disponibilité du service mais ne peut garantir une absence
          totale d&apos;interruption. Buddly ne saurait être tenu responsable des sorties organisées, ni des
          relations entre les membres d&apos;un groupe.
        </p>
      </Section>

      <Section title="8. Données personnelles">
        <p>
          Le traitement de vos données est décrit dans nos{" "}
          <Link href="/mentions-legales" className="text-violet underline">mentions légales</Link>.
        </p>
      </Section>

      <Section title="9. Litiges et droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, contactez-nous d&apos;abord
          à {CONTACT_EMAIL} pour trouver une solution amiable. Vous pouvez également recourir gratuitement à un
          médiateur de la consommation ou à la plateforme européenne de règlement en ligne des litiges
          (ec.europa.eu/consumers/odr). À défaut, les tribunaux français seront compétents.
        </p>
      </Section>
    </LegalPage>
  );
}
