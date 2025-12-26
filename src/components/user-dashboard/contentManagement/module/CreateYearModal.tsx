"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { createYear } from "@/service/product-Service";

interface CreateYearModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function CreateYearModal({ open, onClose, onSuccess }: CreateYearModalProps) {
  const [yearName, setYearName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useGlobalToast();

  const currentYear = new Date().getFullYear();
  const minAllowedYear = currentYear - 35;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setYearName("");
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

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
      const response = await createYear({ year_name: yearNumber.toString() });
      
      if (response && response.success) {
        showToast("Year created successfully", "success");
        onSuccess?.();
        onClose();
        setYearName("");
      } else {
        throw new Error(response?.message || "Failed to create year");
      }
    } catch (error: any) {
      console.error("Error creating year:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create year";
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setYearName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Year</DialogTitle>
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
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !yearName.trim() || !!error}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateYearModal;