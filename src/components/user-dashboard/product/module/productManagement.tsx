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
import { approveBulkProducts, aproveProduct, deactivateBulkProducts, deactivateProduct, exportCSV, rejectProduct, getCategories, getSubCategories } from "@/service/product-Service";
import { updateProductLiveStatus } from "@/store/slice/product/productLiveStatusSlice";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { useAppDispatch } from "@/store/hooks";
import RejectReason from "./tabs/Super-Admin/dialogue/RejectReason";
import { fetchAndDownloadCSV } from "@/components/common/ExportCsv";

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

export default function ProductManagement() {
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
  const [uploadDealerBulkLoading, setUploadDealerBulkLoading] = useState(false);
  const route = useRouter();
  const dispatch = useAppDispatch();
const selectedProducts = useAppSelector(
  (state) => state.productIdForBulkAction.products || []
);
const allowedRoles = ["Super-admin", "Inventory-Admin", "Inventory-Staff", "Fulfillment-Admin"];
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState<string | null>(null);
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
      
      console.log("🔍 ProductManagement: searchQuery updated to:", sanitizedQuery);
      console.log("🔍 ProductManagement: Search will trigger re-render in tab components");
    } catch (error) {
      console.error("❌ Error in performSearch:", error);
      setSearchQuery("");
      setIsSearching(false);
    }
  }, []);
  useEffect(() => {
    const loadSubCategories = async () => {
      try {
        const res = await getSubCategories();
        const data = res?.data || [];
        setSubCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      }
    };
    loadSubCategories();
  }, []);
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
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories();
        const data = res?.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);




  // Debug: Monitor searchQuery changes
  useEffect(() => {
    console.log("ProductManagement: searchQuery changed to:", searchQuery);
  }, [searchQuery]);

  // Debug: Monitor category and subcategory filter changes
  useEffect(() => {
    console.log("ProductManagement: Category ID filter changed to:", selectedCategoryId);
    console.log("ProductManagement: Category Name filter changed to:", selectedCategoryName);
    console.log("ProductManagement: Subcategory ID filter changed to:", selectedSubCategoryId);
    console.log("ProductManagement: Subcategory Name filter changed to:", selectedSubCategoryName);
    console.log("ProductManagement: Categories data:", categories);
    console.log("ProductManagement: Subcategories data:", subCategories);
    
    // Trigger refresh when filters change
    setRefreshKey(prev => prev + 1);
  }, [selectedCategoryId, selectedSubCategoryId]);

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

  // Bulk operation handlers for Select component
  const handleBulkApprove = async () => {
    const productIds = Object.values(selectedProducts);
    if (productIds.length === 0) return;
    try {
      const updatedProducts: any[] = [];
      const requestBody = { productIds };
      await approveBulkProducts(requestBody);
      await Promise.all(
        productIds.map(async (id) => {
          
          updatedProducts.push(id);
        })
      );
      // Update Redux for all approved products
      updatedProducts.forEach((id) => {
        dispatch(updateProductLiveStatus({ id, liveStatus: "Approved" }));
      });
      showToast("Approved successfully", "success");
      
      // Trigger refresh in child components
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Bulk approve failed:", error);
      showToast("Approved failed", "error");
    }
  };
