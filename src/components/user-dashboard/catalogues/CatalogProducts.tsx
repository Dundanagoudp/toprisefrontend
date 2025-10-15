"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Wrench, Eye, Edit } from "lucide-react";
import { getCatalogs, getBrands, getModels } from "@/service/catalogue-service";

interface CatalogProductsProps {
  catalogId: string;
}

export default function CatalogProducts({ catalogId }: CatalogProductsProps) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    fetchCatalogAndProducts();
  }, [catalogId]);

  useEffect(() => {
    // Filter products based on search term
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Helper functions to get brand and model names by ID
  const getBrandName = (brandId: string) => {
    if (!brandId) return "N/A";
    const brand = brands.find(b => b._id === brandId || b.id === brandId);
    return brand ? brand.brand_name : brandId;
  };

  const getModelName = (modelId: string) => {
    if (!modelId) return "N/A";
    const model = models.find(m => m._id === modelId || m.id === modelId);
    return model ? model.model_name : modelId;
  };

  const fetchCatalogAndProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching catalog and products for ID:", catalogId);
      
      // Fetch catalogs, brands, and models in parallel
      const [catalogsResponse, brandsResponse, modelsResponse] = await Promise.all([
        getCatalogs(),
        getBrands(),
        getModels()
      ]);
      
      console.log("Catalogs API response:", catalogsResponse);
      console.log("Brands API response:", brandsResponse);
      console.log("Models API response:", modelsResponse);
      
      // Set brands and models
      if (brandsResponse.success && Array.isArray(brandsResponse.data)) {
        setBrands(brandsResponse.data);
      }
      
      if (modelsResponse.success && Array.isArray(modelsResponse.data)) {
        setModels(modelsResponse.data);
      }
      
      if (catalogsResponse.success && catalogsResponse.data && Array.isArray(catalogsResponse.data.catalogs)) {
        // Find the specific catalog by ID
        const foundCatalog = catalogsResponse.data.catalogs.find((cat: any) => cat._id === catalogId);
        
        if (foundCatalog) {
          console.log("Found catalog:", foundCatalog);
          setCatalog(foundCatalog);
          
          // Extract products from the catalog
          const catalogProducts = foundCatalog.catalog_products || [];
          console.log("Catalog products:", catalogProducts);
          
          setProducts(catalogProducts);
          setFilteredProducts(catalogProducts);
        } else {
          console.error("Catalog not found with ID:", catalogId);
        }
      } else {
        console.error("Failed to fetch catalogs or invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching catalog and products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg animate-bounce">
              <Wrench className="h-16 w-16 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Loading Catalog Products</h3>
            <p className="text-gray-600">Please wait while we fetch the products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-200 rounded-full blur-2xl opacity-50"></div>
            <div className="relative p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
              <Wrench className="h-16 w-16 text-white" />
            </div>
          </div>
          <div className="text-center space-y-4 max-w-md">
            <h3 className="text-2xl font-bold text-gray-900">Catalog Not Found</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              The catalog you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => router.back()}
              className="mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center gap-3 px-4 py-2 rounded-xl border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Catalogs
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Wrench className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {catalog.catalog_name}
                  </h1>
                  <p className="text-gray-600 text-lg mt-2 max-w-2xl">{catalog.catalog_description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl px-6 py-3 border border-green-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{filteredProducts.length}</p>
                  <p className="text-sm text-green-600 font-medium">Products Found</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-6 py-3 border border-blue-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">{products.length}</p>
                  <p className="text-sm text-blue-600 font-medium">Total Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              Search Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <Input
                placeholder="Search products by name, SKU, brand, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 bg-gray-50 focus:bg-white text-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="mb-8">
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-16 px-8">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg">
                  <Wrench className="h-16 w-16 text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-4 max-w-md">
                <h3 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? "No products found" : "No products in this catalog"}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {searchTerm 
                    ? "Try adjusting your search criteria to find what you're looking for."
                    : "This catalog doesn't have any products yet. Products will appear here once they are added to the catalog."}
                </p>
                
                {searchTerm && (
                  <Button 
                    onClick={() => setSearchTerm("")}
                    className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <Card key={product._id || index} className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              {/* Product Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                      {product.product_name || "Unnamed Product"}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium"
                    >
                      {product.sku_code || "No SKU"}
                    </Badge>
                  </div>
                </div>
              </div>

              <CardContent className="px-6 pb-6 space-y-4">
                {/* Product Details Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Wrench className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Brand</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getBrandName(product.brand)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Model</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getModelName(product.model)}
                      </p>
                    </div>
                  </div>
                  
                  {product.variant && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Edit className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Variants</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {Array.isArray(product.variant) ? product.variant.length : 1} variant(s)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => router.push(`/user/dashboard/product/product-details/${product._id || product.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-300 hover:border-blue-500 hover:text-blue-600 rounded-xl py-3 font-semibold transition-all duration-200"
                    onClick={() => router.push(`/user/dashboard/product/productedit/${product._id || product.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
