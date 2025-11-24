import { createContext } from "react";


export interface SelectContextType {
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  isSelected: (id: string) => boolean;
  clearSelection: () => void;
}

export const SelectContext = createContext<SelectContextType | undefined>(undefined);