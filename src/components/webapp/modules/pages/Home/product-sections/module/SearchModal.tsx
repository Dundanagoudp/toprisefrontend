"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, ChevronRight, Package } from "lucide-react";
import { 
  intelligentSearch,
  getVariantsByModel
} from "@/service/product-Service";
import apiClient from "@/apiClient";

interface Category {
  _id: string;
  category_name: string;
  category_code: string;
  category_image?: string;
  category_Status: string;
}

interface Brand {
  id: string;
  name: string;
  code: string;
  logo?: string;
  featured?: boolean;
  nextStep?: string;
  productCount?: number; // Added for displaying product count
}

interface Model {
  id: string;
  name: string;
  code: string;
  image?: string;
  status: string;
  brand?: {
    id: string;
    name: string;
    code: string;
  };
  nextStep?: string;
}

interface Variant {
  id: string;
  name: string;
  code: string;
  image?: string;
  status: string;
  description?: string;
  nextStep?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleTypeId: string;
  vehicleType: string;
}

type SearchStep = 'search' | 'brand' | 'model' | 'category' | 'variant';

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  vehicleTypeId,
  vehicleType
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SearchStep>('search');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Selection states
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [detectedPath, setDetectedPath] = useState<any>(null);
  
  // Search type information
  const [searchType, setSearchType] = useState<string | null>(null);
  const [searchTypeDetails, setSearchTypeDetails] = useState<any>(null);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('search');
      setSearchQuery("");
      setSelectedBrand(null);
      setSelectedModel(null);
      setSelectedCategory(null);
      setSelectedVariant(null);
      setBrands([]);
      setModels([]);
      setVariants([]);
      setCategories([]);
      setDetectedPath(null);
      setSearchType(null);
      setSearchTypeDetails(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      console.log("Performing intelligent search for:", searchQuery);
      const response = await intelligentSearch(searchQuery.trim(), 20, 1);

      if (!response.success) {
        setError(response.message || "Search failed");
        return;
      }

      const { type, results, detectedPath: detected, total, hasMore, suggestion, searchType: detectedSearchType, searchTypeDetails } = response.data;
      console.log("Search type detected:", type);
      console.log("Search type:", detectedSearchType);
      console.log("Search type details:", searchTypeDetails);
      console.log("Results:", results);
      console.log("Detected path:", detected);
      console.log("Total results:", total);
      console.log("Suggestion:", suggestion);

      setDetectedPath(detected);
      setSearchType(detectedSearchType);
      setSearchTypeDetails(searchTypeDetails);

      // Handle different result types
      switch (type) {
        case 'brand':
          setBrands(results || []);
          setCurrentStep('brand');
          // Store total count in detectedPath if available
          if (total !== undefined) {
            setDetectedPath({
              ...detected,
              totalCount: total,
              suggestion: suggestion
            });
          }
          break;
        case 'model':
          setModels(results || []);
          setCurrentStep('model');
          // Set detected brand if available
          if (detected && detected.brand) {
            setSelectedBrand({
              id: detected.brand.id,
              name: detected.brand.name,
              code: detected.brand.code,
              nextStep: 'model'
            });
          }
          break;
        case 'variant':
          setVariants(results || []);
          setCurrentStep('variant');
          // Set detected brand and model if available
          if (detected && detected.brand) {
            setSelectedBrand({
              id: detected.brand.id,
              name: detected.brand.name,
              code: detected.brand.code,
              nextStep: 'model'
            });
          }
          if (detected && detected.model) {
            setSelectedModel({
              id: detected.model.id,
              name: detected.model.name,
              code: detected.model.code,
              status: 'active',
              nextStep: 'variant'
            });
          }
          break;
        case 'products':
          // Navigate to search results page with the search query
          const searchParams = new URLSearchParams();
          searchParams.set('query', searchQuery.trim());
          router.push(`/shop/search-results?${searchParams.toString()}`);
          onClose();
          break;
        case 'none':
        default:
          setError("No results found. Please try a different search.");
          break;
      }
    } catch (err: any) {
      console.error("Error performing search:", err);
      setError(err.message || "Failed to perform search");
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = async (brand: Brand) => {
    setSelectedBrand(brand);
    // Perform another intelligent search with the brand name
    try {
      setLoading(true);
      const response = await intelligentSearch(brand.name, 20, 1);
      if (response.success && response.data.type === 'model') {
        setModels(response.data.results || []);
        setCurrentStep('model');
      }
    } catch (err) {
      console.error("Error searching for models:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = async (model: Model) => {
    setSelectedModel(model);
    console.log("Model selected:", model);
    
    // Load categories first for filtering
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading categories for vehicleType:", vehicleTypeId);
      
      const response = await apiClient.get(`/category/api/category/type/${vehicleTypeId}`);
      
      console.log("Categories response:", response);
      console.log("Response structure:", {
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
        hasCategories: !!response?.data?.data?.categories,
        categoriesLength: response?.data?.data?.categories?.length || 0
      });
      
      if (response && response.data) {
        // The response structure is: { success: true, message: "...", data: { categories: [...] } }
        const categoriesData = response.data.data?.categories || response.data.categories || response.data.data || response.data;
        const categoryData = Array.isArray(categoriesData) ? categoriesData : [];
        console.log("Parsed categories:", categoryData);
        console.log("Categories count:", categoryData.length);
        
        if (categoryData.length > 0) {
          setCategories(categoryData);
          setCurrentStep('category');
        } else {
          setError("No categories found for this vehicle type");
        }
      } else {
        setError("Failed to load categories");
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category);
    console.log("Category selected:", category);
    
    // Now load variants for the selected model
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading variants for model:", selectedModel?.id);
      
      const response = await getVariantsByModel(selectedModel!.id);
      
      console.log("Variants response:", response);
      
      if (response && response.success) {
        let variantsData = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            variantsData = response.data;
          } else if ((response.data as any).products && Array.isArray((response.data as any).products)) {
            variantsData = (response.data as any).products;
          } else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
            variantsData = (response.data as any).data;
          }
        }
        
        console.log("Extracted variants:", variantsData.length);
        
        if (variantsData.length > 0) {
          const mappedVariants = variantsData.map((v: any) => ({
            id: v._id || v.id,
            name: v.variant_name || v.name,
            code: v.variant_code || v.code,
            image: v.variant_image || v.image,
            status: v.variant_status || v.status,
            description: v.variant_Description || v.description,
            nextStep: 'products'
          }));
          
          console.log("Mapped variants:", mappedVariants);
          setVariants(mappedVariants);
          setCurrentStep('variant');
        } else {
          setError("No variants found for this model");
        }
      } else {
        setError("Failed to load variants");
      }
    } catch (err) {
      console.error("Error loading variants:", err);
      setError("Failed to load variants: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = async (variant: Variant) => {
    setSelectedVariant(variant);
    
    // Navigate to search results page with filters
    if (!selectedBrand || !selectedModel || !selectedCategory) {
      setError("Missing brand, model, or category information");
      return;
    }

    // Build query parameters for the search results page
    const params = new URLSearchParams();
    params.set('brand', selectedBrand.id);
    params.set('model', selectedModel.id);
    params.set('variant', variant.id);
    params.set('category', selectedCategory._id);
    
    // Add search type parameters if available
    if (searchType) {
      params.set('searchType', searchType);
    }
    if (searchTypeDetails) {
      params.set('searchTypeDetails', JSON.stringify(searchTypeDetails));
    }
    if (searchQuery.trim()) {
      params.set('originalQuery', searchQuery.trim());
    }

    // Navigate to search results page
    router.push(`/shop/search-results?${params.toString()}`);
    onClose();
  };

  



  const handleBack = () => {
    switch (currentStep) {
      case 'brand':
        setCurrentStep('search');
        break;
      case 'model':
        setCurrentStep('brand');
        break;
      case 'category':
        setCurrentStep('model');
        break;
      case 'variant':
        setCurrentStep('category');
        break;
    }
  };

  const buildImageUrl = (path?: string) => {
    if (!path) return "/placeholder.svg";
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const filesOrigin = apiBase.replace(/\/api$/, "");
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'search':
        return 'Search Products';
      case 'brand':
        return 'Select Brand';
      case 'model':
        return 'Select Model';
      case 'category':
        return 'Select Category';
      case 'variant':
        return 'Select Variant';
      default:
        return 'Search Products';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'search':
        return `Search for ${vehicleType} parts and accessories`;
      case 'brand':
        return 'Select a brand';
      case 'model':
        return `Select a model${selectedBrand ? ` for ${selectedBrand.name}` : ''}`;
      case 'category':
        return `Select a category${selectedBrand ? ` for ${selectedBrand.name}` : ''}`;
      case 'variant':
        return `Select a variant${selectedModel ? ` for ${selectedModel.name}` : ''}`;
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            {currentStep !== 'search' && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
              <p className="text-sm text-muted-foreground">{getStepDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {currentStep === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search for {vehicleType} parts
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Try: maruti suzuki, swift, spark plug, TOPT1000015..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || loading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              
              {/* Search Hints */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">💡 Search Tips</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium">•</span>
                    <div>
                      <span className="font-medium">Brand Name:</span> "maruti suzuki", "honda", "tvs"
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium">•</span>
                    <div>
                      <span className="font-medium">Model Name:</span> "swift", "city", "apache rtr"
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium">•</span>
                    <div>
                      <span className="font-medium">Product Name:</span> "spark plug", "brake pad", "oil filter"
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium">•</span>
                    <div>
                      <span className="font-medium">SKU Code:</span> "TOPT1000015", "TOPBRK001", "Top"
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium">•</span>
                    <div>
                      <span className="font-medium">Part Number:</span> "944", "M7011320", "N90105107D"
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>Pro Tip:</strong> You can combine terms like "maruti suzuki swift spark plug" for more specific results!
                </div>
              </div>
            </div>
          )}

          {currentStep === 'brand' && (
            <div className="space-y-4">
              {detectedPath?.products && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                  <p className="text-sm text-blue-800">
                    Found <span className="font-semibold">{detectedPath.products.count}</span> products matching your search. Select a brand to continue.
                  </p>
                </div>
              )}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => handleBrandSelect(brand)}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <img
                        src={buildImageUrl(brand.logo)}
                        alt={brand.name}
                        className="w-12 h-12 object-contain mx-auto mb-2"
                      />
                      <h3 className="text-sm font-medium text-center">{brand.name}</h3>
                      {brand.productCount && (
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {brand.productCount} products
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 'model' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <img
                        src={buildImageUrl(model.image)}
                        alt={model.name}
                        className="w-12 h-12 object-contain mx-auto mb-2"
                      />
                      <h3 className="text-sm font-medium text-center">{model.name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 'category' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      onClick={() => handleCategorySelect(category)}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <img
                        src={buildImageUrl(category.category_image)}
                        alt={category.category_name}
                        className="w-12 h-12 object-contain mx-auto mb-2"
                      />
                      <h3 className="text-sm font-medium text-center">{category.category_name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 'variant' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-medium text-center">{variant.name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchModal;
