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
import { useAppSelector } from "@/store/hooks";
import { getUserProfile } from "@/service/user/userService";
import { UserAddress, UserProfile } from "@/service/user/userService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Optional handler called with form data when user submits.
   * Return false to keep dialog open, true/undefined to close.
   */
  onSubmit?: (payload: { files: File[]; description: string; vehicleDetails: string }) => Promise<boolean | void> | boolean | void;
};

export default function PurchaseOrderDialog({ isOpen, onClose, onSubmit }: Props) {
  const { showToast } = useToast();
  const userId = useAppSelector((state) => state.auth.user?._id);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState<string>("");
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      getUserProfile(userId).then((res) => {
        if (res.success && res.data) {
          setUserInfo(res.data);
          setSavedAddresses(res.data.address || []);
        }
      }).catch(console.error);
    }
    if (!isOpen) {
      setFiles([]);
      setDescription("");
      setAddress("");
      setPincode("");
      setVehicleDetails("");
      setPreviews([]);
      setSubmitting(false);
      setUserInfo(null);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    // create previews
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleFiles = (fList: FileList | null) => {
    if (!fList) return;
    const maxSize = 1024 * 1024; // 1MB in bytes
    const arr = Array.from(fList);
    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    arr.forEach((file) => {
      if (file.size > maxSize) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      showToast(`File(s) exceed 1MB limit: ${oversizedFiles.join(", ")}`, "error");
    }

    // Append new files to existing ones, but limit total to 6
    setFiles((prevFiles) => {
      const combined = [...prevFiles, ...validFiles];
      const uniqueFiles = combined.filter((file, index, self) => 
        index === self.findIndex((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
      );
      return uniqueFiles.slice(0, 6);
    });
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value so the same files can be selected again if needed
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddressSelect = (idx: string) => {
    const addr = savedAddresses[parseInt(idx)];
    if (addr) {
      const addrStr = `${addr.street || ""}${addr.city ? ", " + addr.city : ""}${addr.state ? ", " + addr.state : ""}`.trim();
      setAddress(addrStr);
      setPincode(addr.pincode || "");
    }
  };

  const handleSubmit = async () => {
    // if (files.length === 0) {
    //   alert("Please upload at least one image.");
    //   return;
    // }
    if (!userId || !userInfo) {
      alert("User not authenticated. Please log in again.");
      return;
    }
    if (!address || !pincode) {
      alert("Please enter address and pincode.");
      return;
    }
    const email = userInfo.email || "";
    const phone = userInfo.phone_Number || "";
    const name = userInfo.username || "";
    setSubmitting(true);
    try {
      await uploadPurchaseOrder(files, description, vehicleDetails, userId, name, email, phone, address, pincode);
      
      showToast("Purchase order uploaded successfully", "success");
      const result = onSubmit ? await onSubmit({ files, description , vehicleDetails }) : undefined;

      if (result === false) {
        setSubmitting(false);
        return;
      }
      onClose();
    } catch (err) {
      console.error("Submit failed:", err);
      showToast("Failed to upload purchase request. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex items-start justify-between shrink-0">
          <div>
            <DialogTitle className="text-lg font-semibold">Upload Purchase Request</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Attach photos of the purchase order and add a brief note.</p>
          </div>
    
        </DialogHeader>

        <div className="mt-4 space-y-4 overflow-y-auto flex-1 min-h-0 pr-2">
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
            <div className="text-sm text-muted-foreground">Click to upload (max 1MB per file)</div>
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

          {/* Address Selection */}
          {savedAddresses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Saved Address</label>
              <Select onValueChange={handleAddressSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an address" />
                </SelectTrigger>
                <SelectContent>
                  {savedAddresses.map((addr, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {addr.nick_name || `${addr.street || ""}, ${addr.city || ""}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter address"
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full rounded-lg border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter pincode"
            />
          </div>
            {/* Vehicle Details */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Vehicle Details * <span className="text-xs text-muted-foreground font-normal">(Max 50 words)</span>
            </label>
            <input
              type="text"
              value={vehicleDetails}
              onChange={(e) => {
                const val = e.target.value;
                const wordCount = val.trim() ? val.trim().split(/\s+/).length : 0;
                if (wordCount <= 50) {
                  setVehicleDetails(val);
                }
              }}
              className="w-full rounded-lg border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter vehicle details such as brand, model, year etc."
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Brief about the purchase request</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Add any details that would help"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button className="bg-red-600 text-white" onClick={handleSubmit} disabled={submitting || !vehicleDetails.trim() || !description.trim()}>
            {submitting ? "Submitting..." : "Upload Purchase Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
