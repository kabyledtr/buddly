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
          l&apos;achat du Pass Sortie. Tout achat implique leur acceptation.
        </p>
      </Section>

      <Section title="2. Le service">
        <p>
          Buddly permet de créer un groupe pour une sortie, d&apos;inviter des amis par lien, d&apos;indiquer ses
          préférences et de voter (« swiper ») sur des restaurants, bars, cafés et activités à proximité, afin de
          trouver un lieu qui convient à tout le groupe.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Gratuit</strong> : jusqu&apos;à 4 amis par groupe, 15 adresses à swiper, le lieu préféré du groupe et le conseil de Buddy.</li>
          <li>
            <strong>Pass Sortie</strong> : pour une sortie donnée, jusqu&apos;à 15 amis, 40 adresses à swiper et le
            classement complet du groupe.
          </li>
        </ul>
        <p>
          Les informations sur les lieux proviennent de sources ouvertes (OpenStreetMap) et sont fournies à titre
          indicatif ; les prix sont des estimations. Buddly n&apos;est pas responsable des prestations fournies par
          les établissements.
        </p>
      </Section>

      <Section title="3. Prix et paiement">
        <p>
          Le Pass Sortie est vendu <strong>0,99 € TTC</strong>, en paiement unique, pour un groupe. Il ne
          s&apos;agit pas d&apos;un abonnement : aucun autre prélèvement n&apos;a lieu. Le paiement s&apos;effectue
          par carte bancaire via Stripe, prestataire de paiement sécurisé ; Buddly ne stocke aucune donnée
          bancaire.
        </p>
      </Section>

      <Section title="4. Accès">
        <p>
          Le Pass Sortie est activé immédiatement après le paiement, pour tous les membres du groupe concerné, tant
          que le groupe existe (30 jours après sa dernière activité).
        </p>
      </Section>

      <Section title="5. Droit de rétractation">
        <p>
          Le Pass Sortie est un contenu numérique fourni immédiatement après l&apos;achat. En validant le paiement,
          vous demandez cette exécution immédiate et reconnaissez perdre votre droit de rétractation, conformément à
          l&apos;article L221-28, 13° du Code de la consommation. En cas de problème technique empêchant l&apos;accès
          au Pass, écrivez à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet underline">{CONTACT_EMAIL}</a> : vous serez
          remboursé.
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
