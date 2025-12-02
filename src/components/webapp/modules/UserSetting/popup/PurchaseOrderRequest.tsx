// components/profile/PurchaseOrderDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { PurchaseOrder } from "@/types/Ticket-types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder?: Partial<PurchaseOrder> | null;
}

export default function PurchaseOrderDialog({
  isOpen,
  onClose,
  purchaseOrder = null,
}: Props) {
  const [data, setData] = useState<Partial<PurchaseOrder> | null>(purchaseOrder);
  const [loading] = useState(false);

  useEffect(() => {
    if (isOpen) setData(purchaseOrder ?? null);
    console.log("purchaseOrder", purchaseOrder);
  }, [isOpen, purchaseOrder]);

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-semibold">
                { "Purchase Order Request"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ID:{(data?._id) ?? "—"}
              </p>
            </div>
         
          </div>
        </DialogHeader>

        <div className="mt-3">
          {loading ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : !data ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No details available.</div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground">Status</h4>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    (data.status || "").toString().toLowerCase() === "pending-review"
                      ? "bg-yellow-100 text-yellow-800"
                      : (data.status || "").toString().toLowerCase() === "approved"
                      ? "bg-green-100 text-green-800"
                      : (data.status || "").toString().toLowerCase() === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {(data.status || "unknown").toString()}
                  </span>
                </div>
              </div>

              {data.description && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Description</h4>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {data.description}
                  </p>
                </div>
              )}

              {(data.status || "").toString().toLowerCase() === "rejected" && data.rejection_reason && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Rejection Reason</h4>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {data.rejection_reason}
                  </p>
                </div>
              )}

              {/* Render request files (images) */}
              {Array.isArray(data.req_files) && data.req_files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Requested Files</h4>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {data.req_files.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-md overflow-hidden border border-border p-1 bg-background"
                        title={`Open file ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`file-${idx}`}
                          className="w-full h-28 object-contain bg-white"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <div className="text-xs">Created</div>
                  <div className="mt-1 text-foreground">
                    {data.createdAt ? new Date(data.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs">Last updated</div>
                  <div className="mt-1 text-foreground">
                    {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
