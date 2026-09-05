import { useQuery } from '@tanstack/react-query'
import { getDraft } from '@/api/sleeper'

const METADATA_POLL_MS = 10_000

export function useDraft(draftId: string | undefined) {
  return useQuery({
    queryKey: ['draft', draftId],
    queryFn: () => getDraft(draftId as string),
    enabled: !!draftId,
    refetchInterval: (query) =>
      query.state.data?.status === 'complete' ? false : METADATA_POLL_MS,
    refetchIntervalInBackground: false,
  })
}
