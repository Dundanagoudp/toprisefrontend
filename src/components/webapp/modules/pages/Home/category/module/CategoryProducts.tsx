'use client'
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Search, Grid, List, ShoppingCart, Eye, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchInput from '@/components/common/search/SearchInput';
import { getCategories, getProducts, getProductsByCategory, getSubCategories } from '@/service/product-Service';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/components/ui/toast';
import type { SubCategory } from '@/types/product-Types';

interface FilterSection {
  title: string;
  isOpen: boolean;
}

const ProductListing = () => {
  const params = useParams()
  const categoryId = params?.categoryId as string
  const [products, setProducts] = useState<any[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [displayLimit, setDisplayLimit] = useState<number>(10)
  const [categoryName, setCategoryName] = useState<string>('Products')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const router = useRouter()
  const { addItemToCart } = useCart()
  const { showToast } = useToast()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    vehicle: true,
    price: false,
    sortBy: false,
    subCategories: true,
  });
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loadingSubCategories, setLoadingSubCategories] = useState<boolean>(false)
  
  useEffect(()=>{
    const fetchProducts = async()=>{
        try {
          let response;
          if (categoryId) {
            console.log('Fetching products by category:', categoryId)
            response = await getProductsByCategory(categoryId)
            console.log('Products by category response:', response)
          } else {
            response = await getProducts()
            console.log('All products response:', response)
          }
          setProducts(response.data.products)
          setDisplayLimit(10) // Reset display limit when new products are loaded
        } catch (error) {
          console.error('Failed to fetch products:', error)
          setProducts([])
        }
    }
    fetchProducts()
  },[categoryId])
  useEffect(()=>{
    const fetchSubCategories = async()=>{
        setLoadingSubCategories(true)
        try {
          const response = await getSubCategories()
          setSubCategories(response.data)
        } catch (error) {
          console.error('Failed to fetch subcategories:', error)
          setSubCategories([])
        } finally {
          setLoadingSubCategories(false)
        }
    }
    fetchSubCategories()
  },[])

  useEffect(()=>{
    const fetchCategoryName = async()=>{
        if (categoryId) {
          try {
            const response = await getCategories()
            const categories = response.data || []
            const category = categories.find((cat: any) => cat._id === categoryId)
            if (category) {
              setCategoryName(category.category_name || 'Products')
            }
          } catch (error) {
            console.error('Failed to fetch category name:', error)
          }
        }
    }
    fetchCategoryName()
  },[categoryId])

  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: '',
    sortBy: '',
    subCategories: [] as string[],
  });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])
  
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 10)
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      setAddingToCart(productId)
      await addItemToCart(productId, 1)
      showToast(`${productName} has been added to your cart.`, "success")
    } catch (error: any) {
      if (error.message === 'User not authenticated') {
        showToast("Please login to add items to cart", "error")
        router.push("/login")
      } else {
        showToast("Failed to add product to cart", "error")
        console.error("Error adding to cart:", error)
      }
    } finally {
      setAddingToCart(null)
    }
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/shop/product/${productId}`)
  }

  const handleResetFilters = () => {
    setSelectedFilters({
      priceRange: '',
      sortBy: '',
      subCategories: [],
    });
    setSearchValue('');
    setDisplayLimit(10);
  }

  // Filter products based on selected filters
  const filteredProducts = React.useMemo(() => {
    let filtered = products;
    
    // Filter by subcategories
    if (selectedFilters.subCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedFilters.subCategories.includes(product.sub_category._id)
      );
    }
    
    // Filter by search value
    if (searchValue.trim()) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.brand.brand_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.sub_category.subcategory_name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    // Apply price sorting
    if (selectedFilters.priceRange) {
      filtered = [...filtered].sort((a, b) => {
        if (selectedFilters.priceRange === 'high-to-low') {
          return b.selling_price - a.selling_price;
        } else if (selectedFilters.priceRange === 'low-to-high') {
          return a.selling_price - b.selling_price;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [products, selectedFilters, searchValue]);

  const displayedProducts = filteredProducts.slice(0, displayLimit)
  const hasMoreProducts = displayLimit < filteredProducts.length

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  // const subCategories = [
  //   'Air Conditioning',
  //   'Belt & Chain Drive', 
  //   'Body Parts',
  //   'Brake System',
  //   'Bike Accessories',
  //   'Bike Care',
  //   'Clutch System',
  //   'Cooling System',
  //   'Electrical',
  //   'Exhaust System',
  //   'Fasteners',
  //   'Filters',
  //   'Fuel System',
  //   'Gasket & Seals',
  //   'Hybrid & Electric Drive',
  //   'Interiors Comfort & Safety',
  //   'Lighting',
  //   'Oils & Fluids',
  //   'Service Kit',
  //   'Suspension',
  //   'Transmission',
  //   'Wheels & Tyre',
  //   'Windscreen Cleaning System'
  // ];

  const handleSubCategoryToggle = (categoryId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      subCategories: prev.subCategories.includes(categoryId)
        ? prev.subCategories.filter(c => c !== categoryId)
        : [...prev.subCategories, categoryId]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href="/" 
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link 
              href="/shop" 
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">Category: {categoryName}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Filter</h2>
                <button 
                  onClick={handleResetFilters}
                  className="text-sm text-destructive hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Vehicle Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('vehicle')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h3 className="font-medium text-foreground">Vehicle</h3>
                  {openSections.vehicle ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {openSections.vehicle && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Choose Brand Model"
                      className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    />
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h3 className="font-medium text-foreground">Price</h3>
                  {openSections.price ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {openSections.price && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        className="rounded border-input"
                        checked={selectedFilters.priceRange === 'high-to-low'}
                        onChange={() => setSelectedFilters(prev => ({ ...prev, priceRange: 'high-to-low' }))}
                      />
                      High to Low Price
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        className="rounded border-input"
                        checked={selectedFilters.priceRange === 'low-to-high'}
                        onChange={() => setSelectedFilters(prev => ({ ...prev, priceRange: 'low-to-high' }))}
                      />
                      Low to High Price
                    </label>
                  </div>
                )}
              </div>

              {/* Sort By Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('sortBy')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h3 className="font-medium text-foreground">Sort By</h3>
                  {openSections.sortBy ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {openSections.sortBy && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                      />
                      OEM
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                      />
                      After Market Product
                    </label>
                  </div>
                )}
              </div>

              {/* Sub Categories */}
              <div>
                <button
                  onClick={() => toggleSection('subCategories')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h3 className="font-medium text-foreground">Sub Categories</h3>
                  {openSections.subCategories ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {openSections.subCategories && (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {loadingSubCategories ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : subCategories.length > 0 ? (
                      subCategories.map((category) => (
                        <label
                          key={category._id}
                          className="flex items-center gap-2 text-sm text-foreground cursor-pointer py-1 hover:bg-muted px-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-input"
                            checked={selectedFilters.subCategories.includes(category._id)}
                            onChange={() => handleSubCategoryToggle(category._id)}
                          />
                          {category.subcategory_name}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">No subcategories available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
                
                {/* Search Bar */}
                {/* <div className="relative max-w-md">
                  <SearchInput 
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Search products..."
                  />
                </div> */}
              </div>
              
              {/* Results Count and Active Filters */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {displayedProducts.length} of {filteredProducts.length} products
                  {selectedFilters.subCategories.length > 0 && (
                    <span className="ml-2">
                      • {selectedFilters.subCategories.length} subcategory filter(s) active
                    </span>
                  )}
                </span>
                
                {(selectedFilters.subCategories.length > 0 || searchValue.trim()) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-destructive hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedFilters.subCategories.length > 0 || searchValue.trim()
                    ? "Try adjusting your filters or search terms."
                    : "No products are available at the moment."}
                </p>
                {(selectedFilters.subCategories.length > 0 || searchValue.trim()) && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={buildImageUrl(product.images?.[0])}
                          alt={product.product_name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-2">
                          {product.product_name}
                        </h4>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-primary font-semibold">
                            Rs {product.selling_price?.toLocaleString() || 'N/A'}
                          </span>
                          {product.sku_code && (
                            <span className="text-xs text-muted-foreground">
                              {product.sku_code}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewProduct(product._id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-transparent hover:bg-secondary/50 border border-border rounded-md transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => handleAddToCart(product._id, product.product_name)}
                            disabled={addingToCart === product._id}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addingToCart === product._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-3 h-3" />
                            )}
                            {addingToCart === product._id ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMoreProducts && (
              <div className="flex justify-center mt-8">
                                  <button 
                  onClick={handleLoadMore}
                  className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Load More Products ({filteredProducts.length - displayLimit} remaining)
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;