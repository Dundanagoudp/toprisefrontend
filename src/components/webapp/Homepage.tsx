"use client";
import React, { useState, useCallback } from 'react'
import CategorySection from './modules/pages/Home/category/Category';
import Featureproduct from './modules/pages/Home/product-sections/Featureproduct';
import ShopFilters from './modules/pages/Home/shop-filters/ShopFilters';

export default function Homepage() {
  const [filters, setFilters] = useState<{
    brand?: string;
    model?: string;
    variant?: string;
    year?: string;
  }>({});

  const handleFiltersChange = useCallback((newFilters: {
    brand?: string;
    model?: string;
    variant?: string;
    year?: string;
  }) => {
    setFilters(newFilters);
  }, []);

  return (
    <div>
        <CategorySection/>
        <div className="max-w-screen-2xl mx-auto px-4">
          <ShopFilters onFiltersChange={handleFiltersChange} />
        </div>
        <Featureproduct filters={filters}/>
    </div>
  )
}
