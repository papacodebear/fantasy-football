const STORAGE_KEY = 'recent-drafts'
const MAX_ENTRIES = 8

export interface RecentDraft {
  draftId: string
  label: string
  viewedAt: number
}

export function getRecentDrafts(): RecentDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecentDraft[]) : []
  } catch {
    return []
  }
}

export function addRecentDraft(draftId: string, label: string): void {
  const existing = getRecentDrafts().filter((d) => d.draftId !== draftId)
  const updated = [{ draftId, label, viewedAt: Date.now() }, ...existing].slice(0, MAX_ENTRIES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage unavailable (private browsing, quota) — recent list just won't persist
  }
}
