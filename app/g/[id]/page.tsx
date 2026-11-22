import type { Metadata } from "next";
import { loadGroup, loadMembers } from "@/lib/group";
import { groupIdFrom } from "@/lib/slug";
import GroupApp from "./GroupApp";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = groupIdFrom((await params).id);
  const fallback: Metadata = {
    robots: { index: false, follow: false },
    title: "Rejoins la sortie · Buddly",
    description: "Tes amis t'invitent à choisir la sortie sur Buddly : swipe les adresses, on garde celle qui plaît à tout le monde.",
  };
  try {
    const g = await loadGroup(id);
    if (!g) return fallback;
    const host = (await loadMembers(id))[0]?.name;
    const title = host ? `${host} t'invite : ${g.name}` : g.name;
    const description = `${g.when ? g.when + " · " : ""}${g.area.split(",")[0]}. Swipe les spots en 30 secondes, Bud garde ce qui plaît à tout le monde.`;
    return {
      title: `${title} · Buddly`,
      description,
      robots: { index: false, follow: false }, // sortie privée : jamais dans Google
      openGraph: { title, description, siteName: "Buddly", type: "website" },
    };
  } catch {
    return fallback;
  }
}

export default async function Page({ params }: Props) {
  return <GroupApp id={groupIdFrom((await params).id)} />;
}
