"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import ShowCategory from "./TabComponent/showCategory";
import SubCategory from "./TabComponent/showSubCategory";
import ShowModel from "./TabComponent/showModel";
import DynamicButton from "@/components/common/button/button";
import CreateCategory from "./TabComponent/handelTabForm/CreateCategory";
import CreateSubCategory from "./TabComponent/handelTabForm/CreateSubCatefory";
import CreateModelForm from "./TabComponent/handelTabForm/createModelForm";
import ShowBrand from "./TabComponent/showBrand";
import CreateBrand from "./TabComponent/handelTabForm/CreateBrand";
import ShowVariant from "./TabComponent/showVarient";
import CreateVarient from "./TabComponent/handelTabForm/createVarient";
import ShowBanner from "./TabComponent/showBanner";
import CreateBanner from "./TabComponent/handelTabForm/CreateBanner";
import SearchInput from "@/components/common/search/SearchInput";
import useDebounce from "@/utils/useDebounce";
import ContentMangementBulk from "./uploadbulkpopup/contentMangementBulk";
import Image from "next/image";
import { getContentStats } from "@/service/product-Service";
import { Skeleton } from "@/components/ui/skeleton";

// Tab types
type TabType = "Model" | "Brand" | "Variant" | "Category" | "Subcategory" | "Banner";

