'use client'
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Search, Grid, List, ShoppingCart, Eye, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchInput from '@/components/common/search/SearchInput';
import { getCategories, getProducts, getProductsByCategory, getProductsByPage, getSubCategoriesByCategory, getTypes, getBrandsByType } from '@/service/product-Service';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/components/ui/toast';
import { usePincode } from '@/hooks/use-pincode';
import { PincodeDialog } from '@/components/webapp/common/PincodeDialog';
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
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
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
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [availableBrands, setAvailableBrands] = useState<any[]>([])
  const [showPincodeDialog, setShowPincodeDialog] = useState(false)
  const [pendingCartAction, setPendingCartAction] = useState<{ productId: string; productName: string } | null>(null)
  const { shouldShowPincodeDialog } = usePincode()

  useEffect(()=>{
    const fetchSubCategories = async()=>{
        if (!categoryId) {
          setSubCategories([])
          setLoadingSubCategories(false)
          return
        }

        setLoadingSubCategories(true)
        try {
          const response = await getSubCategoriesByCategory(categoryId)
          setSubCategories(response.data)
        } catch (error) {
          console.error('Failed to fetch subcategories:', error)
          setSubCategories([])
        } finally {
          setLoadingSubCategories(false)
        }
    }
    fetchSubCategories()
  },[categoryId])

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

  // Fetch vehicle types on mount
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await getTypes()
        const typesData = response?.data?.products || response?.data || []
        setVehicleTypes(Array.isArray(typesData) ? typesData : [])
      } catch (error) {
        console.error('Failed to fetch vehicle types:', error)
        setVehicleTypes([])
      }
    }
    fetchVehicleTypes()
  }, [])

  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: '',
    sortBy: '',
    subCategoryId: '',
    vehicleType: '',
    brandId: '',
  });

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
    setProducts([])
    setHasMore(true)
  }, [selectedFilters.subCategoryId, selectedFilters.vehicleType, selectedFilters.brandId])

  // Fetch products with pagination and filters
  useEffect(()=>{
    const fetchProducts = async()=>{
        try {
          setLoading(true)
          const limit = 12; // Fixed limit for pagination
          const subCategoryIds = selectedFilters.subCategoryId ? [selectedFilters.subCategoryId] : undefined
          const response = await getProductsByPage(page, limit, undefined, undefined, categoryId, subCategoryIds, selectedFilters.priceRange || undefined, selectedFilters.brandId || undefined)

          console.log('Products by page response:', response)

          if (page === 1) {
            // Replace products array for first page
            setProducts(response.data.products)
          } else {
            // Append new results to existing products for subsequent pages
            setProducts(prev => [...prev, ...response.data.products])
          }

          // Update hasMore based on whether we got fewer results than requested limit
          setHasMore(response.data.products.length === limit)
        } catch (error) {
          console.error('Failed to fetch products:', error)
          setProducts([])
          setHasMore(false)
        } finally {
          setLoading(false)
        }
    }
    fetchProducts()
  },[categoryId, page, selectedFilters.subCategoryId, selectedFilters.priceRange, selectedFilters.brandId])

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])
  
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    // Check if pincode is saved, show dialog if not
    if (shouldShowPincodeDialog()) {
      setPendingCartAction({ productId, productName });
      setShowPincodeDialog(true);
      return;
    }

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
  };

  const handlePincodeSaved = async () => {
    // Execute the pending cart action now that pincode is saved
    if (pendingCartAction) {
      const { productId, productName } = pendingCartAction;
      try {
        setAddingToCart(productId);
        await addItemToCart(productId, 1);
        showToast(`${productName} has been added to your cart.`, "success");
      } catch (error: any) {
        if (error.message === 'User not authenticated') {
          showToast("Please login to add items to cart", "error");
          router.push("/login");
        } else {
          showToast("Failed to add product to cart", "error");
          console.error("Error adding to cart:", error);
        }
      } finally {
        setAddingToCart(null);
        setPendingCartAction(null);
      }
    }
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/shop/product/${productId}`)
  }

  const handleResetFilters = () => {
    setSelectedFilters({
      priceRange: '',
      sortBy: '',
      subCategoryId: '',
      vehicleType: '',
      brandId: '',
    });
    setAvailableBrands([]);
    setSearchValue('');
    setPage(1);
    setProducts([]);
    setHasMore(true);
  }

  // Filter products based on selected filters (server-side filtering for subcategories, client-side for others)
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Note: Subcategory filtering is now done server-side

    // Filter by search value (client-side search)
    if (searchValue.trim()) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.brand.brand_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.sub_category.subcategory_name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Note: Price sorting is now handled server-side

    return filtered;
  }, [products, searchValue]);

  const displayedProducts = filteredProducts
  const hasMoreProducts = hasMore

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  const handleSubCategoryToggle = (subCategoryId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      subCategoryId: prev.subCategoryId === subCategoryId ? '' : subCategoryId
    }));
    // Reset pagination immediately when subcategory changes
    setPage(1);
    setProducts([]);
    setHasMore(true);
  };

  const handleVehicleTypeChange = async (id: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      vehicleType: id,
      brandId: '',
    }));
    setAvailableBrands([]);
    setPage(1);
    setProducts([]);
    setHasMore(true);

    if (id) {
      try {
        const response = await getBrandsByType(id);
        const brandsData = response?.data || [];
        setAvailableBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        console.error('Failed to fetch brands by type:', error);
        setAvailableBrands([]);
      }
    }
  };

  const handleBrandChange = (id: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      brandId: id,
    }));
    setPage(1);
    setProducts([]);
    setHasMore(true);
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
              href="/" 
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
                    <select
                      value={selectedFilters.vehicleType}
                      onChange={(e) => handleVehicleTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name || type.name}
                        </option>
                      ))}
                    </select>
                    {selectedFilters.vehicleType && (
                      <select
                        value={selectedFilters.brandId}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                      >
                        <option value="">Select Brand</option>
                        {availableBrands.map((brand) => (
                          <option key={brand._id} value={brand._id}>
                            {brand.brand_name || brand.name}
                          </option>
                        ))}
                      </select>
                    )}
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
                        checked={selectedFilters.priceRange === 'H-L'}
                        onChange={() => {
                          setSelectedFilters(prev => ({ ...prev, priceRange: 'H-L' }));
                          setPage(1);
                          setProducts([]);
                          setHasMore(true);
                        }}
                      />
                      High to Low Price
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        className="rounded border-input"
                        checked={selectedFilters.priceRange === 'L-H'}
                        onChange={() => {
                          setSelectedFilters(prev => ({ ...prev, priceRange: 'L-H' }));
                          setPage(1);
                          setProducts([]);
                          setHasMore(true);
                        }}
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
                            type="radio"
                            name="subcategory"
                            className="rounded border-input"
                            checked={selectedFilters.subCategoryId === category._id}
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
                  Showing {displayedProducts.length} products
                  {selectedFilters.subCategoryId && (
                    <span className="ml-2">
                      • 1 subcategory filter active
                    </span>
                  )}
                </span>
                
                {(selectedFilters.subCategoryId || searchValue.trim()) && (
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
                  {selectedFilters.subCategoryId || searchValue.trim()
                    ? "Try adjusting your filters or search terms."
                    : "No products are available at the moment."}
                </p>
                {(selectedFilters.subCategoryId || searchValue.trim()) && (
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
                {displayedProducts.map((product) => {
                  const isOutOfStock = product.out_of_stock ?? false;

                  return (
                  <div
                    key={product._id}
                    className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
                        <img
                          src={buildImageUrl(product.images?.[0])}
                          alt={product.product_name || "Product"}
                          className="w-full h-full object-cover"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
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
                            disabled={addingToCart === product._id || isOutOfStock}
                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-md transition-colors ${
                              isOutOfStock
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {addingToCart === product._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-3 h-3" />
                            )}
                            {addingToCart === product._id ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}

            {/* Load More */}
            {hasMoreProducts && (
              <div className="flex justify-center mt-8">
                                  <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <PincodeDialog
        open={showPincodeDialog}
        onOpenChange={setShowPincodeDialog}
        onPincodeSaved={handlePincodeSaved}
      />
    </div>
  );
};

export default ProductListing;