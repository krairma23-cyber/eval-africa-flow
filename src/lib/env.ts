/**
 * Environment detection helper.
 *
 * Returns the active environment based on `VITE_APP_ENV` (set in
 * `.env.development`, `.env.staging`, `.env.production`). Falls back to
 * inferring from the Supabase URL or the Vite mode when not provided.
 *
 * Used by:
 *  - `EnvironmentBanner` to display a coloured banner on non-prod
 *  - any guard that should refuse destructive operations off-prod
 */
export type AppEnv = "development" | "staging" | "production";

export function getAppEnv(): AppEnv {
  const explicit = (import.meta.env.VITE_APP_ENV as string | undefined)?.toLowerCase();
  if (explicit === "development" || explicit === "staging" || explicit === "production") {
    return explicit;
  }

  // Fallback: infer from Vite mode
  const mode = import.meta.env.MODE;
  if (mode === "production") return "production";
  if (mode === "staging") return "staging";
  return "development";
}

export const isProd = () => getAppEnv() === "production";
export const isStaging = () => getAppEnv() === "staging";
export const isDev = () => getAppEnv() === "development";
