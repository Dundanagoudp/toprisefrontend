import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Upload, Package } from "lucide-react";
import { completeInspection } from "@/service/return-service";
import { ReturnRequest } from "@/types/return-Types";
import { useAppSelector } from "@/store/hooks";

interface CompleteInspectionDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (success: boolean) => void;
  returnId: string | null;
  returnRequest?: ReturnRequest | null;
}

const schema = z.object({
  condition: z.string().min(1, "Condition is required"),
  remarks: z.string().min(1, "Remarks are required"),
  skuMatch: z.boolean(),
  isApproved: z.boolean(),
  inspectionImages: z.array(z.string()).optional(),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (!data.isApproved && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: "Rejection reason is required when not approved",
  path: ["rejectionReason"],
});

type FormValues = z.infer<typeof schema>;

export default function CompleteInspectionDialog({ 
  open, 
  onClose, 
  onComplete, 
  returnId, 
  returnRequest 
}: CompleteInspectionDialogProps) {
  const { showToast } = useGlobalToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userId = useAppSelector((state) => state.auth.user._id);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      condition: "",
      remarks: "",
      skuMatch: true,
      isApproved: true,
      inspectionImages: [],
      rejectionReason: "",
    },
  });

  const isApproved = watch("isApproved");

  // File to Base64 conversion
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const base64Images: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validation
        if (!file.type.startsWith("image/")) {
          showToast(`File ${file.name} is not an image`, "error");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          showToast(`File ${file.name} exceeds 5MB limit`, "error");
          continue;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);
        base64Images.push(base64);
      }

      const newImages = [...uploadedImages, ...base64Images];
      setUploadedImages(newImages);
      setValue("inspectionImages", newImages);

      showToast(`${base64Images.length} image(s) uploaded successfully`, "success");
    } catch (error) {
      showToast("Failed to upload images", "error");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue("inspectionImages", newImages);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setUploadedImages([]);
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    if (!returnId) {
      showToast("Return ID is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const isSuperAdmin = userRole === "Super-admin";

      // Create request body matching the API requirements
      const requestBody: any = {
        inspectedBy: userId,
        condition: data.condition,
        remarks: data.remarks,
        skuMatch: data.skuMatch,
        isApproved: data.isApproved,
        isSuperAdmin: isSuperAdmin,
      };

      // Add optional fields
      if (data.inspectionImages && data.inspectionImages.length > 0) {
        requestBody.inspectionImages = data.inspectionImages;
      }

      if (!data.isApproved && data.rejectionReason) {
        requestBody.rejectionReason = data.rejectionReason;
      }

      console.log("Complete Inspection payload:", requestBody);

      const response = await completeInspection(returnId, requestBody);
      
      if (response.success) {
        showToast("Inspection completed successfully", "success");
        onComplete?.(true);
        onClose();
        reset();
      } else {
        showToast(response.message || "Failed to complete inspection", "error");
        onComplete?.(false);
      }
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to complete inspection";
      showToast(errorMessage, "error");
      onComplete?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Complete Product Inspection
          </DialogTitle>
          <DialogDescription>
            Complete the inspection by providing condition details and uploading images.
            {returnRequest?.sku && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <span className="text-sm font-medium text-blue-900">
                  SKU: <span className="font-mono">{returnRequest.sku}</span>
                </span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Condition Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Condition <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) => setValue("condition", value)}
                  value={watch("condition")}
                >
                  <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2">
                    <SelectValue placeholder="Select product condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <span className="text-xs text-red-500 mt-1">{errors.condition.message}</span>
                )}
              </div>

              {/* SKU Match Checkbox */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded">
                  <Checkbox
                    id="skuMatch"
                    checked={watch("skuMatch")}
                    onCheckedChange={(checked) => setValue("skuMatch", Boolean(checked))}
                  />
                  <label htmlFor="skuMatch" className="text-sm font-medium text-gray-700 cursor-pointer">
                    SKU matches the product received
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Remarks <span className="text-red-500">*</span>
                </label>
                <Textarea
                  {...register("remarks")}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                  placeholder="Enter detailed remarks about the inspection"
                  rows={3}
                />
                {errors.remarks && (
                  <span className="text-xs text-red-500 mt-1">{errors.remarks.message}</span>
                )}
              </div>

              {/* Inspection Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Images
                </label>
                <div className="mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <DynamicButton
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 h-10 border-dashed border-2 border-gray-300 hover:border-gray-400"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Images (Max 5MB each)
                  </DynamicButton>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Inspection ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {uploadedImages.length} image(s) uploaded
                  </p>
                )}
              </div>

              {/* Approval Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Status
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded">
                  <Checkbox
                    id="isApproved"
                    checked={watch("isApproved")}
                    onCheckedChange={(checked) => setValue("isApproved", Boolean(checked))}
                  />
                  <label htmlFor="isApproved" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Approve this return request
                  </label>
                </div>
              </div>

              {/* Rejection Reason (conditional) */}
              {!isApproved && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    {...register("rejectionReason")}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                    placeholder="Provide a detailed reason for rejection"
                    rows={3}
                  />
                  {errors.rejectionReason && (
                    <span className="text-xs text-red-500 mt-1">{errors.rejectionReason.message}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <DynamicButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </DynamicButton>
            <DynamicButton
              type="submit"
              loading={isSubmitting}
              loadingText="Completing Inspection..."
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Complete Inspection
            </DynamicButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
