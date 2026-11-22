/** Événements publicitaires Meta et TikTok : envoyés seulement si le visiteur a accepté (les pixels ne sont chargés qu'après accord). */
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
  // TikTok : mêmes moments, avec ses noms d'événements standard
  const tt = TIKTOK[event];
  const ttq = (window as unknown as { ttq?: { track?: (e: string, p?: Record<string, unknown>, o?: { event_id?: string }) => void } }).ttq;
  if (tt && ttq?.track) {
    try {
      const value = typeof params?.value === "number" ? params.value : undefined;
      ttq.track(
        tt,
        { ...(value != null ? { value, currency: "EUR" } : {}), content_type: "product", content_id: String(params?.content_name ?? event), content_name: String(params?.content_name ?? event) },
        eventId ? { event_id: eventId } : undefined,
      );
    } catch {}
  }
}

const TIKTOK: Record<string, string> = {
  Lead: "SubmitForm",
  CompleteRegistration: "CompleteRegistration",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
};
