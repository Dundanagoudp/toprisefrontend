import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  isLoading = false,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative w-full sm:w-80 lg:w-96 ${className}`}>
      <div className="flex items-center gap-2 h-10 rounded-lg bg-[#EBEBEB] px-4 py-0">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-[#A3A3A3] flex-shrink-0 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-[#A3A3A3] flex-shrink-0" />
        )}
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent font-[Poppins] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#737373] placeholder:text-[#A3A3A3] h-10 p-0 flex-1 outline-none shadow-none"
        />
        {value && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full flex-shrink-0"
            type="button"
          >
            <X className="h-4 w-4 text-[#A3A3A3]" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;