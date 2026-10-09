// Gestion du consentement cookies + chargement conditionnel des traceurs.
// - Google Analytics 4 (catégorie "analytics")
// - Meta Pixel (catégorie "marketing")
// Aucun traceur n'est chargé avant un consentement explicite, ni jamais sur
// les espaces privés (données scolaires).
export const CONSENT_KEY = "gdpr-consent";
export const CONSENT_VERSION = "2026-10-09";
export const CONSENT_EVENT = "evalscol-consent-change";
const GTM_ID = "GTM-TB5QSVH5";
const GA4_ID = "G-NXRR7WVCCN";
const META_PIXEL_ID = "1661383978857911";

export type ConsentRecord = {
  version: string;
  date: string;
  functional: true;
  analytics: boolean;
  marketing: boolean;
  notice: string;
};

export const CONSENT_NOTICE =
  "Cookies essentiels (connexion, sécurité) toujours actifs. Mesure d'audience Google Analytics (Google LLC) et Meta Pixel (Meta Platforms) uniquement avec votre accord, sur les pages publiques. Jamais dans les espaces connectés.";

// Espaces privés : aucun traceur, jamais.
const PRIVATE_PREFIXES = ["/dashboard", "/command-center", "/parent-portal", "/invitation", "/payment-callback", "/onboarding"];

export function isPrivatePath(pathname: string = location.pathname): boolean {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

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

let gaLoaded = false;
let pixelLoaded = false;

function clearCookies(prefixes: string[]) {
  const root = location.hostname.split(".").slice(-2).join(".");
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (prefixes.some((p) => name.startsWith(p))) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${root}`;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  });
}

/** Applique le consentement pour la page courante (à appeler à chaque changement de route). */
export function applyConsent(pathname: string = location.pathname) {
  const consent = readConsent();
  const w = window as any;
  const isPrivate = isPrivatePath(pathname);

  // --- Analytics (GA4 + GTM)
  if (consent?.analytics && !isPrivate) {
    if (!gaLoaded) loadGoogle();
    else {
      w.gtag?.("consent", "update", { analytics_storage: "granted" });
      w.gtag?.("event", "page_view", { page_path: pathname, page_location: location.href });
    }
  } else if (gaLoaded) {
    w.gtag?.("consent", "update", { analytics_storage: "denied" });
    if (!consent?.analytics) {
      clearCookies(["_ga", "_gid"]);
      location.reload();
      return;
    }
  }

  // --- Marketing (Meta Pixel)
  if (consent?.marketing && !isPrivate) {
    if (!pixelLoaded) loadPixel();
    else {
      w.fbq?.("consent", "grant");
      w.fbq?.("track", "PageView");
    }
  } else if (pixelLoaded) {
    w.fbq?.("consent", "revoke");
    if (!consent?.marketing) {
      clearCookies(["_fbp", "_fbc"]);
      location.reload();
    }
  }
}

function loadGoogle() {
  gaLoaded = true;
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer.push(arguments); };
  w.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  w.gtag("js", new Date());
  w.gtag("config", GA4_ID, { anonymize_ip: true });
  const ga = document.createElement("script");
  ga.async = true;
  ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(ga);

  w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const gtm = document.createElement("script");
  gtm.async = true;
  gtm.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(gtm);
}

function loadPixel() {
  pixelLoaded = true;
  const w = window as any;
  if (!w.fbq) {
    const fbq: any = function (...args: unknown[]) {
      fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    w.fbq = fbq;
    if (!w._fbq) w._fbq = fbq;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }
  w.fbq("consent", "grant");
  w.fbq("init", META_PIXEL_ID);
  w.fbq("track", "PageView");
}

// Synchronise les autres onglets ouverts.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CONSENT_KEY) applyConsent();
  });
}
