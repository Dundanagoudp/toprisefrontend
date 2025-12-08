"use client"
import { Button } from "@/components/ui/button"
import React from "react"
import { useRouter } from "next/navigation"
import { getCategories, getCategoriesByType } from "@/service/product-Service"
import type { Category as ProductCategory } from "@/types/product-Types"
import { useAppSelector } from "@/store/hooks"
import { selectVehicleTypeId } from "@/store/slice/vehicle/vehicleSlice"
import { ChevronRight } from 'lucide-react'

export default function CategorySection() {
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
        // console.log("Type ID:", typeId)
        // Fetch only main categories for the selected vehicle type
        const res = await getCategoriesByType(typeId, true)
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

  const displayedCategories = categories.slice(0, 6)

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Categories</h2>
          <Button
            onClick={() => router.push('/shop/categories')}
            variant="outline"
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View More
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {(loading ? Array.from({ length: 6 }) : displayedCategories).map((category: any, idx: number) => (
            <div
              key={category?._id ?? idx}
              className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow cursor-pointer min-h-[240px] text-center flex flex-col items-center justify-center"
              onClick={() => category?._id && handleCategoryClick(category)}
            >
              <div className="mb-4 flex justify-center">
                <img
                  src={buildImageUrl(category?.category_image)}
                  alt={category?.category_name || "Category"}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {category?.category_name || "\u00A0"}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
