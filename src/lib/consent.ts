// Gestion du consentement cookies + chargement conditionnel de Google Tag Manager.
// Aucun traceur tiers n'est chargé avant un consentement explicite "mesure d'audience".
export const CONSENT_KEY = "gdpr-consent";
export const CONSENT_VERSION = "2026-09-25";
export const CONSENT_EVENT = "evalscol-consent-change";
const GTM_ID = "GTM-TB5QSVH5";

export type ConsentRecord = {
  version: string;
  date: string;
  functional: true;
  analytics: boolean;
  marketing: boolean;
  notice: string;
};

export const CONSENT_NOTICE =
  "Cookies essentiels (connexion, sécurité) toujours actifs. Mesure d'audience Google Analytics via Google Tag Manager (Google LLC) uniquement avec votre accord. Aucun cookie publicitaire.";

export function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== CONSENT_VERSION) return null;
    return parsed as ConsentRecord;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean, marketing = false) {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
    functional: true,
    analytics,
    marketing,
    notice: CONSENT_NOTICE,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(CONSENT_EVENT));
  applyConsent();
}

export function openConsentSettings() {
  window.dispatchEvent(new Event("evalscol-open-consent"));
}

let gtmLoaded = false;

export function applyConsent() {
  const consent = readConsent();
  if (consent?.analytics) {
    loadGtm();
  } else if (gtmLoaded) {
    // Retrait : on coupe la mesure puis on recharge pour décharger les scripts.
    const w = window as any;
    w.gtag?.("consent", "update", { analytics_storage: "denied" });
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (name.startsWith("_ga") || name.startsWith("_gid")) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname.split(".").slice(-2).join(".")}`;
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });
    location.reload();
  }
}

function loadGtm() {
  if (gtmLoaded) return;
  gtmLoaded = true;
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer.push(arguments); };
  w.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

// Synchronise les autres onglets ouverts.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CONSENT_KEY) applyConsent();
  });
}
