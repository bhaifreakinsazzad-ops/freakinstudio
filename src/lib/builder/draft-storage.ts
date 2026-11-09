import type { PackageDraft } from "@/types/domain";

const STORAGE_KEY = "freakinstudio_package_draft";

export function saveLocalDraft(draft: PackageDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error("Failed to save draft to localStorage:", err);
  }
}

export function getLocalDraft(): PackageDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PackageDraft;
  } catch (err) {
    console.error("Failed to load draft from localStorage:", err);
    return null;
  }
}

export function clearLocalDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
