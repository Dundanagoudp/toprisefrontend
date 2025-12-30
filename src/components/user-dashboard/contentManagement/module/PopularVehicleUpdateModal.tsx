"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import Image from "next/image";
import { updatePopularVehicles, getBrand, getModels, getTypes, getVariantsByModel, getBrandsByType, getModelsByBrand } from "@/service/product-Service";

interface PopularVehicleUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  vehicle: any;
}

interface PopularVehicleFormData {
  vehicle_name: string;
  vehicle_image: File | null;
  brand_id: string;
  model_id: string;
  variant_id: string;
  vehicle_type: string;
}

function PopularVehicleUpdateModal({ open, onClose, onSubmit, vehicle }: PopularVehicleUpdateModalProps) {
  const [formData, setFormData] = useState<PopularVehicleFormData>({
    vehicle_name: "",
    vehicle_image: null,
    brand_id: "",
    model_id: "",
    variant_id: "",
    vehicle_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { showToast } = useGlobalToast();

  // Data states
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ typesRes] = await Promise.all([
          getTypes(),
        ]);
        setVehicleTypes(typesRes.data?.products || typesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  // get brands by type

  useEffect(() => {
    const fetchBrandsByType = async () => {
      const response = await getBrandsByType(formData.vehicle_type);
      setBrands(response.data || []);
    };
    fetchBrandsByType();
  }, [formData.vehicle_type]);

  // get models by brand
  useEffect(() => {
    const fetchModelsByBrand = async () => {
      const response = await getModelsByBrand(formData.brand_id);
      setModels(response.data?.products || response.data || []);
    };
    fetchModelsByBrand();
  }, [formData.brand_id]);  

  // get variants by model
  useEffect(() => {
    const fetchVariants = async () => {
      const response = await getVariantsByModel(formData.model_id);
      setVariants(response?.data as any);
    };
    fetchVariants();
  }, [formData.variant_id]);
  // Fetch variants when model changes
  useEffect(() => {
    const fetchVariants = async () => {
      if (formData.model_id) {
        try {
          const variantsRes = await getVariantsByModel(formData.model_id);
          setVariants(variantsRes.data?.products || variantsRes.data || []);
        } catch (error) {
          console.error("Failed to fetch variants:", error);
          setVariants([]);
        }
      } else {
        setVariants([]);
      }
    };
    fetchVariants();
  }, [formData.model_id]);

  // Populate form when vehicle changes
  useEffect(() => {
    if (vehicle && open) {
      setFormData({
        vehicle_name: vehicle.vehicle_name || "",
        vehicle_image: null, // Reset file input
        brand_id: vehicle.brand_id?._id || "",
        model_id: vehicle.model_id?._id || "",
        variant_id: vehicle.variant_id?._id || "",
        vehicle_type: vehicle.vehicle_type?._id || "",
      });
      setImagePreview(vehicle.vehicle_image || null);
      setError(null);
    }
  }, [vehicle, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        vehicle_name: "",
        vehicle_image: null,
        brand_id: "",
        model_id: "",
        variant_id: "",
        vehicle_type: "",
      });
      setImagePreview(null);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, vehicle_image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.vehicle_name.trim()) {
      showToast("Vehicle name is required", "error");
      return;
    }
    if (!formData.vehicle_type) {
      showToast("Vehicle type is required", "error");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("vehicle_name", formData.vehicle_name.trim());
      submitData.append("vehicle_type", formData.vehicle_type);
      if (formData.brand_id) submitData.append("brand_id", formData.brand_id);
      if (formData.model_id) submitData.append("model_id", formData.model_id);
      if (formData.variant_id) submitData.append("variant_id", formData.variant_id);
      if (formData.vehicle_image) submitData.append("vehicle_image", formData.vehicle_image);

      const response = await updatePopularVehicles(vehicle._id, submitData);

      if (response && response.success) {
        showToast("Popular vehicle updated successfully", "success");
        onSubmit(formData);
      } else {
        throw new Error(response?.message || "Failed to update popular vehicle");
      }
    } catch (error: any) {
      console.error("Error updating popular vehicle:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update popular vehicle";
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Popular Vehicle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Vehicle Name */}
          <div className="grid gap-2">
            <Label htmlFor="vehicle_name">Vehicle Name*</Label>
            <Input
              id="vehicle_name"
              value={formData.vehicle_name}
              onChange={(event) => {
                const value = event.target.value;
                setFormData(prev => ({ ...prev, vehicle_name: value }));
                if (error && value) setError(null);
              }}
              placeholder="Enter vehicle name"
              disabled={submitting}
            />
          </div>

          {/* Vehicle Image */}
          <div className="grid gap-2">
            <Label htmlFor="vehicle_image">Vehicle Image</Label>
            <Input
              id="vehicle_image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting}
            />
            {imagePreview && (
              <div className="mt-2">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={150}
                  className="object-contain border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Current/Updated image preview</p>
              </div>
            )}
          </div>

          {/* Vehicle Type */}
          <div className="grid gap-2">
            <Label htmlFor="vehicle_type">Vehicle Type*</Label>
            <Select
              value={formData.vehicle_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value }))}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="grid gap-2">
            <Label htmlFor="brand_id">Brand</Label>
            <Select
              value={formData.brand_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand " />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.brand_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="grid gap-2">
            <Label htmlFor="model_id">Model</Label>
            <Select
              value={formData.model_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, model_id: value }))}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model " />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model._id} value={model._id}>
                    {model.model_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variant */}
          <div className="grid gap-2">
            <Label htmlFor="variant_id">Variant</Label>
            <Select
              value={formData.variant_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, variant_id: value }))}
              disabled={submitting || !formData.model_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variant " />
              </SelectTrigger>
              <SelectContent>
                {variants.map((variant) => (
                  <SelectItem key={variant._id} value={variant._id}>
                    {variant.variant_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            disabled={submitting || !formData.vehicle_name.trim() || !formData.vehicle_type}
          >
            {submitting ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PopularVehicleUpdateModal;
