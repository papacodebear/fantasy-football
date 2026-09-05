export type MobileTab = 'board' | 'available' | 'picks'

interface Props {
  active: MobileTab
  onChange: (tab: MobileTab) => void
}

const TABS: { id: MobileTab; label: string }[] = [
  { id: 'board', label: 'Board' },
  { id: 'available', label: 'Available' },
  { id: 'picks', label: 'Picks' },
]

export default function MobileTabs({ active, onChange }: Props) {
  return (
    <nav className="flex border-b border-slate-800">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2 text-sm font-medium ${
            active === tab.id ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
