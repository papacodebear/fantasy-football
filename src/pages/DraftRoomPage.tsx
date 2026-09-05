import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addRecentDraft } from '@/api/recentDrafts'
import AvailablePlayersPanel from '@/components/draft/AvailablePlayersPanel'
import DraftBoard from '@/components/draft/DraftBoard'
import DraftHeader from '@/components/draft/DraftHeader'
import MobileTabs, { type MobileTab } from '@/components/draft/MobileTabs'
import PicksFeed from '@/components/draft/PicksFeed'
import { useAvailablePlayers } from '@/hooks/useAvailablePlayers'
import { useDraft } from '@/hooks/useDraft'
import { useDraftPicks } from '@/hooks/useDraftPicks'
import { useLeague, useLeagueRosters, useLeagueUsers } from '@/hooks/useLeague'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePlayers } from '@/hooks/usePlayers'
import { buildDraftedByLookup } from '@/lib/draftedBy'
import { derivePositionFilters } from '@/lib/positions'
import { buildSlotLabels, type NameMode } from '@/lib/teamLabels'

export default function DraftRoomPage() {
  const { draftId } = useParams<{ draftId: string }>()
  const [mobileTab, setMobileTab] = useState<MobileTab>('board')
  const [nameMode, setNameMode] = useState<NameMode>('team')
  const [showSidebar, setShowSidebar] = useState(true)
  const isWide = useMediaQuery('(min-width: 1024px)')

  const draftQuery = useDraft(draftId)
  const draft = draftQuery.data
  const picksQuery = useDraftPicks(draftId, draft?.status)
  const picks = picksQuery.data ?? []
  const playersQuery = usePlayers()
  const available = useAvailablePlayers(playersQuery.data, picks)

  const leagueQuery = useLeague(draft?.league_id)
  const leagueUsersQuery = useLeagueUsers(draft?.league_id)
  const leagueRostersQuery = useLeagueRosters(draft?.league_id)
  const positionFilters = derivePositionFilters(leagueQuery.data?.roster_positions)
  const slotLabels = buildSlotLabels(
    draft?.slot_to_roster_id ?? null,
    leagueRostersQuery.data,
    leagueUsersQuery.data,
    nameMode,
  )
  const draftedBy = buildDraftedByLookup(picks, slotLabels)

  useEffect(() => {
    if (draft && draftId) {
      addRecentDraft(draftId, draft.metadata?.name || `${draft.type} draft (${draft.season})`)
    }
  }, [draft, draftId])

  if (draftQuery.isLoading) {
    return <p className="p-6 text-sm text-slate-400">Loading draft…</p>
  }
  if (draftQuery.isError || !draft) {
    return (
      <p className="p-6 text-sm text-red-400">
        Couldn't load that draft — check the ID and try again.
      </p>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <DraftHeader
        draft={draft}
        picks={picks}
        slotLabels={slotLabels}
        isFetchingPicks={picksQuery.isFetching}
        nameMode={nameMode}
        onNameModeChange={setNameMode}
        isWide={isWide}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
      />

      {!isWide && <MobileTabs active={mobileTab} onChange={setMobileTab} />}

      {isWide ? (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <DraftBoard draft={draft} picks={picks} slotLabels={slotLabels} />
          </div>
          {showSidebar && (
            <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-slate-800">
              <div className="min-h-0 flex-1 overflow-hidden border-b border-slate-800">
                <AvailablePlayersPanel
                  players={available}
                  allPlayers={playersQuery.data}
                  draftedBy={draftedBy}
                  isLoading={playersQuery.isLoading}
                  positionFilters={positionFilters}
                />
              </div>
              <div className="h-64 shrink-0 overflow-hidden">
                <PicksFeed picks={picks} slotLabels={slotLabels} />
              </div>
            </aside>
          )}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === 'board' && (
            <DraftBoard draft={draft} picks={picks} slotLabels={slotLabels} />
          )}
          {mobileTab === 'available' && (
            <AvailablePlayersPanel
              players={available}
              allPlayers={playersQuery.data}
              draftedBy={draftedBy}
              isLoading={playersQuery.isLoading}
              positionFilters={positionFilters}
            />
          )}
          {mobileTab === 'picks' && <PicksFeed picks={picks} slotLabels={slotLabels} />}
        </div>
      )}
    </div>
  )
}
