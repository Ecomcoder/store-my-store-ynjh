'use client'

import { useQuery } from '@tanstack/react-query'
import { medusaClient } from '@/lib/medusa-client'

export function useRegion() {
  const { data: region, isLoading, error } = useQuery({
    queryKey: ['region'],
    queryFn: async () => {
      const response = await medusaClient.store.region.list()
      const firstRegion = response.regions[0]
      if (!firstRegion) throw new Error('No region configured')
      return firstRegion
    },
    staleTime: 1000 * 60 * 30, // 30 minutes — regions rarely change
  })

  return { region, regionId: region?.id, isLoading, error }
}
