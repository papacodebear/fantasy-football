import type { SleeperLeagueUser, SleeperRoster } from '@/api/sleeper'

export type NameMode = 'team' | 'username'

export function buildSlotLabels(
  slotToRosterId: Record<string, number> | null,
  rosters: SleeperRoster[] | undefined,
  users: SleeperLeagueUser[] | undefined,
  mode: NameMode = 'team',
): Record<number, string> {
  const labels: Record<number, string> = {}
  if (!slotToRosterId) return labels
  const rosterOwner = new Map((rosters ?? []).map((r) => [r.roster_id, r.owner_id]))
  const userById = new Map((users ?? []).map((u) => [u.user_id, u]))
  for (const [slotStr, rosterId] of Object.entries(slotToRosterId)) {
    const ownerId = rosterOwner.get(rosterId)
    const user = ownerId ? userById.get(ownerId) : undefined
    const teamName = user?.metadata?.team_name
    const username = user?.display_name
    const primary = mode === 'team' ? teamName : username
    const fallback = mode === 'team' ? username : teamName
    labels[Number(slotStr)] = primary || fallback || `Slot ${slotStr}`
  }
  return labels
}
