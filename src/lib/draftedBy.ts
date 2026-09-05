import type { SleeperPick } from '@/api/sleeper'

export function buildDraftedByLookup(
  picks: SleeperPick[],
  slotLabels: Record<number, string>,
): Map<string, string> {
  const map = new Map<string, string>()
  for (const pick of picks) {
    map.set(pick.player_id, slotLabels[pick.draft_slot] ?? `Slot ${pick.draft_slot}`)
  }
  return map
}
