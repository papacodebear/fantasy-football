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

  return (
    <div className="overflow-auto p-3 sm:p-4">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${teams}, minmax(140px, 1fr))` }}
      >
        {slots.map((slot) => (
          <div
            key={`head-${slot}`}
            className="sticky top-0 z-10 line-clamp-2 rounded-md bg-slate-900 px-2 py-2 text-center text-sm font-semibold leading-tight text-slate-200 sm:text-base"
            title={slotLabels[slot] ?? `Slot ${slot}`}
          >
            {slotLabels[slot] ?? `Slot ${slot}`}
          </div>
        ))}

        {roundNumbers.flatMap((round) =>
          slots.map((slot) => {
            const pick = pickByCell.get(`${round}-${slot}`)
            const isOnTheClock =
              !pick && round === Math.ceil(currentPickNo / teams) && slot === currentSlot
            return (
              <div
                key={`${round}-${slot}`}
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
    <div className="flex flex-col gap-2 overflow-auto p-3 sm:p-4">
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
