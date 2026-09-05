import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDraftInput } from '@/api/parseDraftInput'

export default function DraftIdForm() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const draftId = parseDraftInput(input)
    if (!draftId) {
      setError("Couldn't find a draft ID in that — paste the draft URL or its numeric ID.")
      return
    }
    setError('')
    navigate(`/draft/${draftId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Draft ID or Sleeper draft URL"
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Go
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  )
}
