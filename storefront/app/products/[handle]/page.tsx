import { notFound } from 'next/navigation'
import { medusaClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import { ImageIcon, Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react'
import AddToCart from '@/components/product/add-to-cart'
import ProductAccordion from '@/components/product/product-accordion'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variant = product.variants?.[0]
  const price = variant?.calculated_price

  const formattedPrice =
    price && price.calculated_amount != null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: price.currency_code?.toUpperCase() || 'USD',
        }).format(price.calculated_amount / 100)
      : 'Price not available'

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: any) => img.url !== product.thumbnail),
  ]

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
              {allImages[0]?.url ? (
                <Image
                  src={allImages[0].url}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground/30">
                  <ImageIcon className="h-16 w-16" strokeWidth={1} />
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.slice(1, 5).map((image: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Title & Subtitle */}
            <div>
              {product.subtitle && (
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="text-h2 font-heading font-semibold">{product.title}</h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <p className="text-xl font-heading font-semibold">{formattedPrice}</p>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 1 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-semibold mb-3">
                  {product.options?.[0]?.title || 'Options'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      className="px-4 py-2 text-sm border hover:border-foreground transition-colors"
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {variant && <AddToCart variant={variant} />}

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Secure Checkout</p>
              </div>
            </div>

            {/* Accordion Sections */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>
    </>
  )
}
