import { useMemo } from 'react'
import type { SleeperDraft, SleeperPick } from '@/api/sleeper'
import { posInRoundForSlot, slotForPick } from '@/lib/draftOrder'

interface Props {
  draft: SleeperDraft
  picks: SleeperPick[]
  slotLabels: Record<number, string>
}

export default function DraftBoard({ draft, picks, slotLabels }: Props) {
  const pickByCell = useMemo(() => {
    const map = new Map<string, SleeperPick>()
    for (const p of picks) map.set(`${p.round}-${p.draft_slot}`, p)
    return map
  }, [picks])

  if (draft.type === 'auction') {
    return <AuctionPicksList picks={picks} />
  }

  const { teams, rounds } = draft.settings
  const currentPickNo = picks.length + 1
  const currentSlot =
    currentPickNo <= teams * rounds
      ? slotForPick(currentPickNo, teams, draft.type, draft.settings.reversal_round)
      : null

  const slots = Array.from({ length: teams }, (_, i) => i + 1)
  const roundNumbers = Array.from({ length: rounds }, (_, i) => i + 1)

  const gridTemplateColumns = `repeat(${teams}, minmax(140px, 1fr))`

  return (
    <div id="board-scroll" className="h-full overflow-auto px-3 pb-3 sm:px-4 sm:pb-4">
      {/* One sticky wrapper (not one per pill) so the header locks as a single rigid unit — it's
          a full-span item of the outer grid for a guaranteed width match with the pick cells. */}
      <div id="board-grid" className="grid gap-2" style={{ gridTemplateColumns }}>
        <div
          id="board-header-bar"
          className="sticky top-0 z-10 grid gap-2 bg-slate-950 pb-1 pt-2"
          style={{ gridRow: 1, gridColumn: '1 / -1', gridTemplateColumns }}
        >
          {slots.map((slot) => (
            <div
              key={`head-${slot}`}
              data-slot={slot}
              className="flex items-center justify-center rounded-md bg-slate-900 px-2 py-2 text-center text-sm font-semibold leading-tight text-slate-200 sm:text-base"
              title={slotLabels[slot] ?? `Slot ${slot}`}
            >
              <span className="line-clamp-3">{slotLabels[slot] ?? `Slot ${slot}`}</span>
            </div>
          ))}
        </div>

        {roundNumbers.flatMap((round) =>
          slots.map((slot) => {
            const pick = pickByCell.get(`${round}-${slot}`)
            const isOnTheClock =
              !pick && round === Math.ceil(currentPickNo / teams) && slot === currentSlot
            return (
              <div
                key={`${round}-${slot}`}
                style={{ gridRow: round + 1, gridColumn: slot }}
                className={`flex min-h-[64px] flex-col justify-center rounded-md border px-2 py-2 sm:min-h-[80px] ${
                  pick
                    ? 'border-slate-800 bg-slate-900'
                    : isOnTheClock
                      ? 'animate-pulse border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-800/60 bg-slate-950'
                }`}
              >
                {pick ? (
                  <>
                    <p className="line-clamp-2 text-sm font-medium leading-tight text-slate-100 sm:text-base">
                      {pick.metadata.first_name} {pick.metadata.last_name}
                    </p>
                    <p className="text-xs text-slate-400 sm:text-sm">
                      {pick.metadata.position} · {pick.metadata.team ?? 'FA'}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-600 sm:text-sm">
                    {round}.
                    {String(
                      posInRoundForSlot(
                        round,
                        slot,
                        teams,
                        draft.type,
                        draft.settings.reversal_round,
                      ),
                    ).padStart(2, '0')}
                  </p>
                )}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

function AuctionPicksList({ picks }: { picks: SleeperPick[] }) {
  const sorted = [...picks].sort((a, b) => b.pick_no - a.pick_no)
  return (
    <div className="flex h-full flex-col gap-2 overflow-auto p-3 sm:p-4">
      {sorted.map((pick) => (
        <div
          key={pick.pick_no}
          className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2"
        >
          <span className="text-sm font-medium text-slate-100 sm:text-base">
            {pick.metadata.first_name} {pick.metadata.last_name}{' '}
            <span className="text-slate-400">
              ({pick.metadata.position} · {pick.metadata.team ?? 'FA'})
            </span>
          </span>
          {pick.metadata.amount && (
            <span className="font-mono text-emerald-400">${pick.metadata.amount}</span>
          )}
        </div>
      ))}
      {sorted.length === 0 && <p className="text-sm text-slate-500">No picks yet.</p>}
    </div>
  )
}
