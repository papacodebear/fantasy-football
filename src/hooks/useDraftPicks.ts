import { useQuery } from '@tanstack/react-query'
import { getDraftPicks, type DraftStatus } from '@/api/sleeper'

const PICKS_POLL_MS = 3_000

export function useDraftPicks(draftId: string | undefined, status: DraftStatus | undefined) {
  return useQuery({
    queryKey: ['draft-picks', draftId],
    queryFn: () => getDraftPicks(draftId as string),
    enabled: !!draftId,
    refetchInterval: status === 'complete' ? false : PICKS_POLL_MS,
    refetchIntervalInBackground: false,
  })
}
