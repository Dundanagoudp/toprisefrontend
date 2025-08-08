  // Handle SLA Form submit

"use client";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllDealers } from "@/service/dealerServices";
import { disableDealer, enableDealer } from "@/service/dealerServices";
import type { Dealer, Category } from "@/types/dealer-types";
import { useToast as useToastMessage } from "@/components/ui/toast";
import { getAllCategories } from "@/service/dealerServices";
import { Skeleton } from "@/components/ui/skeleton";
import AssignSLAForm from "../../dealer-management/module/popups/assignSLA";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";

interface DealertableProps {
  search?: string;
  role?: string;
}

export default function Dealertable({
  search = "",
  role = "",
}: DealertableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastMessage();
  const itemsPerPage = 10;
  // Filter dealers by search and role
  const filteredDealers = dealers.filter((dealer) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      dealer.legal_name.toLowerCase().includes(searchLower) ||
      dealer.trade_name.toLowerCase().includes(searchLower) ||
      dealer.user_id.email.toLowerCase().includes(searchLower) ||
      dealer.user_id.phone_Number.toLowerCase().includes(searchLower) ||
      dealer.contact_person.name.toLowerCase().includes(searchLower) ||
      dealer.contact_person.email.toLowerCase().includes(searchLower);
    const matchesRole =
      !role || dealer.user_id.role?.toLowerCase() === role.toLowerCase();
    return matchesSearch && matchesRole;
  });
  const totalItems = filteredDealers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredDealers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [slaFormOpen, setSlaFormOpen] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [viewDealerLoading, setViewDealerLoading] = useState(false);
  const [editDealerLoading, setEditDealerLoading] = useState(false);
  const [addDealerLoading, setAddDealerLoading] = useState(false);
  const [disablingId, setDisablingId] = useState<string | null>(null);
  const [enablingId, setEnablingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDealers();
    fetchCategories();
  }, []);

  const handleSLAFormSubmit = (data: any) => {
    setSlaFormOpen(false);
    setSelectedDealerId(null);
    showToast("SLA has been assigned successfully.", "success");
    // Optionally, refresh dealers or perform other actions here
  };


  const fetchDealers = async () => {
    try {
      setLoading(true);
      const response = await getAllDealers();
      if (response.success) {
        setDealers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
      showToast("Failed to fetch dealers", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showToast("Failed to fetch categories", "error");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const handleDisableDealer = async (dealerId: string) => {
    try {
      setDisablingId(dealerId);
      await disableDealer(dealerId);
      setDealers((prev) =>
        prev.map((d) => (d._id === dealerId ? { ...d, is_active: false } : d))
      );
      showToast("Dealer Disabled Successfully", "success");
    } catch (error) {
      showToast("Failed to disable dealer. Please try again.", "error");
    } finally {
      setDisablingId(null);
    }
  };

  const handleEnableDealer = async (dealerId: string) => {
    try {
      setEnablingId(dealerId);
      await enableDealer(dealerId);
      setDealers((prev) =>
        prev.map((d) => (d._id === dealerId ? { ...d, is_active: true } : d))
      );
      showToast("Dealer Enabled Successfully", "success");
    } catch (error) {
      showToast("Failed to enable dealer. Please try again.", "error");
    } finally {
      setEnablingId(null);
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                S. No.
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                Legal Name
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                Trade Name
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                Email/Phone
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                Contact Person
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                Role
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                Status
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                Category
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-14" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              S. No.
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              Legal Name
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              Trade Name
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              Email/Phone
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              Contact Person
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              Role
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              Status
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              Category
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((dealer, index) => (
            <tr
              key={dealer._id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="p-3 md:p-4 text-gray-600 text-sm">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                {dealer.legal_name}
              </td>
              <td className="p-3 md:p-4 font-medium text-gray-900 text-sm">
                {dealer.trade_name}
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div>
                  <div>{dealer.user_id.email}</div>
                  <div className="text-xs text-gray-500">
                    {dealer.user_id.phone_Number}
                  </div>
                </div>
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div>
                  <div>{dealer.contact_person.name}</div>
                  <div className="text-xs text-gray-500">
                    {dealer.contact_person.email}
                  </div>
                </div>
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                {dealer.user_id.role}
              </td>
              <td className="p-3 md:p-4">{getStatusBadge(dealer.is_active)}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div className="flex flex-wrap gap-1">
                  {dealer.categories_allowed.map((categoryId, idx) => {
                    const category = categories.find(
                      (cat) => cat._id === categoryId
                    );
                    return (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {category ? category.category_name : categoryId}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="p-3 md:p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                      {
                        setEditDealerLoading(true);
                        router.push(
                          `/user/dashboard/user/edit-dealer/${dealer._id}`
                        )}
                        
                      }
                    >
                      Edit
                    </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                    
                      setSelectedDealerId(dealer._id);
                      setSlaFormOpen(true);
                    }}
                  >
                    Assign SLA
                  </DropdownMenuItem>
                  {dealer.is_active && (
                    <DropdownMenuItem
                      onClick={() => {
                        if (disablingId) return;
                        handleDisableDealer(dealer._id);
                      }}
                    >
                      {disablingId === dealer._id ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Disabling...
                        </span>
                      ) : (
                        "Disable Dealer"
                      )}
                    </DropdownMenuItem>
                  )}
                  {!dealer.is_active && (
                    <DropdownMenuItem
                      onClick={() => {
                        if (enablingId) return;
                        handleEnableDealer(dealer._id);
                      }}
                    >
                      {enablingId === dealer._id ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enabling...
                        </span>
                      ) : (
                        "Enable Dealer"
                      )}
                    </DropdownMenuItem>
                  )}
                    <DropdownMenuItem
                      onClick={() => {
                        setViewDealerLoading(true);
                        router.push(
                          `/user/dashboard/user/dealerview/${dealer._id}`
                        );
                      }}
                    >
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Dynamic Pagination */}
      <DynamicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
      <AssignSLAForm
        open={slaFormOpen}
        onClose={() => setSlaFormOpen(false)}
        dealerId={selectedDealerId}
        onSubmit={handleSLAFormSubmit}
      />
{/* Loader for  dealers */}


              {viewDealerLoading && (
              <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
                  <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Loading Dealer details...
                  </p>
                </div>
              </div>
            )}
                  {editDealerLoading && (
              <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
                  <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Loading Dealer details...
                  </p>
                </div>
              </div>
            )}
             {addDealerLoading && (
              <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
                  <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Loading Dealer details...
                  </p>
                </div>
              </div>
            )}
    </div>
  );
}
