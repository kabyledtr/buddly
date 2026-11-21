/** Événements publicitaires Meta : envoyés seulement si le visiteur a accepté (le pixel n'est chargé qu'après accord). */
type Fbq = (cmd: "track" | "trackCustom", event: string, params?: Record<string, unknown>, opts?: { eventID?: string }) => void;

export function track(event: string, params?: Record<string, unknown>, eventId?: string, tries = 12) {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem("buddly:consent") !== "yes") return;
  } catch {
    return;
  }
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  // le pixel peut se charger juste après (ex. retour de paiement) : on réessaie quelques instants
  if (!fbq) return void (tries > 0 && setTimeout(() => track(event, params, eventId, tries - 1), 300));
  try {
    fbq("track", event, params, eventId ? { eventID: eventId } : undefined);
  } catch {}
}
