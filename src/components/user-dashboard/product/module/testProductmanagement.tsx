"use client";
import Image from "next/image";
import { useState, useMemo , useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useDebounce from "@/utils/useDebounce";
import { useAppSelector } from "@/store/hooks";
import DynamicButton from '@/components/common/button/button';
import SearchInput from '@/components/common/search/SearchInput';
import { Plus, Pencil } from 'lucide-react';
import uploadFile from "../../../../../public/assets/uploadFile.svg";
import CreatedProduct from "./tabs/CreatedProduct";




type TabType = "Created" | "Approved" | "Pending" | "Rejected" 
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
export default function TestProductmanagement() {
      const [activeTab, setActiveTab] = useState<TabType>("Created");
        const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

        const auth = useAppSelector((state) => state.auth.user);

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



         const tabConfigs: TabConfig[] = useMemo(
            () => [
              {
                id: "Created",
                label: "Created",
                component: CreatedProduct
                // component: ShowCreated,
                // buttonConfig: {
                //   text: "Add Created",
                //   action: handleCreatedAction,
                // },
              },
              {
                id: "Approved",
                label: "Approved",
                // component: ShowApproved,
                // buttonConfig: {
                //   text: "Add Approved",
                //   action: handleApprovedAction,
                // },
              },
                {                
                id: "Pending",
                label: "Pending",
                // component: ShowPending,
                // buttonConfig: {
                //   text: "Add Pending",
                //   action: handlePendingAction,
                // },
              
                },
                {
                id: "Rejected",
                label: "Rejected",
                // component: ShowRejected,
                // buttonConfig: {
                //   text: "Add Rejected",
                //   action: handleRejectedAction,
                // },
                }
            ],
            []
          );
            // Get current tab configuration
  const currentTabConfig = useMemo(
    () => tabConfigs.find((tab) => tab.id === activeTab) || tabConfigs[0],
    [tabConfigs, activeTab]
  );
            const renderTabContent = useCallback(() => {
    const TabComponent = currentTabConfig.component;
    if (TabComponent) {
      return <TabComponent searchQuery={searchQuery} />;
    }
    return null; // or you can return a message: <div>No component for this tab.</div>
  }, [currentTabConfig, searchQuery]);

  return (
<div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
                     {/* Top Row: Search/Filters/Requests (left), Upload/Add Product (right) */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            {/* Left: Search, Filters, Requests */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              {/* Search Bar */}

              <SearchInput
                       value={searchInput}
    onChange={handleSearchChange}
    onClear={handleClearSearch}
    isLoading={isSearching}
    placeholder="Search Spare parts..."
              />
              {/* Filter Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  customClassName="bg-transparent border-gray-300 hover:bg-gray-50 min-w-[100px]"
                  text="Filters"
                />
                <DynamicButton
                  variant="outline"
                  customClassName="border-[#C72920] text-[#C72920] bg-white hover:bg-[#c728203a] min-w-[100px]"
                  text="Requests"
                />
              </div>
            </div>
            {/* Right: Upload, Add Product */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-start grid-ro-2 sm:justify-end">
              {(auth?.role === "Super-admin" ||
                auth?.role === "Inventory-admin") && (
                <>
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center font-[Poppins]"
                    // onClick={handleUploadBulk}
                    // disabled={uploadBulkLoading}
                    // loading={uploadBulkLoading}
                    loadingText="Uploading..."
                    icon={
                      <Image src={uploadFile} alt="Add" className="h-4 w-4" />
                    }
                    text="Upload"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center font-[Poppins]  font-regular   "
                    // onClick={handleAddProduct}
                    // disabled={addProductLoading}
                    // loading={addProductLoading}
                    loadingText="Adding..."
                    icon={<Plus />}
                    text="Add Product"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="bg-gray-200 text-black hover:bg-gray-300 flex items-center gap-2"
                    // onClick={handleBulkEdit}
                    // disabled={editBulkLoading}
                    // loading={editBulkLoading}
                    // loadingText="Editing..."
                    icon={<Pencil />}
                    text="Bulk Edit"
                  />
                  <DynamicButton
                  variant="default"
                   customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center font-[Poppins]"
                    // onClick={handleBulkUploadDealer}
                    loadingText="Opening..."
                    icon={<Pencil />}
                    text="Assign Dealer"

                  />
                </>
              )}
            </div>
          </div>
                    
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
       
         
        
          </div>
            </CardHeader>
             <CardContent className="p-0">
                     {/* Tab Bar */}
            <div
              className="flex border-b border-gray-200 overflow-x-auto"
              aria-label="Product status tabs"
            >
               <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
            </div>
  )
}
