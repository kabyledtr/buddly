/**
 * Navigateur automatisé ou robot (capture d'écran, crawler, outil de test) : on affiche tout d'office,
 * sans animation au scroll ni chargement différé, pour que la capture montre vraiment la page.
 */
export const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|screenshot|puppeteer|playwright|phantom|prerender|preview/i;

export function isBot(): boolean {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver) || BOT_RE.test(navigator.userAgent);
}
