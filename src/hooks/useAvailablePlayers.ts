import { useMemo } from 'react'
import type { SleeperPick, SleeperPlayer } from '@/api/sleeper'
import { isRosterablePlayer } from '@/lib/players'

export function useAvailablePlayers(
  players: Record<string, SleeperPlayer> | undefined,
  picks: SleeperPick[] | undefined,
): SleeperPlayer[] {
  return useMemo(() => {
    if (!players) return []
    const draftedIds = new Set((picks ?? []).map((p) => p.player_id))
    return Object.values(players)
      .filter((p) => isRosterablePlayer(p) && !draftedIds.has(p.player_id))
      .sort((a, b) => (a.search_rank ?? Infinity) - (b.search_rank ?? Infinity))
  }, [players, picks])
}
