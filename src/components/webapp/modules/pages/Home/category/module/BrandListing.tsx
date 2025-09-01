'use client'
import React, { useState } from 'react';

interface Brand {
  _id: string;
  brand_name: string;
  brand_logo?: string;
  type?: {
    type_name: string;
  };
}

interface BrandListingProps {
  brands: Brand[];
  selectedBrands: string[];
  onBrandSelect: (brandId: string) => void;
  isLoading?: boolean;
  vehicleTypeDisplay?: string;
}

const BrandListing = ({
  brands,
  selectedBrands,
  onBrandSelect,
  isLoading = false,
  vehicleTypeDisplay = "Vehicle"
}: BrandListingProps) => {
  const [displayLimit, setDisplayLimit] = useState<number>(12);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])

  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 12)
  }

  const displayedBrands = brands.slice(0, displayLimit)
  const hasMoreBrands = displayLimit < brands.length

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading brands...</p>
      </div>
    )
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Brands Found</h3>
        <p className="text-muted-foreground">
          No brands available for {vehicleTypeDisplay.toLowerCase()} vehicles
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Select Brand
        </h2>
        <p className="text-muted-foreground">
          Choose from {brands.length} available brand{brands.length !== 1 ? 's' : ''} for {vehicleTypeDisplay.toLowerCase()} vehicles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedBrands.map((brand) => (
          <div
            key={brand._id}
            className={`bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-all cursor-pointer group ${
              selectedBrands.includes(brand._id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onBrandSelect(brand._id)}
          >
            <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden group-hover:bg-secondary transition-colors">
              <img
                src={buildImageUrl(brand.brand_logo)}
                alt={brand.brand_name}
                className="w-16 h-16 object-contain"
              />
            </div>
            <h3 className="font-medium text-foreground text-sm mb-2 text-center line-clamp-2">
              {brand.brand_name}
            </h3>
            {brand.type && (
              <p className="text-xs text-muted-foreground text-center">
                {brand.type.type_name}
              </p>
            )}
            {selectedBrands.includes(brand._id) && (
              <div className="mt-2 flex justify-center">
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMoreBrands && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Load More Brands ({brands.length - displayLimit} remaining)
          </button>
        </div>
      )}

      {/* Selection Summary */}
      {selectedBrands.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default BrandListing;
