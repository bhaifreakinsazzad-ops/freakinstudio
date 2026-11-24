const DEFAULT_APP_URL = "https://freakinstudio.space";

export function isValidHttpUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSafeAppUrl(raw?: string): URL {
  if (isValidHttpUrl(raw)) {
    return new URL(raw.trim());
  }
  return new URL(DEFAULT_APP_URL);
}

export function getSafeAppOrigin(raw?: string): string {
  return getSafeAppUrl(raw).origin;
}
