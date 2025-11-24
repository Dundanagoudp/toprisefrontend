"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ProductSelectionContextType {
  selectedProductIds: string[];
  toggleProductSelection: (id: string) => void;
  clearSelection: () => void;
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProductSelectionContext = createContext<ProductSelectionContextType | undefined>(undefined);

export function ProductSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const toggleProductSelection = useCallback((id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedProductIds([]), []);

  return (
    <ProductSelectionContext.Provider
      value={{ selectedProductIds, toggleProductSelection, clearSelection, setSelectedProductIds }}
    >
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection() {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error("useProductSelection must be used within a ProductSelectionProvider");
  }
  return context;
}
