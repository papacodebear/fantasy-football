import type { SleeperPick } from '@/api/sleeper'

interface Props {
  picks: SleeperPick[]
  slotLabels: Record<number, string>
}

export default function PicksFeed({ picks, slotLabels }: Props) {
  const sorted = [...picks].sort((a, b) => b.pick_no - a.pick_no)

  return (
    <div className="flex h-full flex-col gap-1 overflow-auto p-3">
      <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        Recent picks
      </h2>
      {sorted.length === 0 && <p className="px-1 text-sm text-slate-500">No picks yet.</p>}
      <ul className="flex flex-col divide-y divide-slate-800/60">
        {sorted.map((pick) => (
          <li key={pick.pick_no} className="flex flex-col px-1 py-1.5 text-sm">
            <span className="text-slate-200">
              {pick.metadata.first_name} {pick.metadata.last_name}{' '}
              <span className="text-slate-500">
                ({pick.metadata.position} · {pick.metadata.team ?? 'FA'})
              </span>
            </span>
            <span className="text-slate-500">
              Pick {pick.pick_no} · {slotLabels[pick.draft_slot] ?? `Slot ${pick.draft_slot}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
