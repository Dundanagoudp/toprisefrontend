"use client";
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchContentSuccess, fetchContentRequest, fetchContentFailure } from "@/store/slice/content/contentSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ShowCategory from "./TabComponent/showCategory";
import SubCategory from "./TabComponent/subCategory";
import ShowModel from "./TabComponent/showModel";
import DynamicButton from "@/components/common/button/button";

// Tab types
type TabType = 'Category' | 'Subcategory' | 'Model';

// Tab configuration interface for scalability
interface TabConfig {
  id: TabType;
  label: string;
  component: React.ComponentType;
  buttonConfig: {
    text: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
  };
}


export default function ShowContent() {
  const [activeTab, setActiveTab] = useState<TabType>('Category');
  const { showToast } = useGlobalToast();

  // Tab-specific action handlers
  const handleCategoryAction = useCallback(() => {
    console.log("Category action triggered");
    showToast("Category added", "success");
    // Add your category-specific logic here
    // e.g., open modal, navigate to form, etc.
  }, [showToast]);

  const handleSubcategoryAction = useCallback(() => {
    console.log("Subcategory action triggered");
    showToast("Subcategory added", "success");
    // Add your subcategory-specific logic here
  }, [showToast]);

    // Add your subcategory-specific logic here

  const handleModelAction = useCallback(() => {
    console.log("Model action triggered");
    showToast("Model added", "success");
    
  }, [showToast]);

  // Scalable tab configuration - easy to extend
  const tabConfigs: TabConfig[] = useMemo(() => [
    {
      id: 'Category',
      label: 'Category',
      component: ShowCategory,
      buttonConfig: {
        text: 'Add Category',
        action: handleCategoryAction,
      }
    },
    {
      id: 'Subcategory', 
      label: 'Subcategory',
      component: SubCategory,
      buttonConfig: {
        text: 'Add Subcategory',
        action: handleSubcategoryAction,
      }
    },
    {
      id: 'Model',
      label: 'Model', 
      component: ShowModel,
      buttonConfig: {
        text: 'Add Model',
        action: handleModelAction,
      }
    }
  ], [handleCategoryAction, handleSubcategoryAction, handleModelAction]);

  // Get current tab configuration
  const currentTabConfig = useMemo(() => 
    tabConfigs.find(tab => tab.id === activeTab) || tabConfigs[0], 
    [tabConfigs, activeTab]
  );

  // Render tab content dynamically
  const renderTabContent = useCallback(() => {
    const TabComponent = currentTabConfig.component;
    return <TabComponent />;
  }, [currentTabConfig]);

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center"> 
            <CardTitle>Content Management</CardTitle>
            {/* Dynamic button that changes based on active tab */}
            <DynamicButton
              text={currentTabConfig.buttonConfig.text}
              onClick={currentTabConfig.buttonConfig.action}
              className="bg-[#C72920] text-white hover:bg-[#C72920]/90"
              disabled={currentTabConfig.buttonConfig.disabled}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm font-mono transition-colors
                    ${
                      activeTab === tab.id
                        ? 'text-[#C72920] border-b-2 border-[#C72920]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
