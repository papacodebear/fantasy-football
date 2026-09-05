import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeagueDrafts, getUserByUsername, getUserLeagues } from '@/api/sleeper'
import { useNflState } from '@/hooks/useNflState'

export default function UsernameFlow() {
  const navigate = useNavigate()
  const { data: nflState } = useNflState()

  const [usernameInput, setUsernameInput] = useState('')
  const [submittedUsername, setSubmittedUsername] = useState('')
  const [season, setSeason] = useState('')
  const [selectedLeagueId, setSelectedLeagueId] = useState('')

  const effectiveSeason = season || nflState?.season || ''

  const userQuery = useQuery({
    queryKey: ['user', submittedUsername],
    queryFn: () => getUserByUsername(submittedUsername),
    enabled: !!submittedUsername,
    retry: false,
  })

  const leaguesQuery = useQuery({
    queryKey: ['leagues', userQuery.data?.user_id, effectiveSeason],
    queryFn: () => getUserLeagues(userQuery.data!.user_id, effectiveSeason),
    enabled: !!userQuery.data && !!effectiveSeason,
  })

  const draftsQuery = useQuery({
    queryKey: ['league-drafts', selectedLeagueId],
    queryFn: () => getLeagueDrafts(selectedLeagueId),
    enabled: !!selectedLeagueId,
  })

  function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSelectedLeagueId('')
    setSubmittedUsername(usernameInput.trim())
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleUsernameSubmit} className="flex gap-2">
        <input
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="Sleeper username"
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!usernameInput.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Find leagues
        </button>
      </form>

      {userQuery.isError && (
        <p className="text-sm text-red-400">Couldn't find a Sleeper user with that username.</p>
      )}

      {userQuery.data && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-300">
              Signed in as{' '}
              <span className="font-medium text-slate-100">{userQuery.data.display_name}</span>
            </p>
            <select
              value={effectiveSeason}
              onChange={(e) => setSeason(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
            >
              {[0, 1, 2].map((offset) => {
                const year = String(Number(nflState?.season ?? new Date().getFullYear()) - offset)
                return (
                  <option key={year} value={year}>
                    {year} season
                  </option>
                )
              })}
            </select>
          </div>

          {leaguesQuery.isLoading && <p className="text-sm text-slate-400">Loading leagues…</p>}
          {leaguesQuery.data && leaguesQuery.data.length === 0 && (
            <p className="text-sm text-slate-400">No leagues found for {effectiveSeason}.</p>
          )}
          {leaguesQuery.data && leaguesQuery.data.length > 0 && (
            <ul className="flex flex-col gap-1">
              {leaguesQuery.data.map((league) => (
                <li key={league.league_id}>
                  <button
                    onClick={() => setSelectedLeagueId(league.league_id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-800 ${
                      selectedLeagueId === league.league_id
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {league.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedLeagueId && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          {draftsQuery.isLoading && <p className="text-sm text-slate-400">Loading drafts…</p>}
          {draftsQuery.data && draftsQuery.data.length === 0 && (
            <p className="text-sm text-slate-400">No drafts found for this league.</p>
          )}
          {draftsQuery.data?.map((draft) => (
            <button
              key={draft.draft_id}
              onClick={() => navigate(`/draft/${draft.draft_id}`)}
              className="flex items-center justify-between rounded-md border border-slate-800 px-3 py-2 text-left text-sm hover:border-emerald-600 hover:bg-slate-800"
            >
              <span className="text-slate-100">
                {draft.metadata?.name || `${draft.type} draft`}
              </span>
              <span className="text-xs uppercase text-slate-400">
                {draft.status.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
