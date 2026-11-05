import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PRIVATE_PREFIXES = ["/dashboard", "/command-center", "/onboarding", "/set-password", "/invitation", "/payment-callback", "/parent-portal"];

/** Adds <meta name="robots" content="noindex, nofollow"> on private (admin) pages. */
export function PrivateNoIndex() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isPrivate = PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"][data-private]');
    if (isPrivate) {
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "robots";
        tag.setAttribute("data-private", "");
        document.head.appendChild(tag);
      }
      tag.content = "noindex, nofollow";
    } else tag?.remove();
  }, [pathname]);
  return null;
}
