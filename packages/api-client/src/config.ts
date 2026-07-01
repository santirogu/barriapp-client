/** Resolve the API base URL from the environment, defaulting to local dev. */
export const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

export function resolveApiUrl(explicit?: string): string {
  if (explicit) return explicit.replace(/\/$/, '');
  // Expo (EXPO_PUBLIC_*) and Next (NEXT_PUBLIC_*) both inline these at build time.
  const fromEnv =
    (typeof process !== 'undefined' &&
      (process.env?.EXPO_PUBLIC_API_URL || process.env?.NEXT_PUBLIC_API_URL)) ||
    undefined;
  return (fromEnv || DEFAULT_API_URL).replace(/\/$/, '');
}
