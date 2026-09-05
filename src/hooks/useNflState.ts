import { useQuery } from '@tanstack/react-query'
import { getNflState } from '@/api/sleeper'

export function useNflState() {
  return useQuery({
    queryKey: ['nfl-state'],
    queryFn: getNflState,
    staleTime: 60 * 60 * 1000,
  })
}
