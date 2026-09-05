import DraftIdForm from '@/components/landing/DraftIdForm'
import RecentDrafts from '@/components/landing/RecentDrafts'
import UsernameFlow from '@/components/landing/UsernameFlow'

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-100">Draft Tracker</h1>
        <p className="text-sm text-slate-400">
          Follow a Sleeper draft live and see who's still on the board.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-800 p-5">
          <h2 className="text-lg font-medium text-slate-100">Find your leagues</h2>
          <UsernameFlow />
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-slate-800 p-5">
          <h2 className="text-lg font-medium text-slate-100">Jump to a draft</h2>
          <DraftIdForm />
        </section>
      </div>

      <RecentDrafts />
    </div>
  )
}
