// Composite slots don't map 1:1 to a player's own position, so list what each one accepts.
// Slots absent here (QB, RB, WR, TE, K, DEF, DL, LB, DB, CB, S, DE, DT, ...) match by equality.
const SLOT_POSITION_MAP: Record<string, string[]> = {
  FLEX: ['RB', 'WR', 'TE'],
  SUPER_FLEX: ['QB', 'RB', 'WR', 'TE'],
  WRRB_FLEX: ['WR', 'RB'],
  REC_FLEX: ['WR', 'TE'],
  IDP_FLEX: ['DL', 'LB', 'DB'],
}

const NON_STARTING_SLOTS = new Set(['BN', 'IR', 'TAXI'])

const DEFAULT_POSITION_FILTERS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF']

export function matchesPositionFilter(playerPositions: string[] | null, filter: string): boolean {
  if (filter === 'ALL') return true
  if (!playerPositions || playerPositions.length === 0) return false
  const allowed = SLOT_POSITION_MAP[filter] ?? [filter]
  return playerPositions.some((p) => allowed.includes(p))
}

// Builds the filter chip list from the league's actual starting roster slots, so a league running
// IDP (DL/LB/DB/IDP_FLEX) or extra flex types sees exactly the positions it drafts for.
export function derivePositionFilters(rosterPositions: string[] | undefined): string[] {
  if (!rosterPositions || rosterPositions.length === 0) return DEFAULT_POSITION_FILTERS

  const seen = new Set<string>()
  const ordered: string[] = []
  for (const slot of rosterPositions) {
    if (NON_STARTING_SLOTS.has(slot) || seen.has(slot)) continue
    seen.add(slot)
    ordered.push(slot)
  }
  return ['ALL', ...ordered]
}
