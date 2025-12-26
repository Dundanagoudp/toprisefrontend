"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { TagsInput } from "react-tag-input-component";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  addProductByDealer,
  getBrandByType,
  getCategoriesByType,
  getCategories,
  getModelByBrand,
  getModels,
  getSubCategories,
  getSubcategoriesByCategoryId,
  getTypes,
  getVariantsByModelIds,
  getvarientByModel,
  getYearRange,
  getBrandsByTypeAndDealerId,
} from "@/service/product-Service";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
// Helper to decode JWT and extract user id
import { useToast as useGlobalToast } from "@/components/ui/toast";
import DynamicButton from "@/components/common/button/button";
import { dealerProductSchema } from "@/lib/schemas/product-schema";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { getDealerIdFromUserId } from "@/service/dealerServices";
import { useRouter } from "next/navigation";

type FormValues = z.infer<typeof dealerProductSchema>;

// Helper function for numeric input validation
const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (
    !/[0-9]/.test(e.key) &&
    e.key !== "Backspace" &&
    e.key !== "Delete" &&
    e.key !== "ArrowLeft" &&
    e.key !== "ArrowRight" &&
    e.key !== "Tab"
  ) {
    e.preventDefault();
  }
};

export default function DealerAddProducts() {
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const auth = useAppSelector((state) => state.auth);
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [filteredBrandOptions, setFilteredBrandOptions] = useState<any[]>([]);
  const [selectedProductTypeId, setSelectedProductTypeId] =
    useState<string>("");
  const { showToast } = useGlobalToast();
  const [selectedbrandId, setSelectedBrandId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [yearRangeOptions, setYearRangeOptions] = useState<any[]>([]);
  const [varientOptions, setVarientOptions] = useState<any[]>([]);
  const [modelId, setModelId] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const allowedRoles = ["Super-admin", "Inventory-admin", "Dealer"];

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(dealerProductSchema) as any,
    defaultValues: {
      is_universal: false,
      is_consumable: false,
      active: "yes",
      is_returnable: false,
      quantity_per_dealer: 1,
   
    },
  });

  // Set dealer ID when component mounts
  useEffect(() => {
    if (auth.user && auth.user._id) {
      setValue("addedByDealerId", auth.user._id);
    }
  }, [auth.user, setValue]);

  const fetchDealerIdByUserId = async () => {
    try {
      const response = await getDealerIdFromUserId(auth.user?._id);
      if (response) {
        setSelectedDealerId(response);
        setValue("addedByDealerId", response);
      }
    } catch (error) {
      console.error("Failed to fetch dealer ID:", error);
      // Fallback to user ID if dealer ID fetch fails
      if (auth.user?._id) {
        setSelectedDealerId(auth.user._id);
        setValue("addedByDealerId", auth.user._id);
      }
    }
  };

  useEffect(() => {
    if (auth.user?._id) {
      fetchDealerIdByUserId();
    }
  }, [auth.user?._id]);
  // Parallel fetch for types and year ranges
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [types, yearRanges] = await Promise.all([
          getTypes(),
          getYearRange(),
        ]);
        // Use type assertions to bypass TypeScript errors for build
        setTypeOptions((types.data as any) || []);
        setYearRangeOptions((yearRanges.data as any) || []);
        console.log("Fetched all initial data in parallel");
      } catch (error) {
        console.error("Failed to fetch initial data in parallel:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Categories by Types
  useEffect(() => {
    if (!selectedProductTypeId) {
      setCategoryOptions([]);
      return;
    }
    const fetchCategoriesByType = async () => {
      try {
        const response = await getCategoriesByType(selectedProductTypeId);
        const categoryData = response?.data || response || [];
        setCategoryOptions(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error("Failed to fetch categories by type:", error);
        setCategoryOptions([]);
        showToast("Failed to load categories for selected type", "error");
      }
    };
    fetchCategoriesByType();
  }, [selectedProductTypeId]);

  // Model options (fetch brands by type)
  useEffect(() => {
    if (!selectedProductTypeId) {
      setFilteredBrandOptions([]);
      return;
    }
    const fetchBrandsByType = async () => {
      try {
        const response = await getBrandsByTypeAndDealerId( selectedDealerId,selectedProductTypeId);
        setFilteredBrandOptions((response.data as any) || []);
      } catch (error) {
        setFilteredBrandOptions([]);
        console.error("Failed to fetch brands by type:", error);
      }
    };
    fetchBrandsByType();
  }, [selectedProductTypeId, selectedDealerId]);
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubCategoryOptions([]); // Clear if no category selected
      setValue("sub_category", ""); // Reset subcategory when category changes
      return;
    }
    const fetchSubCategoriesByCategory = async () => {
      try {
        console.log(
          "Fetching subcategories for category ID:",
          selectedCategoryId
        );
        const response = await getSubcategoriesByCategoryId(selectedCategoryId);
        console.log("Subcategories response:", response);

        // Handle different response structures
        const subCategoryData =
          response?.data?.products || response?.data || response || [];
        console.log("Processed subcategory data:", subCategoryData);

        setSubCategoryOptions(
          Array.isArray(subCategoryData) ? subCategoryData : []
        );
      } catch (error) {
        console.error("Failed to fetch subcategories by category:", error);
        setSubCategoryOptions([]);
        showToast(
          "Failed to load subcategories for selected category",
          "error"
        );
      }
    };
    fetchSubCategoriesByCategory();
  }, [selectedCategoryId, setValue, showToast]);
  // Fetch models when brand changes
  useEffect(() => {
    if (!selectedbrandId) {
      setModelOptions([]);
      return;
    }
    const fetchModelsByBrand = async () => {
      try {
        const response = await getModelByBrand(selectedbrandId);
        setModelOptions((response.data as any) || []);
      } catch (error) {
        console.error("Failed to fetch models by brand:", error);
      }
    };
    fetchModelsByBrand();
  }, [selectedbrandId]);

  // Fetch variants by model
  useEffect(() => {
    if (!modelId || !Array.isArray(modelId) || modelId.length === 0) {
      setVarientOptions([]);
      return;
    }
    const fetchVarientByModel = async () => {
      try {
        const response = await getVariantsByModelIds(modelId);
        const variantData = response?.data?.products || response?.data || response || [];
        setVarientOptions(Array.isArray(variantData) ? variantData : []);
        console.log("Varient Options:", response.data);
      } catch (error) {
        console.error("Failed to fetch variant options:", error);
        setVarientOptions([]);
      }
    };
    fetchVarientByModel();
  }, [modelId]);

  // Handle search tags input and Submit
  const onSubmit = async (data: FormValues) => {
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formData) return;

    setSubmitLoading(true);
    try {
      const userId = auth.user && auth.user._id;
      if (!userId) {
        showToast("User ID not found in token", "error");
        setSubmitLoading(false);
        return;
      }
      const dealerId = selectedDealerId || userId;
      // Add created_by and dealer ID to data
      const dataWithCreatedBy = {
        ...formData,
        created_by: userId,
        addedByDealerId: dealerId,
      };

      const formDataObj = new FormData();
      if (dealerId) {
        // Parse quantity - handle string, number, or empty values
        const quantity = formData.quantity_per_dealer ?? 1;

        formDataObj.append(`available_dealers[0][dealers_Ref]`, dealerId);
        formDataObj.append(
          `available_dealers[0][quantity_per_dealer]`,
          quantity.toString()
        );
        formDataObj.append(
          `available_dealers[0][inStock]`,
          (quantity && quantity > 0 ? "true" : "false")
        );
      }
      Object.entries(dataWithCreatedBy).forEach(([key, value]) => {
        if (
          key !== "images" &&
          key !== "searchTagsArray"
        ) {
          if (key === "year_range" && Array.isArray(value)) {
            value.forEach((id) => formDataObj.append("year_range[]", id));
          } else if (key === "variant" && Array.isArray(value)) {
            value.forEach((id) => formDataObj.append("variant[]", id));
          } else if (key === "model" && Array.isArray(value)) {
            value.forEach((id) => formDataObj.append("model[]", id));
          } else if (Array.isArray(value)) {
            // For arrays, append as comma-separated string (FormData does not support arrays natively)
            formDataObj.append(key, value.join(","));
          } else if (typeof value === "number") {
            formDataObj.append(key, value.toString());
          } else {
            formDataObj.append(
              key,
              typeof value === "boolean" ? String(value) : value ?? ""
            );
          }
        }
      });
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formDataObj.append("images", file);
        });
      }

      const response = await addProductByDealer(formDataObj);
   if(response.data){
    showToast("Product created successfully ", "success");
    setImageFiles([]);
    setImagePreviews([]);
    reset(); // Reset the form after successful submission
    router.push("/dealer/dashboard/product");
   }else{
    showToast("Failed to create product", "error");
   }


    } catch (error) {
      console.error("Failed to submit product:", error);
      showToast("Failed to create product", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Prevent form submission on Enter key in any input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      // Only allow Enter to submit if the target is a textarea or the submit button
      const target = e.target as HTMLElement;
      if (
        target.tagName !== "TEXTAREA" &&
        target.getAttribute("type") !== "submit"
      ) {
        e.preventDefault();
      }
    }
  };
  if (!auth || !allowedRoles.includes(auth.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
            Add Product
          </h1>
          <p className="text-base font-medium font-sans text-gray-500">
            Add your product description
          </p>
        </div>
        {/* Save button removed from here */}
      </div>
      <form
        id="add-product-form"
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Form validation failed", errors);
        })}
        onKeyDown={handleKeyDown}
        className="space-y-6"
      >
        {/* Hidden input for created_by (snake_case) */}
        <input type="hidden" {...register("created_by")} />
        {/* Core Product Identity */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Core Product Identity
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Classify the product for catalog structure, filterability, and
              business logic.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label
                htmlFor="productName"
                className="text-base font-medium font-sans"
              >
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="Enter Product Name"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("product_name")}
              />
              {errors.product_name && (
                <span className="text-red-500 text-sm">
                  {errors.product_name.message}
                </span>
              )}
            </div>
            {/* Manufacturer Part Number */}
            <div className="space-y-2">
              <Label
                htmlFor="manufacturerPartNumber"
                className="text-base font-medium font-sans"
              >
                Manufacturer Part Number (MPN)
              </Label>
              <Input
                id="manufacturerPartNumber"
                placeholder="Part Number"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                type="string"
                {...register("manufacturer_part_name")}
              />
              {errors.manufacturer_part_name && (
                <span className="text-red-500 text-sm">
                  {errors.manufacturer_part_name.message}
                </span>
              )}
            </div>

            {/* HSN Code */}
            <div className="space-y-2">
              <Label
                htmlFor="hsnCode"
                className="text-base font-medium font-sans"
              >
                HSN Code
              </Label>
              <Input
                id="hsnCode"
                placeholder="Enter HSN Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                type="number"
                maxLength={8}
                {...register("hsn_code", {
                  valueAsNumber: true,
                  required: "HSN Code is required",
                  validate: (value) =>
                    value === undefined || isNaN(value)
                      ? "Invalid input: expected number"
                      : true,
                })}
              />
              {errors.hsn_code && (
                <span className="text-red-500 text-sm">
                  {errors.hsn_code.message}
                </span>
              )}
            </div>
                   {/* Vehicle Type */}
                   <div className="space-y-2">
              <Label
                htmlFor="vehicleType"
                className="text-base font-medium font-sans"
              >
                Vehicle Type
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("vehicle_type", value);
                  setSelectedProductTypeId(value);
                }}
                defaultValue={watch("vehicle_type")}
              >
                <SelectTrigger
                  id="vehicleType"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    typeOptions.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.type_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.vehicle_type && (
                <span className="text-red-500 text-sm">
                  {errors.vehicle_type.message}
                </span>
              )}
            </div>
            {/* Category */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-base font-medium font-sans"
              >
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("category", value);
                  setSelectedCategoryId(value);
                  setValue("sub_category", ""); // Reset subcategory when category changes
                }}
                disabled={!selectedProductTypeId}
              >
                <SelectTrigger
                  id="category"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder={selectedProductTypeId ? "Select" : "Select vehicle type first"} />
                </SelectTrigger>
                <SelectContent>
                  {!selectedProductTypeId ? (
                    <SelectItem value="disabled" disabled>
                      Please select vehicle type first
                    </SelectItem>
                  ) : categoryOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    categoryOptions.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.category_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.category && (
                <span className="text-red-500 text-sm">
                  {errors.category.message}
                </span>
              )}
            </div>
            {/* Sub-category */}
            <div className="space-y-2">
              <Label
                htmlFor="subCategory"
                className="text-base font-medium font-sans"
              >
                Sub-category <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("sub_category", value)}
              >
                <SelectTrigger
                  id="subCategory"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {!selectedCategoryId ? (
                    <SelectItem value="no-category" disabled>
                      Please select category first
                    </SelectItem>
                  ) : subCategoryOptions.length === 0 ? (
                    <SelectItem value="no-subcategories" disabled>
                      No subcategories found
                    </SelectItem>
                  ) : (
                    subCategoryOptions.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.subcategory_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.sub_category && (
                <span className="text-red-500 text-sm">
                  {errors.sub_category.message}
                </span>
              )}
            </div>
            {/* Product Type (OE, OEM, Aftermarket) */}
            <div className="space-y-2">
              <Label
                htmlFor="productType"
                className="text-base font-medium font-sans"
              >
                Product Type <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("product_type", value)}
                defaultValue={watch("product_type")}
              >
                <SelectTrigger
                  id="productType"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="AFTERMARKET">Aftermarket</SelectItem>
                </SelectContent>
              </Select>
              {errors.product_type && (
                <span className="text-red-500 text-sm">
                  {errors.product_type.message}
                </span>
              )}
            </div>
     
          </CardContent>
        </Card>

        {/* Vehicle Compatibility */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Vehicle Compatibility
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Specify which vehicle make, model, and variant the product is
              compatible with.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Make */}
            <div className="space-y-2">
              <Label
                htmlFor="brand"
                className="text-base font-medium font-sans"
              >
                Brand
              </Label>
              <Select
                onValueChange={(value) => {
                  setSelectedBrandId(value);
                  setValue("brand", value);
                }}
              >
                <SelectTrigger
                  id="brand"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBrandOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Please select Product Type first
                    </SelectItem>
                  ) : (
                    filteredBrandOptions.map((option) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.brand_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.brand && (
                <span className="text-red-500 text-sm">
                  {errors.brand.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="make" className="text-base font-medium font-sans">
                Make <span className="text-red-500">*</span>
              </Label>
              <Input
                id="make"
                placeholder="Enter Make"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("make")}
              />
              {errors.make && (
                <span className="text-red-500 text-sm">
                  {errors.make.message}
                </span>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-base font-medium font-sans">
                Model <span className="text-red-500">*</span>
              </Label>

              <div className="border rounded-lg p-3 bg-gray-50 max-h-52 overflow-y-auto">
                {selectedbrandId && modelOptions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No models found</p>
                ) : modelOptions.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Please select Brand first
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modelOptions.map((option) => {
                      const selected = Array.isArray(watch("model"))
                        ? watch("model")
                        : [];
                      const isSelected = selected.includes(option._id);

                      return (
                        <button
                          key={option._id}
                          type="button"
                          onClick={() => {
                            const updated = isSelected
                              ? selected.filter((id) => id !== option._id)
                              : [...selected, option._id];
                            setValue("model", updated);
                            setModelId(updated);
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? "bg-red-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {option.model_name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {errors.model && (
                <span className="text-red-500 text-sm">{errors.model.message}</span>
              )}
            </div>
            {/* Year Range */}
            <div className="space-y-2">
              <Label
                htmlFor="yearRange"
                className="text-base font-medium font-sans"
              >
                Year Range (Multiple Allowed)
              </Label>

              <div className="border rounded-lg p-3 bg-gray-50 max-h-52 overflow-y-auto">
                {yearRangeOptions.length === 0 ? (
                  <p className="text-gray-500 text-sm">Loading...</p>
                ) : (
                  yearRangeOptions.map((option) => {
                    const selected = watch("year_range") || [];
                    const isChecked = selected.includes(option._id);

                    return (
                      <div key={option._id} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? selected.filter((id) => id !== option._id)
                              : [...selected, option._id];
                            setValue("year_range", updated);
                          }}
                        />
                        <span className="text-sm">{option.year_name}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {errors.year_range && (
                <span className="text-red-500 text-sm">{errors.year_range.message}</span>
              )}
            </div>
            {/* Variant */}
            <div className="space-y-2">
              <div className="space-y-2">
                <Label
                  htmlFor="variant"
                  className="text-base font-medium font-sans"
                >
                  Variant <span className="text-red-500">*</span>
                </Label>

                <div className="border rounded-lg p-3 bg-gray-50 max-h-52 overflow-y-auto">
                  {varientOptions.length === 0 && modelId.length === 0 ? (
                    <p className="text-gray-500 text-sm">Variant not found</p>
                  ) : varientOptions.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Please select model first
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {varientOptions.map((option) => {
                        const selected = Array.isArray(watch("variant"))
                          ? watch("variant")
                          : [];
                        const isSelected = selected.includes(option._id);

                        return (
                          <button
                            key={option._id}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? selected.filter((id) => id !== option._id)
                                : [...selected, option._id];
                              setValue("variant", updated);
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              isSelected
                                ? "bg-red-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {option.variant_name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {errors.variant && (
                  <span className="text-red-500 text-sm">
                    {errors.variant.message}
                  </span>
                )}
              </div>
            </div>
            {/* Fitment Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="fitmentNotes"
                className="text-base font-medium font-sans"
              >
                Fitment Notes
              </Label>
              <Input
                id="fitmentNotes"
                placeholder="Enter Fitment Notes"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fitment_notes")}
              />
              {errors.fitment_notes && (
                <span className="text-red-500 text-sm">
                  {errors.fitment_notes.message}
                </span>
              )}
            </div>
            {/* Is Universal */}
            <div className="space-y-2">
              <Label
                htmlFor="isUniversal"
                className="text-base font-medium font-sans"
              >
                Is Universal
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("is_universal", value === "yes")
                }
                defaultValue="no"
              >
                <SelectTrigger
                  id="isUniversal"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_universal && (
                <span className="text-red-500 text-sm">
                  {errors.is_universal.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Technical Specifications
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Add all relevant technical details to help users understand the
              product quality and features.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Specifications */}
            <div className="space-y-2">
              <Label
                htmlFor="key_specifications"
                className="text-base font-medium font-sans"
              >
                Key Specifications
              </Label>
              <Input
                id="key_specifications"
                placeholder="Enter Key Specifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("key_specifications")}
              />
              {errors.key_specifications && (
                <span className="text-red-500 text-sm">
                  {errors.key_specifications.message}
                </span>
              )}
            </div>
            {/* keySpecifications */}
            {/* <div className="space-y-2">
              <Label
                htmlFor="keySpecifications"
                className="text-base font-medium font-sans"
              >
                Key Specifications
              </Label>
              <Input
                id="keySpecifications"
                placeholder="Enter Key Specifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("keySpecifications")}
              />
              {errors.keySpecifications && (
                <span className="text-red-500 text-sm">
                  {errors.keySpecifications.message}
                </span>
              )}
            </div> */}
            {/* Dimensions */}
            <div className="space-y-2">
              <Label
                htmlFor="dimensions"
                className="text-base font-medium font-sans"
              >
                Dimensions
              </Label>
              <Input
                id="dimensions"
                placeholder="Enter Dimensions"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("dimensions")}
              />
              {errors.dimensions && (
                <span className="text-red-500 text-sm">
                  {errors.dimensions.message}
                </span>
              )}
            </div>
            {/* Weight */}
            <div className="space-y-2">
              <Label
                htmlFor="weight"
                className="text-base font-medium font-sans"
              >
                Weight
              </Label>
              <Input
                id="weight"
                placeholder="Enter Weight"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("weight")}
              />
              {errors.weight && (
                <span className="text-red-500 text-sm">
                  {errors.weight.message}
                </span>
              )}
            </div>
            {/* Certifications */}
            <div className="space-y-2">
              <Label
                htmlFor="certifications"
                className="text-base font-medium font-sans"
              >
                Certifications
              </Label>
              <Input
                id="certifications"
                placeholder="Enter Certifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("certifications")}
              />
              {errors.certifications && (
                <span className="text-red-500 text-sm">
                  {errors.certifications.message}
                </span>
              )}
            </div>
            {/* Warranty */}
            <div className="space-y-2">
              <Label
                htmlFor="warranty"
                className="text-base font-medium font-sans"
              >
                Warranty (in months)
              </Label>
              <Input
                id="warranty"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Warranty in months"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("warranty", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              {errors.warranty && (
                <span className="text-red-500 text-sm">
                  {errors.warranty.message}
                </span>
              )}
            </div>
            {/* Is Consumable */}
            <div className="space-y-2">
              <Label
                htmlFor="isConsumable"
                className="text-base font-medium font-sans"
              >
                Is Consumable
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("is_consumable", value === "yes")
                }
                defaultValue="no"
              >
                <SelectTrigger
                  id="isConsumable"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_consumable && (
                <span className="text-red-500 text-sm">
                  {errors.is_consumable.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Media & Documentation */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sanss">
              Media & Documentation
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Upload product images, videos, and brochures to enhance product
              representation and credibility.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div className="space-y-2">
              <Label
                htmlFor="images"
                className="text-base font-medium font-sans"
              >
                Images
              </Label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImageFiles((prev) => [...prev, ...files]);
                  // Generate previews for new files
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreviews((prev) => [
                        ...prev,
                        reader.result as string,
                      ]);
                    };
                    reader.readAsDataURL(file);
                  });
                  setValue(
                    "images",
                    files.length > 0 ? files.map((f) => f.name).join(",") : ""
                  ); // for validation
                }}
              />
              <Button
                type="button"
                className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 w-full text-left text-gray-700 hover:bg-gray-100"
                onClick={() => document.getElementById("images")?.click()}
              >
                {imageFiles.length > 0
                  ? `${imageFiles.length} image(s) selected`
                  : "Choose Images"}
              </Button>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative inline-block">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="max-h-24 rounded border"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        onClick={() => {
                          setImageFiles((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                          setImagePreviews((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && (
                <span className="text-red-500 text-sm">
                  {errors.images.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Pricing & Tax
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Provide the pricing and tax information required for listing and
              billing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MRP (with GST) */}
            <div className="space-y-2">
              <Label htmlFor="mrp" className="text-base font-medium font-sans">
                MRP (with GST) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mrp"
                type="number"
                placeholder="Enter MRP"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("mrp_with_gst", { valueAsNumber: true })}
              />
              {errors.mrp_with_gst && (
                <span className="text-red-500 text-sm">
                  {errors.mrp_with_gst.message}
                </span>
              )}
            </div>
            {/* Selling Price (Required) */}
            <div className="space-y-2">
              <Label
                htmlFor="selling_price"
                className="text-base font-medium font-sans"
              >
                Selling Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="selling_price"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Selling Price"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("selling_price", {
                  valueAsNumber: true,
                  required: true,
                })}
              />
              {errors.selling_price && (
                <span className="text-red-500 text-sm">
                  {errors.selling_price.message}
                </span>
              )}
            </div>
            {/* GST % */}
            <div className="space-y-2">
              <Label htmlFor="gst" className="text-base font-medium font-sans">
                GST % <span className="text-red-500">*</span>
              </Label>
              <Input
                id="gst_percentage"
                type="number"
                placeholder="Enter GST"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("gst_percentage", {
                  valueAsNumber: true,
                })}
              />
              {errors.gst_percentage && (
                <span className="text-red-500 text-sm">
                  {errors.gst_percentage.message}
                </span>
              )}
            </div>
            {/* Returnable */}
            <div className="space-y-2">
              <Label
                htmlFor="returnable"
                className="text-base font-medium font-sans"
              >
                Returnable
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("is_returnable", value === "yes")
                }
                value={watch("is_returnable") ? "yes" : "no"}
              >
                <SelectTrigger
                  id="returnable"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_returnable && (
                <span className="text-red-500 text-sm">
                  {errors.is_returnable.message}
                </span>
              )}
            </div>
            {/* Return Policy */}
            {/* <div className="space-y-2">
              <Label
                htmlFor="returnPolicy"
                className="text-base font-medium font-sans"
              >
                Return Policy <span className="text-red-500">*</span>
              </Label>
              <Input
                id="returnPolicy"
                placeholder="Enter Return Policy"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("return_policy")}
              />
              {errors.return_policy && (
                <span className="text-red-500 text-sm">
                  {errors.return_policy.message}
                </span>
              )}
            </div> */}
          </CardContent>
        </Card>

        {/* Dealer-Level Mapping & Routing */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Dealer-Level Mapping & Routing
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Dealer product quantity and quality
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dealer Reference */}
            <div className="space-y-2">
              <Label
                htmlFor="addedByDealerId"
                className="text-base font-medium font-sans"
              >
                Dealer Reference
              </Label>
              <Input
                id="addedByDealerId"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4 cursor-not-allowed"
                disabled
                value={selectedDealerId || ""}
                {...register("addedByDealerId")}
              />
              {errors.addedByDealerId && (
                <span className="text-red-500 text-sm">
                  {errors.addedByDealerId.message}
                </span>
              )}
            </div>
            {/* Quantity per Dealer */}
            <div className="space-y-2">
              <Label
                htmlFor="quantity_per_dealer"
                className="text-base font-medium font-sans"
              >
                Quantity per Dealer
              </Label>
              <Input
                id="quantity_per_dealer"
                type="number"
                min="0"
                step="1"
                placeholder="Enter Quantity"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                onKeyDown={handleNumericKeyDown}
                {...register("quantity_per_dealer", {
                  setValueAs: (v) => v === "" || v === null || v === undefined ? 1 : Number(v),
                })}
              />
              {errors.quantity_per_dealer && (
                <span className="text-red-500 text-sm">
                  {errors.quantity_per_dealer.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SEO & Search Optimization */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              SEO & Search Optimization
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Provide the pricing and tax information required for listing and
              billing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label
                htmlFor="seoTitle"
                className="text-base font-medium font-sans"
              >
                SEO Title
              </Label>
              <Input
                id="seoTitle"
                placeholder="Enter SEO Title"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("seo_title")}
              />
              {errors.seo_title && (
                <span className="text-red-500 text-sm">
                  {errors.seo_title.message}
                </span>
              )}
            </div>
            {/* Search Tags (chip input) */}
            <div className="space-y-2">
              <Label
                htmlFor="searchTagsArray"
                className="text-base font-medium font-sans"
              >
                Search Tags
              </Label>
              <TagsInput
                value={
                  Array.isArray(watch("search_tags"))
                    ? watch("search_tags")
                    : []
                }
                onChange={(tags: string[]) => setValue("search_tags", tags)}
                name="searchTagsArray"
                placeHolder="Add tag and press enter"
              />
              {errors.search_tags && (
                <span className="text-red-500 text-sm">
                  {errors.search_tags.message}
                </span>
              )}
            </div>
            {/* SEO Description */}
            <div className="space-y-2">
              <Label
                htmlFor="seoDescription"
                className="text-base font-medium font-sans"
              >
                SEO Description
              </Label>
              <Input
                id="seoDescription"
                placeholder="Enter SEO Description"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("seo_description")}
              />
              {errors.seo_description && (
                <span className="text-red-500 text-sm">
                  {errors.seo_description.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end pt-4">
          <DynamicButton
            variant="default"
            type="submit"
            customClassName="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
            disabled={submitLoading}
            loading={submitLoading}
            loadingText="Adding..."
            text="Add Product"
          />
        </div>
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          title="Add Product"
          description="Are you sure you want to add this product?"
          confirmText="Yes, Add Product"
          cancelText="No, Cancel"
        />
      </form>
    </div>
  );
}



