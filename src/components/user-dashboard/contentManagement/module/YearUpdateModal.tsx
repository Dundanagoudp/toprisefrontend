"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";

interface YearUpdateModalProps {
  open: boolean;
  year?: { _id?: string; year_name?: string } | null;
  onClose: () => void;
  onSubmit: (yearName: string) => Promise<void>;
}

export default function YearUpdateModal({ open, year, onClose, onSubmit }: YearUpdateModalProps) {
  const [yearName, setYearName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useGlobalToast();

  useEffect(() => {
    if (open) {
      setYearName(year?.year_name ?? "");
    }
  }, [open, year]);

  const resetAndClose = () => {
    setYearName("");
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = yearName.trim();
    if (!trimmed) {
      showToast("Year name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(trimmed);
      resetAndClose();
    } catch (error) {
      console.error("Failed to update year:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen && !submitting ? resetAndClose() : null)}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Year</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor="year_name">Year*</Label>
          <Input
            id="year_name"
            value={yearName}
            onChange={(event) => setYearName(event.target.value)}
            placeholder="Enter year  "
            disabled={submitting}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={resetAndClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
