import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLeagueDrafts } from '@/api/sleeper'
import { useLeague } from '@/hooks/useLeague'
import { autoSelectDraft } from '@/lib/autoSelectDraft'

export default function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>()
  const navigate = useNavigate()
  const leagueQuery = useLeague(leagueId)
  const draftsQuery = useQuery({
    queryKey: ['league-drafts', leagueId],
    queryFn: () => getLeagueDrafts(leagueId as string),
    enabled: !!leagueId,
  })
  const autoDraft = draftsQuery.data ? autoSelectDraft(draftsQuery.data) : null

  useEffect(() => {
    if (autoDraft) navigate(`/draft/${autoDraft.draft_id}`, { replace: true })
  }, [autoDraft, navigate])

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm text-emerald-400 hover:underline">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold text-slate-100">
        {leagueQuery.data?.name ?? 'League'}
      </h1>
      {!autoDraft && (
        <ul className="flex flex-col gap-2">
          {draftsQuery.data?.map((draft) => (
            <li key={draft.draft_id}>
              <Link
                to={`/draft/${draft.draft_id}`}
                className="flex items-center justify-between rounded-md border border-slate-800 px-4 py-3 text-sm hover:border-emerald-600 hover:bg-slate-900"
              >
                <span className="text-slate-100">
                  {draft.metadata?.name || `${draft.type} draft`}
                </span>
                <span className="text-xs uppercase text-slate-400">
                  {draft.status.replace('_', ' ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
