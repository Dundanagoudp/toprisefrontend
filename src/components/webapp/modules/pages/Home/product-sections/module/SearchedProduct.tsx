"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { smartSearch } from '@/service/user/smartSearchService';
import { Product, Brand } from '@/types/User/Search-Types';
import { useAppSelector } from '@/store/hooks';
import { selectVehicleType } from '@/store/slice/vehicle/vehicleSlice';

// Model interface for API response
interface Model {
  _id: string;
  model_name: string;
  model_code: string;
  brand_ref: string;
  model_image?: string;
  created_by: string;
  updated_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

// Import components
import ModelListing from '@/components/webapp/modules/pages/Home/category/module/ModelListing';
import VariantListing from '@/components/webapp/modules/pages/Home/category/module/VariantListing';
import ProductListing from '@/components/webapp/modules/pages/Home/category/module/ProductListing';

// Variant interface for API response
interface Variant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: string;
  variant_image?: string;
  created_by: string;
  updated_by: any[];
  variant_status: string;
  variant_Description: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

// Brand display component - no longer using lazy loading







const SearchResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query'); // Support both 'searchQuery' and 'query'
  const vehicleTypeId = searchParams.get('vehicleTypeId');
  const vehicleType = useAppSelector(selectVehicleType);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [isBrand, setIsBrand] = useState<boolean>(false);
  const [isModel, setIsModel] = useState<boolean>(false);
  const [isVariant, setIsVariant] = useState<boolean>(false);
  const [isProduct, setIsProduct] = useState<boolean>(false);
  const [brandData, setBrandData] = useState<Brand[]>([]);
  const [modelData, setModelData] = useState<Model[]>([]);
  const [variantData, setVariantData] = useState<Variant[]>([]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    vehicle: true,
    price: false,
    sortBy: false,
    subCategories: true,
  });
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: '',
    sortBy: '',
    subCategories: [] as string[],
  });
  const noVehicleResults =
    Boolean(vehicleTypeId) &&
    !loading &&
    products.length === 0 &&
    !isBrand &&
    !isModel &&
    !isVariant &&
    !isProduct;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const filesOrigin = apiBase.replace(/\/api$/, "");

  // Handle brand click - update search query and trigger new search
  const handleBrandClick = async (brandName: string) => {
    const newQuery = `${query} ${brandName}`.trim();
    console.log('Brand clicked:', brandName, 'New query:', newQuery);

    // Update URL with new query
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('query', newQuery);
    router.push(`?${newSearchParams.toString()}`);
  };

  // Handle model click - update search query and trigger new search
  const handleModelClick = async (modelName: string) => {
    const newQuery = `${query} ${modelName}`.trim();
    console.log('Model clicked:', modelName, 'New query:', newQuery);

    // Update URL with new query
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('query', newQuery);
    router.push(`?${newSearchParams.toString()}`);
  };

  // Handle variant click - update search query and trigger new search
  const handleVariantClick = async (variantName: string) => {
    const newQuery = `${query} ${variantName}`.trim();
    console.log('Variant clicked:', variantName, 'New query:', newQuery);

    // Update URL with new query
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('query', newQuery);
    router.push(`?${newSearchParams.toString()}`);
  };

  // Handle product click - update search query and trigger new search
  const handleProductClick = async (productName: string) => {
    const newQuery = `${query} ${productName}`.trim();
    console.log('Product clicked:', productName, 'New query:', newQuery);

    // Update URL with new query
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('query', newQuery);
    router.push(`?${newSearchParams.toString()}`);
  };

  useEffect(() => {
    if (query) {
      const fetchSearchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          // Send both query and vehicleTypeId to smartSearch
          const response = await smartSearch(query, vehicleTypeId || undefined);
          console.log('smartSearch response:', response);

          // Check is_brand, is_model, is_variant, and is_product flags
          const brandFlag = response.is_brand || false;
          const modelFlag = response.is_model || false;
          const variantFlag = response.is_variant || false;
          const productFlag = response.is_product || false;
          setIsBrand(brandFlag);
          setIsModel(modelFlag);
          setIsVariant(variantFlag);
          setIsProduct(productFlag);
          console.log('is_brand flag:', brandFlag);
          console.log('is_model flag:', modelFlag);
          console.log('is_variant flag:', variantFlag);
          console.log('is_product flag:', productFlag);

          // Extract all brand data if available
          let brands: Brand[] = [];

          // Check if results object exists and has brand data (using type assertion for API compatibility)
          const apiResponse = response as any;
          if (apiResponse.results?.brand) {
            brands = [apiResponse.results.brand];
            console.log('Brand found in response.results.brand:', brands.length, 'brand');
          } else if (apiResponse.results && Array.isArray(apiResponse.results) && apiResponse.results.length > 0) {
            // Fallback for array format
            brands = apiResponse.results;
            console.log('Brands found in response.results (array):', brands.length, 'brands');
          } else {
            console.log('Brand data not found. Response structure:', response);
            console.log('Available keys in response:', Object.keys(response));
            if (apiResponse.results) {
              console.log('Available keys in results:', Object.keys(apiResponse.results));
            }
          }

          setBrandData(brands);

          // Extract models data if available
          let models: Model[] = [];
          if (apiResponse.results?.models && Array.isArray(apiResponse.results.models) && apiResponse.results.models.length > 0) {
            models = apiResponse.results.models;
            console.log('Models found in response.results.models:', models.length, 'models');
          } else {
            console.log('No models found in response');
            console.log('Available keys in results:', apiResponse.results ? Object.keys(apiResponse.results) : 'No results object');
          }

          setModelData(models);

          // Extract variants data if available
          let variants: Variant[] = [];
          let modelData: any = null;

          if (apiResponse.results?.variants && Array.isArray(apiResponse.results.variants) && apiResponse.results.variants.length > 0) {
            variants = apiResponse.results.variants;
            console.log('Variants found in response.results.variants:', variants.length, 'variants');

            // Extract model data for variants (when is_variant is true, we get single model)
            if (apiResponse.results.model) {
              modelData = apiResponse.results.model;
              console.log('Model data found for variants:', modelData.model_name);
            }
          } else {
            console.log('No variants found in response');
          }

          setVariantData(variants);
          // Update model data for variants if available
          if (modelData) {
            setModelData([modelData]);
          }

          // Extract products from response (try multiple locations)
          let extractedProducts: Product[] = [];

          // Try different possible locations for products
          if (apiResponse.results?.products && Array.isArray(apiResponse.results.products)) {
            extractedProducts = apiResponse.results.products;
            console.log('Products found in response.results.products:', extractedProducts.length, 'products');
          } else if (apiResponse.products && Array.isArray(apiResponse.products)) {
            extractedProducts = apiResponse.products;
            console.log('Products found in response.products:', extractedProducts.length, 'products');
          } else if (response.data?.products && Array.isArray(response.data.products)) {
            extractedProducts = response.data.products;
            console.log('Products found in response.data.products:', extractedProducts.length, 'products');
          } else {
            console.log('No products found in expected locations');
          }

          setProducts(extractedProducts);
        } catch (err) {
          setError("Failed to fetch products. Please try again.");
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchSearchResults();
    }
  }, [query]);

  // Log rendering decision
  useEffect(() => {
    console.log(`BrandListing component will ${isBrand ? '' : 'not '}be rendered`);
  }, [isBrand]);

  // Log model, variant, and product flags
  useEffect(() => {
    if (isModel) {
      console.log('is_model is true - model search detected');
    }
  }, [isModel]);

  useEffect(() => {
    if (isVariant) {
      console.log('is_variant is true - variant search detected');
    }
  }, [isVariant]);

  useEffect(() => {
    if (isProduct) {
      console.log('is_product is true - product search detected');
    }
  }, [isProduct]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const subCategories = [
    'Air Conditioning',
    'Belt & Chain Drive',
    'Body Parts',
    'Brake System',
    'Bike Accessories',
    'Bike Care',
    'Clutch System',
    'Cooling System',
    'Electrical',
    'Exhaust System',
    'Fasteners',
    'Filters',
    'Fuel System',
    'Gasket & Seals',
    'Hybrid & Electric Drive',
    'Interiors Comfort & Safety',
    'Lighting',
    'Oils & Fluids',
    'Service Kit',
    'Suspension',
    'Transmission',
    'Wheels & Tyre',
    'Windscreen Cleaning System'
  ];

  const handleSubCategoryToggle = (category: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      subCategories: prev.subCategories.includes(category)
        ? prev.subCategories.filter(c => c !== category)
        : [...prev.subCategories, category]
    }));
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 10);
  };



  const displayedProducts = products.slice(0, displayLimit);
  const hasMoreProducts = displayLimit < products.length;

  const buildImageUrl = (path?: string) => {
    if (!path) return "/placeholder.svg";
    if (/^https?:\/\//i.test(path)) return path;
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="hover:text-primary cursor-pointer transition-colors"
              onClick={() => router.push('/')}
            >
              Home
            </span>
            <span>/</span>
            <span className="text-foreground">Search Results</span>
            {vehicleType && (
              <span className="text-xs text-muted-foreground ml-2">Vehicle Type: {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}</span>
            )}
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
                <button className="text-sm text-destructive hover:underline">
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
                        type="checkbox"
                        className="rounded border-input"
                        onChange={() => setSelectedFilters(prev => ({ ...prev, priceRange: 'high-to-low' }))}
                      />
                      High to Low Price
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input"
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
                    {subCategories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 text-sm text-foreground cursor-pointer py-1 hover:bg-muted px-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-input"
                          checked={selectedFilters.subCategories.includes(category)}
                          onChange={() => handleSubCategoryToggle(category)}
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
          {/* Product Grid */}
          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground mb-4">Search Results for "{query}"</h1>

              {/* Search Bar */}
              {/* <div className="relative max-w-md ml-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <SearchIcon className="w-4 h-4" />
                  </div>
                </div>
              </div> */}
            </div>
            {/* Brand Display - grid of all brands */}
            {isBrand && brandData.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {brandData.length} Brand{brandData.length !== 1 ? 's' : ''} Found
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {brandData.map((brand) => (
                    <div
                      key={brand._id}
                      className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => handleBrandClick(brand.brand_name)}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={brand.brand_logo || "/placeholder.svg"}
                          alt={brand.brand_name}
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                        <h4 className="text-sm font-medium text-foreground text-center line-clamp-2 leading-tight">
                          {brand.brand_name}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Display - grid of all models */}
            {isModel && modelData.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {modelData.length} Model{modelData.length !== 1 ? 's' : ''} Found
                  </h2>
                </div>
                <ModelListing
                  models={modelData}
                  onModelSelect={handleModelClick}
                />
              </div>
            )}

            {/* Variant Display - grid of all variants */}
            {isVariant && variantData.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {variantData.length} Variant{variantData.length !== 1 ? 's' : ''} Found
                  </h2>
                </div>
                <VariantListing
                  variants={variantData}
                  models={modelData.length > 0 ? modelData[0] : null}
                  onVariantSelect={handleVariantClick}
                />
              </div>
            )}

            {/* Product Display - grid of all products */}
            {isProduct && products.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {products.length} Product{products.length !== 1 ? 's' : ''} Found
                  </h2>
                </div>
                <ProductListing
                  products={products}
                  onProductSelect={handleProductClick}
                />
              </div>
            )}
            {/* No results messages */}
            {noVehicleResults && (
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <p className="text-sm font-medium text-yellow-800">
                    No products found for the selected vehicle.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Try removing the vehicle filter or search with a different query.
                  </p>
                </div>
              </div>
            )}

            {/* No products found when is_product is true but products array is empty */}
            {!loading && isProduct && products.length === 0 && (
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <p className="text-sm font-medium text-yellow-800">
                    No products found for the selected vehicle.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Try removing the vehicle filter or search with a different query.
                  </p>
                </div>
              </div>
            )}

            {/* General no results message */}
            {!loading &&
              !isBrand &&
              !isModel &&
              !isVariant &&
              !isProduct &&
              products.length === 0 &&
              !noVehicleResults && (
                <div className="mb-6">
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-md text-center">
                    <p className="text-lg font-medium text-gray-800 mb-2">
                      No results found for "{query}"
                    </p>
                    <p className="text-sm text-gray-600">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                  </div>
                </div>
              )}
            {/* Products Grid - only show when not in product listing mode */}
            {!isProduct && products.length > 0 && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {products.length} Product{products.length !== 1 ? 's' : ''} Found
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden group-hover:bg-secondary transition-colors">
                        <img
                          src={buildImageUrl(product.images?.[0])}
                          alt={product.product_name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2">
                        {product.product_name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold">
                          Rs {product.selling_price?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Load More */}
                {hasMoreProducts && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Load More Products ({products.length - displayLimit} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