const handleBulkReject = useCallback(() => {
  if (!selectedProducts || selectedProducts.length === 0) {
    showToast("Please select products to reject", "error");
    return;
  }
  setIsRejectDialogOpen(true);
}, [selectedProducts, showToast]);
// Bulk Deactivate handler
  const handleBulkDeactivate = async () => {
       const productIds = Object.values(selectedProducts);
       if (productIds.length === 0) return;
    try {
            const updatedProducts: any[] = [];
             const requestBody = { productIds };
      await deactivateBulkProducts(requestBody);
       showToast("Deactivated successfully", "success");
      await Promise.all(
        productIds.map(async (id) => {
             updatedProducts.push(id);
           })
         );
         // Update Redux for all deactivated products
         updatedProducts.forEach((id) => {
           dispatch(updateProductLiveStatus({ id, liveStatus: "Pending" }));
         });
         
      // Trigger refresh in child components
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Bulk deactivate failed:", error);
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
    
    console.log("🔍 ProductManagement: renderTabContent called");
    console.log("🔍 Current searchQuery:", searchQuery);
    console.log("🔍 Current activeTab:", activeTab);
    console.log("🔍 Passing props to", currentTabConfig.id, "component:", {
      searchQuery,
      selectedTab,
      categoryFilter: selectedCategoryId || undefined,
      subCategoryFilter: selectedSubCategoryId || undefined
    });
    
    return (
      <TabComponent
        searchQuery={searchQuery}
        selectedTab={selectedTab}
        categoryFilter={selectedCategoryId || undefined}
        subCategoryFilter={selectedSubCategoryId || undefined}
        refreshKey={refreshKey}
      />
    );
  }, [currentTabConfig, searchQuery, selectedTab, selectedCategoryId, selectedSubCategoryId, activeTab, refreshKey]);

  return (
    <div className="w-full ">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          {/* Top Row: Search/Filters/Requests (left), Upload/Add Product (right) */}
          <div className="flex flex-col space-y-4 w-full">
            {/* Search Bar - Full Width */}
            <div className="w-full">
              <SearchInput
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
                placeholder="Search Spare parts..."
              />
              {/* Temporary debug button - remove after testing */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log("=== FILTER DEBUG INFO ===");
                  console.log("Current searchInput:", searchInput);
                  console.log("Current searchQuery:", searchQuery);
                  console.log("Current isSearching:", isSearching);
                  console.log("Current activeTab:", activeTab);
                  console.log("Selected Category ID:", selectedCategoryId);
                  console.log("Selected Category Name:", selectedCategoryName);
                  console.log("Selected Subcategory ID:", selectedSubCategoryId);
                  console.log("Selected Subcategory Name:", selectedSubCategoryName);
                  console.log("Categories data:", categories);
                  console.log("Subcategories data:", subCategories);
                  console.log("========================");
                }}
                className="mt-2"
              >
                Debug Filters
              </Button>
            </div>
            
            {/* Middle Row: Filters and Action Buttons */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
              {/* Left: Filter Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <DynamicButton
                      variant="outline"
                      customClassName="bg-transparent border-gray-300 hover:bg-gray-50 min-w-[120px] flex-shrink-0"
                      text={
                        selectedCategoryName || selectedSubCategoryName
                          ? `Filter: ${[selectedCategoryName, selectedSubCategoryName].filter(Boolean).join(" / ")}`
                          : "Filters"
                      }
                    />
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-80 p-4">
                    <Accordion type="multiple" defaultValue={["category", "subcategory"]}>
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
                                      const categoryId = cat?._id || cat?.id;
                                      const categoryName = cat?.category_name || cat?.name;
                                      console.log("Category selected - ID:", categoryId, "Name:", categoryName);
                                      console.log("Full category object:", cat);
                                      setSelectedCategoryId(categoryId || null);
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
                            {subCategories && subCategories.length > 0 ? (
                              subCategories.map((sub: any) => (
                                <li key={sub?._id || sub?.id}>
                                  <button
                                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedSubCategoryName === (sub?.subcategory_name || sub?.name) ? "bg-gray-100" : ""}`}
                                    onClick={() => { 
                                      const subcategoryId = sub?._id || sub?.id;
                                      const subcategoryName = sub?.subcategory_name || sub?.name;
                                      console.log("Subcategory selected - ID:", subcategoryId, "Name:", subcategoryName);
                                      console.log("Full subcategory object:", sub);
                                      setSelectedSubCategoryId(subcategoryId || null);
                                      setSelectedSubCategoryName(subcategoryName || null);
                                    }}
                                  >
                                    {sub?.subcategory_name || sub?.name}
                                  </button>
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-gray-500 px-2">No subcategories found</li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </PopoverContent>
                </Popover>
                <DynamicButton
                  variant="outline"
                  customClassName="border-[#C72920] text-[#C72920] bg-white hover:bg-[#c728203a] min-w-[100px] flex-shrink-0"
                  text="Export"
                  onClick={handleDownload}
                />
                <DynamicButton
                  variant="outline"
                  customClassName="border-[#C72920] text-[#C72920] bg-white hover:bg-[#c728203a] min-w-[100px] flex-shrink-0"
                  text="Logs"
                  onClick={() => route.push('/user/dashboard/product/Logs')}
                  icon={<FileBarChart className="w-4 h-4 mr-2" />}
                />
              </div>
            </div>
            
            {/* Bottom Row: Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
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
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full"></div>
        </CardHeader>


        <CardContent className="p-0">
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
            {selectedProducts.length > 0 && (
              <div className="px-4 sm:px-6 flex items-center flex-shrink-0">
                <DropdownMenu >
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[120px] sm:min-w-[140px] text-xs sm:text-sm"
                      disabled={!allowedRoles.includes(auth.role)}
                    >Bulk Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer" onClick={handleBulkApprove}>
                      Approve Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleBulkDeactivate}>
                      Deactivate Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleBulkReject}>
                      Reject Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
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
              onSubmit={(data) => {
                setIsRejectDialogOpen(false);
                // Trigger refresh after bulk rejection
                setRefreshKey(prev => prev + 1);
              }}
            />
            
    </div>
  );
}