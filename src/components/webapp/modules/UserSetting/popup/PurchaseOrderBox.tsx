"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from "lucide-react";
import { uploadPurchaseOrder } from "@/service/product-Service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  /**
   * Optional handler called with form data when user submits.
   * Return false to keep dialog open, true/undefined to close.
   */
  onSubmit?: (payload: { files: File[]; description: string }) => Promise<boolean | void> | boolean | void;
};

export default function PurchaseOrderDialog({ isOpen, onClose, userId, onSubmit }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // cleanup previews on close
    if (!isOpen) {
      setFiles([]);
      setDescription("");
      setPreviews([]);
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // create previews
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleFiles = (fList: FileList | null) => {
    if (!fList) return;
    const arr = Array.from(fList).slice(0, 6); // limit to 6 images
    setFiles(arr);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      // Call the API directly
      await uploadPurchaseOrder(files, description, userId);

      // Call the optional onSubmit handler for backward compatibility
      const result = onSubmit
        ? await onSubmit({ files, description })
        : undefined;

      // If handler returned false explicitly, keep dialog open
      if (result === false) {
        setSubmitting(false);
        return;
      }

      onClose();
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to upload purchase order. Please try again.");
      // keep dialog open for now
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl w-full">
        <DialogHeader className="flex items-start justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold">Upload Purchase Request</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Attach photos of the purchase order and add a brief note.</p>
          </div>
    
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Image upload area */}
          <div
            onClick={() => inputRef.current?.click()}
            className="min-h-[220px] rounded-lg border border-border/70 bg-white flex flex-col items-center justify-center cursor-pointer p-6 hover:shadow-sm transition"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFileInput}
            />
            <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
            <div className="text-sm text-muted-foreground">Click to upload (max 6 images)</div>
            {files.length > 0 && <div className="text-xs text-muted-foreground mt-1">{files.length} file(s) selected</div>}
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-6 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative rounded overflow-hidden border border-border/60">
                  <img src={src} alt={`preview-${idx}`} className="h-20 w-20 object-cover block" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white"
                    aria-label="remove image"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Brief about the purchase request</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Add any details that would help (optional)"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button className="bg-red-600 text-white" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Rise Purchase Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
