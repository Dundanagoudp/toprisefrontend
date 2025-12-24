"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, XCircle, Clock, AlertTriangle, Package, Search, Truck, Eye, FileCheck, IndianRupee } from "lucide-react";
import { getReturnRequests } from "@/service/product-Service";
import type { ReturnRequest, ReturnRequestsResponse } from "@/types/User/retrurn-Types";


interface ReturnStatusTimelineProps {
  returnRequest: ReturnRequest;
}

function ReturnStatusTimeline({ returnRequest }: ReturnStatusTimelineProps) {
  const allTimelineSteps = [
    {
      label: "Return Requested",
      timestamp: returnRequest.timestamps?.requestedAt || returnRequest.createdAt,
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: "Return Cancelled",
      timestamp: returnRequest.timestamps?.rejectedAt,
      icon: <XCircle className="h-4 w-4" />,
      isCancelled: true,
    },
    // {
    //   label: "Pickup Initiated",
    //   timestamp: returnRequest.timestamps?.borzoShipmentInitiatedAt,
    //   icon: <FileCheck className="h-4 w-4" />,
    // },
    // {
    //   label: "Request Validation",
    //   timestamp: returnRequest.timestamps?.validatedAt,
    //   icon: <FileCheck className="h-4 w-4" />,
    // },
    {
      label: "Pickup Scheduled",
      timestamp: returnRequest.timestamps?.borzoShipmentInitiatedAt,
      icon: <Truck className="h-4 w-4" />,
    },
    {
      label: "Out for Pickup ",
      timestamp: returnRequest.tracking_info?.courrier_departed,
      icon: <Truck className="h-4 w-4" />,
    },
    {
      label: "Pickup Completed",
      timestamp: returnRequest.pickupRequest?.completedDate,
      icon: <Truck className="h-4 w-4" />,
    },
    {
      label: "Inspection",
      timestamp: returnRequest.inspection?.inspectedAt,
      icon: <Search className="h-4 w-4" />,
      isCancelled: returnRequest.inspection?.isApproved === false,
    },
    {
      label: "Refund Processing",
      timestamp: returnRequest.refund?.refundStatus === "Processed"
        ? returnRequest.timestamps?.inspectionCompletedAt
        : undefined,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Refund Completed",
      timestamp: returnRequest.refund?.refundStatus === "Processed"
        ? returnRequest.timestamps?.refundCompletedAt
        : undefined,
      icon: <IndianRupee className="h-4 w-4" />,
    }
  ];

  const timelineSteps = allTimelineSteps
    .filter((step) => step.timestamp)
    .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());

  return (
    <div className="relative py-2">
      {timelineSteps.map((step, stepIndex) => (
        <div key={stepIndex} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Timeline line */}
          {stepIndex !== timelineSteps.length - 1 && (
            <div className={`absolute left-[15px] top-[32px] h-full w-[2px] ${
              step.isCancelled ? "bg-red-500" : "bg-green-500"
            }`} />
          )}

          {/* Icon */}
          <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
            step.isCancelled
              ? "border-red-500 bg-red-500"
              : "border-green-500 bg-green-500"
          } text-white`}>
            {step.icon}
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5">
            <h4 className={`text-sm font-medium mb-1 ${
              step.isCancelled ? "text-red-700" : "text-green-700"
            }`}>
              {step.label}
            </h4>
            <p className="text-xs text-muted-foreground">
              {new Date(step.timestamp!).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ReturnRequestListProps {
  userId: string;
}

function ReturnRequestList({ userId }: ReturnRequestListProps) {
  const [returnRequests, setReturnRequests] = useState<ReturnRequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReturnRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getReturnRequests(userId);
        setReturnRequests(response);
      } catch (err) {
        console.error("Error fetching return requests:", err);
        setError("Failed to load return requests");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchReturnRequests();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
        Loading return requests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!returnRequests || !returnRequests.data?.returnRequests?.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
        No return requests found
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Requested":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Validated":
        return "success";
      case "Rejected":
        return "destructive";
      case "Requested":
        return "success";
      default:
        return "outline";
    }
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case "Processed":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "Failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <ScrollArea className="h-[80vh]">
      <Accordion type="multiple" className="w-full space-y-4">
        {returnRequests.data.returnRequests.map((req: ReturnRequest) => (
          console.log("Return Request:", req),
          <AccordionItem
            key={req._id}
            value={req._id}
            className="border border-border bg-card rounded-lg px-4 max-sm:px-3"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex justify-between items-start w-full mr-4 gap-3 max-sm:flex-col max-sm:items-start">
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold max-sm:text-base max-sm:line-clamp-2">
                    {req.productDetails?.productName || `Product ${req.sku}`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-sm:text-xs">
                    SKU: {req.sku} • Qty: {req.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 max-sm:w-full max-sm:justify-start">
                  {getStatusIcon(req.returnStatus || "Requested")}
                  <Badge
                    variant={getStatusVariant(req.returnStatus || "Requested") as any}
                    className={`max-sm:text-xs ${req.returnStatus === "Validated" ? "bg-green-500 text-white hover:bg-green-600" : ""}`}
                  >
                    { req.returnStatus || "Unknown"}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4">
              <div className="space-y-6">
              {/* Status Timeline */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-sm:p-3">
                <ReturnStatusTimeline returnRequest={req} />
              </div>

              <Separator />

              {/* Return Reason */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Return Reason</h4>
                <p className="text-sm text-muted-foreground">{req.returnReason}</p>
                {req.returnDescription && (
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    {req.returnDescription}
                  </p>
                )}
              </div>

              {/* Eligibility Status */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${req.isEligible ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {req.isEligible ? 'Eligible for return' : 'Not eligible for return'}
                </span>
              </div>
              {!req.isEligible && req.eligibilityReason && (
                <p className="text-xs text-red-600 ml-4">{req.eligibilityReason}</p>
              )}

              {/* Refund Information */}
              {req.refund && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200 dark:border-green-800 max-sm:p-3">
                  <div className="flex justify-between items-center mb-3 max-sm:flex-col max-sm:items-start max-sm:gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Refund Amount</span>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1 max-sm:text-xl">
                        ₹{req.refund.refundAmount?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <Badge className={`${
                      req.refund.refundStatus === 'Processed' ? 'bg-green-600' :
                      req.refund.refundStatus === 'Pending' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    } text-white flex-shrink-0`}>
                      {req.refund.refundStatus || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">Method:</span>
                    <span>{req.refund.refundMethod || 'Original Payment Method'}</span>
                  </div>
                </div>
              )}

              {/* Action Taken */}
              {req.actionTaken && (
                <div className="text-sm">
                  <span className="font-medium">Action Taken:</span> {req.actionTaken}
                </div>
              )}

              {/* Inspection Status */}
              {/* {req.inspection && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 max-sm:p-3">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Inspection Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3 max-sm:grid-cols-1 max-sm:gap-2">
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-md">
                      <div className={`h-2 w-2 rounded-full ${req.inspection.skuMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="text-xs text-muted-foreground">SKU Match</div>
                        <div className={`text-sm font-medium ${req.inspection.skuMatch ? 'text-green-600' : 'text-red-600'}`}>
                          {req.inspection.skuMatch ? 'Verified' : 'Mismatch'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-md">
                      <div className={`h-2 w-2 rounded-full ${req.inspection.isApproved ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className={`text-sm font-medium ${req.inspection.isApproved ? 'text-green-600' : 'text-red-600'}`}>
                          {req.inspection.isApproved ? 'Approved' : 'Rejected'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {req.inspection.condition && (
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-md mb-2">
                      <span className="text-xs text-muted-foreground">Condition:</span>
                      <span className="text-sm font-medium ml-2">{req.inspection.condition}</span>
                    </div>
                  )}
                  {req.inspection.inspectedByUser && (
                    <p className="text-xs text-muted-foreground">
                      Inspected by: <span className="font-medium">{req.inspection.inspectedByUser.name}</span>
                    </p>
                  )}
                </div>
              )} */}

              {/* Return Images */}
              {req.returnImages && req.returnImages.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Return Images</h4>
                    <div className="flex flex-wrap gap-2">
                      {req.returnImages.slice(0, 4).map((img: string, i: number) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Return image ${i + 1}`}
                          className="h-16 w-16 rounded-md object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                      {req.returnImages.length > 4 && (
                        <div className="h-16 w-16 rounded-md bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground">
                          +{req.returnImages.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps and Status */}
              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>
                    <br />
                    {req.timestamps?.requestedAt
                      ? new Date(req.timestamps.requestedAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                  {/* <div>
                    <span className="text-muted-foreground">Days Since Request:</span>
                    <br />
                    {req.daysSinceRequest || 0} days
                  </div> */}
                  {req.isOverdue && (
                    <div className="col-span-2">
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Pickup Information */}
                {req.pickupRequest && (
                  <div className="mt-3 bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800 max-sm:p-3">
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Pickup Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1 max-sm:gap-2">
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Pickup ID</div>
                        <div className="text-sm font-mono font-medium">{req.pickupRequest.pickupId}</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Partner</div>
                        <div className="text-sm font-medium">{req.pickupRequest.logisticsPartner || 'N/A'}</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Scheduled</div>
                        <div className="text-sm font-medium">
                          {req.pickupRequest.scheduledDate
                            ? new Date(req.pickupRequest.scheduledDate).toLocaleDateString()
                            : 'Not scheduled'}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Completed</div>
                        <div className={`text-sm font-medium ${req.pickupRequest.completedDate ? 'text-green-600' : 'text-yellow-600'}`}>
                          {req.pickupRequest.completedDate
                            ? new Date(req.pickupRequest.completedDate).toLocaleDateString()
                            : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
}

export default ReturnRequestList;
