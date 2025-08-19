"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Filter, ChevronDown, ChevronUp, Eye, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SearchInput from "@/components/common/search/SearchInput";
import DynamicButton from "@/components/common/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/utils/useDebounce";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import { getTickets } from "@/service/Ticket-service";
import { Ticket, TicketResponse, TicketStatus, TicketType } from "@/types/Ticket-types";

type TabType = "All" | "General" | "Order" | "Technical" | "Billing" | "Support";

interface TabConfig {
  id: TabType;
  label: string;
  ticketTypes?: TicketType[];
}

export default function ShowTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("All");
  
  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Pagination state (client-side for now)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialog state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await getTickets();
        
        if (response.success && response.data) {
          setTickets(response.data);
        } else {
          console.warn("Invalid response structure:", response);
          setTickets([]);
        }
      } catch (error) {
        console.log("error in fetch tickets", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Tab configurations
  const tabConfigs: TabConfig[] = useMemo(() => [
    {
      id: "All",
      label: "All Tickets",
    },
    {
      id: "General",
      label: "General",
      ticketTypes: ["General"],
    },
    {
      id: "Order",
      label: "Order",
      ticketTypes: ["Order"],
    },
   
  ], []);

  // Get current tab configuration
  const currentTabConfig = useMemo(
    () => tabConfigs.find((tab) => tab.id === activeTab) || tabConfigs[0],
    [tabConfigs, activeTab]
  );

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let currentTickets = [...tickets];

    // Apply tab filter first
    if (currentTabConfig.ticketTypes && currentTabConfig.ticketTypes.length > 0) {
      currentTickets = currentTickets.filter(ticket => 
        currentTabConfig.ticketTypes!.includes(ticket.ticketType)
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      currentTickets = currentTickets.filter(
        (ticket) =>
          ticket._id?.toLowerCase().includes(q) ||
          ticket.description?.toLowerCase().includes(q) ||
          ticket.status?.toLowerCase().includes(q) ||
          ticket.ticketType?.toLowerCase().includes(q) ||
          ticket.userRef?.toLowerCase().includes(q)
      );
    }

    // Sort tickets
    if (sortField) {
      currentTickets.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case "_id":
            aValue = a._id?.toLowerCase() || "";
            bValue = b._id?.toLowerCase() || "";
            break;
          case "description":
            aValue = a.description?.toLowerCase() || "";
            bValue = b.description?.toLowerCase() || "";
            break;
          case "createdAt":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case "updatedAt":
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          case "status":
            aValue = a.status?.toLowerCase() || "";
            bValue = b.status?.toLowerCase() || "";
            break;
          case "ticketType":
            aValue = a.ticketType?.toLowerCase() || "";
            bValue = b.ticketType?.toLowerCase() || "";
            break;
          case "assigned":
            aValue = a.assigned ? 1 : 0;
            bValue = b.assigned ? 1 : 0;
            break;
          default:
            return 0;
        }
        
        if (sortDirection === "asc") {
          return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
          return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
      });
    }
    
    return currentTickets;
  }, [tickets, searchQuery, sortField, sortDirection, currentTabConfig]);

  // Pagination
  const totalItems = filteredAndSortedTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredAndSortedTickets.slice(startIndex, endIndex);

  // Debounced search functionality
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (currentPage !== 1) {
      setCurrentPage(1); // Reset to first page when searching
    }
    setIsSearching(false);
  }, [currentPage]);

  const { debouncedCallback: debouncedSearch } = useDebounce(performSearch, 500);

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

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  const getStatusBadge = (status: TicketStatus) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status.toLowerCase()) {
      case "open":
        return `${baseClasses} text-green-700 bg-green-100`;
      case "in progress":
        return `${baseClasses} text-blue-700 bg-blue-100`;
      case "closed":
        return `${baseClasses} text-gray-700 bg-gray-100`;
      case "pending":
        return `${baseClasses} text-yellow-700 bg-yellow-100`;
      case "resolved":
        return `${baseClasses} text-purple-700 bg-purple-100`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-100`;
    }
  };

  const getTypeBadge = (type: TicketType) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (type.toLowerCase()) {
      case "general":
        return `${baseClasses} text-blue-700 bg-blue-50 border border-blue-200`;
      case "order":
        return `${baseClasses} text-orange-700 bg-orange-50 border border-orange-200`;
      case "technical":
        return `${baseClasses} text-red-700 bg-red-50 border border-red-200`;
      case "billing":
        return `${baseClasses} text-green-700 bg-green-50 border border-green-200`;
      case "support":
        return `${baseClasses} text-purple-700 bg-purple-50 border border-purple-200`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-50 border border-gray-200`;
    }
  };

  // Handle opening ticket details dialog
  const handleViewTicketDetails = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsDialogOpen(true);
  };

  // Handle closing ticket details dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTicketId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <CardTitle className="text-[#000000] font-bold text-lg font-sans">
            <span>Support Tickets</span>
          </CardTitle>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              <SearchInput
                placeholder="Search tickets"
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
              />
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  text="Filters"
                  icon={<Filter className="h-4 w-4 mr-2" />}
                />
              </div>
            </div>
          </div>

          {/* Tickets Section Header */}
          <div className="mb-4">
            <CardTitle className="font-sans font-bold text-lg text-[#000000]">
              {currentTabConfig.label}
            </CardTitle>
            <CardDescription className="text-sm text-[#737373] font-medium font-sans">
              Manage and track support tickets by category
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Tab Bar */}
          <div
            className="flex w-full items-center justify-between border-b border-gray-200 overflow-x-auto"
            aria-label="Ticket tabs"
          >
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1); // Reset to first page when changing tabs
                  }}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm font-mono transition-colors
                    ${
                      activeTab === tab.id
                        ? "text-[#C72920] border-b-2 border-[#C72920]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  {/* Show count for each tab */}
                  {tab.ticketTypes ? (
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? "bg-[#C72920] text-white" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {tickets.filter(ticket => tab.ticketTypes!.includes(ticket.ticketType)).length}
                    </span>
                  ) : (
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? "bg-[#C72920] text-white" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {tickets.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox aria-label="Select all" />
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("_id")}
                  >
                    <div className="flex items-center gap-1">
                      Ticket ID
                      {getSortIcon("_id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      {getSortIcon("description")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("ticketType")}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {getSortIcon("ticketType")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("assigned")}
                  >
                    <div className="flex items-center gap-1">
                      Assigned
                      {getSortIcon("assigned")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {getSortIcon("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("updatedAt")}
                  >
                    <div className="flex items-center gap-1">
                      Updated
                      {getSortIcon("updatedAt")}
                    </div>
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-4 py-4 w-8">
                          <Skeleton className="w-5 h-5 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-8 w-16 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paginatedData.map((ticket) => (
                      <TableRow key={ticket._id}>
                        <TableCell className="px-4 py-4 w-8">
                          <Checkbox />
                        </TableCell>
                        <TableCell 
                          className="px-6 py-4 font-medium cursor-pointer hover:text-[#C72920] transition-colors"
                          onClick={() => handleViewTicketDetails(ticket._id)}
                        >
                          {ticket._id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium max-w-xs">
                          <div className="truncate" title={ticket.description}>
                            {truncateText(ticket.description, 60)}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={getTypeBadge(ticket.ticketType)}>
                            {ticket.ticketType}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={getStatusBadge(ticket.status)}>
                            {ticket.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {ticket.assigned ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-500 flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                          {formatDate(ticket.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                          {formatDate(ticket.updatedAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTicketDetails(ticket._id)}
                              className="hover:bg-[#C72920] hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalItems > 0 && totalPages > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-6 pb-6">
              {/* Left: Showing X-Y of Z tickets */}
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {`Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} tickets`}
              </div>
              {/* Right: Pagination Controls */}
              <DynamicPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                showItemsInfo={false}
              />
            </div>
          )}
        </CardContent>
        
        {/* Empty State */}
        {paginatedData.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No tickets found</p>
            <p className="text-gray-400 text-sm">
              {searchQuery ? "Try adjusting your search terms" : "No support tickets available"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
