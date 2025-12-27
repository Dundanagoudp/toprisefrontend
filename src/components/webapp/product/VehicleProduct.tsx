"use client"
import React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getProductsByFilter } from "@/service/product-Service"
import type { Product } from "@/types/product-Types"
import { Filter } from 'lucide-react';
import FilterSidebar from "./FilterSidebar"
import { useAppSelector } from "@/store/hooks"
import { selectVehicleTypeId } from "@/store/slice/vehicle/vehicleSlice"

// Simple alias for compatibility with existing code


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
  const vehicleTypeId = searchParams.get("vehicleTypeId")?.trim() || ""
  
  // Get typeId from Redux store with fallback to URL param
  const reduxTypeId = useAppSelector(selectVehicleTypeId)
  const typeId = reduxTypeId || vehicleTypeId || ""
  
  // Get filter values from URL params
  const urlCategory = searchParams.get("category")?.trim() || ""
  const urlSubCategory = searchParams.get("subcategory")?.trim() || ""
  const urlYear = searchParams.get("year")?.trim() || ""
  
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sortBy, setSortBy] = React.useState<string>('A-Z');
  const [minPrice, setMinPrice] = React.useState<number>(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = React.useState<number>(DEFAULT_MAX_PRICE);
  const [isFilterOpen, setIsFilterOpen] = React.useState<boolean>(false);
  const [category, setCategory] = React.useState<string>(urlCategory);
  const [subCategory, setSubCategory] = React.useState<string>(urlSubCategory);
  const [year, setYear] = React.useState<string>(urlYear);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])

  // Sync state with URL params when they change
  React.useEffect(() => {
    setCategory(urlCategory)
    setSubCategory(urlSubCategory)
    setYear(urlYear)
  }, [urlCategory, urlSubCategory, urlYear])

  // Log URL parameters when component mounts
  // console.log("VehicleProduct component mounted with URL parameters:", {
  //   productType,
  //   brand,
  //   model,
  //   variant,
  //   id,
  //   vehicleName,
  //   vehicleType
  // })

  const buildImageUrl = React.useCallback(
    (path?: string) => {
      if (!path) return "/placeholder.svg"
      if (/^https?:\/\//i.test(path)) return path
      return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
    },
    [filesOrigin]
  )

 const fetchProducts = React.useCallback(
  async (opts?: {
    productType?: string;
    brand?: string;
    model?: string;
    variant?: string;
    subcategory?: string;
    id?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    year?: string;
  }) => {
    setLoading(true);
    setError(null);
    const {
      productType: pType = productType,
      brand: b = brand,
      model: m = model,
      variant: v = variant,
      subcategory: sc = subCategory,
      id: pid = id,
      sortBy: s = sortBy,
      minPrice: min = minPrice,
      maxPrice: max = maxPrice,
      category: cat = category,
      year: yr = year,
    } = opts || {};

    let ignore = false;
    try {
      // Use subCategory from state if available, otherwise fallback to subcategory from URL
      
      
      const response = await getProductsByFilter(
        "", // product_type - no longer used
        b,
        m,
        v,
        cat,
        sc,
        yr,
        pid,
        s,
        min,
        max,
        1,
        DEFAULT_LIMIT
      );
      if (ignore) return;
      const items = response?.data?.products ?? [];
      setProducts(items);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err?.message || "Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      if (!ignore) setLoading(false);
    }

    // return a cancellable token if you wish (not used here)
    return () => {
      ignore = true;
    };
  },
  [productType, brand, model, variant, subCategory, id, sortBy, minPrice, maxPrice, category, year]
);
React.useEffect(() => {
  fetchProducts();
}, [fetchProducts]);

// Update URL when filters change (but not on initial mount to avoid conflicts)
React.useEffect(() => {
  const currentCategory = searchParams.get("category")?.trim() || ""
  const currentSubCategory = searchParams.get("subcategory")?.trim() || ""
  const currentYear = searchParams.get("year")?.trim() || ""
  
  // Only update URL if values have actually changed
  if (category === currentCategory && subCategory === currentSubCategory && year === currentYear) {
    return
  }
  
  const params = new URLSearchParams(searchParams.toString())
  
  if (category) {
    params.set("category", category)
  } else {
    params.delete("category")
  }
  
  if (subCategory) {
    params.set("subcategory", subCategory)
  } else {
    params.delete("subcategory")
  }
  
  if (year) {
    params.set("year", year)
  } else {
    params.delete("year")
  }
  
  // Update URL without causing a page reload
  const newUrl = `${window.location.pathname}?${params.toString()}`
  router.replace(newUrl, { scroll: false })
}, [category, subCategory, year, router, searchParams])
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
            <FilterSidebar
              products={products}
              sortBy={sortBy}
              setSortBy={setSortBy}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              category={category}
              setCategory={setCategory}
              subCategory={subCategory}
              setSubCategory={setSubCategory}
              year={year}
              setYear={setYear}
              categoryId={category}
              typeId={typeId}
            />
          </div>
          {/* Mobile Sidebar Overlay */}
          {isFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsFilterOpen(false)}>
              <div className="absolute left-0 top-0 h-full" onClick={(e) => e.stopPropagation()}>
                <FilterSidebar
                  products={products}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  isFilterOpen={isFilterOpen}
                  setIsFilterOpen={setIsFilterOpen}
                  category={category}
                  setCategory={setCategory}
                  subCategory={subCategory}
                  setSubCategory={setSubCategory}
                  year={year}
                  setYear={setYear}
                  categoryId={category}
                  typeId={typeId}
                />
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
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 cursor-pointer">
                  {products.map((product) => {
                    const isOutOfStock = product.out_of_stock ?? false;
                    return (
                    <div
                      key={product._id}
                      className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-md bg-muted">
                        <img
                          src={buildImageUrl(product.images?.[0])}
                          alt={product.product_name}
                            onClick={() => handleViewProduct(product._id)}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col"   onClick={() => handleViewProduct(product._id)}>
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
                          {/* <span className="text-xs text-muted-foreground">
                            {product.sku_code}
                          </span> */}
                        </div>
                        <div className="mt-6 flex gap-2">
                          {/* <button
                            onClick={() => handleViewProduct(product._id)}
                            className="flex-1 rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            View Details
                          </button> */}
                        </div>
                      </div>
                    </div>
                  )})}
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


