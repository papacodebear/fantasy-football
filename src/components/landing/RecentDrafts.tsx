import { Link } from 'react-router-dom'
import { getRecentDrafts } from '@/api/recentDrafts'

export default function RecentDrafts() {
  const recent = getRecentDrafts()
  if (recent.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-slate-400">Recently viewed</h2>
      <ul className="flex flex-col gap-1">
        {recent.map((d) => (
          <li key={d.draftId}>
            <Link
              to={`/draft/${d.draftId}`}
              className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
