import type { SleeperPlayer } from '@/api/sleeper'

// Excludes free agents, retired/inactive entries, and non-fantasy-relevant players entirely.
export function isRosterablePlayer(p: SleeperPlayer): boolean {
  return !!p.active && !!p.team && !!p.fantasy_positions && p.fantasy_positions.length > 0
}
