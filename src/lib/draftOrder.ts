import type { DraftType } from '@/api/sleeper'

export function roundForPick(pickNo: number, teams: number): number {
  return Math.ceil(pickNo / teams)
}

// Third-round-reversal aware: normally odd rounds run forward, even rounds reverse.
// When reversalRound is set, that round repeats the prior round's direction instead of flipping back.
function isReversedRound(round: number, type: DraftType, reversalRound: number): boolean {
  if (type !== 'snake') return false
  if (!reversalRound || round < reversalRound) return round % 2 === 0
  return (round - 1) % 2 === 0
}

export function slotForPick(
  pickNo: number,
  teams: number,
  type: DraftType,
  reversalRound = 0,
): number {
  const round = roundForPick(pickNo, teams)
  const posInRound = pickNo - (round - 1) * teams
  if (isReversedRound(round, type, reversalRound)) {
    return teams - posInRound + 1
  }
  return posInRound
}

// Inverse of slotForPick: a team's fixed column slot stays the same all draft, but which
// position-in-round that slot picks at flips on reversed rounds.
export function posInRoundForSlot(
  round: number,
  slot: number,
  teams: number,
  type: DraftType,
  reversalRound = 0,
): number {
  if (isReversedRound(round, type, reversalRound)) {
    return teams - slot + 1
  }
  return slot
}
