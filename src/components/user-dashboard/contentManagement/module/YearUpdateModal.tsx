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
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useGlobalToast();
  const currentYear = new Date().getFullYear();
  const minAllowedYear = currentYear - 35;
  useEffect(() => {
    if (open) {
      setYearName(year?.year_name ?? "");
    }
  }, [open, year]);

  const resetAndClose = () => {
    setYearName("");
    setSubmitting(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const yearNameTrimmed = yearName.trim();
    const yearNumber = parseInt(yearNameTrimmed, 10);

    if (!yearNameTrimmed) {
      showToast("Year name is required", "error");
      return;
    }

    if (isNaN(yearNumber)) {
      setError("Year must be a valid number");
      return;
    }

    if (yearNumber < minAllowedYear || yearNumber > currentYear) {
      setError(`Year must be between ${minAllowedYear} and ${currentYear}`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await onSubmit(yearNumber.toString());
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
            onChange={(event) => {
              const value = event.target.value;
              setYearName(value);
              // Clear error when user types
              if (error && value) setError(null);
            }}
            placeholder={`Enter year (${minAllowedYear}–${currentYear})`}
            disabled={submitting}
            type="number"
            min={minAllowedYear}
            max={currentYear}
            maxLength={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !submitting && !error) {
                handleSubmit();
              }
            }}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={resetAndClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !yearName.trim() || !!error}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
