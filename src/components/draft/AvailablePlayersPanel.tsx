import { useMemo, useState } from 'react'
import type { SleeperPlayer } from '@/api/sleeper'
import { matchesPositionFilter } from '@/lib/positions'
import { isRosterablePlayer } from '@/lib/players'
import PlayerDetailModal from './PlayerDetailModal'

interface Props {
  players: SleeperPlayer[]
  allPlayers: Record<string, SleeperPlayer> | undefined
  draftedBy: Map<string, string>
  isLoading: boolean
  positionFilters: string[]
}

const ROW_LIMIT = 150

export default function AvailablePlayersPanel({
  players,
  allPlayers,
  draftedBy,
  isLoading,
  positionFilters,
}: Props) {
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [selectedPlayer, setSelectedPlayer] = useState<SleeperPlayer | null>(null)
  // The league's roster slots may not be known yet on first render (or may change once loaded),
  // so fall back to ALL rather than filtering by a position no longer in the list.
  const effectivePosition = positionFilters.includes(position) ? position : 'ALL'

  // Searching looks beyond the undrafted pool so you can find who already took a player.
  const eligiblePlayers = useMemo(
    () => Object.values(allPlayers ?? {}).filter(isRosterablePlayer),
    [allPlayers],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const pool = q ? eligiblePlayers : players
    return pool
      .filter((p) => {
        if (!matchesPositionFilter(p.fantasy_positions, effectivePosition)) return false
        if (!q) return true
        const name = p.full_name ?? `${p.first_name} ${p.last_name}`
        return name.toLowerCase().includes(q)
      })
      .sort((a, b) => (a.search_rank ?? Infinity) - (b.search_rank ?? Infinity))
  }, [players, eligiblePlayers, search, effectivePosition])

  const visible = filtered.slice(0, ROW_LIMIT)

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search players…"
        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
      />
      <div className="flex flex-wrap gap-1">
        {positionFilters.map((pos) => (
          <button
            key={pos}
            onClick={() => setPosition(pos)}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              effectivePosition === pos
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading && <p className="p-2 text-sm text-slate-500">Loading players…</p>}
        <ul className="flex flex-col divide-y divide-slate-800/60">
          {visible.map((p) => {
            const draftedByLabel = draftedBy.get(p.player_id)
            return (
              <li key={p.player_id}>
                <button
                  onClick={() => setSelectedPlayer(p)}
                  className={`flex w-full items-center justify-between px-1 py-1.5 text-left text-sm hover:bg-slate-800 ${
                    draftedByLabel ? 'opacity-60' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-slate-200">
                    {p.full_name ?? `${p.first_name} ${p.last_name}`}
                  </span>
                  <span className="ml-2 max-w-[45%] shrink-0 truncate text-slate-500">
                    {draftedByLabel
                      ? `Drafted by ${draftedByLabel}`
                      : `${p.position} · ${p.team ?? 'FA'}`}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {filtered.length > ROW_LIMIT && (
          <p className="p-2 text-xs text-slate-500">
            Showing {ROW_LIMIT} of {filtered.length} — refine your search to see more.
          </p>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="p-2 text-sm text-slate-500">No players match.</p>
        )}
      </div>

      {selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  )
}
