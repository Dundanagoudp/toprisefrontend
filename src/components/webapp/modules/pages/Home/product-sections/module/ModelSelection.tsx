"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getModelsByBrand } from "@/service/product-Service";

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

interface ModelSelectionProps {
  brandId: string;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({ brandId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleTypeId = searchParams.get("vehicleTypeId");
  const brandName = searchParams.get("brandName");
  
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await getModelsByBrand(brandId);
        
        if (response && response.data && Array.isArray(response.data)) {
          setModels(response.data);
        } else {
          setError("No models found for this brand");
        }
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchModels();
    }
  }, [brandId]);

  const handleModelClick = (modelId: string, modelName: string) => {
    const params = new URLSearchParams();
    if (vehicleTypeId) params.set("vehicleTypeId", vehicleTypeId);
    if (brandName) params.set("brandName", brandName);
    params.set("modelName", encodeURIComponent(modelName));
    
    router.push(`/shop/variants/${modelId}?${params.toString()}`);
  };

  const handleBackToBrands = () => {
    if (vehicleTypeId) {
      router.push(`/shop/brands/${vehicleTypeId}`);
    } else {
      router.back();
    }
  };

  const filteredModels = models.filter(model =>
    model.model_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const buildImageUrl = (path?: string) => {
    if (!path) return "/placeholder.svg";
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const filesOrigin = apiBase.replace(/\/api$/, "");
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading models...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              <h3 className="text-xl font-semibold text-red-700 mb-2">Error</h3>
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Link
              href={vehicleTypeId ? `/shop/brands/${vehicleTypeId}` : "/shop"}
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Brands
            </Link>
            <span>/</span>
            <span className="text-foreground">Select Model</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackToBrands}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Brands
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Select a Model
          </h1>
          {brandName && (
            <p className="text-muted-foreground">
              Choose a model from <span className="font-semibold text-primary">{brandName}</span> to see available variants
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search models..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        {filteredModels.length > 0 ? (
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {filteredModels.length} Model{filteredModels.length !== 1 ? "s" : ""} Available
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredModels.map((model) => (
                <div
                  key={model._id}
                  className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => handleModelClick(model._id, model.model_name)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={buildImageUrl(model.model_image)}
                        alt={model.model_name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-foreground text-center line-clamp-2 leading-tight">
                      {model.model_name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Models Found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `No models match "${searchQuery}". Try a different search term.`
                  : "No models are available for this brand at the moment."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelection;
