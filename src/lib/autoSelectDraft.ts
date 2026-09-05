import type { SleeperDraft } from '@/api/sleeper'

// Skip the extra pick-a-draft step when there's only one option worth showing: either the league
// has exactly one draft, or exactly one draft that isn't already complete (the current one).
export function autoSelectDraft(drafts: SleeperDraft[]): SleeperDraft | null {
  if (drafts.length === 1) return drafts[0]
  const active = drafts.filter((d) => d.status !== 'complete')
  return active.length === 1 ? active[0] : null
}
