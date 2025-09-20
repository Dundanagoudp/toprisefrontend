"use client";
import React from 'react'
import CategorySection from './modules/pages/Home/category/Category';
import Featureproduct from './modules/pages/Home/product-sections/Featureproduct';
import SearchByBrand from './modules/pages/Home/brand-section/SearchByBrand';
import MarketingCarousel from './modules/pages/Home/carousel/MarketingCarousel';

export default function Homepage() {
  return (
    <div>
        <SearchByBrand />
        <CategorySection/>
        <MarketingCarousel />
        <Featureproduct />
    </div>
  )
}
