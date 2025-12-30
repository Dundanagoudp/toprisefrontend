'use client'
import React, { useState } from 'react';

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

interface ModelListingProps {
  models: Model[];
  onModelSelect: (modelName: string) => void;
  isLoading?: boolean;
}

const ModelListing = ({
  models,
  onModelSelect,
  isLoading = false
}: ModelListingProps) => {
  const [displayLimit, setDisplayLimit] = useState<number>(12);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 12)
  }

  const displayedModels = models.slice(0, displayLimit)
  const hasMoreModels = displayLimit < models.length

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading models...</p>
      </div>
    )
  }

  if (!models || models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Models Found</h3>
        <p className="text-muted-foreground">
          No models available
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Select Model
        </h2>
        <p className="text-muted-foreground">
          Choose from {models.length} available model{models.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayedModels.map((model) => (
          <div
            key={model._id}
            className="bg-card h-72 rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => onModelSelect(model.model_name)}
          >
            <div className="flex flex-col items-center gap-3 h-full w-full">
              <div className="w-full aspect-4/3 flex items-center justify-center overflow-hidden rounded-lg bg-muted">
              <img
                src={model.model_image || "/placeholder.svg"}
                alt={model.model_name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                     
              />
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
              <h4 className="text-sm font-medium text-foreground text-center line-clamp-2 leading-tight">
                {model.model_name}
              </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMoreModels && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Load More Models ({models.length - displayLimit} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelListing;
