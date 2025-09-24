"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface BreadcrumbContextType {
  customLabels: Record<string, string>;
  setCustomLabels: (labels: Record<string, string>) => void;
  updateLabel: (key: string, value: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

  const updateLabel = useCallback((key: string, value: string) => {
    setCustomLabels(prev => {
      // Only update if the value has actually changed
      if (prev[key] === value) {
        return prev;
      }
      return {
        ...prev,
        [key]: value
      };
    });
  }, []);

  const contextValue = useMemo(() => ({
    customLabels,
    setCustomLabels,
    updateLabel
  }), [customLabels, updateLabel]);

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}
