"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  Search as SearchIcon,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  smartSearch,
  smartSearchWithCategory,
} from "@/service/user/smartSearchService";
import { getVariantsByModel } from "@/service/product-Service";
import { Product, Brand } from "@/types/User/Search-Types";
import { Product as ProductFilterType } from "@/types/product-Types";
import { useAppSelector } from "@/store/hooks";
import { selectVehicleType } from "@/store/slice/vehicle/vehicleSlice";

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
import ModelListing from "@/components/webapp/modules/pages/Home/category/module/ModelListing";
import VariantListing from "@/components/webapp/modules/pages/Home/category/module/VariantListing";
import ProductListing from "@/components/webapp/modules/pages/Home/category/module/ProductListing";
import FilterSidebar from "@/components/webapp/product/FilterSidebar";

// Variant interface for API response
interface Variant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: any;
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
  const query = searchParams.get("query"); // Support both 'searchQuery' and 'query'
  const category = searchParams.get("category");
  const categoryName = searchParams.get("categoryName");
  const vehicleTypeId = searchParams.get("vehicleTypeId");
  const vehicleType = useAppSelector(selectVehicleType);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [isBrand, setIsBrand] = useState<boolean>(false);
  const [isModel, setIsModel] = useState<boolean>(false);
  const [isVariant, setIsVariant] = useState<boolean>(false);
  const [isProduct, setIsProduct] = useState<boolean>(false);
  const [isCategory, setIsCategory] = useState<boolean>(false);
  const [brandData, setBrandData] = useState<Brand[]>([]);
  const [modelData, setModelData] = useState<Model[]>([]);
  const [variantData, setVariantData] = useState<Variant[]>([]);
  const [searchValue, setSearchValue] = useState<string>(
    query || categoryName || ""
  );

  // Filter states
  const [sortBy, setSortBy] = useState<string>("A-Z");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSubCategory, setFilterSubCategory] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");

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

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const price = product.selling_price || 0;

      // Price filter
      if (price < minPrice || price > maxPrice) {
        return false;
      }

      // Category filter
      if (filterCategory && product.category !== filterCategory) {
        return false;
      }

      // Sub-category filter
      if (filterSubCategory && product.sub_category !== filterSubCategory) {
        return false;
      }

      // Year filter
      if (filterYear && (!product.year_range || !product.year_range.includes(filterYear))) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "A-Z":
          return (a.product_name || "").localeCompare(b.product_name || "");
        case "Z-A":
          return (b.product_name || "").localeCompare(a.product_name || "");
        case "L-H":
          return (a.selling_price || 0) - (b.selling_price || 0);
        case "H-L":
          return (b.selling_price || 0) - (a.selling_price || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, sortBy, minPrice, maxPrice, filterCategory, filterSubCategory, filterYear]);

  // Update search value when component mounts
  useEffect(() => {
    if (query) {
      setSearchValue(query);
    } else if (categoryName) {
      setSearchValue(categoryName);
      setIsCategory(true);
    }
    console.log("Search params:", {
      query,
      category,
      categoryName,
      vehicleTypeId,
    });
  }, [query, category, categoryName, vehicleTypeId]);

  // Handle category-based search - fetch brands within category
  useEffect(() => {
    if (category && !query) {
      const fetchCategoryBrands = async () => {
        setLoading(true);
        setError(null);
        try {
          // Use smartSearch to get brands for the category
          const response = await smartSearch(
            categoryName || "",
            vehicleTypeId || undefined
          );
          console.log("Category search response:", response);

          // Validate response structure
          if (!response || typeof response !== "object") {
            throw new Error("Invalid response format from category search");
          }

          // Set category flag and extract brand data
          setIsCategory(true);
          setIsBrand(false);
          setIsModel(false);
          setIsVariant(false);
          setIsProduct(false);

          // Extract brand data if available
          let brands: Brand[] = [];
          const apiResponse = response as any;
          if (apiResponse.results?.brand) {
            brands = [apiResponse.results.brand];
          } else if (
            apiResponse.results &&
            Array.isArray(apiResponse.results) &&
            apiResponse.results.length > 0
          ) {
            brands = apiResponse.results;
          } else if (apiResponse.brands && Array.isArray(apiResponse.brands)) {
            brands = apiResponse.brands;
          }
          setBrandData(brands);

          // Clear other data
          setModelData([]);
          setVariantData([]);
          setProducts([]);
        } catch (err) {
          console.error("Category search error:", err);
          setError("Failed to load brands for this category");
        } finally {
          setLoading(false);
        }
      };

      fetchCategoryBrands();
    }
  }, [category, categoryName, vehicleTypeId, query]);

  // Handle brand click - update search query and trigger new search
  const handleBrandClick = async (brandName: string) => {
    let newQuery: string;

    if (categoryName) {
      // If we're in category mode, combine category and brand
      newQuery = `${categoryName} ${brandName}`.trim();
    } else {
      // If we're in regular search mode, combine existing query with brand
      newQuery = `${query} ${brandName}`.trim();
    }

    console.log("Brand clicked:", brandName, "New query:", newQuery);

    // Update URL with new query
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("query", newQuery);
    // Remove category parameters since we're now doing a query search
    newSearchParams.delete("category");
    newSearchParams.delete("categoryName");
    router.push(`?${newSearchParams.toString()}`);
  };

  // Handle model click - update search query and trigger new search
  const handleModelClick = async (modelName: string) => {
    const newQuery = `${query || ""} ${modelName}`.trim();
    console.log("Model clicked:", modelName, "New query:", newQuery);

    // Update URL with new query
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("query", newQuery);
    router.push(`?${newSearchParams.toString()}`);
  };

  // Handle variant click - update search query and trigger new search
  const handleVariantClick = async (variantName: string) => {
    const newQuery = `${query} ${variantName}`.trim();
    console.log("Variant clicked:", variantName, "New query:", newQuery);

    // If we have a category context, use the category-specific API
    if (category && categoryName) {
      try {
        setLoading(true);
        setError(null);

        // Use the new API with category parameter
        const response = await smartSearchWithCategory(newQuery, categoryName);
        console.log("Variant search with category response:", response);

        // Validate response structure
        if (!response || typeof response !== "object") {
          throw new Error(
            "Invalid response format from variant search with category"
          );
        }

        // Set product flag and extract product data
        setIsCategory(false);
        setIsBrand(false);
        setIsModel(false);
        setIsVariant(false);
        setIsProduct(true);

        // Extract products from response
        let extractedProducts: Product[] = [];
        const apiResponse = response as any;

        if (
          apiResponse.results?.products &&
          Array.isArray(apiResponse.results.products)
        ) {
          extractedProducts = apiResponse.results.products;
          console.log(
            "Variant products found in response.results.products:",
            extractedProducts.length,
            "products"
          );
        } else if (
          apiResponse.products &&
          Array.isArray(apiResponse.products)
        ) {
          extractedProducts = apiResponse.products;
          console.log(
            "Variant products found in response.products:",
            extractedProducts.length,
            "products"
          );
        } else if (
          apiResponse.data?.products &&
          Array.isArray(apiResponse.data.products)
        ) {
          extractedProducts = apiResponse.data.products;
          console.log(
            "Variant products found in response.data.products:",
            extractedProducts.length,
            "products"
          );
        } else {
          console.log("No products found for variant with category");
        }

        setProducts(extractedProducts);

        // Clear other data
        setBrandData([]);
        setModelData([]);
        setVariantData([]);

        // Update URL with new query
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("query", newQuery);
        router.push(`?${newSearchParams.toString()}`);
      } catch (err) {
        console.error("Variant search with category error:", err);
        setError("Failed to load products for this variant");
      } finally {
        setLoading(false);
      }
    } else {
      // Regular search flow
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("query", newQuery);
      router.push(`?${newSearchParams.toString()}`);
    }
  };

  // Handle product click - update search query and trigger new search
  const handleProductClick = async (productName: string) => {
    router.push(`/shop/product/${productName}`);

  };

  // Handle back to model - go back to model selection
  const handleBackToModel = () => {
    setIsCategory(false);
    setIsBrand(false);
    setIsModel(true);
    setIsVariant(false);
    setIsProduct(false);

    setVariantData([]);
    setProducts([]);
  };

  useEffect(() => {
    if (query) {
      const fetchSearchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          // Send both query and vehicleTypeId to smartSearch
          const response = await smartSearch(
            query,
            vehicleTypeId || undefined,
            sortBy,
            sortBy,
            minPrice,
            maxPrice
          );
          console.log("smartSearch response:", response);

          // Validate response structure
          if (!response || typeof response !== "object") {
            throw new Error("Invalid response format from smartSearch");
          }

          // Check is_brand, is_model, is_variant, and is_product flags

          const brandFlag = response.is_brand || false;
          const modelFlag = response.is_model || false;
          const variantFlag = response.is_variant || false;
          const productFlag = response.is_product || false;
          setIsBrand(brandFlag);
          setIsModel(modelFlag);
          setIsVariant(variantFlag);
          setIsProduct(productFlag);
          console.log("is_brand flag:", brandFlag);
          console.log("is_model flag:", modelFlag);
          console.log("is_variant flag:", variantFlag);
          console.log("is_product flag:", productFlag);

          // Extract all brand data if available
          let brands: Brand[] = [];

          // Check if results object exists and has brand data (using type assertion for API compatibility)
          const apiResponse = response as any;
          if (apiResponse.results?.brand) {
            brands = [apiResponse.results.brand];
            console.log(
              "Brand found in response.results.brand:",
              brands.length,
              "brand"
            );
          } else if (
            apiResponse.results &&
            Array.isArray(apiResponse.results) &&
            apiResponse.results.length > 0
          ) {
            // Fallback for array format
            brands = apiResponse.results;
            console.log(
              "Brands found in response.results (array):",
              brands.length,
              "brands"
            );
          } else {
            console.log("Brand data not found. Response structure:", response);
            console.log("Available keys in response:", Object.keys(response));
            if (apiResponse.results) {
              console.log(
                "Available keys in results:",
                Object.keys(apiResponse.results)
              );
            }
          }

          setBrandData(brands);

          // Extract models data if available
          let models: Model[] = [];
          if (
            apiResponse.results?.models &&
            Array.isArray(apiResponse.results.models) &&
            apiResponse.results.models.length > 0
          ) {
            models = apiResponse.results.models;
            console.log(
              "Models found in response.results.models:",
              models.length,
              "models"
            );
          } else {
            console.log("No models found in response");
            console.log(
              "Available keys in results:",
              apiResponse.results
                ? Object.keys(apiResponse.results)
                : "No results object"
            );
          }

          setModelData(models);

          // Extract variants data if available
          let variants: Variant[] = [];
          let modelData: any = null;

          if (
            apiResponse.results?.variants &&
            Array.isArray(apiResponse.results.variants) &&
            apiResponse.results.variants.length > 0
          ) {
            variants = apiResponse.results.variants;
            console.log(
              "Variants found in response.results.variants:",
              variants.length,
              "variants"
            );

            // Extract model data for variants (when is_variant is true, we get single model)
            if (apiResponse.results.model) {
              modelData = apiResponse.results.model;
              console.log(
                "Model data found for variants:",
                modelData.model_name
              );
            }
          } else {
            console.log("No variants found in response");
          }

          setVariantData(variants);
          // Update model data for variants if available
          if (modelData) {
            setModelData([modelData]);
          }

          // Extract products from response (try multiple locations)
          let extractedProducts: Product[] = [];

          // Try different possible locations for products
          if (
            apiResponse.results?.products &&
            Array.isArray(apiResponse.results.products)
          ) {
            extractedProducts = apiResponse.results.products;
            console.log(
              "Products found in response.results.products:",
              extractedProducts.length,
              "products"
            );
          } else if (
            apiResponse.products &&
            Array.isArray(apiResponse.products)
          ) {
            extractedProducts = apiResponse.products;
            console.log(
              "Products found in response.products:",
              extractedProducts.length,
              "products"
            );
          } else if (
            response.data?.products &&
            Array.isArray(response.data.products)
          ) {
            extractedProducts = response.data.products;
            console.log(
              "Products found in response.data.products:",
              extractedProducts.length,
              "products"
            );
          } else {
            console.log("No products found in expected locations");
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
  }, [query, vehicleTypeId]);

  // Log rendering decision
  useEffect(() => {
    console.log(
      `BrandListing component will ${isBrand ? "" : "not "}be rendered`
    );
  }, [isBrand]);

  // Log model, variant, and product flags
  useEffect(() => {
    if (isModel) {
      console.log("is_model is true - model search detected");
    }
  }, [isModel]);

  useEffect(() => {
    if (isVariant) {
      console.log("is_variant is true - variant search detected");
    }
  }, [isVariant]);

  useEffect(() => {
    if (isProduct) {
      console.log("is_product is true - product search detected");
    }
  }, [isProduct]);

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 10);
  };

  const displayedProducts = filteredAndSortedProducts.slice(0, displayLimit);
  const hasMoreProducts = displayLimit < filteredAndSortedProducts.length;

  const buildImageUrl = (path?: string) => {
    if (!path) return "/placeholder.svg";
    if (/^https?:\/\//i.test(path)) return path;
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
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
              <span className="text-foreground">
                {isCategory && categoryName
                  ? `Category: ${categoryName}`
                  : query
                  ? `Search: ${query}`
                  : "Search Results"}
              </span>
              {vehicleType && (
                <span className="text-xs text-muted-foreground ml-2">
                  Vehicle Type:{" "}
                  {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
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
                products={
                  filteredAndSortedProducts as unknown as ProductFilterType[]
                }
                sortBy={sortBy}
                setSortBy={setSortBy}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                category={filterCategory}
                setCategory={setFilterCategory}
                subCategory={filterSubCategory}
                setSubCategory={setFilterSubCategory}
                year={filterYear}
                setYear={setFilterYear}
                categoryId={category || undefined}
                typeId={vehicleTypeId || undefined}
              />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isFilterOpen && (
              <div
                className="lg:hidden fixed inset-0 z-40 bg-black/50"
                onClick={() => setIsFilterOpen(false)}
              >
                <div
                  className="absolute left-0 top-0 h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FilterSidebar
                    products={
                      filteredAndSortedProducts as unknown as ProductFilterType[]
                    }
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                    category={filterCategory}
                    setCategory={setFilterCategory}
                    subCategory={filterSubCategory}
                    setSubCategory={setFilterSubCategory}
                    year={filterYear}
                    setYear={setFilterYear}
                    categoryId={category || undefined}
                    typeId={vehicleTypeId || undefined}
                  />
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Product Grid */}
              <main>
                {/* Page Header */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  {/* show this based on the flags */}
                  {isBrand && (
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    Select a Brand to see available models
                    </h1>
                  )}
                  {isModel && (
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                      Select a Model to see available variants
                    </h1>
                  )}
                  {isVariant && (
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                      Select a Variant to see available products
                    </h1>
                  )}
         
                 { !isBrand && !isModel && !isVariant && (
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {/* {isCategory && categoryName
                      ? `Brands in "${categoryName}" Category`
                      : `Search Results for "${query}"`} */}
                      Product Search Results
                  </h1>)}

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
                {(isBrand || isCategory) && brandData.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg font-semibold text-foreground">
                        {brandData.length} Brand
                        {brandData.length !== 1 ? "s" : ""} Found
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {brandData.map((brand) => (
                        <div
                          key={brand._id}
                          className="bg-card rounded-lg border border-border p-3 sm:p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                          onClick={() => handleBrandClick(brand.brand_name)}
                        >
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <img
                              src={brand.brand_logo || "/placeholder.svg"}
                              alt={brand.brand_name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg"
                            />
                            <h4 className="text-xs sm:text-sm font-medium text-foreground text-center line-clamp-2 leading-tight">
                              {brand.brand_name}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No brands found message */}
                {(isBrand || isCategory) &&
                  brandData.length === 0 &&
                  !loading && (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-lg mb-4">
                        <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No Brands Found
                        </h3>
                        <p className="text-gray-500">
                          {isCategory && categoryName
                            ? `No brands are available in the "${categoryName}" category at the moment.`
                            : "No brands match your search criteria. Try adjusting your search terms."}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Model Display - grid of all models */}
                {isModel && modelData.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        {modelData.length} Model
                        {modelData.length !== 1 ? "s" : ""} Found
                      </h2>
                    </div>
                    <ModelListing
                      models={modelData}
                      onModelSelect={handleModelClick}
                    />
                  </div>
                )}

                {/* Variant Display - grid of all variants or direct products */}
                {isVariant &&
                  variantData.length > 0 &&
                  products.length === 0 && (
                    <div className="mb-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">
                          {variantData.length} Variant
                          {variantData.length !== 1 ? "s" : ""} Found
                          {modelData.length > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              for {modelData[0].model_name}
                            </span>
                          )}
                        </h2>
                        <button
                          onClick={handleBackToModel}
                          className="px-4 py-2 text-sm border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          ← Back to Models
                        </button>
                      </div>
                      <VariantListing
                        variants={variantData}
                        models={modelData.length > 0 ? modelData[0] : null}
                        onVariantSelect={handleVariantClick}
                      />
                    </div>
                  )}

                {/* Direct Product Display for variants that have products */}
                {isVariant && filteredAndSortedProducts.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg font-semibold text-foreground">
                        {filteredAndSortedProducts.length} Product
                        {filteredAndSortedProducts.length !== 1 ? "s" : ""}{" "}
                        Found
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                      {displayedProducts.map((product) => (
                        <div
                          key={product._id}
                          className="bg-card rounded-lg border border-border p-2 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                          <div className="aspect-square bg-muted rounded-md mb-2 sm:mb-3 flex items-center justify-center overflow-hidden group-hover:bg-secondary transition-colors">
                            <img
                              src={buildImageUrl(product.images?.[0])}
                              alt={product.product_name || "Product"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-medium text-foreground text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                            {product.product_name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-primary font-semibold text-xs sm:text-base">
                              Rs {product.selling_price?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Load More */}
                    {hasMoreProducts && displayedProducts.length > 0 && (
                      <div className="flex justify-center mt-6 sm:mt-8">
                        <button
                          onClick={handleLoadMore}
                          className="px-4 sm:px-6 py-2 border border-primary text-primary text-sm sm:text-base rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          Load More Products (
                          {filteredAndSortedProducts.length - displayLimit}{" "}
                          remaining)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Display - grid of all products */}
                {isProduct && filteredAndSortedProducts.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        {filteredAndSortedProducts.length} Product
                        {filteredAndSortedProducts.length !== 1 ? "s" : ""}{" "}
                        Found
                      </h2>
                    </div>
                    <ProductListing
                      products={filteredAndSortedProducts}
                      onProductSelect={handleProductClick}
                    />
                  </div>
                )}

                {/* Products Grid - only show when not in product listing mode */}
                {!isProduct && products.length > 0 && (
                  <>
                    {displayedProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                        {displayedProducts.map((product) => (
                          <div
                            key={product._id}
                            className="bg-card rounded-lg border border-border p-2 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                          >
                            <div className="aspect-square bg-muted rounded-md mb-2 sm:mb-3 flex items-center justify-center overflow-hidden group-hover:bg-secondary transition-colors">
                              <img
                                src={buildImageUrl(product.images?.[0])}
                                alt={product.product_name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-medium text-foreground text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                              {product.product_name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-primary font-semibold text-xs sm:text-base">
                                Rs{" "}
                                {product.selling_price?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">
                          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Products Found
                          </h3>
                          <p className="text-gray-500">
                            No products match your search criteria. Try
                            adjusting your search terms.
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Load More */}
                    {hasMoreProducts && displayedProducts.length > 0 && (
                      <div className="flex justify-center mt-6 sm:mt-8">
                        <button
                          onClick={handleLoadMore}
                          className="px-4 sm:px-6 py-2 border border-primary text-primary text-sm sm:text-base rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          Load More Products (
                          {filteredAndSortedProducts.length - displayLimit}{" "}
                          remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResults;
