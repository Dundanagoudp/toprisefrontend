"use client";
import React from 'react'
import CategorySection from './modules/pages/Home/category/Category';
import Featureproduct from './modules/pages/Home/product-sections/Featureproduct';

interface HomepageProps {
  filters?: {
    brand?: string;
    model?: string;
    variant?: string;
    year?: string;
  };
}

export default function Homepage({ filters = {} }: HomepageProps) {

  return (
    <div>
        <CategorySection/>
        <Featureproduct filters={filters}/>
    </div>
  )
}
