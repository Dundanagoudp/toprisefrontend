import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
// Removed Redux imports since we're now fetching types dynamically
import { getBrandsByType, getModelsByBrand, getTypes, getVariantsByModel } from "@/service/product-Service";

// schema
const vehicleFormSchema = z.object({
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().min(1, "Variant is required"),
});
type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface AddVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => void;
  editingVehicle?: any;
}

export default function AddVehicleDialog({
  isOpen,
  onClose,
  onSubmit,
  editingVehicle,
}: AddVehicleDialogProps) {

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);


  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicle_type: editingVehicle?.vehicle_type || "",
      brand: editingVehicle?.brand || "",
      model: editingVehicle?.model || "",
      variant: editingVehicle?.variant || ""
    },
  });

  const selectedVehicleType = watch("vehicle_type");
  const selectedBrand = watch("brand");
  const selectedModel = watch("model");

  const allFieldsFilled = selectedVehicleType && selectedBrand && selectedModel;
  const onSubmitHandler = async (data: VehicleFormData) => {
    onSubmit(data);
    onClose();
  };

  // Reset form when editing vehicle changes or dialog opens/closes
  useEffect(() => {
    if (isOpen && editingVehicle) {
      reset({
        vehicle_type: editingVehicle.vehicle_type || "",
        brand: editingVehicle.brand || "",
        model: editingVehicle.model || "",
        variant: editingVehicle.variant || ""
      });
    } else if (isOpen && !editingVehicle) {
      // Reset to empty when adding new vehicle
      reset({
        vehicle_type: "",
        brand: "",
        model: "",
        variant: ""
      });
    }
  }, [isOpen, editingVehicle, reset]);


  useEffect(() => {
    const fetchBrands = async () => {
      if (!selectedVehicleType) {
        setBrands([]);
        return;
      }
      setLoadingBrands(true);
      try {
        const res = await getBrandsByType(selectedVehicleType);
        setBrands(res?.data ?? []);
      } catch {
        setBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, [selectedVehicleType]);
  useEffect(() => {
    const fetchTypes = async () => {
      setLoadingTypes(true);
      try {
        const res = await getTypes();
        const typesData = res?.data?.products || res?.data || [];
        setTypes(Array.isArray(typesData) ? typesData : []);
      } catch {
        setTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedBrand) {
        setModels([]);
        return;
      }
      setLoadingModels(true);
      try {
        const res = await getModelsByBrand(selectedBrand);
        const modelsData = res?.data?.products || res?.data || [];
        setModels(Array.isArray(modelsData) ? modelsData : []);
      } catch {
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [selectedBrand]);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!selectedModel) {
        setVariants([]);
        return;
      }
      setLoadingVariants(true);
      try {
        const res = await getVariantsByModel(selectedModel);
        const variantsData = res?.data?.products || res?.data || [];
        setVariants(Array.isArray(variantsData) ? variantsData : []);
      } catch {
        setVariants([]);
      } finally {
        setLoadingVariants(false);
      }
    };
    fetchVariants();
  }, [selectedModel]);

  // reset dependent selects when parent changes
  useEffect(() => {
    if (selectedVehicleType) {
      setValue("brand", "");
      setValue("model", "");
      setValue("variant", "");
      setBrands([]);
      setModels([]);
      setVariants([]);
    }
  }, [selectedVehicleType, setValue]);

  useEffect(() => {
    if (selectedBrand) {
      setValue("model", "");
      setValue("variant", "");
      setModels([]);
      setVariants([]);
    }
  }, [selectedBrand, setValue]);

  useEffect(() => {
    if (selectedModel) {
      setValue("variant", "");
      setVariants([]);
    }
  }, [selectedModel, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{editingVehicle ? 'Edit Vehicle Details' : 'Add Vehicle Details'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        {/* Current Vehicle Preview - Only show when editing */}
        {editingVehicle && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Vehicle Type:</span>
                <p className="font-medium text-gray-900">
                  {editingVehicle._original?.vehicle_type || editingVehicle._original?.type || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Brand:</span>
                <p className="font-medium text-gray-900">
                  {editingVehicle._original?.brand?.brand_name || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Model:</span>
                <p className="font-medium text-gray-900">
                  {editingVehicle._original?.model?.model_name || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Variant:</span>
                <p className="font-medium text-gray-900">
                  {editingVehicle._original?.variant?.variant_name || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">You are editing this vehicle's information below.</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 py-4">
          {/* Vehicle Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle_type" className="text-right">Vehicle</Label>
            <Controller
              name="vehicle_type"
              control={control}
              render={({ field }) => (
                <div className="col-span-3">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-[200px]"> 
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTypes ? (
                        <SelectItem value="__loading_types" disabled>Loading types...</SelectItem>
                      ) : types.length > 0 ? (
                        types.map((type: any, i: number) => {
                          const id = type._id || type.id || `type-${i}`;
                          const name = type.type_name || type.name || `Type ${i + 1}`;
                          return <SelectItem key={id} value={String(id)}>{name}</SelectItem>;
                        })
                      ) : (
                        <SelectItem value="__no_types" disabled>No types available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.vehicle_type && <span className="text-red-500 text-sm">{errors.vehicle_type.message}</span>}
                </div>
              )}
            />
          </div>
          {/* Brand */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">Brand</Label>
            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <div className="col-span-3">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-[200px]"> {/* Added fixed width */}
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBrands ? (
                        <SelectItem value="__loading_brands" disabled>Loading brands...</SelectItem>
                      ) : brands.length > 0 ? (
                        brands.map((brand: any, i: number) => {
                          const id = brand._id || brand.id || `brand-${i}`;
                          const name = brand.brand_name || brand.name || `Brand ${i + 1}`;
                          return <SelectItem key={id} value={String(id)}>{name}</SelectItem>;
                        })
                      ) : (
                        <SelectItem value="__no_brands" disabled>No brands available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.brand && <span className="text-red-500 text-sm">{errors.brand.message}</span>}
                </div>
              )}
            />
          </div>
          {/* Model */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">Model</Label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <div className="col-span-3">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-[200px]"> {/* Added fixed width */}
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingModels ? (
                        <SelectItem value="__loading_models" disabled>Loading models...</SelectItem>
                      ) : models.length > 0 ? (
                        models.map((m: any, i: number) => {
                          const id = m._id || m.id || `model-${i}`;
                          const name = m.model_name || m.name || `Model ${i + 1}`;
                          return <SelectItem key={id} value={String(id)}>{name}</SelectItem>;
                        })
                      ) : (
                        <SelectItem value="__no_models" disabled>{selectedBrand ? "No models available" : "Select a brand first"}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.model && <span className="text-red-500 text-sm">{errors.model.message}</span>}
                </div>
              )}
            />
          </div>
          {/* Variant */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variant" className="text-right">Variant</Label>
            <Controller
              name="variant"
              control={control}
              render={({ field }) => (
                <div className="col-span-3">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-[200px]"> {/* Added fixed width */}
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingVariants ? (
                        <SelectItem value="__loading_variants" disabled>Loading variants...</SelectItem>
                      ) : variants.length > 0 ? (
                        variants.map((v: any, i: number) => {
                          const id = v._id || v.id || `variant-${i}`;
                          const name = v.variant_name || v.name || `Variant ${i + 1}`;
                          return <SelectItem key={id} value={String(id)}>{name}</SelectItem>;
                        })
                      ) : (
                        <SelectItem value="__no_variants" disabled>{selectedModel ? "No variants available" : "Select a model first"}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.variant && <span className="text-red-500 text-sm">{errors.variant.message}</span>}
                </div>
              )}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || !allFieldsFilled}>
            {editingVehicle ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  
  );
}
