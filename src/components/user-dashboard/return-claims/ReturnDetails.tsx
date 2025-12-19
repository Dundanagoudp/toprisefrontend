"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchEmployeeByUserId, getOrderById } from "@/service/order-service";
import { getUserIdFromToken } from "@/utils/auth";
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  Edit,
  Truck,
  Package,
  DollarSign,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  FileText,
  Image,
  Download,
  MoreHorizontal,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Info,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getReturnRequestsById,
  startInspection,
  initiateBorzoPickup,
} from "@/service/return-service";
import { ReturnRequest } from "@/types/return-Types";
import ValidateReturnRequest from "./modules/modalpopus/Validate";
import SchedulePickupDialog from "./modules/modalpopus/SchedulePickupDialog";
import CompletePickupDialog from "./modules/modalpopus/CompletePickupDialog";
import InspectDialog from "./modules/modalpopus/inspectDialog";
import InitiateRefundForm from "./modules/modalpopus/InitiateReturn";
import CompleteInspectionDialog from "./modules/modalpopus/CompleteInspectionDialog";
import OnlineRefundDialog from "./modules/modalpopus/OnlineRefundDialog";
import CODRefundDialog from "./modules/modalpopus/CODRefundDialog";
import RejectReturnDialog from "./modules/modalpopus/RejectReturnDialog";
import { useAppSelector } from "@/store/hooks";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { useSelector } from "react-redux";

interface ReturnDetailsProps {
  returnId: string;
}

