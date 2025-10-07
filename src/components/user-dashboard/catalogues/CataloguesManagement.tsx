"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Car, Calendar, Wrench, Plus, Edit, Trash2, Eye, BarChart3 } from "lucide-react";
import { Catalog, Brand, Model, Variant, CreateCatalogRequest } from "@/types/catalogue-types";
import { 
  getCatalogs, 
  getMockCatalogs, 
  getBrands, 
  getMockBrands, 
  getModels, 
  getMockModels, 
  getVariants, 
  getMockVariants,
  createCatalog,
  updateCatalog,
  deleteCatalog
} from "@/service/catalogue-service";

export default function CataloguesManagement() {
  const router = useRouter();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [filteredCatalogs, setFilteredCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedVariant, setSelectedVariant] = useState<string>("all");
  
  // Create catalog form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCatalogRequest>({
    catalog_name: "",
    catalog_description: "",
    catalog_image: "",
    catalog_brands: [],
    catalog_models: [],
    catalog_variants: []
  });

  // Update catalog form state
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedCatalogForUpdate, setSelectedCatalogForUpdate] = useState<Catalog | null>(null);
  const [updateForm, setUpdateForm] = useState<CreateCatalogRequest>({
    catalog_name: "",
    catalog_description: "",
    catalog_image: "",
    catalog_brands: [],
    catalog_models: [],
    catalog_variants: []
  });


  // Reset form when dialog opens/closes
  const resetForm = () => {
    console.log("Resetting form...");
    setCreateForm({
      catalog_name: "",
      catalog_description: "",
      catalog_image: "",
      catalog_brands: [],
      catalog_models: [],
      catalog_variants: []
    });
  };

  // Force re-render key to ensure checkboxes are properly controlled
  const [formKey, setFormKey] = useState(0);
  const forceFormRerender = () => {
    setFormKey(prev => prev + 1);
  };
  
  // Brands, models, variants for form
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<Variant[]>([]);

  useEffect(() => {
    fetchCatalogs();
    fetchBrands();
    fetchAllModels(); // Fetch all models for filter dropdown
    fetchAllVariants(); // Fetch all variants for filter dropdown
  }, []);

  // Debug logging for brands, models, variants
  useEffect(() => {
    console.log("Brands updated:", brands);
  }, [brands]);

  useEffect(() => {
    console.log("Models updated:", models);
  }, [models]);

  useEffect(() => {
    console.log("Variants updated:", variants);
  }, [variants]);

  useEffect(() => {
    console.log("Catalogs updated:", catalogs);
    console.log("FilteredCatalogs updated:", filteredCatalogs);
  }, [catalogs, filteredCatalogs]);

  useEffect(() => {
    console.log("Create form updated:", createForm);
  }, [createForm]);

  useEffect(() => {
    filterCatalogs();
  }, [catalogs, searchTerm, selectedBrand, selectedModel, selectedVariant]);

  useEffect(() => {
    // Fetch and filter models based on selected brands in CREATE form
    if (createForm.catalog_brands.length > 0) {
      console.log("CREATE: Brands selected, fetching models for:", createForm.catalog_brands);
      fetchModels(createForm.catalog_brands);
    } else {
      console.log("CREATE: No brands selected, clearing filtered models");
      setFilteredModels([]);
    }
  }, [createForm.catalog_brands]);

  useEffect(() => {
    // Fetch and filter models based on selected brands in UPDATE form
    if (updateForm.catalog_brands.length > 0) {
      console.log("UPDATE: Brands selected, fetching models for:", updateForm.catalog_brands);
      fetchModels(updateForm.catalog_brands);
    } else {
      console.log("UPDATE: No brands selected, clearing filtered models");
      setFilteredModels([]);
    }
  }, [updateForm.catalog_brands]);

  // Separate useEffect to filter models when models array changes
  useEffect(() => {
    if (createForm.catalog_brands.length > 0) {
      const filtered = models.filter(model => 
        createForm.catalog_brands.includes(model.brand_id)
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  }, [models, createForm.catalog_brands]);

  useEffect(() => {
    // Fetch and filter variants based on selected models in CREATE form
    if (createForm.catalog_models.length > 0) {
      console.log("CREATE: Models selected, fetching variants for:", createForm.catalog_models);
      fetchVariants(createForm.catalog_models);
    } else {
      console.log("CREATE: No models selected, clearing filtered variants");
      setFilteredVariants([]);
    }
  }, [createForm.catalog_models]);

  useEffect(() => {
    // Fetch and filter variants based on selected models in UPDATE form
    if (updateForm.catalog_models.length > 0) {
      console.log("UPDATE: Models selected, fetching variants for:", updateForm.catalog_models);
      fetchVariants(updateForm.catalog_models);
    } else {
      console.log("UPDATE: No models selected, clearing filtered variants");
      setFilteredVariants([]);
    }
  }, [updateForm.catalog_models]);

  // Separate useEffect to filter variants when variants array changes
  useEffect(() => {
    if (createForm.catalog_models.length > 0) {
      const filtered = variants.filter(variant => 
        createForm.catalog_models.includes(variant.model_id)
      );
      setFilteredVariants(filtered);
    } else {
      setFilteredVariants([]);
    }
  }, [variants, createForm.catalog_models]);

  const normalizeId = (id: any, fallback: any) => String(id || fallback);

  // Handle viewing products for a catalog - navigate to separate page
  const handleViewProducts = (catalog: Catalog) => {
    console.log("Navigating to products for catalog:", catalog);
    router.push(`/user/dashboard/catalogues/${catalog.id}/products`);
  };


  const fetchCatalogs = async () => {
    try {
      console.log("Starting to fetch catalogs...");
      setLoading(true);
      const response = await getCatalogs();
      console.log("Catalogs API response:", response);
      console.log("Response success:", response.success);
      console.log("Response data type:", typeof response.data);
      console.log("Response data is array:", Array.isArray(response.data));
      console.log("Response data length:", response.data?.catalogs?.length);
      
      if (response.success && response.data && Array.isArray(response.data.catalogs)) {
        console.log("Setting catalogs from API data:", response.data.catalogs);
        // Normalize the catalog data to match expected structure
        const normalizedCatalogs = response.data.catalogs.map((cat: any) => ({
          id: cat._id,
          catalog_name: cat.catalog_name,
          catalog_description: cat.catalog_description,
          catalog_image: cat.catalog_image,
          catalog_created_by: "admin@toprise.in", // Default since not in API response
          catalog_brands: cat.catalog_brands?.map((b: any) => b._id) || [],
          catalog_models: cat.catalog_models?.map((m: any) => m._id) || [],
          catalog_variants: cat.catalog_variants?.map((v: any) => v._id) || [],
          catalog_products: cat.catalog_products?.map((p: any) => p._id) || [],
          created_at: cat.catalog_created_at,
          updated_at: cat.catalog_updated_at
        }));
        console.log("Normalized catalogs:", normalizedCatalogs);
        setCatalogs(normalizedCatalogs);
        console.log("Catalogs set successfully");
      } else if (response.success && Array.isArray(response.data)) {
        // Fallback for direct array structure
        console.log("Setting catalogs from direct array:", response.data);
        setCatalogs(response.data);
        console.log("Catalogs set successfully");
      } else {
        console.log("Catalogs API failed or data is not array, using mock data");
        console.log("Response structure:", { 
          success: response.success, 
          dataType: typeof response.data, 
          isArray: Array.isArray(response.data),
          hasCatalogs: response.data?.catalogs ? "Yes" : "No",
          catalogsIsArray: Array.isArray(response.data?.catalogs)
        });
        // Fallback to mock data if API fails
        const mockData = getMockCatalogs();
        console.log("Using mock data:", mockData);
        setCatalogs(mockData);
      }
    } catch (error) {
      console.error("Error fetching catalogs:", error);
      // Fallback to mock data on error
      const mockData = getMockCatalogs();
      console.log("Using mock data due to error:", mockData);
      setCatalogs(mockData);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await getBrands();
      if (response.success && Array.isArray(response.data)) {
        // Normalize IDs
        setBrands(response.data.map((b: any, i: number) => ({
          id: String(b.id || b._id || i),
          brand_name: b.brand_name
        })));
      } else {
        const mockData = getMockBrands().map((b: any, i: number) => ({
          id: String(b.id || b._id || i),
          brand_name: b.brand_name
        }));
        setBrands(mockData);
      }
    } catch (error) {
      const mockData = getMockBrands().map((b: any, i: number) => ({
        id: String(b.id || b._id || i),
        brand_name: b.brand_name
      }));
      setBrands(mockData);
    }
  };
  
  // Fetch all models for filter dropdown (not filtered by brand)
  const fetchAllModels = async () => {
    try {
      console.log("Fetching all models for filter dropdown");
      const response = await getModels(); // Fetch without brand filter
      console.log("All Models API response:", response);
      if (response.success && Array.isArray(response.data)) {
        const normalizedModels = response.data.map((m: any, i: number) => ({
          id: normalizeId(m._id || m.id, i),
          model_name: m.model_name,
          brand_id: normalizeId(m.brand_ref?._id || m.brand_id || m.brand?._id, "")
        }));
        console.log("Normalized all models for filter:", normalizedModels);
        setModels(normalizedModels);
      }
    } catch (error) {
      console.error("Error fetching all models:", error);
    }
  };

  const fetchModels = async (brandIds?: string[]) => {
    try {
      console.log("Fetching models for brand IDs:", brandIds);
      const response = await getModels(brandIds && brandIds.length > 0 ? brandIds[0] : undefined);
      console.log("Models API response:", response);
      if (response.success && Array.isArray(response.data)) {
        const normalizedModels = response.data.map((m: any, i: number) => ({
          id: normalizeId(m._id || m.id, i),
          model_name: m.model_name,
          brand_id: normalizeId(m.brand_ref?._id || m.brand_id || m.brand?._id, "")
        }));
        console.log("Normalized models:", normalizedModels);
        setFilteredModels(normalizedModels); // Use filteredModels for create form
      } else {
        console.log("Models API failed, using mock data");
        const mockData = getMockModels().map((m: any, i: number) => ({
          id: normalizeId(m._id || m.id, i),
          model_name: m.model_name,
          brand_id: normalizeId(m.brand_ref?._id || m.brand_id || m.brand?._id, "")
        }));
        setFilteredModels(mockData);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      const mockData = getMockModels().map((m: any, i: number) => ({
        id: normalizeId(m._id || m.id, i),
        model_name: m.model_name,
        brand_id: normalizeId(m.brand_ref?._id || m.brand_id || m.brand?._id, "")
      }));
      setFilteredModels(mockData);
    }
  };
  
  // Fetch all variants for filter dropdown (not filtered by model)
  const fetchAllVariants = async () => {
    try {
      console.log("Fetching all variants for filter dropdown");
      const response = await getVariants(); // Fetch without model filter
      console.log("All Variants API response:", response);
      if (response.success && Array.isArray(response.data)) {
        const normalizedVariants = response.data.map((v: any, i: number) => ({
          id: String(v._id || v.id || i),
          variant_name: v.variant_name,
          model_id: String(v.model?._id || v.model_id || "")
        }));
        console.log("Normalized all variants for filter:", normalizedVariants);
        setVariants(normalizedVariants);
      }
    } catch (error) {
      console.error("Error fetching all variants:", error);
    }
  };

  const fetchVariants = async (modelIds?: string[]) => {
    try {
      console.log("Fetching variants for model IDs:", modelIds);
      const response = await getVariants(modelIds && modelIds.length > 0 ? modelIds[0] : undefined);
      console.log("Variants API response:", response);
      if (response.success && Array.isArray(response.data)) {
        const normalizedVariants = response.data.map((v: any, i: number) => ({
          id: String(v._id || v.id || i),
          variant_name: v.variant_name,
          model_id: String(v.model?._id || v.model_id || "")
        }));
        console.log("Normalized variants for create form:", normalizedVariants);
        setFilteredVariants(normalizedVariants); // Use filteredVariants for create form
      } else {
        console.log("Variants API failed, using mock data");
        const mockData = getMockVariants().map((v: any, i: number) => ({
          id: String(v._id || v.id || i),
          variant_name: v.variant_name,
          model_id: String(v.model?._id || v.model_id || "")
        }));
        setFilteredVariants(mockData);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      const mockData = getMockVariants().map((v: any, i: number) => ({
        id: String(v._id || v.id || i),
        variant_name: v.variant_name,
        model_id: String(v.model?._id || v.model_id || "")
      }));
      setFilteredVariants(mockData);
    }
  };
  

  const filterCatalogs = () => {
    // Ensure catalogs is always an array
    if (!Array.isArray(catalogs)) {
      console.error("Catalogs is not an array:", catalogs);
      setFilteredCatalogs([]);
      return;
    }

    let filtered = catalogs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.catalog_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.catalog_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.catalog_created_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrand !== "all") {
      filtered = filtered.filter(cat => cat.catalog_brands.includes(selectedBrand));
    }

    // Model filter
    if (selectedModel !== "all") {
      filtered = filtered.filter(cat => cat.catalog_models.includes(selectedModel));
    }

    // Variant filter
    if (selectedVariant !== "all") {
      filtered = filtered.filter(cat => cat.catalog_variants.includes(selectedVariant));
    }

    setFilteredCatalogs(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBrand("all");
    setSelectedModel("all");
    setSelectedVariant("all");
  };

  const handleEditCatalog = (catalog: Catalog) => {
    console.log("Opening edit dialog for catalog:", catalog);
    setSelectedCatalogForUpdate(catalog);
    setUpdateForm({
      catalog_name: catalog.catalog_name,
      catalog_description: catalog.catalog_description,
      catalog_image: catalog.catalog_image,
      catalog_brands: catalog.catalog_brands,
      catalog_models: catalog.catalog_models,
      catalog_variants: catalog.catalog_variants
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateCatalog = async () => {
    if (!selectedCatalogForUpdate) return;
    
    try {
      console.log("Updating catalog:", selectedCatalogForUpdate.id);
      console.log("Update form data:", updateForm);
      
      const response = await updateCatalog(selectedCatalogForUpdate.id, updateForm);
      if (response.success) {
        console.log("Catalog updated successfully");
        fetchCatalogs(); // Refresh the list
        setIsUpdateDialogOpen(false);
        setSelectedCatalogForUpdate(null);
        setUpdateForm({
          catalog_name: "",
          catalog_description: "",
          catalog_image: "",
          catalog_brands: [],
          catalog_models: [],
          catalog_variants: []
        });
      } else {
        console.error("Failed to update catalog:", response.message);
      }
    } catch (error) {
      console.error("Error updating catalog:", error);
    }
  };

  const handleCreateCatalog = async () => {
    try {
      const response = await createCatalog(createForm);
      if (response.success) {
        fetchCatalogs(); // Refresh the list
        setIsCreateDialogOpen(false);
        setCreateForm({
          catalog_name: "",
          catalog_description: "",
          catalog_image: "",
          catalog_brands: [],
          catalog_models: [],
          catalog_variants: []
        });
      } else {
        console.error("Failed to create catalog:", response.message);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error("Error creating catalog:", error);
      // Fallback to mock data behavior for development
      const newCatalog: Catalog = {
        id: Date.now().toString(),
        catalog_name: createForm.catalog_name,
        catalog_description: createForm.catalog_description,
        catalog_image: createForm.catalog_image,
        catalog_created_by: "admin@toprise.in",
        catalog_brands: createForm.catalog_brands,
        catalog_models: createForm.catalog_models,
        catalog_variants: createForm.catalog_variants,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        statistics: {
          total_products: 0,
          total_brands: createForm.catalog_brands.length,
          total_models: createForm.catalog_models.length,
          total_variants: createForm.catalog_variants.length,
          last_updated: new Date().toISOString()
        }
      };
      
      setCatalogs([...catalogs, newCatalog]);
      setIsCreateDialogOpen(false);
      setCreateForm({
        catalog_name: "",
        catalog_description: "",
        catalog_image: "",
        catalog_brands: [],
        catalog_models: [],
        catalog_variants: []
      });
    }
  };

  const handleDeleteCatalog = async (catalogId: string) => {
    try {
      const response = await deleteCatalog(catalogId);
      if (response.success) {
        fetchCatalogs(); // Refresh the list
      } else {
        console.error("Failed to delete catalog:", response.message);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error("Error deleting catalog:", error);
      // Fallback to mock data behavior for development
      setCatalogs(catalogs.filter(cat => cat.id !== catalogId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading catalogs...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Vehicle Catalogs
                  </h1>
                  <p className="text-gray-600 text-lg">Manage and organize your vehicle parts catalogs</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl px-4 py-2 border border-red-200">
                <span className="text-sm font-medium text-red-700">
                  {filteredCatalogs.length} Active Catalogs
                </span>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (open) {
                  resetForm();
                  forceFormRerender();
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
                    <Plus className="h-5 w-5" />
                    Create New Catalog
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Catalog</DialogTitle>
              </DialogHeader>
              <div key={formKey} className="space-y-4">
                <div>
                  <Label htmlFor="catalog_name" className="text-sm font-medium py-2">Catalog Name</Label>
                  <Input
                    id="catalog_name"
                    value={createForm.catalog_name}
                    onChange={(e) => setCreateForm({...createForm, catalog_name: e.target.value})}
                    placeholder="e.g., Honda Civic Parts Catalog"
                  />
                </div>
                
                <div>
                  <Label htmlFor="catalog_description" className="text-sm font-medium py-2">Description</Label>
                  <Textarea
                    id="catalog_description"
                    value={createForm.catalog_description}
                    onChange={(e) => setCreateForm({...createForm, catalog_description: e.target.value})}
                    placeholder="Describe what this catalog contains..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="catalog_image" className="text-sm font-medium py-2">Image URL (Optional)</Label>
                  <Input
                    id="catalog_image"
                    value={createForm.catalog_image}
                    onChange={(e) => setCreateForm({...createForm, catalog_image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Brands</Label>
                  <div className="text-xs text-gray-500 mb-2">
                    Available brands: {brands.length}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                  {brands.map((brand) => {
  const isChecked = createForm.catalog_brands.includes(brand.id);
  return (
    <label key={brand.id} className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => {
          setCreateForm(prev => {
            const exists = prev.catalog_brands.includes(brand.id);
            return {
              ...prev,
              catalog_brands: exists
                ? prev.catalog_brands.filter(id => id !== brand.id)
                : [...prev.catalog_brands, brand.id],
              // Also reset models/variants if brand removed
              catalog_models: exists
                ? prev.catalog_models.filter(mId =>
                    models.find(m => m.id === mId)?.brand_id !== brand.id
                  )
                : prev.catalog_models,
              catalog_variants: exists
                ? prev.catalog_variants.filter(vId =>
                    variants.find(v => v.id === vId)?.model_id !==
                    models.find(m => m.id === vId)?.id
                  )
                : prev.catalog_variants
            };
          });
        }}
      />
      <span className="text-sm">{brand.brand_name}</span>
    </label>
  );
})}

                  </div>
                </div>

                <div>
                  <Label>Models</Label>
                  <div className="text-xs text-gray-500 mb-2">
                    Available models: {filteredModels.length} (Total: {models.length})
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filteredModels.length > 0 ? filteredModels.map((model, index) => {
                      const isChecked = createForm.catalog_models.includes(model.id);
                      console.log(`Model ${model.model_name} (${model.id}): isChecked=${isChecked}, catalog_models=`, createForm.catalog_models);
                      return (
                        <label key={`model-${model.id}-${index}`} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`model-checkbox-${model.id}-${index}`}
                            checked={isChecked}
                            onChange={(e) => {
                              console.log("Model checkbox changed:", model.model_name, e.target.checked, "Model ID:", model.id);
                              console.log("Current catalog_models before change:", createForm.catalog_models);
                              
                              if (e.target.checked) {
                                const newModels = [...createForm.catalog_models, model.id];
                                console.log("Adding model, new array:", newModels);
                                setCreateForm({
                                  ...createForm,
                                  catalog_models: newModels
                                });
                              } else {
                                const newModels = createForm.catalog_models.filter(id => id !== model.id);
                                console.log("Removing model, new array:", newModels);
                                setCreateForm({
                                  ...createForm,
                                  catalog_models: newModels,
                                  catalog_variants: createForm.catalog_variants.filter(variantId => 
                                    !variants.find(v => v.id === variantId && v.model_id === model.id)
                                  )
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{model.model_name}</span>
                        </label>
                      );
                    }) : (
                      <div className="text-sm text-gray-500">
                        {models.length === 0 ? "No models available" : "Select brands first to see models"}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Variants</Label>
                  <div className="text-xs text-gray-500 mb-2">
                    Available variants: {filteredVariants.length} (Total: {variants.length})
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filteredVariants.length > 0 ? filteredVariants.map((variant, index) => {
                      const isChecked = createForm.catalog_variants.includes(variant.id);
                      console.log(`Variant ${variant.variant_name} (${variant.id}): isChecked=${isChecked}, catalog_variants=`, createForm.catalog_variants);
                      return (
                        <label key={`variant-${variant.id}-${index}`} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`variant-checkbox-${variant.id}-${index}`}
                            checked={isChecked}
                            onChange={(e) => {
                              console.log("Variant checkbox changed:", variant.variant_name, e.target.checked, "Variant ID:", variant.id);
                              console.log("Current catalog_variants before change:", createForm.catalog_variants);
                              
                              if (e.target.checked) {
                                const newVariants = [...createForm.catalog_variants, variant.id];
                                console.log("Adding variant, new array:", newVariants);
                                setCreateForm({
                                  ...createForm,
                                  catalog_variants: newVariants
                                });
                              } else {
                                const newVariants = createForm.catalog_variants.filter(id => id !== variant.id);
                                console.log("Removing variant, new array:", newVariants);
                                setCreateForm({
                                  ...createForm,
                                  catalog_variants: newVariants
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{variant.variant_name}</span>
                        </label>
                      );
                    }) : (
                      <div className="text-sm text-gray-500">
                        {variants.length === 0 ? "No variants available" : "Select models first to see variants"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Debug section - remove in production */}
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <div className="font-semibold mb-2">Debug Info:</div>
                  <div>Selected Brands: {createForm.catalog_brands.length} - {createForm.catalog_brands.join(", ")}</div>
                  <div>Selected Models: {createForm.catalog_models.length} - {createForm.catalog_models.join(", ")}</div>
                  <div>Selected Variants: {createForm.catalog_variants.length} - {createForm.catalog_variants.join(", ")}</div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCatalog} disabled={!createForm.catalog_name} className="bg-red-600 hover:bg-red-700 text-white">
                    Create Catalog
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Update Catalog Dialog */}
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Catalog</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="update_catalog_name" className="text-sm font-medium py-2">Catalog Name</Label>
                  <Input
                    id="update_catalog_name"
                    value={updateForm.catalog_name}
                    onChange={(e) => setUpdateForm({...updateForm, catalog_name: e.target.value})}
                    placeholder="e.g., Honda Civic Parts Catalog"
                  />
                </div>
                
                <div>
                  <Label htmlFor="update_catalog_description" className="text-sm font-medium py-2">Description</Label>
                  <Textarea
                    id="update_catalog_description"
                    value={updateForm.catalog_description}
                    onChange={(e) => setUpdateForm({...updateForm, catalog_description: e.target.value})}
                    placeholder="Describe what this catalog contains..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="update_catalog_image" className="text-sm font-medium py-2">Image URL (Optional)</Label>
                  <Input
                    id="update_catalog_image"
                    value={updateForm.catalog_image}
                    onChange={(e) => setUpdateForm({...updateForm, catalog_image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Brands</Label>
                  <div className="text-xs text-gray-500 mb-2">
                    Selected: {updateForm.catalog_brands.length}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {brands.map((brand) => {
                      const isChecked = updateForm.catalog_brands.includes(brand.id);
                      return (
                        <label key={`update-brand-${brand.id}`} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUpdateForm({
                                  ...updateForm,
                                  catalog_brands: [...updateForm.catalog_brands, brand.id]
                                });
                              } else {
                                setUpdateForm({
                                  ...updateForm,
                                  catalog_brands: updateForm.catalog_brands.filter(id => id !== brand.id),
                                  catalog_models: updateForm.catalog_models.filter(modelId => 
                                    !models.find(m => m.id === modelId && m.brand_id === brand.id)
                                  ),
                                  catalog_variants: updateForm.catalog_variants.filter(variantId => {
                                    const variant = variants.find(v => v.id === variantId);
                                    const model = models.find(m => m.id === variant?.model_id);
                                    return model?.brand_id !== brand.id;
                                  })
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{brand.brand_name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {updateForm.catalog_brands.length > 0 && filteredModels.length > 0 && (
                  <div>
                    <Label>Models (Optional)</Label>
                    <div className="text-xs text-gray-500 mb-2">
                      Selected: {updateForm.catalog_models.length}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {filteredModels.map((model) => {
                        const isChecked = updateForm.catalog_models.includes(model.id);
                        return (
                          <label key={`update-model-${model.id}`} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setUpdateForm({
                                    ...updateForm,
                                    catalog_models: [...updateForm.catalog_models, model.id]
                                  });
                                } else {
                                  setUpdateForm({
                                    ...updateForm,
                                    catalog_models: updateForm.catalog_models.filter(id => id !== model.id),
                                    catalog_variants: updateForm.catalog_variants.filter(variantId => 
                                      !variants.find(v => v.id === variantId && v.model_id === model.id)
                                    )
                                  });
                                }
                              }}
                            />
                            <span className="text-sm">{model.model_name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {updateForm.catalog_models.length > 0 && filteredVariants.length > 0 && (
                  <div>
                    <Label>Variants (Optional)</Label>
                    <div className="text-xs text-gray-500 mb-2">
                      Selected: {updateForm.catalog_variants.length}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {filteredVariants.map((variant) => {
                        const isChecked = updateForm.catalog_variants.includes(variant.id);
                        return (
                          <label key={`update-variant-${variant.id}`} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setUpdateForm({
                                    ...updateForm,
                                    catalog_variants: [...updateForm.catalog_variants, variant.id]
                                  });
                                } else {
                                  setUpdateForm({
                                    ...updateForm,
                                    catalog_variants: updateForm.catalog_variants.filter(id => id !== variant.id)
                                  });
                                }
                              }}
                            />
                            <span className="text-sm">{variant.variant_name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsUpdateDialogOpen(false);
                    setSelectedCatalogForUpdate(null);
                    setUpdateForm({
                      catalog_name: "",
                      catalog_description: "",
                      catalog_image: "",
                      catalog_brands: [],
                      catalog_models: [],
                      catalog_variants: []
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCatalog} disabled={!updateForm.catalog_name} className="bg-red-600 hover:bg-red-700 text-white">
                    Update Catalog
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
            </div>
          </div>
        </div>
      </div>


      {/* Search and Filters */}
      <div className="mb-8">
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <Input
                  placeholder="Search catalogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500/20 bg-gray-50 focus:bg-white">
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id} className="rounded-lg">
                        {brand.brand_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Filter */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500/20 bg-gray-50 focus:bg-white">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Models</SelectItem>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="rounded-lg">
                        {model.model_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Variant Filter */}
                {/* <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Variant</label>
                  <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500/20 bg-gray-50 focus:bg-white">
                      <SelectValue placeholder="Select Variant" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                      <SelectItem value="all" className="rounded-lg">All Variants</SelectItem>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id} className="rounded-lg">
                          {variant.variant_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="px-6 py-2 rounded-xl border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-200"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catalogs Grid */}
      {!Array.isArray(filteredCatalogs) || filteredCatalogs.length === 0 ? (
        <div className="mb-8">
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-16 px-8">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-200 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
                  <Car className="h-16 w-16 text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-4 max-w-md">
                <h3 className="text-2xl font-bold text-gray-900">
                  {searchTerm || selectedBrand !== "all" || selectedModel !== "all" || selectedVariant !== "all"
                    ? "No catalogs found"
                    : "No catalogs available"}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {searchTerm || selectedBrand !== "all" || selectedModel !== "all" || selectedVariant !== "all"
                    ? "Try adjusting your search criteria or filters to find what you're looking for."
                    : "Get started by creating your first vehicle parts catalog to organize your inventory."}
                </p>
                
                {!searchTerm && selectedBrand === "all" && selectedModel === "all" && selectedVariant === "all" && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Catalog
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(filteredCatalogs) && filteredCatalogs.map((catalog) => (
            <Card key={catalog.id} className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              {/* Card Header with Image */}
              <div className="relative">
                {catalog.catalog_image ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={catalog.catalog_image}
                      alt={catalog.catalog_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Car className="h-16 w-16 text-white opacity-80" />
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button 
                    size="sm" 
                    className="bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm"
                    onClick={() => handleViewProducts(catalog)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg backdrop-blur-sm"
                    onClick={() => handleDeleteCatalog(catalog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Title and Description */}
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                    {catalog.catalog_name}
                  </CardTitle>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {catalog.catalog_description}
                  </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Products</p>
                      <p className="text-lg font-bold text-gray-900">{catalog.statistics?.total_products || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Car className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Brands</p>
                      <p className="text-lg font-bold text-gray-900">{catalog.catalog_brands.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Wrench className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Models</p>
                      <p className="text-lg font-bold text-gray-900">{catalog.catalog_models.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Variants</p>
                      <p className="text-lg font-bold text-gray-900">{catalog.catalog_variants.length}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="outline"
                    className="w-full border-blue-300 hover:border-blue-500 hover:text-blue-600 rounded-xl py-3 font-semibold transition-all duration-200"
                    onClick={() => handleEditCatalog(catalog)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Catalog
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => handleViewProducts(catalog)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Products
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-300 hover:border-red-500 hover:text-red-600 rounded-xl py-3 font-semibold transition-all duration-200"
                    onClick={() => router.push(`/user/dashboard/catalogues/${catalog.id}/products`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Manage Products
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

