function parseFlag(value: string | undefined, defaultValue: boolean) {
  if (typeof value === "undefined") return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "off";
}

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

export const API_URL = rawApiUrl?.trim() ? rawApiUrl.trim() : undefined;
export const STRICT_API = parseFlag(import.meta.env.VITE_STRICT_API as string | undefined, false);
export const DEMO_MODE = parseFlag(import.meta.env.VITE_DEMO_MODE as string | undefined, true);
export const USE_DEMO_FALLBACK = DEMO_MODE && !STRICT_API;
