"use client"
import React from "react"
import { Filter, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { Product, Category, SubCategory, YearRange } from "@/types/product-Types"
import { 
  getCategoriesByType, 
  getSubCategoriesByCategory, 
  getYearRange 
} from "@/service/product-Service"

const DEFAULT_MIN_PRICE = 0
const DEFAULT_MAX_PRICE = 1000000

interface FilterSidebarProps {
  products: Product[]
  sortBy: string
  setSortBy: (value: string) => void
  minPrice: number
  setMinPrice: (value: number) => void
  maxPrice: number
  setMaxPrice: (value: number) => void
  isFilterOpen: boolean
  setIsFilterOpen: (value: boolean) => void
  category: string
  setCategory: (value: string) => void
  subCategory: string
  setSubCategory: (value: string) => void
  year: string
  setYear: (value: string) => void
  categoryId?: string
  typeId?: string
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  products,
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  setIsFilterOpen,
  category,
  setCategory,
  subCategory,
  setSubCategory,
  year,
  setYear,
  categoryId,
  typeId,
}) => {
  // local copies so user can tweak without immediately triggering fetch
  const [localSortBy, setLocalSortBy] = React.useState<string>(sortBy)
  const [localMin, setLocalMin] = React.useState<number>(minPrice)
  const [localMax, setLocalMax] = React.useState<number>(maxPrice)
  const [localCategory, setLocalCategory] = React.useState<string>(category)
  const [localSubCategory, setLocalSubCategory] = React.useState<string>(subCategory)
  const [localYear, setLocalYear] = React.useState<string>(year)

  // State for dropdown options
  const [categories, setCategories] = React.useState<Category[]>([])
  const [subCategories, setSubCategories] = React.useState<SubCategory[]>([])
  const [years, setYears] = React.useState<YearRange[]>([])
  const [loadingCategories, setLoadingCategories] = React.useState<boolean>(false)
  const [loadingSubCategories, setLoadingSubCategories] = React.useState<boolean>(false)
  const [loadingYears, setLoadingYears] = React.useState<boolean>(false)

  // keep local in sync if parent changes (e.g. due to deep-link)
  React.useEffect(() => {
    setLocalSortBy(sortBy)
    setLocalMin(minPrice)
    setLocalMax(maxPrice)
    setLocalCategory(category)
    setLocalSubCategory(subCategory)
    setLocalYear(year)
  }, [sortBy, minPrice, maxPrice, category, subCategory, year])

  // Fetch categories based on typeId
  React.useEffect(() => {
    const fetchCategories = async () => {
      if (!typeId) return
      setLoadingCategories(true)
      try {
        const response = await getCategoriesByType(typeId)
        const categoriesData = Array.isArray(response?.data) 
          ? response.data 
          : (response?.data as any)?.products && Array.isArray((response.data as any).products)
          ? (response.data as any).products
          : []
        setCategories(categoriesData as Category[])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [typeId])

  // Fetch subcategories when category changes
  React.useEffect(() => {
    const fetchSubCategories = async () => {
      if (!localCategory) {
        setSubCategories([])
        return
      }
      setLoadingSubCategories(true)
      try {
        const response = await getSubCategoriesByCategory(localCategory)
        const subCategoriesData = Array.isArray(response?.data)
          ? response.data
          : (response?.data as any)?.products && Array.isArray((response.data as any).products)
          ? (response.data as any).products
          : []
        setSubCategories(subCategoriesData as SubCategory[])
        // Reset subcategory if current selection is not in new list
        if (localSubCategory && !subCategoriesData.some((sc: SubCategory) => sc._id === localSubCategory)) {
          setLocalSubCategory("")
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error)
        setSubCategories([])
      } finally {
        setLoadingSubCategories(false)
      }
    }
    fetchSubCategories()
  }, [localCategory, localSubCategory])

  // Fetch years
  React.useEffect(() => {
    const fetchYears = async () => {
      setLoadingYears(true)
      try {
        const response = await getYearRange()
        const yearsData = Array.isArray(response?.data)
          ? response.data
          : (response?.data as any)?.products && Array.isArray((response.data as any).products)
          ? (response.data as any).products
          : []
        setYears(yearsData as YearRange[])
      } catch (error) {
        console.error("Failed to fetch years:", error)
        setYears([])
      } finally {
        setLoadingYears(false)
      }
    }
    fetchYears()
  }, [])

  const isDirty =
    localSortBy !== sortBy || 
    localMin !== minPrice || 
    localMax !== maxPrice ||
    localCategory !== category ||
    localSubCategory !== subCategory ||
    localYear !== year

  const handleApply = () => {
    // update parent state -> triggers fetch effect
    setSortBy(localSortBy)
    setMinPrice(localMin)
    setMaxPrice(localMax)
    setCategory(localCategory)
    setSubCategory(localSubCategory)
    setYear(localYear)
    setIsFilterOpen(false) // close sidebar on apply (optional)
  }

  const handleReset = () => {
    // reset to defaults
    setLocalSortBy('A-Z')
    setLocalMin(DEFAULT_MIN_PRICE)
    setLocalMax(DEFAULT_MAX_PRICE)
    setLocalCategory("")
    setLocalSubCategory("")
    setLocalYear("")

    // immediately reset parent too so results update
    setSortBy('A-Z')
    setMinPrice(DEFAULT_MIN_PRICE)
    setMaxPrice(DEFAULT_MAX_PRICE)
    setCategory("")
    setSubCategory("")
    setYear("")
  }

  return (
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
          aria-label="Close filters"
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
              value="A-Z"
              checked={localSortBy === 'A-Z'}
              onChange={(e) => setLocalSortBy(e.target.value)}
            />
            <span className="text-sm">Name (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="Z-A"
              checked={localSortBy === 'Z-A'}
              onChange={(e) => setLocalSortBy(e.target.value)}
            />
            <span className="text-sm">Name (Z-A)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="L-H"
              checked={localSortBy === 'L-H'}
              onChange={(e) => setLocalSortBy(e.target.value)}
            />
            <span className="text-sm">Price (Low to High)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="H-L"
              checked={localSortBy === 'H-L'}
              onChange={(e) => setLocalSortBy(e.target.value)}
            />
            <span className="text-sm">Price (High to Low)</span>
          </label>
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Category</h4>
        <select
          value={localCategory}
          onChange={(e) => {
            setLocalCategory(e.target.value)
            setLocalSubCategory("") // Reset subcategory when category changes
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={loadingCategories || !typeId}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.category_name}
            </option>
          ))}
        </select>
        {loadingCategories && (
          <p className="text-xs text-muted-foreground">Loading categories...</p>
        )}
      </div>

      {/* Subcategory Dropdown */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Subcategory</h4>
        <select
          value={localSubCategory}
          onChange={(e) => setLocalSubCategory(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loadingSubCategories || !localCategory || subCategories.length === 0}
        >
          <option value="">All Subcategories</option>
          {subCategories.map((subCat) => (
            <option key={subCat._id} value={subCat._id}>
              {subCat.subcategory_name}
            </option>
          ))}
        </select>
        {loadingSubCategories && (
          <p className="text-xs text-muted-foreground">Loading subcategories...</p>
        )}
        {!localCategory && (
          <p className="text-xs text-muted-foreground">Please select a category first</p>
        )}
      </div>

      {/* Year Dropdown */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Year</h4>
        <select
          value={localYear}
          onChange={(e) => setLocalYear(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loadingYears}
        >
          <option value="">All Years</option>
          {years.map((yr) => (
            <option key={yr._id} value={yr._id}>
              {yr.year_name}
            </option>
          ))}
        </select>
        {loadingYears && (
          <p className="text-xs text-muted-foreground">Loading years...</p>
        )}
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
              value={localMin}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-sm text-foreground mt-1">Rs {localMin.toLocaleString()}</div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Max Price</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={localMax}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-sm text-foreground mt-1">Rs {localMax.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Action Row: only visible when dirty */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Showing {products.length} products
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium border",
              isDirty ? "border-border bg-white text-foreground hover:shadow-sm" : "border-muted text-muted-foreground opacity-60 cursor-not-allowed"
            )}
            disabled={!isDirty}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApply}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium",
              isDirty ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-primary/50 text-primary-foreground opacity-70 cursor-not-allowed"
            )}
            disabled={!isDirty}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterSidebar

