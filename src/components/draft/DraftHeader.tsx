import type { SleeperDraft, SleeperPick } from '@/api/sleeper'
import { useNow } from '@/hooks/useNow'
import { roundForPick, slotForPick } from '@/lib/draftOrder'
import type { NameMode } from '@/lib/teamLabels'

interface Props {
  draft: SleeperDraft
  picks: SleeperPick[]
  slotLabels: Record<number, string>
  isFetchingPicks: boolean
  nameMode: NameMode
  onNameModeChange: (mode: NameMode) => void
}

export default function DraftHeader({
  draft,
  picks,
  slotLabels,
  isFetchingPicks,
  nameMode,
  onNameModeChange,
}: Props) {
  const now = useNow()
  const { teams, rounds, pick_timer } = draft.settings
  const totalPicks = teams * rounds
  const currentPickNo = picks.length + 1
  const isComplete = draft.status === 'complete' || currentPickNo > totalPicks

  const currentRound = isComplete ? rounds : roundForPick(currentPickNo, teams)
  const currentSlot = isComplete
    ? null
    : slotForPick(currentPickNo, teams, draft.type, draft.settings.reversal_round)
  const onTheClock =
    currentSlot !== null ? (slotLabels[currentSlot] ?? `Slot ${currentSlot}`) : null

  let countdown: string | null = null
  if (!isComplete && pick_timer && draft.last_picked) {
    const deadline = draft.last_picked + pick_timer * 1000
    const remainingSec = Math.max(0, Math.round((deadline - now) / 1000))
    countdown = `${Math.floor(remainingSec / 60)}:${String(remainingSec % 60).padStart(2, '0')}`
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">
          {draft.metadata?.name || `${draft.type} draft`}
        </h1>
        <p className="text-xs text-slate-400 sm:text-sm">
          {isComplete
            ? 'Draft complete'
            : `Round ${currentRound} of ${rounds} · Pick ${currentPickNo} of ${totalPicks}`}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex rounded-full bg-slate-800 p-0.5 text-xs font-medium">
          {(['team', 'username'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onNameModeChange(mode)}
              className={`rounded-full px-2 py-1 capitalize ${
                nameMode === mode
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        {!isComplete && onTheClock && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-emerald-400">On the clock</p>
            <p className="text-base font-medium text-slate-100 sm:text-lg">
              {onTheClock}
              {countdown && <span className="ml-2 font-mono text-slate-400">{countdown}</span>}
            </p>
          </div>
        )}
        <span
          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
            isFetchingPicks ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isFetchingPicks ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`}
          />
          Live
        </span>
      </div>
    </header>
  )
}
