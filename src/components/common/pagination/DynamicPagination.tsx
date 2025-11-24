import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface DynamicPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
  showItemsInfo?: boolean;
}

export default function DynamicPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
  showItemsInfo = true,
}: DynamicPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPaginationItems = () => {
    const items: number[] = [
      1,
      totalPages,
      currentPage,
      currentPage - 1,
      currentPage + 1,
    ];

    // Filter valid pages and sort unique values
    const uniquePages = Array.from(new Set(items))
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);

    const pages: (number | string)[] = [];

    // Build pages array with ellipses
    for (let i = 0; i < uniquePages.length; i++) {
      const page = uniquePages[i];
      const prevPage = uniquePages[i - 1];

      if (prevPage && page - prevPage > 1) {
        pages.push("ellipsis-" + i); // Unique key for ellipsis
      }
      pages.push(page);
    }

    return pages.map((page) => {
      if (typeof page === "string") {
        return (
          <PaginationItem key={page}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      return (
        <PaginationItem key={page}>
          <PaginationLink
            isActive={currentPage === page}
            onClick={() => onPageChange(page)}
            className={`cursor-pointer min-w-[40px] h-[40px] flex items-center justify-center ${
              currentPage === page
                ? "bg-white border-2 border-gray-900 text-gray-900 font-medium"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className={`flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 px-6 py-4 ${className}`}>
      {/* Items info - Left side */}
      {/* {showItemsInfo ? (  
        <div className="text-sm text-gray-600 text-center sm:text-left">
          {`Showing ${startItem}-${endItem} of ${totalItems} items`}
        </div>
      ) : null} */}

      {/* Pagination Controls - Right side */}
      <div className={`flex ${showItemsInfo ? 'justify-center sm:justify-end' : 'justify-center'}`}>
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-gray-100"
                }
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-gray-100"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}