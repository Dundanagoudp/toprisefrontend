"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTokenPayload } from "@/utils/cookies";
import { 
  contactDealerAboutViolation, 
  resolveSLAViolation, 
  getSLADealerViolationSummary,
  getEnhancedSLAViolations,
  getSLAViolationStats,
  createManualSLAViolation
} from "@/service/sla-violations-service";
import {
  Search,
  Filter,
  ChevronDown,
  Upload,
  Plus,
  MoreHorizontal,
  PlusIcon,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { EditIcon } from "@/components/ui/TicketIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import addSquare from "../../../../../public/assets/addSquare.svg";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { getProducts } from "@/service/product-Service";
import slaViolationsService from "@/service/slaViolations-Service";
import SLAViolationsDashboard from "@/components/user-dashboard/sla-violations/SLAViolationsDashboard";
import { getAllDealers } from "@/service/dealerServices";
import { getOrders } from "@/service/order-service";
import { useToast } from "@/components/ui/toast";

// Types for SLA Violations
interface SLAViolation {
  _id: string;
  dealer_id: string;
  order_id: string;
  violation_minutes: number;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  dealerInfo?: {
    trade_name: string;
    legal_name: string;
    is_active: boolean;
  };
}

interface DealerWithViolations {
  dealerId: string;
  dealerInfo: {
    trade_name: string;
    legal_name: string;
    is_active: boolean;
  };
  violationStats: {
    totalViolations: number;
    totalViolationMinutes: number;
    avgViolationMinutes: number;
    maxViolationMinutes: number;
    unresolvedViolations: number;
    firstViolation: string;
    lastViolation: string;
    violationDates: string[];
  };
  riskLevel: "High" | "Medium" | "Low";
  eligibleForDisable: boolean;
}

interface DashboardData {
  quickStats: {
    totalViolations: number;
    totalViolationMinutes: number;
    avgViolationMinutes: number;
    maxViolationMinutes: number;
    resolvedViolations: number;
    unresolvedViolations: number;
    uniqueDealerCount: number;
    resolutionRate: number;
  };
  dealersWithViolations: {
    totalDealers: number;
    highRiskDealers: number;
    mediumRiskDealers: number;
    lowRiskDealers: number;
    eligibleForDisable: number;
  };
  topViolators: Array<{
    rank: number;
    dealerId: string;
    dealerInfo: {
      trade_name: string;
    };
    stats: {
      totalViolations: number;
      avgViolationMinutes: number;
    };
    riskLevel: string;
  }>;
  trends: {
    period: string;
    summary: {
      totalViolations: number;
      avgViolationsPerDay: number;
    };
  };
  lastUpdated: string;
}

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case "inactive":
    case "disabled":
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    case "met":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Met
        </Badge>
      );
    case "violated":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" />
          Violated
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status || "Unknown"}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Critical":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {priority}
        </Badge>
      );
    case "High":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {priority}
        </Badge>
      );
    case "Medium":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {priority}
        </Badge>
      );
    case "Low":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {priority}
        </Badge>
      );
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{priority}</Badge>;
  }
};

const getViolationStatusBadge = (resolved: boolean) => {
  if (resolved) {
    return (
      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
        Inactive
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
      Active
    </Badge>
  );
};

export default function SLAViolationsAndReporting() {
  const route = useRouter();
  const payload = getTokenPayload();
  const isAllowed = payload?.role === "Inventory-Admin" || payload?.role === "Super-admin";
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedViolationIds, setSelectedViolationIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("tabular");
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRiskLevel, setFilterRiskLevel] = useState("all");
  const [filterViolations, setFilterViolations] = useState("all");
  
  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>({
    quickStats: {
      totalViolations: 0,
      totalViolationMinutes: 0,
      avgViolationMinutes: 0,
      maxViolationMinutes: 0,
      resolvedViolations: 0,
      unresolvedViolations: 0,
      uniqueDealerCount: 0,
      resolutionRate: 0,
    },
    dealersWithViolations: {
      totalDealers: 0,
      highRiskDealers: 0,
      mediumRiskDealers: 0,
      lowRiskDealers: 0,
      eligibleForDisable: 0,
    },
    topViolators: [],
    trends: {
      period: "30d",
      summary: {
        totalViolations: 0,
        avgViolationsPerDay: 0,
      },
    },
    lastUpdated: new Date().toISOString(),
  });
  const [violations, setViolations] = useState<any[]>([]);
  const [topViolators, setTopViolators] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Action states
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<DealerWithViolations | null>(null);
  const [disableReason, setDisableReason] = useState("");
  const [disableNotes, setDisableNotes] = useState("");
  
  // SLA violation action states
  const [showContactModal, setShowContactModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null);
  const [contactMethod, setContactMethod] = useState<"notification" | "email" | "phone">("notification");
  const [customMessage, setCustomMessage] = useState("Please address this SLA violation immediately");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("Violation resolved after dealer contact");
  
  // Manual violation creation states
  const [showCreateViolationModal, setShowCreateViolationModal] = useState(false);
  const [createViolationData, setCreateViolationData] = useState({
    dealer_id: "",
    order_id: "",
    expected_fulfillment_time: "",
    actual_fulfillment_time: "",
    violation_minutes: 0,
    notes: "",
    contact_dealer: false
  });
  
  // Dealers and orders for manual violation creation
  const [dealers, setDealers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dealersLoading, setDealersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dealerSearchQuery, setDealerSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allViolationIds = violations.map((violation) => violation._id);
      setSelectedViolationIds(allViolationIds);
    } else {
      setSelectedViolationIds([]);
    }
  };

  const handleSelectViolation = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (event.target.checked) {
      setSelectedViolationIds((prev) => [...prev, id]);
    } else {
      setSelectedViolationIds((prev) => prev.filter((violationId) => violationId !== id));
    }
  };

  // Fetch dealers for manual violation creation
  const fetchDealers = async () => {
    try {
      setDealersLoading(true);
      const response = await getAllDealers();
      if (response.success && response.data) {
        setDealers(response.data);
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setDealersLoading(false);
    }
  };

  // Fetch orders for manual violation creation
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await getOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Filter dealers based on search query
  const filteredDealers = useMemo(() => {
    if (!dealerSearchQuery) return dealers;
    return dealers.filter(dealer => 
      dealer.trade_name?.toLowerCase().includes(dealerSearchQuery.toLowerCase()) ||
      dealer.legal_name?.toLowerCase().includes(dealerSearchQuery.toLowerCase()) ||
      dealer._id?.toLowerCase().includes(dealerSearchQuery.toLowerCase())
    );
  }, [dealers, dealerSearchQuery]);

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!orderSearchQuery) return orders;
    return orders.filter(order => 
      order._id?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(orderSearchQuery.toLowerCase())
    );
  }, [orders, orderSearchQuery]);

  // Fetch dealers and orders when modal opens
  useEffect(() => {
    if (showCreateViolationModal) {
      fetchDealers();
      fetchOrders();
    }
  }, [showCreateViolationModal]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await slaViolationsService.getDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        console.warn("Dashboard API response:", response);
        setError("Invalid dashboard data received");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enhanced SLA violations
  const fetchEnhancedViolations = async () => {
    try {
      console.log("Fetching enhanced violations...");
      const response = await getEnhancedSLAViolations();
      console.log("Enhanced violations response:", response);
      
      if (response.success && response.data?.violations) {
        console.log("Setting violations:", response.data.violations);
        setViolations(response.data.violations);
      } else {
        console.warn("Enhanced violations API response:", response);
        setViolations([]);
      }
    } catch (error) {
      console.error("Error fetching enhanced violations:", error);
      setViolations([]);
    }
  };

  // Fetch SLA violation statistics
  const fetchSLAStats = async () => {
    try {
      console.log("Fetching SLA stats...");
      const response = await getSLAViolationStats();
      console.log("SLA stats response:", response);
      
      if (response.success && response.data) {
        console.log("Setting stats data:", response.data);
        setStatsData(response.data);
        
        // Calculate risk level distribution accurately
        const dealers = response.data.data || [];
        const totalDealers = response.data.summary.uniqueDealerCount || 0;
        
        // Calculate risk levels based on violation rate
        const highRiskDealers = dealers.filter((dealer: any) => dealer.violationRate >= 80).length;
        const mediumRiskDealers = dealers.filter((dealer: any) => dealer.violationRate >= 50 && dealer.violationRate < 80).length;
        const lowRiskDealers = dealers.filter((dealer: any) => dealer.violationRate < 50).length;
        const eligibleForDisable = dealers.filter((dealer: any) => dealer.violationRate >= 90).length;
        
        // Verify total counts match
        const calculatedTotal = highRiskDealers + mediumRiskDealers + lowRiskDealers;
        console.log("Risk Level Distribution:", {
          totalDealers,
          highRiskDealers,
          mediumRiskDealers,
          lowRiskDealers,
          eligibleForDisable,
          calculatedTotal,
          dealersCount: dealers.length
        });

        // Update dashboard data with new stats
        setDashboardData(prev => ({
          ...prev,
          quickStats: {
            totalViolations: response.data.summary.totalViolations,
            totalViolationMinutes: response.data.summary.totalViolationMinutes,
            avgViolationMinutes: response.data.summary.avgViolationMinutes,
            maxViolationMinutes: response.data.summary.maxViolationMinutes,
            resolvedViolations: response.data.summary.resolvedViolations,
            unresolvedViolations: response.data.summary.unresolvedViolations,
            uniqueDealerCount: response.data.summary.uniqueDealerCount,
            resolutionRate: response.data.summary.resolutionRate,
          },
          dealersWithViolations: {
            totalDealers: totalDealers,
            highRiskDealers: highRiskDealers,
            mediumRiskDealers: mediumRiskDealers,
            lowRiskDealers: lowRiskDealers,
            eligibleForDisable: eligibleForDisable,
          },
          topViolators: prev?.topViolators || [],
          trends: prev?.trends || {
            period: "30d",
            summary: {
              totalViolations: 0,
              avgViolationsPerDay: 0,
            },
          },
          lastUpdated: new Date().toISOString(),
        }));
        
        // Update top violators with new data
        const topViolatorsData = response.data.data.map((dealer: any, index: number) => ({
          rank: index + 1,
          dealerId: dealer.dealerId,
          dealerInfo: {
            trade_name: dealer.dealerInfo.trade_name
          },
          stats: {
            totalViolations: dealer.totalViolations,
            avgViolationMinutes: dealer.avgViolationMinutes
          }
        }));
        
        console.log("Setting top violators:", topViolatorsData);
        setTopViolators(topViolatorsData);
      } else {
        console.warn("SLA stats API response:", response);
        setStatsData(null);
      }
    } catch (error) {
      console.error("Error fetching SLA stats:", error);
      setStatsData(null);
    }
  };

  // Fetch top violators
  const fetchTopViolators = async () => {
    try {
      const response = await slaViolationsService.getTopViolators({ limit: 10 });
      if (response.success && response.data) {
        setTopViolators(response.data);
      } else {
        console.warn("Top violators API response:", response);
        setTopViolators([]);
      }
    } catch (error) {
      console.error("Error fetching top violators:", error);
      setTopViolators([]);
    }
  };

  // Disable dealer
  const handleDisableDealer = async () => {
    if (!selectedDealer) return;
    
    try {
      const response = await slaViolationsService.disableDealer(selectedDealer.dealerId, {
        reason: disableReason,
        adminNotes: disableNotes,
      });
      
      if (response.success) {
        setShowDisableModal(false);
        setSelectedDealer(null);
        setDisableReason("");
        setDisableNotes("");
        // Refresh data
        fetchDashboardData();
        fetchSLAStats();
        fetchSLAStats();
                fetchSLAStats();
                fetchEnhancedViolations();
      }
    } catch (error) {
      console.error("Error disabling dealer:", error);
    }
  };

  // Bulk disable dealers

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Starting data load...");
        await Promise.all([
          fetchSLAStats(),
          fetchEnhancedViolations()
        ]);
        console.log("Data load completed successfully");
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate filtered violations based on search and filters
  const filteredViolations = useMemo(() => {
    return violations
      .filter(violation => violation && violation._id)
      .filter(violation => {
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = (
            violation._id?.toLowerCase().includes(query) ||
            violation.dealerDetails?.contact_person?.name?.toLowerCase().includes(query) ||
            violation.order_id?.toLowerCase().includes(query) ||
            violation._id?.slice(-8).toLowerCase().includes(query)
          );
          if (!matchesSearch) return false;
        }
        
        // Status filter
        if (filterStatus !== "all") {
          if (filterStatus === "active" && violation.resolved) return false;
          if (filterStatus === "inactive" && !violation.resolved) return false;
          if (filterStatus === "resolved" && !violation.resolved) return false;
        }
        
        // Priority filter (using priority instead of risk level)
        if (filterRiskLevel !== "all") {
          if (violation.priority?.toLowerCase() !== filterRiskLevel.toLowerCase()) return false;
        }
        
        // Violations filter (using violation minutes)
        if (filterViolations !== "all") {
          const violationMinutes = violation.violation_minutes || 0;
          if (filterViolations === "high" && violationMinutes < 10) return false;
          if (filterViolations === "medium" && (violationMinutes < 5 || violationMinutes >= 10)) return false;
          if (filterViolations === "low" && violationMinutes >= 5) return false;
        }
        
        return true;
      });
  }, [violations, searchQuery, filterStatus, filterRiskLevel, filterViolations]);

  // Handle contacting dealer about violation
  const handleContactDealer = async () => {
    if (!selectedViolationId) return;
    
    try {
      setActionLoading(true);
      await contactDealerAboutViolation(selectedViolationId, {
        contact_method: contactMethod,
        custom_message: customMessage
      });
      
      console.log("Dealer contacted successfully");
      showToast("Dealer contacted successfully!", "success");
      setShowContactModal(false);
      setSelectedViolationId(null);
      setCustomMessage("Please address this SLA violation immediately");
      
        // Refresh data
      fetchSLAStats();
                fetchSLAStats();
                fetchEnhancedViolations();
    } catch (error) {
      console.error("Error contacting dealer:", error);
      showToast("Failed to contact dealer. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle resolving SLA violation
  const handleResolveViolation = async () => {
    if (!selectedViolationId) return;
    
    try {
      setActionLoading(true);
      
      // Get current user ID for resolved_by field
      const currentUser = payload?.id || "admin_user_id";
      
      await resolveSLAViolation(selectedViolationId, {
        resolution_notes: resolutionNotes,
        resolved_by: currentUser
      });
      
      console.log("SLA violation resolved successfully");
      setShowResolveModal(false);
      setSelectedViolationId(null);
      setResolutionNotes("Violation resolved after dealer contact");
      
      // Refresh data
      fetchSLAStats();
                fetchSLAStats();
                fetchEnhancedViolations();
    } catch (error) {
      console.error("Error resolving SLA violation:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle viewing dealer violation summary
  const handleViewSummary = async (dealerId: string) => {
    try {
      setActionLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last 30 days
      const endDate = new Date();
      
      const summary = await getSLADealerViolationSummary(
        dealerId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      setSummaryData(summary);
      setShowSummaryModal(true);
    } catch (error) {
      console.error("Error fetching violation summary:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset create violation form
  const resetCreateViolationForm = () => {
    setCreateViolationData({
      dealer_id: "",
      order_id: "",
      expected_fulfillment_time: "",
      actual_fulfillment_time: "",
      violation_minutes: 0,
      notes: "",
      contact_dealer: false
    });
    setDealerSearchQuery("");
    setOrderSearchQuery("");
  };

  // Handle creating manual SLA violation
  const handleCreateManualViolation = async () => {
    try {
      setActionLoading(true);
      const payload = getTokenPayload();
      
      const violationData = {
        ...createViolationData,
        created_by: payload?.id || "unknown"
      };
      
      const response = await createManualSLAViolation(violationData);
      
      if (response.success) {
        // Reset form
        resetCreateViolationForm();
        setShowCreateViolationModal(false);
        
        // Refresh data
        fetchSLAStats();
        fetchEnhancedViolations();
        
        console.log("Manual SLA violation created successfully");
      }
    } catch (error) {
      console.error("Error creating manual SLA violation:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
              SLA Violations & Reporting
            </h1>
            <p className="text-base font-medium font-sans text-gray-500">
              Monitor and analyze Service Level Agreement violations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowCreateViolationModal(true)}
            >
              <Plus className="h-4 w-4" />
              Create Manual Violation
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setError(null);
              fetchSLAStats();
              fetchEnhancedViolations();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Debug Information */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-800 font-medium">Debug Info</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Violations Count: {violations.length}</p>
            <p>Stats Data: {statsData ? 'Loaded' : 'Not loaded'}</p>
            <p>Dashboard Data: {dashboardData ? 'Loaded' : 'Not loaded'}</p>
            <p>Top Violators: {topViolators.length}</p>
          </div>
        </div>
      )} */}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Violations</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? "..." : dashboardData?.quickStats?.totalViolations || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData?.quickStats?.resolutionRate ? `${100 - dashboardData.quickStats.resolutionRate}% violation rate` : "Loading..."}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "..." : `${dashboardData?.quickStats?.resolutionRate || 0}%`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData?.quickStats?.resolvedViolations || 0} resolved violations
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Violation Time</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? "..." : `${dashboardData?.quickStats?.avgViolationMinutes || 0}m`}
                </p>
                <p className="text-xs text-gray-500 mt-1">Minutes over SLA</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Dealers</p>
                <p className="text-2xl font-bold text-red-700">
                  {loading ? "..." : dashboardData?.dealersWithViolations?.highRiskDealers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
          <TabsTrigger value="tabular" className="flex items-center justify-center gap-2">
            <Table className="h-4 w-4" />
            Tabular View
          </TabsTrigger>
          <TabsTrigger value="statistical" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Statistical View
          </TabsTrigger>
          <TabsTrigger value="sla-violations" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            SLA Violations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tabular" className="space-y-6">
          <Card className="shadow-sm rounded-none">
            <CardHeader className="space-y-6">
              {/* Search and Actions Row */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left Side - Search and Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80 lg:w-96">
                    <div className="flex items-center gap-2 h-10 rounded-lg bg-[#EBEBEB] px-3 py-2">
                      <Search className="h-4 w-4 text-[#737373] flex-shrink-0" />
                      <Input
                        placeholder="Search SLA violations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#737373] placeholder:text-[#737373] h-auto p-0"
                      />
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent border-gray-300 hover:bg-gray-50 min-w-[100px]"
                      onClick={() => setShowFilters(true)}
                    >
                      <Filter className="h-4 w-4" />
                      <span className="b3 font-poppins">Filters</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Dealers with Violations Table */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left">
                        <input type="checkbox" onChange={handleSelectAll} />
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left">
                        Violation ID
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px]">
                        Dealer Name
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                        Order ID
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                        Violation Time
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                        Status
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px]">
                        Priority
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px]">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading SLA violations...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : violations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No SLA violations found
                        </TableCell>
                      </TableRow>
                    ) : filteredViolations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No violations match the selected filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredViolations.map((violation, index) => (
                        <TableRow
                          key={violation._id}
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }`}
                        >
                          <TableCell className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              checked={selectedViolationIds.includes(violation._id)}
                              onChange={(e) => handleSelectViolation(e, violation._id)}
                            />
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-gray-700 b2 font-redHat">
                              {violation._id.slice(-8)}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 b2 font-redhat">
                                {violation.dealerDetails?.contact_person?.name || "Unknown Dealer"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {violation.dealerDetails?.contact_person?.email || "No email"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-gray-700 b2 font-semibold">
                              {violation.order_id?.slice(-8) || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-gray-700 b2">
                              {violation.violation_minutes || 0}m
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {getViolationStatusBadge(violation.resolved)}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {getPriorityBadge(violation.priority || "Low")}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => handleViewSummary(violation.dealer_id)}
                                >
                                  View Violation Summary
                                </DropdownMenuItem>
                                  <DropdownMenuItem 
                                  className="cursor-pointer"
                                    onClick={() => {
                                    setSelectedViolationId(violation._id);
                                    setShowContactModal(true);
                                  }}
                                >
                                  Contact Dealer
                                </DropdownMenuItem>
                                {!violation.resolved && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-green-600 hover:text-green-700"
                                    onClick={() => {
                                      setSelectedViolationId(violation._id);
                                      setShowResolveModal(true);
                                    }}
                                  >
                                    Resolve Violation
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Footer - Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing {filteredViolations.length} of {violations.length} SLA violations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Level Distribution */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Risk Level Distribution</CardTitle>
                <CardDescription>Breakdown of dealers by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">High Risk</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : dashboardData?.dealersWithViolations?.highRiskDealers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Medium Risk</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : dashboardData?.dealersWithViolations?.mediumRiskDealers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Low Risk</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : dashboardData?.dealersWithViolations?.lowRiskDealers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-700 rounded-full"></div>
                      <span className="text-sm font-medium">Eligible for Disable</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : dashboardData?.dealersWithViolations?.eligibleForDisable || 0}
                    </span>
                  </div>
                  
                  {/* Total Validation */}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Dealers</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {loading ? "..." : 
                          (dashboardData?.dealersWithViolations?.highRiskDealers || 0) + 
                          (dashboardData?.dealersWithViolations?.mediumRiskDealers || 0) + 
                          (dashboardData?.dealersWithViolations?.lowRiskDealers || 0)
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Expected: {dashboardData?.dealersWithViolations?.totalDealers || 0} dealers
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA Performance Metrics */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">SLA Performance</CardTitle>
                <CardDescription>Overall SLA compliance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Resolution Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${dashboardData?.quickStats?.resolutionRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{dashboardData?.quickStats?.resolutionRate || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Violation Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${dashboardData?.quickStats?.resolutionRate ? 100 - dashboardData.quickStats.resolutionRate : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {dashboardData?.quickStats?.resolutionRate ? 100 - dashboardData.quickStats.resolutionRate : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unique Dealers</span>
                    <span className="text-sm text-gray-600">{dashboardData?.quickStats?.uniqueDealerCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unique Orders</span>
                    <span className="text-sm text-gray-600">{statsData?.summary?.uniqueOrderCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Violations per Order</span>
                    <span className="text-sm text-gray-600">{statsData?.summary?.avgViolationsPerOrder?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Violations per Dealer</span>
                    <span className="text-sm text-gray-600">{statsData?.summary?.avgViolationsPerDealer?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unresolved Violations</span>
                    <span className="text-sm text-gray-600">{dashboardData?.quickStats?.unresolvedViolations || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Violators */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Violating Dealers</CardTitle>
              <CardDescription>Dealers with the highest number of SLA violations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="ml-2">Loading top violators...</span>
                </div>
              ) : topViolators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No top violators data available
                </div>
              ) : (
                <div className="space-y-4">
                  {topViolators.slice(0, 5).map((violator, index) => (
                    <div key={violator.dealerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {violator.dealerInfo?.trade_name || "Unknown Dealer"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {violator.stats?.totalViolations || 0} violations
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {violator.stats?.avgViolationMinutes || 0}m avg
                        </div>
                        <div className="text-xs text-gray-500">
                          {statsData?.data?.[index]?.violationRate || 0}% violation rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla-violations" className="space-y-6">
          <SLAViolationsDashboard />
        </TabsContent>
      </Tabs>

      {/* Disable Dealer Modal */}
      <Dialog open={showDisableModal} onOpenChange={setShowDisableModal}>
        <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
             <DialogTitle>Disable Dealer</DialogTitle>
             <DialogDescription>
               Are you sure you want to disable {selectedDealer?.dealerInfo?.trade_name || "Unknown Dealer"}? 
               This action cannot be undone.
             </DialogDescription>
           </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Disable</Label>
              <Input
                id="reason"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Enter reason for disabling dealer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={disableNotes}
                onChange={(e) => setDisableNotes(e.target.value)}
                placeholder="Additional notes or context"
                rows={3}
              />
            </div>
                         {selectedDealer && (
               <div className="bg-gray-50 p-3 rounded-lg">
                 <h4 className="font-medium text-sm mb-2">Dealer Information</h4>
                 <div className="text-sm text-gray-600 space-y-1">
                   <div><strong>Name:</strong> {selectedDealer.dealerInfo?.trade_name || "Unknown Dealer"}</div>
                   <div><strong>Total Violations:</strong> {selectedDealer.violationStats?.totalViolations || 0}</div>
                   <div><strong>Risk Level:</strong> {selectedDealer.riskLevel || "Unknown"}</div>
                   <div><strong>Unresolved:</strong> {selectedDealer.violationStats?.unresolvedViolations || 0}</div>
                 </div>
               </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisableDealer}
              disabled={!disableReason.trim()}
            >
              Disable Dealer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Create Manual Violation Modal */}
      <Dialog open={showCreateViolationModal} onOpenChange={(open) => {
        setShowCreateViolationModal(open);
        if (!open) {
          resetCreateViolationForm();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Manual SLA Violation</DialogTitle>
            <DialogDescription>
              Manually create an SLA violation for a specific dealer and order
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dealer-select">Select Dealer *</Label>
                <Select
                  value={createViolationData.dealer_id}
                  onValueChange={(value) => setCreateViolationData(prev => ({ ...prev, dealer_id: value }))}
                  disabled={dealersLoading}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue placeholder={dealersLoading ? "Loading dealers..." : "Search and select dealer"} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search dealers..."
                        value={dealerSearchQuery}
                        onChange={(e) => setDealerSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredDealers.length > 0 ? (
                      filteredDealers.map((dealer) => (
                        <SelectItem key={dealer._id} value={dealer._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{dealer.trade_name || dealer.legal_name}</span>
                            <span className="text-xs text-gray-500">ID: {dealer._id}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      !dealersLoading && (
                        <SelectItem value="no-dealers" disabled>
                          No dealers found
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-select">Select Order *</Label>
                <Select
                  value={createViolationData.order_id}
                  onValueChange={(value) => setCreateViolationData(prev => ({ ...prev, order_id: value }))}
                  disabled={ordersLoading}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue placeholder={ordersLoading ? "Loading orders..." : "Search and select order"} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search orders..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <SelectItem key={order._id} value={order._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">Order #{order.orderNumber || order._id}</span>
                            <span className="text-xs text-gray-500">
                              {order.customerName ? `Customer: ${order.customerName}` : `ID: ${order._id}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      !ordersLoading && (
                        <SelectItem value="no-orders" disabled>
                          No orders found
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expected-time">Expected Fulfillment Time *</Label>
                <Input
                  id="expected-time"
                  type="datetime-local"
                  value={createViolationData.expected_fulfillment_time}
                  onChange={(e) => setCreateViolationData(prev => ({ ...prev, expected_fulfillment_time: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="actual-time">Actual Fulfillment Time *</Label>
                <Input
                  id="actual-time"
                  type="datetime-local"
                  value={createViolationData.actual_fulfillment_time}
                  onChange={(e) => setCreateViolationData(prev => ({ ...prev, actual_fulfillment_time: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="violation-minutes">Violation Minutes *</Label>
              <Input
                id="violation-minutes"
                type="number"
                value={createViolationData.violation_minutes}
                onChange={(e) => setCreateViolationData(prev => ({ ...prev, violation_minutes: parseInt(e.target.value) || 0 }))}
                placeholder="Enter violation minutes"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes *</Label>
              <Textarea
                id="notes"
                value={createViolationData.notes}
                onChange={(e) => setCreateViolationData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter violation notes"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="contact-dealer"
                checked={createViolationData.contact_dealer}
                onChange={(e) => setCreateViolationData(prev => ({ ...prev, contact_dealer: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="contact-dealer">Contact dealer about this violation</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateViolationModal(false);
              resetCreateViolationForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateManualViolation}
              disabled={actionLoading || !createViolationData.dealer_id || !createViolationData.order_id || !createViolationData.expected_fulfillment_time || !createViolationData.actual_fulfillment_time || !createViolationData.notes}
            >
              {actionLoading ? "Creating..." : "Create Violation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter SLA Violations</DialogTitle>
            <DialogDescription>
              Apply filters to narrow down the results
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="risk-filter">Risk Level</Label>
              <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="violations-filter">Violations Count</Label>
              <Select value={filterViolations} onValueChange={setFilterViolations}>
                <SelectTrigger>
                  <SelectValue placeholder="Select violations range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Violations</SelectItem>
                  <SelectItem value="high">High (10+)</SelectItem>
                  <SelectItem value="medium">Medium (5-9)</SelectItem>
                  <SelectItem value="low">Low (0-4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setFilterStatus("all");
              setFilterRiskLevel("all");
              setFilterViolations("all");
            }}>
              Clear Filters
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dealer Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact Dealer About SLA Violation</DialogTitle>
            <DialogDescription>
              Send a notification to the dealer about their SLA violation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-method">Contact Method</Label>
              <Select value={contactMethod} onValueChange={(value: "notification" | "email" | "phone") => setContactMethod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="custom-message">Custom Message</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message to the dealer"
                rows={3}
              />
            </div>
              </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleContactDealer}
              disabled={actionLoading || !customMessage.trim()}
            >
              {actionLoading ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Violation Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resolve SLA Violation</DialogTitle>
            <DialogDescription>
              Mark this SLA violation as resolved and add resolution notes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resolution-notes">Resolution Notes</Label>
              <Textarea
                id="resolution-notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter resolution notes..."
                rows={3}
              />
            </div>
            <p className="text-sm text-gray-600">
              This action will mark the violation as resolved and update the dealer's violation status.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolveViolation}
              disabled={actionLoading || !resolutionNotes.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Resolving..." : "Resolve Violation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Violation Summary Modal */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Dealer Violation Summary</DialogTitle>
            <DialogDescription>
              Detailed summary of SLA violations for the selected dealer
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {actionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading summary...</span>
              </div>
            ) : summaryData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Violations</p>
                    <p className="text-2xl font-bold text-red-600">{summaryData.totalViolations || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Resolved Violations</p>
                    <p className="text-2xl font-bold text-green-600">{summaryData.resolvedViolations || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Unresolved Violations</p>
                    <p className="text-2xl font-bold text-orange-600">{summaryData.unresolvedViolations || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Average Resolution Time</p>
                    <p className="text-2xl font-bold text-blue-600">{summaryData.avgResolutionTime || "N/A"}</p>
                  </div>
                </div>
                {summaryData.violations && summaryData.violations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Violations</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {summaryData.violations.map((violation: any, index: number) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          <p><strong>Date:</strong> {violation.date}</p>
                          <p><strong>Type:</strong> {violation.type}</p>
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              violation.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {violation.status}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No summary data available</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSummaryModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

