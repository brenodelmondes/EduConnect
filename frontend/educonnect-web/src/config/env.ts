export const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE as string | undefined)
  ? String(import.meta.env.VITE_DEMO_MODE).toLowerCase() !== "false"
  : true;
