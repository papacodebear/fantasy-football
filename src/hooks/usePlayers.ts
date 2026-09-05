import { useQuery } from '@tanstack/react-query'
import { get, set } from 'idb-keyval'
import { getAllPlayers, type SleeperPlayer } from '@/api/sleeper'

const PLAYERS_KEY = 'sleeper-players-nfl'
const FETCHED_AT_KEY = 'sleeper-players-nfl-fetched-at'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

async function fetchPlayers(): Promise<Record<string, SleeperPlayer>> {
  const fetchedAt = await get<number>(FETCHED_AT_KEY)
  if (fetchedAt && Date.now() - fetchedAt < ONE_DAY_MS) {
    const cached = await get<Record<string, SleeperPlayer>>(PLAYERS_KEY)
    if (cached) return cached
  }
  const players = await getAllPlayers()
  await set(PLAYERS_KEY, players)
  await set(FETCHED_AT_KEY, Date.now())
  return players
}

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
    staleTime: ONE_DAY_MS,
    gcTime: Infinity,
  })
}
