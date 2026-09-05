const BASE_URL = 'https://api.sleeper.app/v1'

// Sleeper's CDN caches responses (s-maxage=30, stale-while-revalidate=300), so naive polling can
// silently return stale data. bypassCache busts that + the browser cache for live-polling calls.
async function sleeperFetch<T>(path: string, opts?: { bypassCache?: boolean }): Promise<T> {
  const url = opts?.bypassCache
    ? `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}`
    : `${BASE_URL}${path}`
  const res = await fetch(url, opts?.bypassCache ? { cache: 'no-store' } : undefined)
  if (!res.ok) {
    throw new Error(`Sleeper API ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface SleeperUser {
  user_id: string
  username: string
  display_name: string
  avatar: string | null
}

export interface SleeperLeague {
  league_id: string
  name: string
  avatar: string | null
  season: string
  total_rosters: number
  roster_positions: string[]
}

export interface SleeperLeagueUser {
  user_id: string
  display_name: string
  avatar: string | null
  metadata?: { team_name?: string }
}

export interface SleeperRoster {
  roster_id: number
  owner_id: string | null
}

export type DraftStatus = 'pre_draft' | 'drafting' | 'paused' | 'complete'
export type DraftType = 'snake' | 'linear' | 'auction'

export interface SleeperDraft {
  draft_id: string
  league_id: string
  status: DraftStatus
  type: DraftType
  sport: string
  season: string
  start_time: number | null
  last_picked: number | null
  draft_order: Record<string, number> | null
  slot_to_roster_id: Record<string, number> | null
  settings: {
    teams: number
    rounds: number
    pick_timer: number
    reversal_round: number
  }
  metadata: {
    name?: string
    scoring_type?: string
  }
}

export interface SleeperPickMetadata {
  first_name?: string
  last_name?: string
  team?: string
  position?: string
  amount?: string
}

export interface SleeperPick {
  round: number
  draft_slot: number
  pick_no: number
  player_id: string
  picked_by: string
  roster_id: number | null
  is_keeper: boolean | null
  metadata: SleeperPickMetadata
}

export interface SleeperPlayer {
  player_id: string
  first_name: string
  last_name: string
  full_name?: string
  team: string | null
  position: string | null
  fantasy_positions: string[] | null
  active: boolean
  search_rank: number | null
  injury_status: string | null
}

export interface SleeperNflState {
  season: string
  week: number
  season_type: string
}

export function getUserByUsername(username: string) {
  return sleeperFetch<SleeperUser>(`/user/${encodeURIComponent(username)}`)
}

export function getUserLeagues(userId: string, season: string) {
  return sleeperFetch<SleeperLeague[]>(`/user/${userId}/leagues/nfl/${season}`)
}

export function getLeague(leagueId: string) {
  return sleeperFetch<SleeperLeague>(`/league/${leagueId}`)
}

export function getLeagueUsers(leagueId: string) {
  return sleeperFetch<SleeperLeagueUser[]>(`/league/${leagueId}/users`)
}

export function getLeagueRosters(leagueId: string) {
  return sleeperFetch<SleeperRoster[]>(`/league/${leagueId}/rosters`)
}

export function getLeagueDrafts(leagueId: string) {
  return sleeperFetch<SleeperDraft[]>(`/league/${leagueId}/drafts`)
}

export function getDraft(draftId: string) {
  return sleeperFetch<SleeperDraft>(`/draft/${draftId}`, { bypassCache: true })
}

export function getDraftPicks(draftId: string) {
  return sleeperFetch<SleeperPick[]>(`/draft/${draftId}/picks`, { bypassCache: true })
}

export function getAllPlayers() {
  return sleeperFetch<Record<string, SleeperPlayer>>('/players/nfl')
}

export function getNflState() {
  return sleeperFetch<SleeperNflState>('/state/nfl')
}

export function avatarUrl(avatar: string | null): string | null {
  return avatar ? `https://sleepercdn.com/avatars/thumbs/${avatar}` : null
}
