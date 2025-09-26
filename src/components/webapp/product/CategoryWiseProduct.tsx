"use client"

import React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getProductsByFilter } from "@/service/product-Service"
import type { Product } from "@/types/product-Types"

const DEFAULT_MIN_PRICE = 0
const DEFAULT_MAX_PRICE = 1000000
const DEFAULT_LIMIT = 24

const CategoryWiseProductPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const productType = searchParams.get("productType")?.trim() || "OE"
  const brand = searchParams.get("brand")?.trim() || ""
  const model = searchParams.get("model")?.trim() || ""
  const variant = searchParams.get("variant")?.trim() || ""
  const subcategory = searchParams.get("subcategory")?.trim() || ""
  const id = searchParams.get("id")?.trim() || ""
  const vehicleName = searchParams.get("vehicleName")?.trim() || ""
  const vehicleType = searchParams.get("vehicleType")?.trim() || ""

  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])

  // Log URL parameters when component mounts
  console.log("CategoryWiseProduct component mounted with URL parameters:", {
    productType,
    brand,
    model,
    variant,
    id,
    vehicleName,
    vehicleType
  })

  const buildImageUrl = React.useCallback(
    (path?: string) => {
      if (!path) return "/placeholder.svg"
      if (/^https?:\/\//i.test(path)) return path
      return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
    },
    [filesOrigin]
  )

  React.useEffect(() => {
    let ignore = false
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("Fetching products with parameters:", {
          productType,
          brand,
          model,
          variant,
          id,
          sortBy: "name-asc",
          minPrice: DEFAULT_MIN_PRICE,
          maxPrice: DEFAULT_MAX_PRICE,
          page: 1,
          limit: DEFAULT_LIMIT
        })

        const response = await getProductsByFilter(
          productType,
          brand,
          model,
          variant,
          subcategory,
          id,
          "name-asc",
          DEFAULT_MIN_PRICE,
          DEFAULT_MAX_PRICE
        )

        if (!ignore) {
          const items = response?.data.products ?? []
          console.log("Fetched products:", items)
          console.log("Total products found:", items.length)
          console.log("Product IDs:", items.map(p => p._id))
          setProducts(items)
        }
      } catch (err: any) {
        if (!ignore) {
          const message = err?.message || "Failed to load products. Please try again later."
          console.error("Error fetching products:", {
            error: err,
            message,
            parameters: {
              productType,
              brand,
              model,
              variant,
              id
            }
          })
          setError(message)
          setProducts([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      ignore = true
    }
  }, [productType, brand, model, variant, subcategory, id])

  const handleViewProduct = React.useCallback(
    (productId: string) => {
      router.push(`/shop/product/${productId}`)
    },
    [router]
  )

  const vehicleHeading = React.useMemo(() => {
    const parts = [] as string[]
    if (vehicleType) parts.push(vehicleType)
    if (vehicleName) parts.push(vehicleName)
    if (brand) parts.push(brand)
    if (model) parts.push(model)
    if (variant) parts.push(variant)
    return parts.join(" • ")
  }, [vehicleType, vehicleName, brand, model, variant])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          
      
            <span>/</span>
            <span className="text-foreground">Category Wise Products</span>
          </div>
          <div className="mt-3">
            {/* <h1 className="text-2xl font-bold text-foreground">
              {vehicleHeading || "Matched Products"}
            </h1> */}
            {/* <p className="text-sm text-muted-foreground mt-1">
              Showing products filtered by product type "{productType}" with matching brand/model/variant selections.
            </p> */}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 h-48 rounded-md bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                <div className="mt-4 flex gap-2">
                  <div className="h-9 w-full rounded bg-muted" />
                  <div className="h-9 w-full rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold text-foreground">No Products Found</h2>
            <p className="mt-2 text-muted-foreground">
              We couldn’t find products that match this vehicle configuration yet. Try exploring other categories or check back soon.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/"
                className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Back to Home
              </Link>
       
            </div>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {products.length} Product{products.length !== 1 ? "s" : ""} Found
                </h2>
                {/* <p className="text-sm text-muted-foreground">
                  Results filtered using brand "{brand || "All"}", model "{model || "All"}", and variant "{variant || "All"}".
                </p> */}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-md bg-muted">
                    <img
                      src={buildImageUrl(product.images?.[0])}
                      alt={product.product_name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                      {product.product_name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.brand?.brand_name || brand || "Unknown brand"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        Rs {product.selling_price?.toLocaleString() || "0"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.sku_code}
                      </span>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product._id)}
                        className="flex-1 rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        View Details
                      </button>
                      {/* <Link
                        href={`/shop/search?query=${encodeURIComponent(product.product_name)}`}
                        className="flex-1 rounded-md bg-secondary px-3 py-2 text-center text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                      >
                        Similar
                      </Link> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryWiseProductPage


