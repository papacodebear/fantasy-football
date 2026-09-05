// Accepts a raw draft ID or a Sleeper draft URL and returns the bare ID, or null if unrecognized.
export function parseDraftInput(input: string): string | null {
  const trimmed = input.trim()
  if (/^\d{10,20}$/.test(trimmed)) return trimmed
  const match = trimmed.match(/draft\/nfl\/(\d{10,20})/) ?? trimmed.match(/(\d{10,20})/)
  return match ? match[1] : null
}
