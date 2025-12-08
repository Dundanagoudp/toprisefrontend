"use client"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { getCategoriesByType } from "@/service/product-Service"
import type { Category as ProductCategory } from "@/types/product-Types"
import { useAppSelector } from "@/store/hooks"
import { selectVehicleTypeId } from "@/store/slice/vehicle/vehicleSlice"
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from "next/link"

export default function CategoriesListing() {
  const router = useRouter()
  const [categories, setCategories] = React.useState<ProductCategory[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const typeId = useAppSelector(selectVehicleTypeId)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])
  
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])

  const handleCategoryClick = (category: ProductCategory) => {
    if (category._id) {
      // Navigate to search page with category parameter
      const params = new URLSearchParams({
        category: category._id,
        categoryName: category.category_name
      });

      router.push(`/shop/subcategories/?${params.toString()}`);
    }
  }

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("Type ID:", typeId)
        // Fetch all categories for the selected vehicle type
        const res = await getCategoriesByType(typeId, false) // false to get all categories, not just main ones
        // console.log("Categories by type:", res)
       
        const items = (res?.data ?? []) as ProductCategory[]
        setCategories(items)
      } catch (e) {
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    if (typeId) {
      fetchData()
    }
  }, [typeId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Categories</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                All Categories
              </h1>
              <p className="text-muted-foreground">
                Browse through all available product categories
              </p>
            </div>
            {!loading && categories.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm font-medium text-primary">
                  {categories.length} categories available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-border/50 bg-card/50 p-6"
                >
                  <div className="mb-4 h-24 rounded-lg bg-muted/60" />
                  <div className="h-4 w-3/4 rounded bg-muted/60" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Categories Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any categories for your selected vehicle type. Please try selecting a different vehicle type.
            </p>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="space-y-8">
            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="group relative flex flex-col items-center gap-4 rounded-xl border border-border/40 p-6 transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
                  onClick={() => handleCategoryClick(category)}
                >
                  {/* Category Image */}
                  <div className="relative w-full h-24 overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-muted/60">
                    <img
                      src={buildImageUrl(category.category_image)}
                      alt={category.category_name}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Hover indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="w-full text-center space-y-2">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {category.category_name}
                    </h3>
                    {category.category_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {category.category_description}
                      </p>
                    )}
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="px-2 py-1 rounded-full bg-muted/50">
                        {category.category_code}
                      </span>
                    </div>
                  </div>

                  {/* Click indicator */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Back to Home */}
            <div className="flex justify-center pt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/60 bg-background/80 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
