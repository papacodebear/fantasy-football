import type { SleeperLeagueUser, SleeperRoster } from '@/api/sleeper'

export function buildSlotLabels(
  slotToRosterId: Record<string, number> | null,
  rosters: SleeperRoster[] | undefined,
  users: SleeperLeagueUser[] | undefined,
): Record<number, string> {
  const labels: Record<number, string> = {}
  if (!slotToRosterId) return labels
  const rosterOwner = new Map((rosters ?? []).map((r) => [r.roster_id, r.owner_id]))
  const userName = new Map(
    (users ?? []).map((u) => [u.user_id, u.metadata?.team_name || u.display_name]),
  )
  for (const [slotStr, rosterId] of Object.entries(slotToRosterId)) {
    const ownerId = rosterOwner.get(rosterId)
    const name = ownerId ? userName.get(ownerId) : undefined
    labels[Number(slotStr)] = name || `Slot ${slotStr}`
  }
  return labels
}
