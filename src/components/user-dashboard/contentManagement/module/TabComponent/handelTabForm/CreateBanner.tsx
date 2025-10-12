"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { createBanner } from "@/service/product-Service";
import { getBrands } from "@/service/product-Service";
import { Upload, X } from "lucide-react";

// Banner schema
const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  brand_id: z.string().min(1, "Brand is required"),
  vehicle_type: z.enum(["Car", "Bike", "CV", "All"], {
    errorMap: () => ({ message: "Vehicle type is required" }),
  }),
  is_active: z.boolean().default(true),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface CreateBannerProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateBanner({ open, onClose }: CreateBannerProps) {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [webImage, setWebImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [tabletImage, setTabletImage] = useState<File | null>(null);
  const [webPreview, setWebPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");
  const [tabletPreview, setTabletPreview] = useState<string>("");
  const { showToast } = useGlobalToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      brand_id: "",
      vehicle_type: "All",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (open) {
      fetchBrands();
    }
  }, [open]);

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      const response = await getBrands();
      setBrands(response.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      showToast("Failed to fetch brands", "error");
    } finally {
      setBrandsLoading(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "web" | "mobile" | "tablet"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("Please select a valid image file", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "web") {
          setWebImage(file);
          setWebPreview(reader.result as string);
        } else if (type === "mobile") {
          setMobileImage(file);
          setMobilePreview(reader.result as string);
        } else {
          setTabletImage(file);
          setTabletPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: "web" | "mobile" | "tablet") => {
    if (type === "web") {
      setWebImage(null);
      setWebPreview("");
    } else if (type === "mobile") {
      setMobileImage(null);
      setMobilePreview("");
    } else {
      setTabletImage(null);
      setTabletPreview("");
    }
  };

  const onSubmit = async (data: BannerFormData) => {
    // Validate at least one image is uploaded
    if (!webImage && !mobileImage && !tabletImage) {
      showToast("Please upload at least one banner image", "error");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("brand_id", data.brand_id);
      formData.append("vehicle_type", data.vehicle_type);
      formData.append("is_active", data.is_active.toString());

      if (webImage) {
        formData.append("web", webImage);
      }
      if (mobileImage) {
        formData.append("mobile", mobileImage);
      }
      if (tabletImage) {
        formData.append("tablet", tabletImage);
      }

      await createBanner(formData);
      showToast("Banner created successfully", "success");
      handleClose();
      
      // Trigger a refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent("bannerCreated"));
    } catch (error: any) {
      console.error("Error creating banner:", error);
      showToast(
        error?.response?.data?.message || "Failed to create banner",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setWebImage(null);
    setMobileImage(null);
    setTabletImage(null);
    setWebPreview("");
    setMobilePreview("");
    setTabletPreview("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Banner</DialogTitle>
          <DialogDescription>
            Add a new banner with images for different devices
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              Title
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter banner title"
              className="w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand_id" className="required">
              Brand
            </Label>
            <Select
              onValueChange={(value) => setValue("brand_id", value)}
              disabled={brandsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    brandsLoading ? "Loading brands..." : "Select a brand"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.brand_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brand_id && (
              <p className="text-sm text-red-500">{errors.brand_id.message}</p>
            )}
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="vehicle_type" className="required">
              Vehicle Type
            </Label>
            <Select
              onValueChange={(value: any) => setValue("vehicle_type", value)}
              defaultValue="All"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Car">Car</SelectItem>
                <SelectItem value="Bike">Bike</SelectItem>
                <SelectItem value="CV">Commercial Vehicle (CV)</SelectItem>
              </SelectContent>
            </Select>
            {errors.vehicle_type && (
              <p className="text-sm text-red-500">
                {errors.vehicle_type.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Status</Label>
              <p className="text-sm text-gray-500">
                Enable this banner to be displayed
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
          </div>

          {/* Image Uploads */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Banner Images</h3>
            <p className="text-sm text-gray-500">
              Upload at least one image (Max size: 5MB each)
            </p>

            {/* Web Image */}
            <div className="space-y-2">
              <Label>Web Banner (Desktop)</Label>
              {webPreview ? (
                <div className="relative">
                  <img
                    src={webPreview}
                    alt="Web preview"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeImage("web")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="web"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "web")}
                    className="hidden"
                  />
                  <label htmlFor="web" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload web banner
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Mobile Image */}
            <div className="space-y-2">
              <Label>Mobile Banner</Label>
              {mobilePreview ? (
                <div className="relative max-w-sm">
                  <img
                    src={mobilePreview}
                    alt="Mobile preview"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeImage("mobile")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="mobile"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "mobile")}
                    className="hidden"
                  />
                  <label htmlFor="mobile" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload mobile banner
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Tablet Image */}
            <div className="space-y-2">
              <Label>Tablet Banner</Label>
              {tabletPreview ? (
                <div className="relative max-w-md">
                  <img
                    src={tabletPreview}
                    alt="Tablet preview"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeImage("tablet")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="tablet"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "tablet")}
                    className="hidden"
                  />
                  <label htmlFor="tablet" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload tablet banner
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Banner"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