export default function ReturnDetails({ returnId }: ReturnDetailsProps) {
  const router = useRouter();
  const { updateLabel } = useBreadcrumb();
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(
    null
  );
  const userId = useAppSelector((state) => state.auth.user._id);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const breadcrumbUpdatedRef = useRef(false);

  // Dialog states
  const [validationDialog, setValidationDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [schedulePickupDialog, setSchedulePickupDialog] = useState(false);
  const [completePickupDialog, setCompletePickupDialog] = useState(false);
  const [inspectDialog, setInspectDialog] = useState(false);
  const [initiateRefundDialog, setInitiateRefundDialog] = useState(false);
  const [completeInspectionDialog, setCompleteInspectionDialog] =
    useState(false);
  const [onlineRefundDialog, setOnlineRefundDialog] = useState(false);
  const [manualRefundDialog, setManualRefundDialog] = useState(false);
  const [codRefundDialog, setCodRefundDialog] = useState(false);
  const [borzoConfirmDialog, setBorzoConfirmDialog] = useState<{
    open: boolean;
    returnId: string | null;
    securePackageAmount: string;
  }>({ open: false, returnId: null, securePackageAmount: "" });
  const [borzoLoading, setBorzoLoading] = useState(false);
  const { showToast } = useGlobalToast();

  // Image modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    fetchReturnDetails();
  }, [returnId]);

  // Image modal handlers
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        console.log("User ID:", userId);
        if (userId) {
          const response = await fetchEmployeeByUserId(userId);


          if (response) {
     
            setEmployeeId(response.employee._id);
          } else {
            console.error("Failed to get employee ID from response:", response);
          }
        } else {
          console.error("No user ID found in token");
        }
      } catch (error) {
        console.error("Failed to fetch employee ID:", error);
      }
    };
    fetchEmployee();
  }, []);

  const fetchReturnDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReturnRequestsById(returnId);
      console.log("Return details API response:", response);

      if (response.success && response.data) {
        // The API returns the return data directly in response.data
        console.log("Return data:", response.data);
        console.log("Return images:", response.data.returnImages);
        setReturnRequest(response.data);

        // Update breadcrumb with "Return Details" for the return ID segment
        if (!breadcrumbUpdatedRef.current) {
          updateLabel(returnId, "Return Details");
          breadcrumbUpdatedRef.current = true;
        }
      } else {
        console.error("API response failed:", response);
        setError("Failed to load return details");
      }
    } catch (error) {
      console.error("Error fetching return details:", error);
      setError("Failed to load return details");
    } finally {
      setLoading(false);
    }
  };

  // Borzo pickup handler
  const handleConfirmBorzo = async () => {
    if (!borzoConfirmDialog.returnId) return;

    setBorzoLoading(true);
    try {
      const response = await initiateBorzoPickup(borzoConfirmDialog.returnId, {
        securePackageAmount: parseFloat(borzoConfirmDialog.securePackageAmount) || 0
      });
      if (response.success) {
        showToast("Borzo pickup has been initiated successfully", "success");

        setBorzoConfirmDialog({ open: false, returnId: null, securePackageAmount: "" });
        fetchReturnDetails();
      } else {
        showToast("Failed to initiate Borzo pickup", "error");
      }
    } catch (error) {
      console.error("Error initiating Borzo pickup:", error);
      showToast("Failed to initiate Borzo pickup", "error");
    } finally {
      setBorzoLoading(false);
    }
  };

  // Start inspection handler
  const handleStartInspection = async () => {
    const isSuperAdmin = userRole === "Super-admin";

    if (!isSuperAdmin && !employeeId) {
      console.error(
        "Employee ID not available. Please ensure you are logged in."
      );
      alert(
        "Unable to start inspection: Employee ID not found. Please try refreshing the page or logging in again."
      );
      return;
    }

    setInspectionLoading(true);
    try {
      // Build request body based on user role
      const requestBody: any = {
        inspectedBy: userId,
        isSuperAdmin,
      };

      // Only add inspectedBy if not super admin
      if (!isSuperAdmin) {
        requestBody.inspectedBy = employeeId;
      }

      console.log("Calling startInspection API with:", {
        returnId,
        ...requestBody,
      });

      const response = await startInspection(returnId, requestBody);

      console.log("Start Inspection API response:", response);

      if (response.success) {
        console.log("Inspection started successfully, refreshing details...");
        await fetchReturnDetails();
        alert("Inspection started successfully!");
      } else {
        console.error("API returned success: false", response);
        alert(
          `Failed to start inspection: ${response.message || "Unknown error"}`
        );
      }
    } catch (error: any) {
      console.error("Failed to start inspection:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      alert(
        `Error starting inspection: ${
          error?.response?.data?.message || error?.message || "Unknown error"
        }`
      );
    } finally {
      setInspectionLoading(false);
    }
  };

  // complete inspection handler
  const handleCompleteInspection = () => {
    setCompleteInspectionDialog(true);
  };

  const handleRefund = async () => {
    if (!returnRequest) return;

    let paymentType = "";

    // Try to use paymentType already present on the order object
    if (
      returnRequest.orderId &&
      typeof returnRequest.orderId === "object" &&
      returnRequest.orderId !== null
    ) {
      paymentType = (returnRequest.orderId as any).paymentType || "";
    }

    // Fallback: fetch order to get paymentType
    if (!paymentType) {
      try {
        const orderId = (returnRequest.orderId as any)?._id || "";
        if (orderId) {
          const order = await getOrderById(orderId);
          paymentType = order.data?.paymentType || "";
        }
      } catch (error) {
        console.error("Failed to resolve payment type for refund:", error);
      }
    }

    if (paymentType === "Prepaid") {
      setOnlineRefundDialog(true);
      return;
    }

    setCodRefundDialog(true);
  };

  const handleOpenRejectReturn = () => {
    setRejectDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";

    switch (status) {
      case "Requested":
        return `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`;
      case "Validated":
        return `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`;
      case "Rejected":
        return `${baseClasses} text-red-600 bg-red-50 border-red-200`;
      case "Shipment_Intiated":
        return `${baseClasses} text-indigo-600 bg-indigo-50 border-indigo-200`;
      case "Shipment_Completed":
        return `${baseClasses} text-purple-600 bg-purple-50 border-purple-200`;
      case "Inspection_Started":
        return `${baseClasses} text-orange-600 bg-orange-50 border-orange-200`;
      case "Inspection_Completed":
        return `${baseClasses} text-cyan-600 bg-cyan-50 border-cyan-200`;
      case "Intiated_Refund":
        return `${baseClasses} text-pink-600 bg-pink-50 border-pink-200`;
      case "Refund_Completed":
        return `${baseClasses} text-emerald-600 bg-emerald-50 border-emerald-200`;
      case "Refund_Failed":
        return `${baseClasses} text-red-600 bg-red-50 border-red-200`;
      default:
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  // Helper function to format status display name
  const formatStatusName = (status: string) => {
    let formatted = status.replace(/_/g, " ");
    // Fix typo: "Intiated Refund" -> "Initiated Refund"
    if (formatted === "Intiated Refund") {
      formatted = "Initiated Refund";
    }
    return formatted;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Requested":
        return <Clock className="h-4 w-4" />;
      case "Validated":
        return <CheckCircle className="h-4 w-4" />;
      case "Approved":
        return <Check className="h-4 w-4" />;
      case "Rejected":
        return <X className="h-4 w-4" />;
      case "Pickup_Scheduled":
        return <Truck className="h-4 w-4" />;
      case "Pickup_Completed":
        return <Package className="h-4 w-4" />;
      case "Under_Inspection":
        return <Eye className="h-4 w-4" />;
      case "Refund_Processed":
        return <DollarSign className="h-4 w-4" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getAvailableActions = () => {
    if (!returnRequest) return [];

    const actions = [];

    switch (returnRequest.returnStatus) {
      case "Requested":
        actions.push({
          label: "Validate Return",
          icon: <CheckCircle className="h-4 w-4" />,
          onClick: () => setValidationDialog(true),
          variant: "default" as const,
        });
        actions.push({
          label: "Reject Return",
          icon: <X className="h-4 w-4" />,
          onClick: () => handleOpenRejectReturn(),
          variant: "destructive" as const,
        });
        break;
      case "Validated":
        actions.push({
          label: "Initiate Borzo Pickup",
          icon: <Truck className="h-4 w-4" />,
          onClick: () =>
            setBorzoConfirmDialog({ open: true, returnId: returnId, securePackageAmount: "" }),
          variant: "default" as const,
        });
        break;
      case "Pickup_Scheduled":
        actions.push({
          label: "Complete Pickup",
          icon: <Package className="h-4 w-4" />,
          onClick: () => setCompletePickupDialog(true),
          variant: "default" as const,
        });
        break;
      case "Pickup_Completed":
      case "Under_Inspection":
        actions.push({
          label: "Inspect Item",
          icon: <Eye className="h-4 w-4" />,
          onClick: () => setInspectDialog(true),
          variant: "default" as const,
        });
        break;
      case "Approved":
        actions.push({
          label: "Initiate Refund",
          icon: <DollarSign className="h-4 w-4" />,
          onClick: () => setInitiateRefundDialog(true),
          variant: "default" as const,
        });
        break;
    }

    return actions;
  };

  const isFullfillmentStaff = useSelector((state: any) => state.auth.user?.role === "Fulfillment-Staff");

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !returnRequest) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Return not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Return Details</h1>
            <p className="text-gray-600">Return ID: {returnRequest._id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {returnRequest.returnStatus === "Shipment_Intiated" && (
            <Badge className="px-3 py-2 bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Product should be delivered first for inspection
            </Badge>
          )}
          {returnRequest.returnStatus === "Shipment_Completed" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleStartInspection}
              disabled={inspectionLoading}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {inspectionLoading ? "Starting..." : "Start Inspection"}
            </Button>
          )}
          {returnRequest.returnStatus === "Inspection_Started" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCompleteInspection}
              disabled={inspectionLoading}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {inspectionLoading ? "Processing..." : "Complete Inspection"}
            </Button>
          )}
          
          {returnRequest.returnStatus === "Inspection_Completed" && !isFullfillmentStaff && (
            <Button
              variant="default"
              size="sm"
              onClick={handleRefund}
              disabled={inspectionLoading}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              {inspectionLoading ? "Processing..." : "Process Refund"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReturnDetails}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(returnRequest.returnStatus)}
              <div>
                <h3 className="font-semibold text-gray-900">Current Status</h3>
                <Badge className={getStatusBadge(returnRequest.returnStatus)}>
                  {formatStatusName(returnRequest.returnStatus)}
                </Badge>
              </div>
            </div>

            {availableActions.length > 0 && (
              <div className="flex gap-2">
                {availableActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    size="sm"
                    onClick={action.onClick}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              {/* <TabsTrigger value="actions">Actions</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        SKU
                      </label>
                      <p className="text-sm font-mono text-gray-900">
                        {returnRequest.sku}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Quantity
                      </label>
                      <p className="text-sm text-gray-900">
                        {returnRequest.quantity}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Return Reason
                      </label>
                      <p className="text-sm text-gray-900">
                        {returnRequest.returnReason}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Request Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDate(returnRequest.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Order ID
                      </label>
                      <p className="text-sm font-mono text-gray-900">
                        {returnRequest.orderId?.orderId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Order Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {returnRequest.orderId?.orderDate
                          ? formatDate(returnRequest.orderId.orderDate)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    
                    Refund Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Refund Amount
                      </label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(returnRequest.refund.refundAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Refund Method
                      </label>
                      <p className="text-sm text-gray-900">
                        {returnRequest.refund.refundMethod || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Refund Status
                      </label>
                      <Badge
                        className={getStatusBadge(
                          returnRequest.refund.refundStatus
                        )}
                      >
                        {returnRequest.refund.refundStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspection Information */}
              {returnRequest.inspection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    
                      Inspection Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Inspection Status
                        </label>
                        <Badge
                          className={
                            returnRequest.inspection.isApproved
                              ? "px-3 py-1 rounded-full text-xs font-medium border text-green-600 bg-green-50 border-green-200"
                              : "px-3 py-1 rounded-full text-xs font-medium border text-red-600 bg-red-50 border-red-200"
                          }
                        >
                          {returnRequest.inspection.isApproved
                            ? "Approved"
                            : "Rejected"}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          SKU Match
                        </label>
                        <Badge
                          className={
                            returnRequest.inspection.skuMatch
                              ? "px-3 py-1 rounded-full text-xs font-medium border text-green-600 bg-green-50 border-green-200"
                              : "px-3 py-1 rounded-full text-xs font-medium border text-red-600 bg-red-50 border-red-200"
                          }
                        >
                          {returnRequest.inspection.skuMatch
                            ? "Matched"
                            : "Not Matched"}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Condition
                        </label>
                        <p className="text-sm text-gray-900">
                          {returnRequest.inspection.condition || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Inspected At
                        </label>
                        <p className="text-sm text-gray-900">
                          {returnRequest.inspection?.inspectedAt
                            ? formatDate(returnRequest.inspection.inspectedAt)
                            : returnRequest.timestamps?.inspectionCompletedAt
                            ? formatDate(
                                returnRequest.timestamps.inspectionCompletedAt
                              )
                            : returnRequest.timestamps?.inspectionStartedAt
                            ? formatDate(
                                returnRequest.timestamps.inspectionStartedAt
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    {returnRequest.inspection.conditionNotes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Condition Notes
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {returnRequest.inspection.conditionNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Return Timeline</CardTitle>
                  <CardDescription>
                    Track the progress of this return request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Build timeline steps for the return process
                    const allTimelineSteps = [
                      {
                        label: "Return Requested",
                        timestamp: returnRequest.timestamps?.requestedAt || returnRequest.createdAt,
                        icon: <FileText className="h-4 w-4" />,
                      },
                      {
                        label: "Return Validated",
                        timestamp: returnRequest.timestamps?.validatedAt,
                        icon: <CheckCircle className="h-4 w-4" />,
                      },
                      {
                        label: "Pickup Initiated",
                        timestamp: returnRequest.timestamps?.borzoShipmentInitiatedAt,
                        icon: <Truck className="h-4 w-4" />,
                      },
                      {
                        label: "Pickup Completed",
                        timestamp: returnRequest.timestamps?.borzoShipmentCompletedAt,
                        icon: <Package className="h-4 w-4" />,
                      },
                      {
                        label: "Inspection Started",
                        timestamp: returnRequest.timestamps?.inspectionStartedAt,
                        icon: <Eye className="h-4 w-4" />,
                      },
                      {
                        label: "Inspection Completed",
                        timestamp: returnRequest.timestamps?.inspectionCompletedAt,
                        icon: returnRequest.inspection?.isApproved ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        ),
                        isCancelled: returnRequest.inspection?.isApproved === false,
                      },
                      {
                        label: "Refund Initiated",
                        timestamp: returnRequest.timestamps?.refundInitiatedAt,
                        icon: <DollarSign className="h-4 w-4" />,
                      },
                    ];

                    // Filter to only show steps that have timestamps and sort by timestamp
                    const timelineSteps = allTimelineSteps
                      .filter((step) => step.timestamp)
                      .sort(
                        (a, b) =>
                          new Date(a.timestamp).getTime() -
                          new Date(b.timestamp).getTime()
                      );

                    return (
                      <div className="space-y-6">
                        {timelineSteps.length > 0 ? (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="relative py-2">
                              {timelineSteps.map((step, stepIndex) => (
                                <div
                                  key={stepIndex}
                                  className="relative flex gap-4 pb-8 last:pb-0"
                                >
                                  {/* Timeline line */}
                                  {stepIndex !== timelineSteps.length - 1 && (
                                    <div
                                      className={`absolute left-[15px] top-[32px] h-full w-[2px] ${
                                        step.isCancelled
                                          ? "bg-red-500"
                                          : "bg-green-500"
                                      }`}
                                    />
                                  )}

                                  {/* Icon */}
                                  <div
                                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                                      step.isCancelled
                                        ? "border-red-500 bg-red-500"
                                        : "border-green-500 bg-green-500"
                                    } text-white`}
                                  >
                                    {step.icon}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 pt-0.5">
                                    <h4
                                      className={`text-sm font-medium mb-1 ${
                                        step.isCancelled
                                          ? "text-red-700"
                                          : "text-green-700"
                                      }`}
                                    >
                                      {step.label}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(step.timestamp).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>

                                    {/* Additional content for specific steps */}
                                    {step.label === "Pickup Initiated" && returnRequest.tracking_info?.borzo_tracking_url && (
                                      <div className="mt-2">
                                        <a
                                          href={returnRequest.tracking_info.borzo_tracking_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                          Track Return Shipment
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}

                                    {step.label === "Pickup Completed" && returnRequest.tracking_info?.borzo_order_id && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Tracking ID: {returnRequest.tracking_info.borzo_order_id}
                                      </p>
                                    )}

                                    {step.label === "Inspection Completed" && returnRequest.inspection?.conditionNotes && (
                                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                        <p className="font-medium text-gray-700">Notes:</p>
                                        <p className="text-gray-600">{returnRequest.inspection.conditionNotes}</p>
                                      </div>
                                    )}

                                    {step.label === "Refund Initiated" && (
                                      <>
                                        {returnRequest.refund?.refundAmount && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            Refund Amount: ₹{returnRequest.refund.refundAmount}
                                          </p>
                                        )}
                                        {returnRequest.refund?.expectedDate && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Expected by {new Date(returnRequest.refund.expectedDate).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </p>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No timeline information available
                          </p>
                        )}
                        {/* Current Status */}
                        {returnRequest.tracking_info?.status && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Current Status
                                </p>
                                <p className="text-lg font-semibold">
                                  {returnRequest.tracking_info.status}
                                </p>
                              </div>
                              {returnRequest.tracking_info?.borzo_last_updated && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    Last Updated
                                  </p>
                                  <p className="text-sm">
                                    {new Date(returnRequest.tracking_info.borzo_last_updated!).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Attachments</CardTitle>
                  <CardDescription>
                    Related documents and images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Debug Information */}

                  {returnRequest.returnImages &&
                  returnRequest.returnImages.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Found {returnRequest.returnImages.length} image(s)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {returnRequest.returnImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group cursor-pointer"
                            onClick={() => handleImageClick(img)}
                          >
                            <img
                              src={img}
                              alt={`Return image ${idx + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            <div className="absolute inset-0  group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2">
                                <Eye className="h-5 w-5 text-gray-800" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No return images attached</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Images uploaded by the customer will appear here
                      </p>
                    </div>
                  )}

                  {returnRequest.inspection?.inspectionImages &&
                    returnRequest.inspection.inspectionImages.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-medium text-gray-900 mb-4">
                          Inspection Images
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {returnRequest.inspection.inspectionImages.map(
                            (imageUrl, index) => (
                              <div
                                key={index}
                                className="relative group cursor-pointer"
                                onClick={() => handleImageClick(imageUrl)}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Inspection image ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                                <div className="absolute inset-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2">
                                    <Eye className="h-5 w-5 text-gray-800" />
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Actions</CardTitle>
                  <CardDescription>
                    Actions you can perform on this return
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {availableActions.length > 0 ? (
                    <div className="space-y-3">
                      {availableActions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant}
                          onClick={action.onClick}
                          className="w-full justify-start"
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No actions available for current status</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {returnRequest.orderId?.customerDetails?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {returnRequest.orderId?.customerDetails?.email || "N/A"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {returnRequest.orderId?.customerDetails?.phone || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {returnRequest.orderId?.customerDetails?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">
                    {returnRequest.orderId?.customerDetails?.address || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Information */}
          {returnRequest.pickupRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Pickup Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Pickup Address
                    </label>
                    <p className="text-sm text-gray-900">
                      {returnRequest.pickupRequest.pickupAddress
                        ? `${returnRequest.pickupRequest.pickupAddress.address}, ${returnRequest.pickupRequest.pickupAddress.city}, ${returnRequest.pickupRequest.pickupAddress.state} - ${returnRequest.pickupRequest.pickupAddress.pincode}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Scheduled Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {returnRequest.pickupRequest.scheduledDate
                        ? formatDate(returnRequest.pickupRequest.scheduledDate)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Logistics Partner
                    </label>
                    <p className="text-sm text-gray-900">
                      {returnRequest.pickupRequest.logisticsPartner || "N/A"}
                    </p>
                  </div>
                  {returnRequest.pickupRequest.trackingNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Tracking Number
                      </label>
                      <p className="text-sm font-mono text-gray-900">
                        {returnRequest.pickupRequest.trackingNumber}
                      </p>
                    </div>
                  )}
                  {returnRequest.pickupRequest.completedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Completed Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDate(returnRequest.pickupRequest.completedDate)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Pickup Status
                    </label>
                    <Badge
                      className={getStatusBadge(returnRequest.returnStatus)}
                    >
                      {returnRequest.returnStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Days Since Request
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.floor(
                    (Date.now() - new Date(returnRequest.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(returnRequest.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ValidateReturnRequest
        open={validationDialog}
        onClose={() => setValidationDialog(false)}
        onValidationComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setValidationDialog(false);
        }}
        returnId={returnId}
      />

      <RejectReturnDialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        onRejectComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setRejectDialog(false);
        }}
        returnId={returnId}
      />

      <Dialog
        open={borzoConfirmDialog.open}
        onOpenChange={(open) =>
          !borzoLoading &&
          setBorzoConfirmDialog({ ...borzoConfirmDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Borzo Pickup</DialogTitle>
            <DialogDescription>
              Enter the secure package amount and confirm to initiate Borzo pickup for this return request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label htmlFor="securePackageAmount" className="text-sm font-medium text-gray-700">
                Secure Package Amount (₹)
              </label>
              <Input
                id="securePackageAmount"
                type="number"
                placeholder="Enter amount"
                value={borzoConfirmDialog.securePackageAmount}
                onChange={(e) => setBorzoConfirmDialog({
                  ...borzoConfirmDialog,
                  securePackageAmount: e.target.value
                })}
                disabled={borzoLoading}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setBorzoConfirmDialog({ open: false, returnId: null, securePackageAmount: "" })
              }
              disabled={borzoLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBorzo}
              disabled={borzoLoading || !borzoConfirmDialog.securePackageAmount}
            >
              {borzoLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CompletePickupDialog
        open={completePickupDialog}
        onClose={() => setCompletePickupDialog(false)}
        onComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setCompletePickupDialog(false);
        }}
        returnId={returnId}
        returnRequest={returnRequest}
      />

      <InspectDialog
        open={inspectDialog}
        onClose={() => setInspectDialog(false)}
        onInspectComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setInspectDialog(false);
        }}
        returnId={returnId}
        returnStatus={returnRequest.returnStatus}
      />

      <InitiateRefundForm
        open={initiateRefundDialog}
        onClose={() => setInitiateRefundDialog(false)}
        returnId={returnId}
        onSubmit={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setInitiateRefundDialog(false);
        }}
      />

      <CompleteInspectionDialog
        open={completeInspectionDialog}
        onClose={() => setCompleteInspectionDialog(false)}
        onComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setCompleteInspectionDialog(false);
        }}
        returnId={returnId}
        returnRequest={returnRequest}
      />

      <OnlineRefundDialog
        open={onlineRefundDialog}
        onClose={() => setOnlineRefundDialog(false)}
        onComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setOnlineRefundDialog(false);
        }}
        returnId={returnId}
      />

      <CODRefundDialog
        open={codRefundDialog}
        onClose={() => setCodRefundDialog(false)}
        onComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setCodRefundDialog(false);
        }}
        returnId={returnId ?? undefined}
        returnRequest={returnRequest}
      />

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* <ManualRefundDialog
        open={manualRefundDialog}
        onClose={() => setManualRefundDialog(false)}
        onComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setManualRefundDialog(false);
        }}
        returnId={returnId}
        returnRequest={returnRequest}
      /> */}
    </div>
  );
}
