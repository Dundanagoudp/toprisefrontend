"use client"
import React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getProductsByFilter } from "@/service/product-Service"
import type { Product } from "@/types/product-Types"
import { Filter, X } from 'lucide-react';

const DEFAULT_MIN_PRICE = 0
const DEFAULT_MAX_PRICE = 1000000
const DEFAULT_LIMIT = 24

const VehicleProductsPage: React.FC = () => {
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
  const [sortBy, setSortBy] = React.useState<string>('name-asc');
  const [minPrice, setMinPrice] = React.useState<number>(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = React.useState<number>(DEFAULT_MAX_PRICE);
  const [isFilterOpen, setIsFilterOpen] = React.useState<boolean>(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])

  // Log URL parameters when component mounts
  console.log("VehicleProduct component mounted with URL parameters:", {
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
          sortBy,
          minPrice,
          maxPrice,
        })
        const response = await getProductsByFilter(
          productType,
          brand,
          model,
          variant,
          subcategory,
          id,
          sortBy,
          minPrice,
          maxPrice
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
              id,
              sortBy,
              minPrice,
              maxPrice,
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
  }, [productType, brand, model, variant, subcategory, id, sortBy, minPrice, maxPrice])

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

  const FilterSidebar = () => (
    <div className="w-80 bg-card border-r border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <button
          onClick={() => setIsFilterOpen(false)}
          className="lg:hidden p-1 hover:bg-muted rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Sort By */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Sort By</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="name-asc"
              checked={sortBy === 'name-asc'}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">Name (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="name-desc"
              checked={sortBy === 'name-desc'}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">Name (Z-A)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="price-asc"
              checked={sortBy === 'price-asc'}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">Price (Low to High)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="price-desc"
              checked={sortBy === 'price-desc'}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">Price (High to Low)</span>
          </label>
        </div>
      </div>
      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Price Range</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Min Price</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-sm text-foreground mt-1">Rs {minPrice.toLocaleString()}</div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Max Price</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-sm text-foreground mt-1">Rs {maxPrice.toLocaleString()}</div>
          </div>
        </div>
      </div>
      {/* Results Count */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} products
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 2px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 2px rgba(0,0,0,0.2);
        }
        .slider::-webkit-slider-track {
          height: 4px;
          background: hsl(var(--muted));
          border-radius: 2px;
        }
        .slider::-moz-range-track {
          height: 4px;
          background: hsl(var(--muted));
          border-radius: 2px;
        }
      `}</style>
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Vehicle Matched Products</span>
          </div>
          <div className="mt-3">
         
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>
          {/* Mobile Sidebar Overlay */}
          {isFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsFilterOpen(false)}>
              <div className="absolute left-0 top-0 h-full" onClick={(e) => e.stopPropagation()}>
                <FilterSidebar />
              </div>
            </div>
          )}
          {/* Main Content Area */}
          <div className="flex-1">
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleProductsPage
