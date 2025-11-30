"use client";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useDebounce from "@/utils/useDebounce";
import { useAppSelector } from "@/store/hooks";
import DynamicButton from "@/components/common/button/button";
import SearchInput from "@/components/common/search/SearchInput";
import { Plus, Pencil, FileText, Clock, CheckCircle, AlertTriangle, FileBarChart } from "lucide-react";
import uploadFile from "../../../../../public/assets/uploadFile.svg";
import ApprovedProduct from "./tabs/Super-Admin/ApprovedProduct";
import RejectedProduct from "./tabs/Super-Admin/RejectedProduct";
import PendingProduct from "./tabs/Super-Admin/PendingProduct";
import UploadBulkCard from "./uploadBulk";
import { useRouter } from "next/navigation";
import { set } from "zod";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { aproveProduct, deactivateProduct, exportCSV, rejectProduct, rejectBulkProducts, getCategories, getSubCategories, getBrand, getModelsByBrand, getVariantsByModel, approveBulkProducts, getSubcategoriesByCategoryId } from "@/service/product-Service";
import { updateProductLiveStatus } from "@/store/slice/product/productLiveStatusSlice";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { useAppDispatch } from "@/store/hooks";
import RejectReason from "./tabs/Super-Admin/dialogue/RejectReason";
import { fetchAndDownloadCSV } from "@/components/common/ExportCsv";
import { SelectContext } from "@/utils/SelectContext";
import { ProductSelectionProvider, useProductSelection } from "@/contexts/ProductSelectionContext";


type TabType = "Approved" | "Pending" | "Rejected";
interface TabConfig {
  id: TabType;
  label: string;
  component?: React.ComponentType<any>;
  buttonConfig?: {
    text: string;
    action: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    disabled?: boolean;
  };
}

function ProductManagementContent() {
  const [activeTab, setActiveTab] = useState<TabType>("Approved");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Approved");
  const [refreshKey, setRefreshKey] = useState(0);
const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<"upload" | "edit" | "uploadDealer">(
    "upload"
  );
  const {showToast} = useGlobalToast();
   const [isModalOpen, setIsModalOpen] = useState(false);
  const auth = useAppSelector((state) => state.auth.user);
  const [uploadBulkLoading, setUploadBulkLoading] = useState(false);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [editBulkLoading, setEditBulkLoading] = useState(false);
  const [bulkApproveLoading, setBulkApproveLoading] = useState(false);
  const [uploadDealerBulkLoading, setUploadDealerBulkLoading] = useState(false);
  const route = useRouter();
  const dispatch = useAppDispatch();
const allowedRoles = ["Super-admin", "Inventory-Admin", "Inventory-Staff", "Fulfillment-Admin"];
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantName, setSelectedVariantName] = useState<string | null>(null);
  const { selectedProductIds, clearSelection } = useProductSelection();
const getStatusColor = (status: string) => {
  switch (status) {

    case "Approved":
      return "text-green-600 font-medium";
    case "Rejected":
      return "text-red-600 font-medium";
    case "Pending":
      return "text-yellow-600 font-medium";
    default:
      return "text-gray-700";
  }
};


  const performSearch = useCallback((query: string) => {
    try {
      console.log("🔍 ProductManagement: performSearch called with query:", query);
      
      // Sanitize the search query
      const sanitizedQuery = query ? query.trim() : "";
      setSearchQuery(sanitizedQuery);
      setIsSearching(false);
      
  
    } catch (error) {
      console.error("❌ Error in performSearch:", error);
      setSearchQuery("");
      setIsSearching(false);
    }
  }, []);
  // Initial loads
  useEffect(() => {
    (async () => {
      try {
        const [catRes,brandRes] = await Promise.all([
          getCategories(), // categories array
          getBrand(), 
        ]);
        
      
        
        // Handle categories
        const categoriesData = Array.isArray(catRes?.data) ? catRes.data : 
                              Array.isArray((catRes?.data as any)?.categories) ? (catRes.data as any).categories : [];
        console.log("✅ Loaded categories:", categoriesData.length, categoriesData);
        setCategories(categoriesData);
        
       
        // Handle brands - check multiple possible structures
        const brandsData = Array.isArray(brandRes?.data?.products) ? brandRes.data.products :
                          Array.isArray((brandRes?.data as any)?.brands) ? (brandRes.data as any).brands :
                          Array.isArray(brandRes?.data) ? brandRes.data : [];
        
        console.log("✅ Loaded brands:", brandsData.length, brandsData);
        setBrands(brandsData);
      } catch (e) {
        console.error("Failed initial filter fetch", e);
      }
    })();
  }, []);

  // Load models when brand changes
  useEffect(() => {
    if (!selectedBrandId) {
      setModels([]);
      setSelectedModelId(null); setSelectedModelName(null);
      setVariants([]); setSelectedVariantId(null); setSelectedVariantName(null);
      return;
    }
    (async () => {
      try {
        const res = await getModelsByBrand(selectedBrandId);
        console.log("📦 Models response for brand", selectedBrandId, ":", res);
        
        // Handle multiple possible response structures
        const modelsData = Array.isArray(res?.data?.products) ? res.data.products :
                          Array.isArray((res?.data as any)?.models) ? (res.data as any).models :
                          Array.isArray(res?.data) ? res.data : [];
        
        console.log("✅ Loaded models:", modelsData.length, modelsData);
        setModels(modelsData);
      } catch (e) {
        console.error("Failed to fetch models", e);
        setModels([]);
      }
    })();
  }, [selectedBrandId]);

// get subcategories by category id
useEffect(() => {
  if (!selectedCategoryId) {
    setSubCategories([]);
    return;
  }
  (async () => {
    try {
      const res = await getSubcategoriesByCategoryId(selectedCategoryId);
      const subCategoriesData = Array.isArray(res?.data) ? res.data :
                                 Array.isArray((res?.data as any)?.subcategories) ? (res.data as any).subcategories : [];
      console.log("✅ Loaded subcategories:", subCategoriesData.length, subCategoriesData);
      setSubCategories(subCategoriesData);
    } catch (e) {
      console.error("Failed to fetch subcategories by category id", e);
      setSubCategories([]);
    }
  })();
}, [selectedCategoryId]);

  // Load variants when model changes
  useEffect(() => {
    if (!selectedModelId) {
      setVariants([]);
      setSelectedVariantId(null); setSelectedVariantName(null);
      return;
    }
    (async () => {
      try {
        const res = await getVariantsByModel(selectedModelId);
        console.log("📦 Variants response for model", selectedModelId, ":", res);
        
        // Handle multiple possible response structures
        const variantsData = Array.isArray(res?.data?.products) ? res.data.products :
                            Array.isArray((res?.data as any)?.variants) ? (res.data as any).variants :
                            Array.isArray(res?.data) ? res.data : [];
        
        console.log("✅ Loaded variants:", variantsData.length, variantsData);
        setVariants(variantsData);
      } catch (e) {
        console.error("Failed to fetch variants", e);
        setVariants([]);
      }
    })();
  }, [selectedModelId]);

  // Filter subcategories based on selected category
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryId || !subCategories.length) {
      return subCategories;
    }
    
    // Filter subcategories that belong to the selected category
    return subCategories.filter((sub: any) => {
      // Check if subcategory has a category reference that matches selected category
      const subCategoryId = sub?.category_ref?._id || sub?.category_id || sub?.category?._id;
      return subCategoryId === selectedCategoryId;
    });
  }, [subCategories, selectedCategoryId]);
   const handleCloseModal = () => {
    setIsModalOpen(false);
   setUploadBulkLoading(false);
   setEditBulkLoading(false);
   setUploadDealerBulkLoading(false);
  };
  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 300);
  const handleSearchChange = (value: string) => {
    try {
      console.log("🔍 ProductManagement: handleSearchChange called with value:", value);
      
      // Sanitize input value
      const sanitizedValue = value || "";
      setSearchInput(sanitizedValue);
      setIsSearching(sanitizedValue.trim() !== "");
      
      // Call debounced search
      debouncedSearch(sanitizedValue);
      
      console.log("🔍 ProductManagement: Search input set to:", sanitizedValue);
      console.log("🔍 ProductManagement: isSearching set to:", sanitizedValue.trim() !== "");
    } catch (error) {
      console.error("❌ Error in handleSearchChange:", error);
      setSearchInput("");
      setIsSearching(false);
    }
  };
  const handleDownload = async () => {
    try {
      await fetchAndDownloadCSV(exportCSV, 'products_export.csv');
    } catch (error) {
      alert('Failed to export data. Please try again.');
    }
  };
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
  };
  // refreshKey triggers when any filter changes we care about




  // Debug: Monitor searchQuery changes
  useEffect(() => {
    console.log("ProductManagement: searchQuery changed to:", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    console.log("🔄 selectedCategoryId state changed to:", selectedCategoryId);
  }, [selectedCategoryId]);

  // Debug: Monitor category and subcategory filter changes
  useEffect(() => {

    
    // Trigger refresh when filters change
    setRefreshKey(prev => prev + 1);
  }, [selectedCategoryId, selectedSubCategoryId, filteredSubCategories, selectedBrandId, selectedModelId, selectedVariantId]);

  const handleUploadBulk = () => {
    setBulkMode("upload");
    setUploadBulkLoading(true);
    setIsModalOpen(true);
    setTimeout(() => setUploadBulkLoading(false), 1000); 
  };
    const handleAddProduct = () => {
    setAddProductLoading(true);
    route.push(`/user/dashboard/product/Addproduct`);
    setTimeout(() => setAddProductLoading(false), 1000); // Simulate loading
  };
    const handleBulkEdit = () => {
    setBulkMode("edit");
    setIsModalOpen(true);
    setEditBulkLoading(true);
  };
    const handleBulkUploadDealer = () => {
    setBulkMode("uploadDealer");
    setIsModalOpen(true);
    setUploadDealerBulkLoading(true);
  };
  const handleBulkApprove = async () => {
    if (!selectedProductIds.length || bulkApproveLoading) return;
    try {
      setBulkApproveLoading(true);
      await approveBulkProducts({ productIds: selectedProductIds });
      showToast("Products approved successfully", "success");
      clearSelection();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to approve products:", error);
      showToast("Failed to approve products", "error");
    } finally {
      setBulkApproveLoading(false);
    }
  };


  const tabConfigs: TabConfig[] = useMemo(() => {
    return [
      {
        id: "Approved",
        label: "Approved",
        component: ApprovedProduct,
      },
      {
        id: "Pending",
        label: "Pending",
        component: PendingProduct,
      },
      {
        id: "Rejected",
        label: "Rejected",
        component: RejectedProduct,
      },
    ];
  }, []);
  // Get current tab configuration
  const currentTabConfig = useMemo(
    () => tabConfigs.find((tab) => tab.id === activeTab) || tabConfigs[0],
    [tabConfigs, activeTab]
  );
  const renderTabContent = useCallback(() => {
    const TabComponent = currentTabConfig.component;
    if (!TabComponent) return null;
    

    
    // Validate that we're passing IDs, not names
    if (selectedCategoryId && !/^[0-9a-fA-F]{24}$/.test(selectedCategoryId)) {
      console.warn("⚠️ Category filter is not a valid ID:", selectedCategoryId);
    }
    if (selectedSubCategoryId && !/^[0-9a-fA-F]{24}$/.test(selectedSubCategoryId)) {
      console.warn("⚠️ Subcategory filter is not a valid ID:", selectedSubCategoryId);
    }
    


    return (
      <TabComponent
        searchQuery={searchQuery}
        selectedTab={selectedTab}
        categoryFilter={selectedCategoryId || undefined}
        subCategoryFilter={selectedSubCategoryId || undefined}
        brandFilter={selectedBrandId || undefined}
        modelFilter={selectedModelId || undefined}
        variantFilter={selectedVariantId || undefined}
        refreshKey={refreshKey}
      />
    );
  }, [currentTabConfig, searchQuery, selectedTab, selectedCategoryId, selectedSubCategoryId, activeTab, refreshKey]);

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Card className="shadow-sm rounded-none min-w-0">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          {/* Search Bar */}
          <div className="w-full">
            <SearchInput
              value={searchInput}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              isLoading={isSearching}
              placeholder="Search Spare parts..."
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 w-full">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <DynamicButton
                    variant="outline"
                    customClassName={`bg-transparent border-gray-300 hover:bg-gray-50 min-w-[120px] flex-shrink-0 h-10 ${
                      selectedCategoryName || selectedSubCategoryName 
                        ? "border-blue-300 bg-blue-50 text-blue-700" 
                        : ""
                    }`}
                    text={
                      selectedCategoryName || selectedSubCategoryName
                        ? `Filters: ${[selectedCategoryName, selectedSubCategoryName].filter(Boolean).join(" / ")}`
                        : "Filters"
                    }
                  />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-4">
                    {/* Clear All Filters Button */}
                    {(selectedCategoryName || selectedSubCategoryName) && (
                      <div className="flex justify-end mb-4">
                        <button
                          className="text-xs text-[#C72920] underline hover:text-[#A01E1A]"
                          onClick={() => {
                            setSelectedCategoryId(null);
                            setSelectedCategoryName(null);
                            setSelectedSubCategoryId(null);
                            setSelectedSubCategoryName(null);
                          }}
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}
                    <Accordion type="multiple" defaultValue={[]}>  {/* collapsed by default */}
                      <AccordionItem value="category">
                        <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
                        <AccordionContent>
                          {selectedCategoryName && (
                            <div className="flex justify-end mb-2">
                              <button
                                className="text-xs text-[#C72920] underline"
                                onClick={() => { 
                                  setSelectedCategoryId(null); 
                                  setSelectedCategoryName(null); 
                                  setSelectedSubCategoryId(null);
                                  setSelectedSubCategoryName(null); 
                                }}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                          <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                            {categories && categories.length > 0 ? (
                              categories.map((cat: any) => (
                                <li key={cat?._id || cat?.id}>
                                  <button
                                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedCategoryName === (cat?.category_name || cat?.name) ? "bg-gray-100" : ""}`}
                                    onClick={() => { 
                                      const rawCategoryId = cat?._id ?? cat?.id ?? cat?.category_id;
                                      const normalizedCategoryId = typeof rawCategoryId === "string"
                                        ? rawCategoryId.trim()
                                        : rawCategoryId !== undefined && rawCategoryId !== null
                                          ? String(rawCategoryId)
                                          : "";
                                      const categoryName = cat?.category_name || cat?.name;
                         

                                      if (!normalizedCategoryId) {
                                        console.error("❌ Missing category identifier in:", cat);
                                        return;
                                      }

                                      if (!/^[0-9a-fA-F]{24}$/.test(normalizedCategoryId)) {
                                        console.warn("⚠️ Category ID is not a 24-char hex string. Proceeding with value:", normalizedCategoryId);
                                      }

                                      setSelectedCategoryId(normalizedCategoryId);
                             
                                      setSelectedCategoryName(categoryName || null); 
                                      setSelectedSubCategoryId(null);
                                      setSelectedSubCategoryName(null); 
                                    }}
                                  >
                                    {cat?.category_name || cat?.name}
                                  </button>
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-gray-500 px-2">No categories found</li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="subcategory">
                        <AccordionTrigger className="text-sm font-medium">Subcategory</AccordionTrigger>
                        <AccordionContent>
                          {selectedSubCategoryName && (
                            <div className="flex justify-end mb-2">
                              <button
                                className="text-xs text-[#C72920] underline"
                                onClick={() => {
                                  setSelectedSubCategoryId(null);
                                  setSelectedSubCategoryName(null);
                                }}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                          <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                            {filteredSubCategories && filteredSubCategories.length > 0 ? (
                              filteredSubCategories.map((sub: any) => (
                                <li key={sub?._id || sub?.id}>
                                  <button
                                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedSubCategoryName === (sub?.subcategory_name || sub?.name) ? "bg-gray-100" : ""}`}
                                    onClick={() => { 
                                      const rawSubcategoryId = sub?._id ?? sub?.id ?? sub?.subcategory_id;
                                      const normalizedSubcategoryId = typeof rawSubcategoryId === "string"
                                        ? rawSubcategoryId.trim()
                                        : rawSubcategoryId !== undefined && rawSubcategoryId !== null
                                          ? String(rawSubcategoryId)
                                          : "";
                                      const subcategoryId = normalizedSubcategoryId;

                                      const subcategoryName = sub?.subcategory_name || sub?.name;
                           
                                      
                                      // Validate that we have a valid ID
                                      if (!subcategoryId || !/^[0-9a-fA-F]{24}$/.test(subcategoryId)) {
                                     
                                        return;
                                      }
                                      
                                      setSelectedSubCategoryId(subcategoryId);
                                    
                                      setSelectedSubCategoryName(subcategoryName || null);
                                    }}
                                  >
                                    {sub?.subcategory_name || sub?.name}
                                  </button>
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-gray-500 px-2">
                                {selectedCategoryId 
                                  ? "No subcategories found for selected category" 
                                  : "No subcategories found"
                                }
                              </li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="brand">
                        <AccordionTrigger className="text-sm font-medium">Brand</AccordionTrigger>
                        <AccordionContent>
                          {selectedBrandName && (
                            <div className="flex justify-end mb-2">
                              <button
                                className="text-xs text-[#C72920] underline"
                                onClick={() => {
                                  setSelectedBrandId(null); setSelectedBrandName(null);
                                  setSelectedModelId(null); setSelectedModelName(null);
                                  setSelectedVariantId(null); setSelectedVariantName(null);
                                }}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                          <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                            {brands && brands.length > 0 ? brands.map((b: any) => (
                              <li key={b?._id || b?.id}>
                                <button
                                  className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedBrandName === (b?.brand_name || b?.name) ? 'bg-gray-100' : ''}`}
                                  onClick={() => {
                                    const id = (b?._id || b?.id || '').toString().trim();
                                    const name = b?.brand_name || b?.name;
                                    if (!id) return;
                                    setSelectedBrandId(id); setSelectedBrandName(name || null);
                                    setSelectedModelId(null); setSelectedModelName(null);
                                    setSelectedVariantId(null); setSelectedVariantName(null);
                                  }}
                                >
                                  {b?.brand_name || b?.name}
                                </button>
                              </li>
                            )) : <li className="text-xs text-gray-500 px-2">No brands found</li>}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="model">
                        <AccordionTrigger className="text-sm font-medium">Model</AccordionTrigger>
                        <AccordionContent>
                          {selectedModelName && (
                            <div className="flex justify-end mb-2">
                              <button
                                className="text-xs text-[#C72920] underline"
                                onClick={() => {
                                  setSelectedModelId(null); setSelectedModelName(null);
                                  setSelectedVariantId(null); setSelectedVariantName(null);
                                }}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                          <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                            {models && models.length > 0 ? models.map((m: any) => (
                              <li key={m?._id || m?.id}>
                                <button
                                  className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedModelName === (m?.model_name || m?.name) ? 'bg-gray-100' : ''}`}
                                  onClick={() => {
                                    const id = (m?._id || m?.id || '').toString().trim();
                                    const name = m?.model_name || m?.name;
                                    if (!id) return;
                                    setSelectedModelId(id); setSelectedModelName(name || null);
                                    setSelectedVariantId(null); setSelectedVariantName(null);
                                  }}
                                >
                                  {m?.model_name || m?.name}
                                </button>
                              </li>
                            )) : <li className="text-xs text-gray-500 px-2">{selectedBrandId ? 'No models found for brand' : 'Select a brand first'}</li>}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="variant">
                        <AccordionTrigger className="text-sm font-medium">Variant</AccordionTrigger>
                        <AccordionContent>
                          {selectedVariantName && (
                            <div className="flex justify-end mb-2">
                              <button
                                className="text-xs text-[#C72920] underline"
                                onClick={() => { setSelectedVariantId(null); setSelectedVariantName(null); }}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                          <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                            {variants && variants.length > 0 ? variants.map((v: any) => (
                              <li key={v?._id || v?.id}>
                                <button
                                  className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedVariantName === (v?.variant_name || v?.name) ? 'bg-gray-100' : ''}`}
                                  onClick={() => {
                                    const id = (v?._id || v?.id || '').toString().trim();
                                    const name = v?.variant_name || v?.name;
                                    if (!id) return;
                                    setSelectedVariantId(id); setSelectedVariantName(name || null);
                                  }}
                                >
                                  {v?.variant_name || v?.name}
                                </button>
                              </li>
                            )) : <li className="text-xs text-gray-500 px-2">{selectedModelId ? 'No variants found for model' : 'Select a model first'}</li>}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                 
                    </Accordion>
                </PopoverContent>
              </Popover>
              <DynamicButton
                variant="outline"
                customClassName="border-[#C72920] text-[#C72920] bg-white hover:bg-[#c728203a] min-w-[100px] flex-shrink-0 h-10"
                text="Export"
                onClick={handleDownload}
              />
              {/* <DynamicButton
                variant="outline"
                customClassName="border-[#C72920] text-[#C72920] bg-white hover:bg-[#c728203a] min-w-[100px] flex-shrink-0 h-10"
                text="Logs"
                onClick={() => route.push('/user/dashboard/product/Logs')}
                icon={<FileBarChart className="w-4 h-4 mr-2" />}
              /> */}
            </div>
            
            {/* Bottom Row: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
              {(auth?.role === "Super-admin" ||
                auth?.role === "Inventory-Admin" ||
                auth?.role === "Inventory-Staff") && (
                <>
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-3 py-2 min-w-[100px] sm:min-w-[120px] justify-center font-[Poppins] flex-shrink-0"
                    onClick={handleUploadBulk}
                    disabled={uploadBulkLoading}
                    loading={uploadBulkLoading}
                    loadingText="Uploading..."
                    icon={
                      <Image src={uploadFile} alt="Add" className="h-4 w-4" />
                    }
                    text="Upload"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-3 py-2 min-w-[120px] sm:min-w-[140px] justify-center font-[Poppins] font-regular flex-shrink-0"
                    onClick={handleAddProduct}
                    disabled={addProductLoading}
                    loading={addProductLoading}
                    loadingText="Adding..."
                    icon={<Plus />}
                    text="Add Product"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="bg-gray-200 text-black hover:bg-gray-300 flex items-center gap-2 px-3 py-2 min-w-[100px] flex-shrink-0"
                    onClick={handleBulkEdit}
                    disabled={editBulkLoading}
                    loading={editBulkLoading}
                    loadingText="Editing..."
                    icon={<Pencil />}
                    text="Bulk Edit"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-3 py-2 min-w-[100px] sm:min-w-[120px] justify-center font-[Poppins] flex-shrink-0"
                    onClick={handleBulkUploadDealer}
                    disabled={uploadDealerBulkLoading}
                    loadingText="Opening..."
                    icon={<Pencil />}
                    text="Assign Dealer"
                  />
                  {selectedProductIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <DynamicButton
                        variant="default"
                        customClassName="flex items-center gap-3 bg-[#1F9254]/10 border border-[#1F9254] text-[#1F9254] hover:bg-[#1F9254]/20 rounded-[8px] px-3 py-2 min-w-[120px] sm:min-w-[140px] justify-center font-[Poppins] font-regular flex-shrink-0"
                        onClick={handleBulkApprove}
                        disabled={bulkApproveLoading}
                        loading={bulkApproveLoading}
                        loadingText="Approving..."
                        icon={<CheckCircle className="w-4 h-4" />}
                        text={`Approve (${selectedProductIds.length})`}
                      />
                      <DynamicButton
                        variant="default"
                        customClassName="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-3 py-2 min-w-[120px] sm:min-w-[140px] justify-center font-[Poppins] font-regular flex-shrink-0"
                        onClick={() => setIsRejectDialogOpen(true)}
                        icon={<AlertTriangle className="w-4 h-4" />}
                        text={`Reject (${selectedProductIds.length})`}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </CardHeader>

        <CardContent className="p-0 min-w-0 overflow-x-auto">
          {/* Tab Bar */}
          <div
            className="flex w-full items-center justify-between border-b border-gray-200 overflow-x-auto"
            aria-label="Product status tabs"
          >
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-0 flex-1" aria-label="Tabs">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm font-mono transition-colors whitespace-nowrap flex-shrink-0
                    ${
                      activeTab === tab.id
                        ? "text-[#C72920] border-b-2 border-[#C72920]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          {/* Tab Content */}
          <div className="min-h-[400px] font-sans">{renderTabContent()}</div>
        </CardContent>
      </Card>
      
      <UploadBulkCard
        isOpen={isModalOpen}
        onClose={handleCloseModal} 
        mode={bulkMode}
      />
      <RejectReason
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onSubmit={async (data) => {
          if (selectedProductIds.length > 0) {
            try {
              const payload = {
                reason: data.reason,
                rejectedBy: auth._id,
                productIds: selectedProductIds,
              };
              await rejectBulkProducts(payload);
              showToast("Products rejected successfully", "success");
              clearSelection();
              setRefreshKey((prev) => prev + 1);
            } catch (error) {
              console.error(error);
              showToast("Failed to reject products", "error");
            }
          }
          setIsRejectDialogOpen(false);
        }}
      />
    </div>
  );
}

export default function ProductManagement() {
  return (
    <ProductSelectionProvider>
      <ProductManagementContent />
    </ProductSelectionProvider>
  );
}