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
import { createBanner, getTypes } from "@/service/product-Service";
import { getBrands } from "@/service/catalogue-service";
import { Upload, X } from "lucide-react";

// Banner schema
const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  brand_id: z.string().min(1, "Brand is required"),
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  is_active: z.boolean().default(true),
  description: z.string().optional(),
  link_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  display_order: z.number().min(1, "Display order must be at least 1").default(1),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface CreateBannerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (banner: any) => void;
}

export default function CreateBanner({ open, onClose, onSuccess }: CreateBannerProps) {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleTypesLoading, setVehicleTypesLoading] = useState(false);
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
      vehicle_type: "",
      is_active: true,
      description: "",
      link_url: "",
      display_order: 1,
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (open) {
      fetchBrands();
      fetchVehicleTypes();
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

  const fetchVehicleTypes = async () => {
    try {
      setVehicleTypesLoading(true);
      const response = await getTypes();
      // Handle different response structures
      let typesData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          typesData = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          typesData = response.data.products;
        }
      }
      setVehicleTypes(typesData);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      showToast("Failed to fetch vehicle types", "error");
    } finally {
      setVehicleTypesLoading(false);
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
      formData.append("description", data.description || "");
      formData.append("link_url", data.link_url || "");
      formData.append("display_order", data.display_order.toString());

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
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
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
              onValueChange={(value) => setValue("vehicle_type", value)}
              disabled={vehicleTypesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    vehicleTypesLoading ? "Loading vehicle types..." : "Select a vehicle type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicle_type && (
              <p className="text-sm text-red-500">
                {errors.vehicle_type.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Enter banner description"
              className="w-full"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <Label htmlFor="link_url">
              Link URL
            </Label>
            <Input
              id="link_url"
              {...register("link_url")}
              placeholder="https://example.com/offer"
              className="w-full"
            />
            {errors.link_url && (
              <p className="text-sm text-red-500">{errors.link_url.message}</p>
            )}
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="display_order" className="required">
              Display Order
            </Label>
            <Input
              id="display_order"
              type="number"
              {...register("display_order", { valueAsNumber: true })}
              placeholder="1"
              min="1"
              className="w-full"
            />
            {errors.display_order && (
              <p className="text-sm text-red-500">{errors.display_order.message}</p>
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

