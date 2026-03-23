'use client'

import { useQuery } from '@tanstack/react-query'
import { medusaClient } from '@/lib/medusa-client'
import { useRegion } from './use-region'

export function useProduct(handle: string) {
  const { regionId } = useRegion()

  return useQuery({
    queryKey: ['product', handle, regionId],
    queryFn: async () => {
      if (!regionId) throw new Error('No region available')

      const response = await medusaClient.store.product.list({
        handle,
        region_id: regionId,
        fields: '*variants.calculated_price',
      })

      const product = response.products?.[0]
      if (!product) throw new Error('Product not found')
      return product
    },
    enabled: !!handle && !!regionId,
    staleTime: 1000 * 60 * 5,
  })
}
