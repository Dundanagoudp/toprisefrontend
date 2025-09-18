"use client";

import React, { useState, useEffect, useRef } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getYearRange, 
  getBrandsByType,
  getModelsByBrand,
  getVariantsByModel
} from "@/service/product-Service";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import { selectVehicleTypeId } from "@/store/slice/vehicle/vehicleSlice";

interface Model {
  _id: string;
  model_name: string;
  brand_id: string;
}

interface Variant {
  _id: string;
  variant_name: string;
  model_id: string;
}

interface Year {
  _id: string;
  year_name: string;
}

interface Brand {
  _id: string;
  brand_name: string;
}

interface ShopFiltersProps {
  onFiltersChange: (filters: {
    brand?: string;
    model?: string;
    variant?: string;
    year?: string;
  }) => void;
}

export default function ShopFilters({ onFiltersChange }: ShopFiltersProps) {
  const { showToast } = useToast();
  const typeId = useAppSelector(selectVehicleTypeId);
  
  // State for dropdown data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  
  // State for selected values
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Fetch initial data when typeId changes
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [brandsRes, yearsRes] = await Promise.all([
          getBrandsByType(typeId),
          getYearRange()
        ]);
        
        if (brandsRes.success && brandsRes.data) {
          setBrands(brandsRes.data);
        }
        
        if (yearsRes.success && yearsRes.data) {
          setYears(yearsRes.data);
        }
        
        // Reset all selections when vehicle type changes
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedVariant("");
        setModels([]);
        setVariants([]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showToast("Failed to load initial data", "error");
      }
    };

    if (typeId) {
      fetchInitialData();
    }
  }, [typeId, showToast]);

  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedBrand) {
        setModels([]);
        setSelectedModel("");
        setSelectedVariant("");
        setVariants([]);
        return;
      }

      try {
        const modelsRes = await getModelsByBrand(selectedBrand);
        
        if (modelsRes.success && modelsRes.data) {
          setModels(modelsRes.data);
        } else {
          setModels([]);
        }
        
        // Reset dependent selections
        setSelectedModel("");
        setSelectedVariant("");
        setVariants([]);
      } catch (error) {
        console.error("Error fetching models:", error);
        showToast("Failed to load models", "error");
        setModels([]);
      }
    };

    fetchModels();
  }, [selectedBrand, showToast]);

  // Fetch variants when model changes
  useEffect(() => {
    const fetchVariants = async () => {
      if (!selectedModel) {
        setVariants([]);
        setSelectedVariant("");
        return;
      }

      try {
        const variantsRes = await getVariantsByModel(selectedModel);
        
        if (variantsRes.success && variantsRes.data) {
          setVariants(variantsRes.data);
        } else {
          setVariants([]);
        }
        
        // Reset dependent selection
        setSelectedVariant("");
      } catch (error) {
        console.error("Error fetching variants:", error);
        showToast("Failed to load variants", "error");
        setVariants([]);
      }
    };

    fetchVariants();
  }, [selectedModel, showToast]);

  // Use ref to track previous filter values to avoid infinite loops
  const prevFiltersRef = useRef<string>("");

  // Notify parent component when filters change
  useEffect(() => {
    const currentFilters = {
      brand: selectedBrand || undefined,
      model: selectedModel || undefined,
      variant: selectedVariant || undefined,
      year: selectedYear || undefined,
    };
    
    const filtersString = JSON.stringify(currentFilters);
    
    // Only call onFiltersChange if filters actually changed
    if (filtersString !== prevFiltersRef.current) {
      prevFiltersRef.current = filtersString;
      onFiltersChange(currentFilters);
    }
  }, [selectedBrand, selectedModel, selectedVariant, selectedYear, onFiltersChange]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedVariant("");
    setSelectedYear("");
  };

  // Check if any filters are active
  const hasActiveFilters = selectedBrand || selectedModel || selectedVariant || selectedYear;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Products</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Brand Filter */}
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
            Brand
          </Label>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select brand..." />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand._id} value={brand._id}>
                  {brand.brand_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Filter */}
        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm font-medium text-gray-700">
            Model
          </Label>
          <Select 
            value={selectedModel} 
            onValueChange={setSelectedModel}
            disabled={!selectedBrand}
          >
            <SelectTrigger className="w-full">
              <SelectValue 
                placeholder={
                  selectedBrand 
                    ? "Select model..." 
                    : "Select brand first"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model._id} value={model._id}>
                  {model.model_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Variant Filter */}
        <div className="space-y-2">
          <Label htmlFor="variant" className="text-sm font-medium text-gray-700">
            Variant
          </Label>
          <Select 
            value={selectedVariant} 
            onValueChange={setSelectedVariant}
            disabled={!selectedModel}
          >
            <SelectTrigger className="w-full">
              <SelectValue 
                placeholder={
                  selectedModel 
                    ? "Select variant..." 
                    : "Select model first"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem key={variant._id} value={variant._id}>
                  {variant.variant_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium text-gray-700">
            Year
          </Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year..." />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year._id} value={year._id}>
                  {year.year_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}