// Tab configuration interface for scalability
interface TabConfig {
  id: TabType;
  label: string;
  component: React.ComponentType<any>;
  buttonConfig: {
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

export default function ShowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab from URL or default to "Category"
  const getInitialTab = (): TabType => {
    const tabFromUrl = searchParams.get('tab') as TabType;
    const validTabs: TabType[] = ["Model", "Brand", "Variant", "Category", "Subcategory", "Banner"];
    return validTabs.includes(tabFromUrl) ? tabFromUrl : "Category";
  };
  
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  
  // Handle tab change and update URL
  const handleTabChange = useCallback((newTab: TabType) => {
    setActiveTab(newTab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);
  
  const [openCategory, setOpenCategory] = useState(false);
  const [openSubCategory, setOpenSubCategory] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openVariant, setOpenVariant] = useState(false);
  const [openBanner, setOpenBanner] = useState(false);
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [uploadBulkLoading, setUploadBulkLoading] = useState(false);
  const { showToast } = useGlobalToast();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Content stats state
  const [contentStats, setContentStats] = useState<{
    categories: number;
    subcategories: number;
    brands: number;
    models: number;
    variants: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync tab state with URL changes (browser back/forward)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabType;
    const validTabs: TabType[] = ["Model", "Brand", "Variant", "Category", "Subcategory", "Banner"];
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  // Fetch content stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const stats = await getContentStats();
        setContentStats(stats);
      } catch (error) {
        console.error("Failed to fetch content stats:", error);
        showToast("Failed to load content statistics", "error");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  // Tab-specific action handlers
  const handleCategoryAction = useCallback(() => {
    setOpenCategory(true);
  }, []);

  const handleSubcategoryAction = useCallback(() => {
    setOpenSubCategory(true);
  }, []);
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);
    const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

    const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
  };
    const searchPlaceholders: Record<TabType, string> = {
    Model: "Search Models...",
    Brand: "Search Brands...",
    Variant: "Search Variants...",
    Category: "Search Categories...",
    Subcategory: "Search Subcategories...",
    Banner: "Search Banners...",
  };

  // Add your subcategory-specific logic here

  const handleModelAction = useCallback(() => {
    setOpenModel(true);
  }, []);
  const handleBrandAction = useCallback(() => {
    setOpenBrand(true);
  }, []);
  const handleVariantAction = useCallback(() => {
    setOpenVariant(true);
  }, []);
  
  const handleBannerAction = useCallback(() => {
    setOpenBanner(true);
  }, []);

  const handleUploadBulk = useCallback(() => {
    setOpenBulkUpload(true);
  }, []);

  // Function to refresh content stats
  const refreshContentStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const stats = await getContentStats();
      setContentStats(stats);
    } catch (error) {
      console.error("Failed to refresh content stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Success callbacks for each tab to refresh data
  const handleCategorySuccess = useCallback(() => {
    // Trigger refresh for category tab
    if (activeTab === "Category") {
      setRefreshKey(prev => prev + 1);
    }
    // Refresh content stats
    refreshContentStats();
  }, [activeTab, refreshContentStats]);

  const handleSubcategorySuccess = useCallback(() => {
    // Trigger refresh for subcategory tab
    if (activeTab === "Subcategory") {
      setRefreshKey(prev => prev + 1);
    }
    // Refresh content stats
    refreshContentStats();
  }, [activeTab, refreshContentStats]);

  const handleModelSuccess = useCallback(() => {
    // Trigger refresh for model tab
    if (activeTab === "Model") {
      setRefreshKey(prev => prev + 1);
    }
    // Refresh content stats
    refreshContentStats();
  }, [activeTab, refreshContentStats]);

  const handleBrandSuccess = useCallback(() => {
    // Trigger refresh for brand tab
    if (activeTab === "Brand") {
      setRefreshKey(prev => prev + 1);
    }
    // Refresh content stats
    refreshContentStats();
  }, [activeTab, refreshContentStats]);

  const handleVariantSuccess = useCallback(() => {
    // Trigger refresh for variant tab
    if (activeTab === "Variant") {
      setRefreshKey(prev => prev + 1);
    }
    // Refresh content stats
    refreshContentStats();
  }, [activeTab, refreshContentStats]);

  const handleBannerSuccess = useCallback(() => {
    // Trigger refresh for banner tab
    if (activeTab === "Banner") {
      setRefreshKey(prev => prev + 1);
    }
    // Refresh content stats
    refreshContentStats();
  }, [activeTab, refreshContentStats]);

  // Get content type for bulk upload based on active tab
  const getContentTypeForBulkUpload = useCallback((tabType: TabType) => {
    switch (tabType) {
      case 'Category':
        return 'Category';
      case 'Subcategory':
        return 'Subcategory';
      case 'Brand':
        return 'Brand';
      case 'Model':
        return 'Model';
      case 'Variant':
        return 'Variant';
      default:
        return 'Product';
    }
  }, []);

  // Scalable tab configuration - easy to extend
  const tabConfigs: TabConfig[] = useMemo(
    () => [
      {
        id: "Model",
        label: "Model",
        component: ShowModel,
        buttonConfig: {
          text: "Add Model",
          action: handleModelAction,
        },
      },
      {
        id: "Brand",
        label: "Brand",
        component: ShowBrand,
        buttonConfig: {
          text: "Add Brand",
          action: handleBrandAction,
        },
      },
      {
        id: "Variant",
        label: "Variant",
        component: ShowVariant,
        buttonConfig: {
          text: "Add Variant",
          action: handleVariantAction,
        },
      },
      {
        id: "Category",
        label: "Category",
        component: ShowCategory,
        buttonConfig: {
          text: "Add Category",
          action: handleCategoryAction,
        },
      },
      {
        id: "Subcategory",
        label: "Subcategory",
        component: SubCategory,
        buttonConfig: {
          text: "Add Subcategory",
          action: handleSubcategoryAction,
        },
      },
      {
        id: "Banner",
        label: "Banner",
        component: ShowBanner,
        buttonConfig: {
          text: "Add Banner",
          action: handleBannerAction,
        },
      },
    ],
    [
      handleCategoryAction,
      handleSubcategoryAction,
      handleModelAction,
      handleBrandAction,
      handleBannerAction,
    ]
  );

  // Get current tab configuration
  const currentTabConfig = useMemo(
    () => tabConfigs.find((tab) => tab.id === activeTab) || tabConfigs[0],
    [tabConfigs, activeTab]
  );

  // Render tab content dynamically
  const renderTabContent = useCallback(() => {
    const TabComponent = currentTabConfig.component;
    return <TabComponent key={refreshKey} searchQuery={searchQuery} />;
  }, [currentTabConfig, searchQuery, refreshKey]);

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col ">
            <CardTitle className="mb-4">Content Management</CardTitle>
            <SearchInput 
               value={searchInput}
    onChange={handleSearchChange}
    onClear={handleClearSearch}
    isLoading={isSearching}
    placeholder={searchPlaceholders[activeTab]}

            />
            </div>
            <div className="flex gap-3">
              {/* Dynamic button that changes based on active tab */}
              <DynamicButton
                text={currentTabConfig.buttonConfig.text}
                onClick={currentTabConfig.buttonConfig.action}
                className="bg-[#C72920] text-white hover:bg-[#C72920]/90"
                disabled={currentTabConfig.buttonConfig.disabled}
              />
                             {/* Bulk Upload Button */}
               <DynamicButton
                 variant="default"
                 customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center font-[Poppins]"
                 onClick={handleUploadBulk}
                 disabled={uploadBulkLoading}
                 loading={uploadBulkLoading}
                 loadingText={`Uploading ${activeTab}...`}
                 icon={
                   <Image src="/assets/uploadFile.svg" alt="Upload" width={16} height={16} className="h-4 w-4" />
                 }
                 text={`Upload ${activeTab}`}
               />
            </div>
          </div>
        </CardHeader>
        
        {/* Content Stats Cards */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statsLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))
            ) : (
              // Stat cards
              [
                { label: "Categories", count: contentStats?.categories || 0, color: "bg-blue-50 text-blue-600" },
                { label: "Subcategories", count: contentStats?.subcategories || 0, color: "bg-green-50 text-green-600" },
                { label: "Brands", count: contentStats?.brands || 0, color: "bg-purple-50 text-purple-600" },
                { label: "Models", count: contentStats?.models || 0, color: "bg-orange-50 text-orange-600" },
                { label: "Variants", count: contentStats?.variants || 0, color: "bg-red-50 text-red-600" },
              ].map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.count.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm font-mono transition-colors
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
          <div className="min-h-[400px]">{renderTabContent()}</div>
        </CardContent>
      </Card>
      <CreateCategory
        open={openCategory}
        onClose={() => setOpenCategory(false)}
        onSuccess={handleCategorySuccess}
      />
      <CreateSubCategory
        open={openSubCategory}
        onClose={() => setOpenSubCategory(false)}
        onSuccess={handleSubcategorySuccess}
      />
      <CreateModelForm 
        open={openModel} 
        onClose={() => setOpenModel(false)} 
        onSuccess={handleModelSuccess}
      />
      <CreateBrand 
        open={openBrand} 
        onClose={() => setOpenBrand(false)} 
        onSuccess={handleBrandSuccess}
      />
      <CreateVarient 
        open={openVariant} 
        onClose={() => setOpenVariant(false)} 
        onSuccess={handleVariantSuccess}
      />
      <CreateBanner 
        open={openBanner} 
        onClose={() => setOpenBanner(false)} 
        onSuccess={handleBannerSuccess}
      />
      <ContentMangementBulk
        isOpen={openBulkUpload}
        onClose={() => setOpenBulkUpload(false)}
        mode="upload"
        contentType={getContentTypeForBulkUpload(activeTab)}
      />
    </div>
  );
}
