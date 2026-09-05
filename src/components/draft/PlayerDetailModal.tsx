import type { SleeperPlayer } from '@/api/sleeper'

interface Props {
  player: SleeperPlayer
  onClose: () => void
}

export default function PlayerDetailModal({ player, onClose }: Props) {
  const name = player.full_name ?? `${player.first_name} ${player.last_name}`
  const sleeperUrl = `https://sleeper.com/nfl/players/${player.player_id}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-slate-700 bg-slate-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{name}</h2>
            <p className="text-sm text-slate-400">
              {player.position} · {player.team ?? 'Free agent'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={sleeperUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-2 py-1 text-sm text-emerald-400 hover:bg-slate-800"
            >
              Open in Sleeper ↗
            </a>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              Close
            </button>
          </div>
        </div>

        <iframe
          src={sleeperUrl}
          title={`${name} on Sleeper`}
          className="flex-1 rounded-md border border-slate-800 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  )
}
