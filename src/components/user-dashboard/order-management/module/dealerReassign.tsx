"use client";
import DynamicButton from "@/components/common/button/button";
import SearchInput from "@/components/common/search/SearchInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import { getAllDealers } from "@/service/dealerServices";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDealersSuccess,
  fetchDealersRequest,
  fetchDealersFailure,
} from "@/store/slice/dealer/dealer";
import useDebounce from "@/utils/useDebounce";
import { useState, useCallback, useRef, use, useEffect } from "react";


export default function DealerAssign() {
  const dispatch = useAppDispatch();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const dealers = useAppSelector((state) => state.dealer.dealers);
  const loading = useAppSelector((state) => state.dealer.loading);
  const error = useAppSelector((state) => state.dealer.error);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
    const filteredDealers = searchQuery
    ? dealers.filter(
        (Dealers: any) =>
          Dealers.dealerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          Dealers.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          Dealers.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dealers;
    const totalPages = Math.ceil(filteredDealers.length / itemsPerPage);
    const paginatedData = filteredDealers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  useEffect(() => {
    async function fetchData() {
      dispatch(fetchDealersRequest());

      try {
        const response = await getAllDealers();

        const mappedDealers = response.data.map((dealer: any) => {
          return {
            id: dealer._id,
            dealerId: dealer.dealerId,
            legalName: dealer.legal_name,
            tradeName: dealer.trade_name,
            gstin: dealer.GSTIN,
            pan: dealer.Pan,
            isActive: dealer.is_active,
            contactName: dealer.contact_person.name,
            contactEmail: dealer.contact_person.email,
            contactPhone: dealer.contact_person.phone_number,
            address: `${dealer.Address.street}, ${dealer.Address.city}, ${dealer.Address.state} - ${dealer.Address.pincode}`,
            categories: dealer.categories_allowed,
            margin: dealer.default_margin,
            dispatchTime: dealer.dealer_dispatch_time,
            slaType: dealer.SLA_type,
            uploadAccess: dealer.upload_access_enabled,
            lastFulfillment: dealer.last_fulfillment_date,
            onboardingDate: dealer.onboarding_date,
            remarks: dealer.remarks,
            user: {
              userId: dealer.user_id._id,
              email: dealer.user_id.email,
              phone: dealer.user_id.phone_Number,
              role: dealer.user_id.role,
            },
            assignedEmployees: dealer.assigned_Toprise_employee.map(
              (emp: any) => ({
                id: emp._id,
                userId: emp.assigned_user,
                status: emp.status,
                assignedAt: emp.assigned_at,
              })
            ),
            createdAt: dealer.created_at,
            updatedAt: dealer.updated_at,
          };
        });

        dispatch(fetchDealersSuccess(mappedDealers));
      } catch (err: any) {
        console.error("Error fetching dealer data:", err);
        dispatch(fetchDealersFailure(err.message));
      }
    }

    fetchData();
  }, []);
    const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
  };
  return (
    <div>
      <Card className="shadow-sm rounded-none">
        <CardHeader className="space-y-4 sm:space-y-6 flex flex-col items-start ">
          <CardTitle className="font-sans font-bold text-base">
            Dealer Assign
          </CardTitle>
          <SearchInput
          value={searchInput}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          isLoading={isSearching}
          placeholder="Search by Dealer ID, Name, or Location" />
        </CardHeader>
        <CardContent className="p-0">
        <div className="hidden sm:block overflow-x-auto">
          <Table className="min-w-full overflow-x-auto">
            <TableHeader>
              <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Dealer ID
                </TableHead>
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Date
                </TableHead>
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Product Name
                </TableHead>
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Dealer Name
                </TableHead>
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Email /Phone
                </TableHead>
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Contact Person
                </TableHead>
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Category
                </TableHead>
                <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                  Quantity
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
           {paginatedData.map((dealer:any,index)=>(
            <TableRow>
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <div className="font-medium text-gray-900 b2 font-sans ">
                    {dealer.dealerId}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <div className="font-medium text-gray-900 b2 font-sans ">
                    {dealer.legalName}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <div className="font-medium text-gray-900 b2 font-sans ">
                    {dealer.tradeName}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <div className="font-medium text-gray-900 b2 font-sans ">
                    {dealer.contactName}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <div className="font-medium text-gray-900 b2 font-sans ">
                    {dealer.contactEmail ? dealer.contactEmail : dealer.contactPhone}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <div className="font-medium text-gray-900 b2 font-sans ">
                   {dealer.contactName}
                  </div>
                </TableCell>
          
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <div className="font-medium text-gray-900 b2 font-sans ">
                  {dealer.categories.map((category: any) => category).join(", ")}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]">
                  <DynamicButton variant="default" text="reassign" />
                </TableCell>
              </TableRow>
           ))   }
              
            </TableBody>
          </Table>
        </div>
         {!loading && !error && paginatedData.length > 0 && totalPages > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-4 sm:px-6 pb-6">
              {/* Left: Showing X-Y of Z products */}
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  paginatedData.length
                )} of ${paginatedData.length} products`}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center sm:justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 3) }).map(
                      (_, idx) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 2) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + idx;
                        } else {
                          pageNum = currentPage - 1 + idx;
                        }

                        // Prevent out-of-bounds pageNum
                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <PaginationItem
                            key={pageNum}
                            className="hidden sm:block"
                          >
                            <PaginationLink
                              isActive={currentPage === pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
