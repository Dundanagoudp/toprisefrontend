'use client'
import React, { useState } from 'react';

interface Variant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: string;
  variant_image?: string;
  created_by: string;
  updated_by: any[];
  variant_status: string;
  variant_Description: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

interface Model {
  _id: string;
  model_name: string;
  model_code: string;
  brand_ref: string;
  model_image?: string;
  created_by: string;
  updated_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

interface VariantListingProps {
  variants: Variant[];
  models: Model | null;
  onVariantSelect: (variantName: string) => void;
  isLoading?: boolean;
}

const VariantListing = ({
  variants,
  models,
  onVariantSelect,
  isLoading = false
}: VariantListingProps) => {
  const [displayLimit, setDisplayLimit] = useState<number>(12);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 12)
  }

  // Helper function to get image for variant (variant image or model image)
  const getVariantImage = (variant: Variant) => {
    // First try variant image (if it exists)
    if (variant.variant_image) {
      return variant.variant_image;
    }

    // If no variant image, use the model image (when is_variant is true, we have single model)
    if (models && models.model_image) {
      return models.model_image;
    }

    // Fallback to placeholder
    return "/placeholder.svg";
  }

  const displayedVariants = variants.slice(0, displayLimit)
  const hasMoreVariants = displayLimit < variants.length

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading variants...</p>
      </div>
    )
  }

  if (!variants || variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Variants Found</h3>
        <p className="text-muted-foreground">
          No variants available
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Select Variant
        </h2>
        <p className="text-muted-foreground">
          Choose from {variants.length} available variant{variants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayedVariants.map((variant) => (
          <div
            key={variant._id}
            className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => onVariantSelect(variant.variant_name)}
          >
            <div className="flex flex-col items-center gap-3">
              <img
                src={getVariantImage(variant)}
                alt={variant.variant_name}
                className="w-16 h-16 object-contain rounded-lg"
              />
              <div className="text-center">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                  {variant.variant_name}
                </h4>
                {/* {variant.Year && variant.Year.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {variant.Year.join(', ')}
                  </p>
                )} */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMoreVariants && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Load More Variants ({variants.length - displayLimit} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default VariantListing;
