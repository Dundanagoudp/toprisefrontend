"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { getReturnRequests } from "@/service/product-Service";
import type { ReturnRequest, ReturnRequestsResponse } from "@/types/User/retrurn-Types";

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
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
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
          <AccordionItem
            key={req._id}
            value={req._id}
            className="border border-border bg-card rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex justify-between items-start w-full mr-4">
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold">
                    {req.productDetails?.productName || `Product ${req.sku}`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    SKU: {req.sku} • Qty: {req.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(req.returnStatus || "Requested")}
                  <Badge variant={getStatusVariant(req.returnStatus || "Requested") as any}>
                    {req.statusDisplay || req.returnStatus || "Unknown"}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4">
              <div className="space-y-4">
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
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Refund Amount</span>
                    <span className="text-lg font-bold text-primary">
                      ₹{req.refund.refundAmount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Method: {req.refund.refundMethod || 'N/A'}</span>
                    <span className={getRefundStatusColor(req.refund.refundStatus || 'Unknown')}>
                      Status: {req.refund.refundStatus || 'Unknown'}
                    </span>
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
              {req.inspection && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Inspection Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">SKU Match:</span>{" "}
                      <span className={req.inspection.skuMatch ? 'text-green-600' : 'text-red-600'}>
                        {req.inspection.skuMatch ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Approved:</span>{" "}
                      <span className={req.inspection.isApproved ? 'text-green-600' : 'text-red-600'}>
                        {req.inspection.isApproved ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {req.inspection.condition && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Condition:</span> {req.inspection.condition}
                      </div>
                    )}
                  </div>
                  {req.inspection.inspectedByUser && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Inspected by: {req.inspection.inspectedByUser.name}
                    </p>
                  )}
                </div>
              )}

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
                  <div>
                    <span className="text-muted-foreground">Days Since Request:</span>
                    <br />
                    {req.daysSinceRequest || 0} days
                  </div>
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
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Pickup Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Pickup ID:</span>
                        <br />
                        {req.pickupRequest.pickupId}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Partner:</span>
                        <br />
                        {req.pickupRequest.logisticsPartner || 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Scheduled:</span>
                        <br />
                        {req.pickupRequest.scheduledDate
                          ? new Date(req.pickupRequest.scheduledDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <br />
                        {req.pickupRequest.completedDate
                          ? new Date(req.pickupRequest.completedDate).toLocaleDateString()
                          : 'Pending'}
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
