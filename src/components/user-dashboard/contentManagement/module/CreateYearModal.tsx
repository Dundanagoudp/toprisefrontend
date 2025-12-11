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
  const { showToast } = useGlobalToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setYearName("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const yearNameTrimmed = yearName.trim();
    
    if (!yearNameTrimmed) {
      showToast("Year name is required", "error");
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await createYear({ year_name: yearNameTrimmed });
      
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
            onChange={(event) => setYearName(event.target.value)}
            placeholder="Enter year (e.g., 2024)"
            disabled={submitting}
            type="number"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !submitting) {
                handleSubmit();
              }
            }}
          />
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
            disabled={submitting || !yearName.trim()}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateYearModal;