import type { Metadata } from "next";
import GroupApp from "./GroupApp";

export const metadata: Metadata = {
  title: "Rejoins la sortie · Buddly",
  description: "Tes amis t'invitent à choisir la sortie sur Buddly : swipe les adresses, on trouve celle qui plaît à tout le monde.",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupApp id={id} />;
}
