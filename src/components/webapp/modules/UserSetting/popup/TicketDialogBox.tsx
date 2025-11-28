// components/profile/TicketDetailsDialog.tsx
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
import { Ticket } from "@/types/Ticket-types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ticketId?: string | null; // kept for compatibility but not used for fetching
  ticket?: Partial<Ticket> | null; // preferred: pass the ticket object here
}

export default function TicketDetailsDialog({
  isOpen,
  onClose,
  ticketId,
  ticket,
}: Props) {
  const [data, setData] = useState<Partial<Ticket> | null>(ticket ?? null);
  const [loading] = useState<boolean>(false); // no network calls => no loading state change
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always prefer the ticket prop. Do NOT perform network fetches here.
    if (!isOpen) {
      // Clear state when closed to avoid stale content the next time it's opened
      setData(null);
      setError(null);
      return;
    }

    if (ticket) {
      setData(ticket);
      setError(null);
      return;
    }

    // No ticket prop provided — show a clear error instead of fetching.
    setData(null);
    setError("Ticket details not available.");
  }, [isOpen, ticket]);

  const createdAt = (data as any)?.created_at || (data as any)?.createdAt;
  const updatedAt = (data as any)?.updated_at || (data as any)?.updatedAt;

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-semibold">
                {"Ticket details"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ID:{ (data as any)?._id || ticketId || "—"}
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
          ) : error ? (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : !data ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No details available.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground">Status</h4>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      (data.status || "").toString().toLowerCase() === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : (data.status || "").toString().toLowerCase() === "closed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {(data.status || "unknown").toString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground">Description</h4>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {data.description || (data as any)?.body || "No description provided."}
                </p>
              </div>

              {data.admin_notes && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Admin Notes</h4>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {data.admin_notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <div className="text-xs">Created</div>
                  <div className="mt-1 text-foreground">
                    {createdAt ? new Date(createdAt).toLocaleString() : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs">Last updated</div>
                  <div className="mt-1 text-foreground">
                    {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              {Array.isArray((data as any)?.attachments) && (data as any).attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Attachments</h4>
                  <div className="mt-2 flex flex-col gap-2">
                    {(data as any).attachments.map((a: any, i: number) => (
                      <a
                        key={i}
                        href={a.url || a.path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary underline"
                      >
                        {a.name || a.filename || `Attachment ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            {/* <Button variant="ghost" onClick={onClose}>
              Close
            </Button> */}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
