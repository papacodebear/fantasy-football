import { useQuery } from '@tanstack/react-query'
import { getLeague, getLeagueRosters, getLeagueUsers } from '@/api/sleeper'

// Sleeper uses league_id "0" for a mock/orphan draft that has no real league behind it.
export function isRealLeague(leagueId: string | undefined): leagueId is string {
  return !!leagueId && leagueId !== '0'
}

export function useLeague(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => getLeague(leagueId as string),
    enabled: isRealLeague(leagueId),
  })
}

export function useLeagueUsers(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league-users', leagueId],
    queryFn: () => getLeagueUsers(leagueId as string),
    enabled: isRealLeague(leagueId),
  })
}

export function useLeagueRosters(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league-rosters', leagueId],
    queryFn: () => getLeagueRosters(leagueId as string),
    enabled: isRealLeague(leagueId),
  })
}
