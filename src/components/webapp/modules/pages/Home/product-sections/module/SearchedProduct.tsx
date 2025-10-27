"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  Search as SearchIcon,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import {
  smartSearch,
  smartSearchWithCategory,
} from "@/service/user/smartSearchService";
import { getVariantsByModel } from "@/service/product-Service";
import { getProductsByFilterWithIds } from "@/service/product-Service";
import { Product, Brand } from "@/types/User/Search-Types";
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
import SearchModal from "./SearchModal";

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
  const brand = searchParams.get("brand");
  const model = searchParams.get("model");
  const variant = searchParams.get("variant");
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
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  // Filter states
  const [sortBy, setSortBy] = useState<string>("A-Z");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

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
      return price >= minPrice && price <= maxPrice;
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
  }, [products, sortBy, minPrice, maxPrice]);

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

  // Handle product fetching when brand, model, variant, and category are present
  useEffect(() => {
    if (brand && model && variant && category) {
      const fetchFilteredProducts = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log("Fetching products with filters:", { brand, model, variant, category });
          
          const response = await getProductsByFilterWithIds(
            "", // product_type (not used)
            brand, // brandId
            model, // modelId
            variant, // variantId
            category, // categoryId
            undefined, // sub_categoryId
            undefined, // sort_by
            undefined, // min_price
            undefined, // max_price
            1, // page
            50 // limit
          );

          console.log("Products API Response:", response);

          let extractedProducts: any[] = [];

          // Handle different possible response structures
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              extractedProducts = response.data;
            } else if (response.data.products && Array.isArray(response.data.products)) {
              extractedProducts = response.data.products;
            }
          }

          setProducts(extractedProducts as Product[]);
          setIsProduct(true);
          setIsBrand(false);
          setIsModel(false);
          setIsVariant(false);
          setIsCategory(false);
        } catch (err) {
          console.error("Error fetching filtered products:", err);
          setError("Failed to load products");
        } finally {
          setLoading(false);
        }
      };

      fetchFilteredProducts();
    }
  }, [brand, model, variant, category]);

  // Handle brand click - navigate to brand selection page
  const handleBrandClick = async (brandName: string, brandId?: string) => {
    if (vehicleTypeId) {
      // Navigate to brand selection page
      router.push(`/shop/brands/${vehicleTypeId}`);
    } else {
      // Fallback to original behavior if no vehicleTypeId
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
    }
  };

  // Handle model click - fetch variants for selected model and show them
  const handleModelClick = async (modelName: string) => {
    try {
      setLoading(true);
      setError(null);

      const model = modelData.find((m) => m.model_name === modelName);
      if (!model) {
        throw new Error("Selected model not found");
      }

      // Store selected model
      setSelectedModel(model);

      const variantsRes: any = await getVariantsByModel(model._id);
      const fetchedVariants: Variant[] = Array.isArray(variantsRes?.data)
        ? variantsRes.data
        : Array.isArray(variantsRes?.data?.products)
        ? variantsRes.data.products
        : Array.isArray(variantsRes?.products)
        ? variantsRes.products
        : [];

      // If variants exist, show them; otherwise fall back to search
      if (fetchedVariants.length > 0) {
        setIsCategory(false);
        setIsBrand(false);
        setIsModel(false);
        setIsVariant(true);
        setIsProduct(false);

        setVariantData(fetchedVariants);
        setModelData([model]);
        setProducts([]);
      } else {
        // No variants - fall back to search
        const newQuery = `${query || ""} ${modelName}`.trim();
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("query", newQuery);
        router.push(`?${newSearchParams.toString()}`);
      }
    } catch (err) {
      console.error("Error fetching variants by model:", err);
      setError("Failed to load variants for this model");
    } finally {
      setLoading(false);
    }
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
    const newQuery = `${query} ${productName}`.trim();
    console.log("Product clicked:", productName, "New query:", newQuery);

    // Update URL with new query
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("query", newQuery);
    router.push(`?${newSearchParams.toString()}`);
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
          const response = await smartSearch(query, vehicleTypeId || undefined, sortBy, sortBy, minPrice, maxPrice);
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
          
          // If brands are detected and we have vehicleTypeId, redirect to brand selection page
          if (brandFlag && vehicleTypeId) {
            router.push(`/shop/brands/${vehicleTypeId}`);
            return;
          }
          
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

  // Filter Sidebar Component
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
              value="A-Z"
              checked={sortBy === "A-Z"}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">Name (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="Z-A"
              checked={sortBy === "Z-A"}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">Name (Z-A)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="L-H"
              checked={sortBy === "L-H"}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">Price (Low to High)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="H-L"
              checked={sortBy === "H-L"}
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
            <label className="block text-sm text-muted-foreground mb-2">
              Min Price
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-sm text-foreground mt-1">
              Rs {minPrice.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Max Price
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-sm text-foreground mt-1">
              Rs {maxPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {displayedProducts.length} of{" "}
          {filteredAndSortedProducts.length} products
        </p>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(
            to right,
            #3b82f6 0%,
            #3b82f6 ${minPrice / 1000}%,
            #e5e7eb ${minPrice / 1000}%,
            #e5e7eb 100%
          );
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: grab;
          transition: transform 0.1s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: grab;
          transition: transform 0.1s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.15);
        }

        .slider::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }

        .slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          border-radius: 3px;
        }

        .slider::-moz-range-track {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
        }
      `}</style>
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
              <FilterSidebar />
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
                  <FilterSidebar />
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Product Grid */}
              <main>
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                  {/* <h1 className="text-2xl font-bold text-foreground mb-4">
                    {isCategory && categoryName
                      ? `Brands in "${categoryName}" Category`
                      : `Search Results for "${query}"`}
                  </h1> */}

                  {/* Search Button */}
                  {vehicleTypeId && (
                    <button
                      onClick={() => setIsSearchModalOpen(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <SearchIcon className="w-4 h-4" />
                      Search Products
                    </button>
                  )}
                </div>
                {/* Brand Display - grid of all brands */}
                {(isBrand || isCategory) && brandData.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        {brandData.length} Brand
                        {brandData.length !== 1 ? "s" : ""} Found
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {brandData.map((brand) => (
                        <div
                          key={brand._id}
                          className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                          onClick={() => handleBrandClick(brand.brand_name, brand._id)}
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
                          {selectedModel && (
                            <span className="text-sm text-muted-foreground ml-2">
                              for {selectedModel.model_name}
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
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        {filteredAndSortedProducts.length} Product
                        {filteredAndSortedProducts.length !== 1 ? "s" : ""}{" "}
                        Found
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
                    {hasMoreProducts && displayedProducts.length > 0 && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={handleLoadMore}
                          className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
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
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={handleLoadMore}
                          className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
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

      {/* Search Modal */}
      {vehicleTypeId && (
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          vehicleTypeId={vehicleTypeId}
          vehicleType={vehicleType}
        />
      )}
    </>
  );
};

export default SearchResults;
