"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDealerProduct,
  selectDealerProductLoading,
  selectDealerProductError,
} from "@/store/slice/dealer-product/dealerProductByIdSlice";
import { fetchDealerProductByIdThunk } from "@/store/slice/dealer-product/dealerProductByIdThunks";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { getDealerById, getDealerIdFromUserId } from "@/service/dealerServices";
import type { Dealer } from "@/types/dealer-types";
import { updateDealerProduct } from "@/service/dealer-products-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategoriesByType,
  getSubcategoriesByCategoryId,
  getBrandByType,
  getModelByBrand,
  getVariantsByModelIds,
  getTypes,
} from "@/service/product-Service";

const schema: any = z.object({
  manufacturer_part_name: z.string().optional(),
  product_name: z.string().min(1, "Product Name is required"),
  brand: z.string().min(1, "Brand is required"),
  hsn_code: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().min(1, "Sub-category is required"),
  product_type: z.string().min(1, "Product type is required"),
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  make: z.string().optional(),
  model: z.array(z.string()).min(1, "At least one model is required"),
  year_range: z.array(z.string()).optional(),
  variant: z.array(z.string()).min(1, "At least one variant is required"),
  fitment_notes: z.string().optional(),
  is_universal: z.string().optional(),
  is_consumable: z.string().optional(),
  key_specifications: z.string().optional(),
  weight: z.coerce
    .number()
    .min(0, "Weight must be a positive number")
    .optional(),
  certifications: z.string().optional(),
  warranty: z.coerce
    .number()
    .min(0, "Warranty must be a positive number")
    .optional(),
  mrp_with_gst: z.number().min(1, "MRP is required"),
  gst_percentage: z.number().min(1, "GST is required"),
  dealer_selling_price: z.number().min(1, "Selling Price is required"),
  is_returnable: z.boolean(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  search_tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow backspace, delete, tab, escape, enter, and decimal point
  if (
    [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
    // Allow Ctrl+A
    (e.keyCode === 65 && e.ctrlKey === true) ||
    // Allow Ctrl+C
    (e.keyCode === 67 && e.ctrlKey === true) ||
    // Allow Ctrl+V
    (e.keyCode === 86 && e.ctrlKey === true) ||
    // Allow Ctrl+X
    (e.keyCode === 88 && e.ctrlKey === true) ||
    // Allow home, end, left, right
    (e.keyCode >= 35 && e.keyCode <= 39)
  ) {
    // Let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the keypress
  if (
    (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
    (e.keyCode < 96 || e.keyCode > 105)
  ) {
    e.preventDefault();
  }
};

export default function DealerProductEditRedux() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { showToast } = useToast();

  // Redux state
  const product = useAppSelector(selectDealerProduct);
  console.log("product", product);
  const loading = useAppSelector(selectDealerProductLoading);
  const productError = useAppSelector(selectDealerProductError);

  // Permission states
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [allowedReadFields, setAllowedReadFields] = useState<string[] | null>(
    null
  );
  const [allowedUpdateFields, setAllowedUpdateFields] = useState<
    string[] | null
  >(null);
  const [readPermissionsEnabled, setReadPermissionsEnabled] =
    useState<boolean>(true);
  const [updatePermissionsEnabled, setUpdatePermissionsEnabled] =
    useState<boolean>(true);

  // Dropdown options
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [yearRangeOptions, setYearRangeOptions] = useState<any[]>([]);
  const [varientOptions, setVarientOptions] = useState<any[]>([]);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for tracking previous values to prevent infinite loops
  const prevVehicleTypeRef = useRef<string | undefined>(undefined);
  const prevCategoryRef = useRef<string | undefined>(undefined);
  const prevBrandRef = useRef<string | undefined>(undefined);
  const prevModelRef = useRef<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      model: [],
      variant: [],
      year_range: [],
      search_tags: [],
      is_returnable: false,
    },
  });

  // Permission check functions
  const canViewField = useCallback(
    (fieldName: string) => {
      if (!readPermissionsEnabled) return true;
      if (!allowedReadFields || allowedReadFields.length === 0) return true;
      return allowedReadFields.includes(fieldName);
    },
    [allowedReadFields, readPermissionsEnabled]
  );

  const canEditField = useCallback(
    (fieldName: string) => {
      if (!updatePermissionsEnabled) return false;
      if (!allowedUpdateFields || allowedUpdateFields.length === 0) return true; // If no update restrictions, allow all
      return allowedUpdateFields.includes(fieldName);
    },
    [allowedUpdateFields, updatePermissionsEnabled]
  );

  // Get dealer permissions
  useEffect(() => {
    const fetchDealerPermissions = async () => {
      try {
        const id = await getDealerIdFromUserId();
        setDealerId(id);

        const dealerResponse = await getDealerById(id);
        const dealer = dealerResponse.data as Dealer;

        // Set read permissions
        const readEnabled =
          dealer.permission?.readPermissions?.isEnabled ?? true;
        setReadPermissionsEnabled(readEnabled);
        setAllowedReadFields(
          dealer.permission?.readPermissions?.allowed_fields || null
        );

        // Set update permissions
        const updateEnabled =
          dealer.permission?.updatePermissions?.isEnabled ?? true;
        setUpdatePermissionsEnabled(updateEnabled);
        setAllowedUpdateFields(
          dealer.permission?.updatePermissions?.allowed_fields || null
        );
      } catch (err) {
        console.error("Failed to fetch dealer permissions:", err);
        // Fallback to all permissions enabled
        setReadPermissionsEnabled(true);
        setUpdatePermissionsEnabled(true);
        setAllowedReadFields(null);
        setAllowedUpdateFields(null);
      }
    };

    fetchDealerPermissions();
  }, []);

  // Fetch product data when component mounts
  useEffect(() => {
    if (productId) {
      dispatch(fetchDealerProductByIdThunk(productId));
    }
  }, [productId, dispatch]);

  // Helper function for form population
  const populateFormWithProduct = useCallback((product: any) => {
    // Set dependent state first
    const vehicleTypeId = product.brand?.type?._id || "";
    const brandId = product.brand?._id || "";

    // Handle multiple models
    const modelIds = product.model?.map((m: { _id: string }) => m._id) || [];

    // Handle multiple variants
    const variantIds = product.variant?.map((v: { _id: string }) => v._id) || [];

    // Update refs to prevent effects from running
    prevVehicleTypeRef.current = vehicleTypeId;
    prevCategoryRef.current = product.category?._id || "";
    prevBrandRef.current = brandId;
    prevModelRef.current = modelIds;

    // Populate form
    setValue("manufacturer_part_name", product.manufacturer_part_name);
    setValue("product_name", product.product_name);
    setValue("brand", brandId);
    setValue("hsn_code", product.hsn_code);
    setValue("category", product.category?._id || "");
    setValue("sub_category", product.sub_category?._id || "");
    setValue("product_type", product.product_type);
    setValue("vehicle_type", vehicleTypeId);
    setValue("make", product.make && product.make.length > 0 ? product.make[0] : "");
    setValue("model", modelIds);
    setValue("variant", variantIds);
    setValue("fitment_notes", product.fitment_notes);
    setValue("is_universal", product.is_universal ? "yes" : "no");
    setValue("is_consumable", product.is_consumable ? "yes" : "no");
    setValue("key_specifications", product.key_specifications);
    setValue("weight", product.weight);
    setValue("certifications", product.certifications);
    setValue("warranty", product.warranty);
    setValue("mrp_with_gst", product.mrp_with_gst);
    setValue("gst_percentage", product.gst_percentage);
    setValue("dealer_selling_price", product.selling_price);
    setValue("is_returnable", product.is_returnable);
    setValue("seo_title", product.seo_title);
    setValue("seo_description", product.seo_description);
    setValue("search_tags", product.search_tags || []);
  }, [setValue]);

  // Effect 1: Initial Data Fetch (Once on Mount)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typesResponse = await getTypes();
        setTypeOptions(
          Array.isArray(typesResponse.data)
            ? typesResponse.data
            : Array.isArray(typesResponse.data?.products)
            ? typesResponse.data.products
            : []
        );
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        showToast("Failed to load initial options", "error");
      }
    };
    fetchInitialData();
  }, [showToast]);

  // Effect 2: Parallel Fetch All Dependent Options
  useEffect(() => {
    if (!product) return;

    // Extract all IDs from product
    const typeId = product.brand?.type?._id;
    const categoryId = product.category?._id;
    const brandId = product.brand?._id;
    const modelIds = product.model?.map((m: { _id: string }) => m._id) || [];

    // Fetch ALL options in parallel
    Promise.all([
      getCategoriesByType(typeId),
      getSubcategoriesByCategoryId(categoryId),
      getBrandByType(typeId),
      getModelByBrand(brandId),
      getVariantsByModelIds(modelIds),
    ]).then(([cats, subCats, brands, models, variants]) => {
      // Set all options
      setCategoryOptions(Array.isArray(cats.data) ? cats.data : []);
      setSubCategoryOptions(Array.isArray(subCats.data) ? subCats.data : []);
      setBrandOptions(Array.isArray(brands.data) ? brands.data : []);
      setModelOptions(Array.isArray(models.data) ? models.data : []);
      setVarientOptions(Array.isArray(variants.data) ? variants.data : []);

      // NOW populate form after all options loaded
      populateFormWithProduct(product);
    }).catch((error) => {
      console.error("Failed to fetch dependent options:", error);
      showToast("Failed to load product options", "error");
    });
  }, [product, populateFormWithProduct, showToast]);

  // When vehicle type changes → fetch categories and brands
  const vehicleType = watch("vehicle_type");
  useEffect(() => {
    if (vehicleType && vehicleType !== prevVehicleTypeRef.current) {
      prevVehicleTypeRef.current = vehicleType;
      setValue("category", "");
      setValue("brand", "");
      setValue("model", []);
      setValue("variant", []);

      Promise.all([
        getCategoriesByType(vehicleType),
        getBrandByType(vehicleType),
      ])
        .then(([cats, brands]) => {
          setCategoryOptions(Array.isArray(cats.data) ? cats.data : []);
          setBrandOptions(Array.isArray(brands.data) ? brands.data : []);
        })
        .catch((error) => {
          console.error("Failed to fetch categories and brands:", error);
          showToast("Failed to load options for selected vehicle type", "error");
        });
    }
  }, [vehicleType, showToast]);

  // When category changes → fetch subcategories
  const category = watch("category");
  useEffect(() => {
    if (category && category !== prevCategoryRef.current) {
      prevCategoryRef.current = category;
      setValue("sub_category", "");

      getSubcategoriesByCategoryId(category)
        .then((subCats) => {
          setSubCategoryOptions(Array.isArray(subCats.data) ? subCats.data : []);
        })
        .catch((error) => {
          console.error("Failed to fetch subcategories:", error);
          showToast("Failed to load subcategories", "error");
        });
    }
  }, [category, showToast]);

  // When brand changes → fetch models
  const brand = watch("brand");
  useEffect(() => {
    if (brand && brand !== prevBrandRef.current) {
      prevBrandRef.current = brand;
      setValue("model", []);
      setValue("variant", []);

      getModelByBrand(brand)
        .then((models) => {
          setModelOptions(Array.isArray(models.data) ? models.data : []);
        })
        .catch((error) => {
          console.error("Failed to fetch models:", error);
          showToast("Failed to load models for selected brand", "error");
        });
    }
  }, [brand, showToast]);

  // When models change → fetch variants for ALL selected models
  const models = watch("model");
  useEffect(() => {
    if (
      Array.isArray(models) &&
      models.length > 0 &&
      JSON.stringify(models) !== JSON.stringify(prevModelRef.current)
    ) {
      prevModelRef.current = models;
      setValue("variant", []);

      getVariantsByModelIds(models)
        .then((variants) => {
          setVarientOptions(Array.isArray(variants.data) ? variants.data : []);
        })
        .catch((error) => {
          console.error("Failed to fetch variants:", error);
          showToast("Failed to load variants for selected models", "error");
        });
    } else if (models === undefined || models.length === 0) {
      if (prevModelRef.current.length > 0) {
        prevModelRef.current = [];
        setVarientOptions([]);
      }
    }
  }, [models, showToast]);

  const onSubmit = async (data: FormValues) => {
    if (!productId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      await updateDealerProduct(productId, formData);

      showToast("Product updated successfully", "success");

      // Refresh the product data
      dispatch(fetchDealerProductByIdThunk(productId));

      // Navigate back to product details
      router.push(`/dealer/dashboard/product/productdetails/${productId}`);
    } catch (error: any) {
      console.error("Failed to update product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update product";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dealer/dashboard/product">Product</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dealer/dashboard/product">Product</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {productError || "Product Not Found"}
            </h3>
            <p className="text-gray-600">
              Unable to load product data for editing.
            </p>
            <Button
              onClick={() => router.push("/dealer/dashboard/product")}
              className="mt-4"
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dealer/dashboard/product">Product</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
              Edit Product
            </h1>
            <p className="text-base font-medium font-sans text-gray-500">
              Update product information and specifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/dealer/dashboard/product/productdetails/${productId}`
                )
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-8">
        {/* Core Product Identity */}
        {(canViewField("product_name") ||
          canViewField("manufacturer_part_name") ||
          canViewField("brand") ||
          canViewField("category") ||
          canViewField("sub_category") ||
          canViewField("product_type") ||
          canViewField("vehicle_type")) && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">
                Core Product Identity
              </CardTitle>
              <p className="text-sm text-gray-500">
                The core identifiers that define the product's identity, brand,
                and origin.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {canViewField("product_name") && (
                <div className="space-y-2">
                  <Label htmlFor="product_name" className="text-sm font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product_name"
                    placeholder="Enter Product Name"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("product_name")}
                    disabled={!canEditField("product_name")}
                  />
                  {errors.product_name && (
                    <span className="text-red-500 text-sm">
                      {errors.product_name?.message as string}
                    </span>
                  )}
                </div>
              )}
              {canViewField("manufacturer_part_name") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="manufacturer_part_name"
                    className="text-sm font-medium"
                  >
                    Manufacturer Part Number
                  </Label>
                  <Input
                    id="manufacturer_part_name"
                    placeholder="Enter Manufacturer Part Number"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("manufacturer_part_name")}
                    disabled={!canEditField("manufacturer_part_name")}
                  />
                  {errors.manufacturer_part_name && (
                    <span className="text-red-500 text-sm">
                      {errors.manufacturer_part_name?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("vehicle_type") && (
                <div className="space-y-2">
                  <Label htmlFor="vehicle_type" className="text-sm font-medium">
                    Vehicle Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("vehicle_type") || ""}
                    onValueChange={(value) => setValue("vehicle_type", value)}
                  >
                    <SelectTrigger
                      id="vehicle_type"
                      className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                      disabled={!canEditField("vehicle_type")}
                    >
                      <SelectValue placeholder="Select Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.type_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicle_type && (
                    <span className="text-red-500 text-sm">
                      {errors.vehicle_type?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("brand") && (
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-medium">
                    Brand <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("brand") || ""}
                    onValueChange={(value) => setValue("brand", value)}
                  >
                    <SelectTrigger
                      id="brand"
                      className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                      disabled={!canEditField("brand")}
                    >
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {(brandOptions || []).map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.brand_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brand && (
                    <span className="text-red-500 text-sm">
                      {errors.brand?.message as string}
                    </span>
                  )}
                </div>
              )}

{canViewField("category") && (
  <div className="space-y-2">
    <Label htmlFor="category" className="text-sm font-medium">
      Category <span className="text-red-500">*</span>
    </Label>
    <Select
      value={watch("category") || ""}
      onValueChange={(value) => setValue("category", value)}
    >
      <SelectTrigger
        id="category"
        className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
        disabled={!canEditField("category")}
      >
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent>
        {(categoryOptions || []).map((category) => (
          <SelectItem key={category._id} value={category._id}>
            {category.category_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.category && (
      <span className="text-red-500 text-sm">
        {errors.category?.message as string}
      </span>
    )}
  </div>
)}

{canViewField("sub_category") && (
  <div className="space-y-2">
    <Label htmlFor="sub_category" className="text-sm font-medium">
      Sub-category <span className="text-red-500">*</span>
    </Label>
    <Select
      value={watch("sub_category") || ""}
      onValueChange={(value) => setValue("sub_category", value)}
    >
      <SelectTrigger
        id="sub_category"
        className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
        disabled={!canEditField("sub_category")}
      >
        <SelectValue placeholder="Select Sub-category" />
      </SelectTrigger>
      <SelectContent>
        {(subCategoryOptions || []).map((subCategory) => (
          <SelectItem key={subCategory._id} value={subCategory._id}>
            {subCategory.subcategory_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.sub_category && (
      <span className="text-red-500 text-sm">
        {errors.sub_category?.message as string}
      </span>
    )}
  </div>
)}
              {canViewField("product_type") && (
                <div className="space-y-2">
                  <Label htmlFor="product_type" className="text-sm font-medium">
                    Product Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product_type"
                    placeholder="Enter Product Type"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("product_type")}
                    disabled={!canEditField("product_type")}
                  />
                  {errors.product_type && (
                    <span className="text-red-500 text-sm">
                      {errors.product_type?.message as string}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vehicle Compatibility */}
        {(canViewField("model") ||
          canViewField("variant") ||
          canViewField("make") ||
          canViewField("fitment_notes") ||
          canViewField("is_universal")) && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">
                Vehicle Compatibility
              </CardTitle>
              <p className="text-sm text-gray-500">
                The vehicle make, model, and variant the product is compatible
                with.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {canViewField("make") && (
                <div className="space-y-2">
                  <Label htmlFor="make" className="text-sm font-medium">
                    Make
                  </Label>
                  <Input
                    id="make"
                    placeholder="Enter Make"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("make")}
                    disabled={!canEditField("make")}
                  />
                  {errors.make && (
                    <span className="text-red-500 text-sm">
                      {errors.make?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("model") && (
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium">
                    Model <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-52 overflow-y-auto">
                    {modelOptions.length === 0 ? (
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
                                  ? selected.filter(
                                      (id: string) => id !== option._id
                                    )
                                  : [...selected, option._id];
                                setValue("model", updated);
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                isSelected
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                              disabled={!canEditField("model")}
                            >
                              {option.model_name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {errors.model && (
                    <span className="text-red-500 text-sm">
                      {errors.model?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("variant") && (
                <div className="space-y-2">
                  <Label htmlFor="variant" className="text-sm font-medium">
                    Variant <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-52 overflow-y-auto">
                    {varientOptions.length === 0 ? (
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
                                  ? selected.filter((id: string) => id !== option._id)
                                  : [...selected, option._id];
                                setValue("variant", updated);
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                isSelected
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                              disabled={!canEditField("variant")}
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
                      {errors.variant?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("fitment_notes") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="fitment_notes"
                    className="text-sm font-medium"
                  >
                    Fitment Notes
                  </Label>
                  <Input
                    id="fitment_notes"
                    placeholder="Enter Fitment Notes"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("fitment_notes")}
                    disabled={!canEditField("fitment_notes")}
                  />
                  {errors.fitment_notes && (
                    <span className="text-red-500 text-sm">
                      {errors.fitment_notes?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("is_universal") && (
                <div className="space-y-2">
                  <Label htmlFor="is_universal" className="text-sm font-medium">
                    Is Universal
                  </Label>
                  <Select
                    value={watch("is_universal") || ""}
                    onValueChange={(value) => setValue("is_universal", value)}
                  >
                    <SelectTrigger
                      id="is_universal"
                      className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                      disabled={!canEditField("is_universal")}
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
                      {errors.is_universal?.message as string}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Technical Specifications */}
        {(canViewField("key_specifications") ||
          canViewField("weight") ||
          canViewField("certifications") ||
          canViewField("warranty") ||
          canViewField("is_consumable")) && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">
                Technical Specifications
              </CardTitle>
              <p className="text-sm text-gray-500">
                Add all relevant technical details to help users understand the
                product quality and features.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {canViewField("key_specifications") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="key_specifications"
                    className="text-sm font-medium"
                  >
                    Key Specifications
                  </Label>
                  <Input
                    id="key_specifications"
                    placeholder="Enter Key Specifications"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("key_specifications")}
                    disabled={!canEditField("key_specifications")}
                  />
                  {errors.key_specifications && (
                    <span className="text-red-500 text-sm">
                      {errors.key_specifications?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("weight") && (
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter Weight in kg"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    {...register("weight")}
                    disabled={!canEditField("weight")}
                  />
                  {errors.weight && (
                    <span className="text-red-500 text-sm">
                      {errors.weight?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("certifications") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="certifications"
                    className="text-sm font-medium"
                  >
                    Certifications
                  </Label>
                  <Input
                    id="certifications"
                    placeholder="Enter Certifications"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("certifications")}
                    disabled={!canEditField("certifications")}
                  />
                  {errors.certifications && (
                    <span className="text-red-500 text-sm">
                      {errors.certifications?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("warranty") && (
                <div className="space-y-2">
                  <Label htmlFor="warranty" className="text-sm font-medium">
                    Warranty (months)
                  </Label>
                  <Input
                    id="warranty"
                    type="number"
                    min="0"
                    placeholder="Enter Warranty in months"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    {...register("warranty")}
                    disabled={!canEditField("warranty")}
                  />
                  {errors.warranty && (
                    <span className="text-red-500 text-sm">
                      {errors.warranty?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("is_consumable") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="is_consumable"
                    className="text-sm font-medium"
                  >
                    Is Consumable
                  </Label>
                  <Select
                    value={watch("is_consumable") || ""}
                    onValueChange={(value) => setValue("is_consumable", value)}
                  >
                    <SelectTrigger
                      id="is_consumable"
                      className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                      disabled={!canEditField("is_consumable")}
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
                      {errors.is_consumable?.message as string}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing & Tax */}
        {(canViewField("mrp_with_gst") ||
          canViewField("gst_percentage") ||
          canViewField("dealer_selling_price") ||
          canViewField("is_returnable")) && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">
                Pricing & Tax
              </CardTitle>
              <p className="text-sm text-gray-500">
                The pricing and tax information required for listing and
                billing.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {canViewField("mrp_with_gst") && (
                <div className="space-y-2">
                  <Label htmlFor="mrp_with_gst" className="text-sm font-medium">
                    MRP (with GST) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mrp_with_gst"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter MRP with GST"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    {...register("mrp_with_gst", { valueAsNumber: true })}
                    disabled={!canEditField("mrp_with_gst")}
                  />
                  {errors.mrp_with_gst && (
                    <span className="text-red-500 text-sm">
                      {errors.mrp_with_gst?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("gst_percentage") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="gst_percentage"
                    className="text-sm font-medium"
                  >
                    GST % <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="gst_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Enter GST Percentage"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    {...register("gst_percentage", { valueAsNumber: true })}
                    disabled={!canEditField("gst_percentage")}
                  />
                  {errors.gst_percentage && (
                    <span className="text-red-500 text-sm">
                      {errors.gst_percentage?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("dealer_selling_price") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="dealer_selling_price"
                    className="text-sm font-medium"
                  >
                    Selling Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dealer_selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter Selling Price"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    {...register("dealer_selling_price", { valueAsNumber: true })}
                    disabled={!canEditField("dealer_selling_price")}
                  />
                  {errors.dealer_selling_price && (
                    <span className="text-red-500 text-sm">
                      {errors.dealer_selling_price?.message as string   }
                    </span>
                  )}
                </div>
              )}

              {canViewField("is_returnable") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="is_returnable"
                    className="text-sm font-medium"
                  >
                    Is Returnable
                  </Label>
                  <Select
                    value={watch("is_returnable") ? "yes" : "no"}
                    onValueChange={(value) =>
                      setValue("is_returnable", value === "yes")
                    }
                  >
                    <SelectTrigger
                      id="is_returnable"
                      className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                      disabled={!canEditField("is_returnable")}
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
                      {errors.is_returnable?.message as string}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SEO & Search Optimization */}
        {(canViewField("seo_title") ||
          canViewField("seo_description") ||
          canViewField("search_tags")) && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">
                SEO & Search Optimization
              </CardTitle>
              <p className="text-sm text-gray-500">
                Optimize product visibility and search engine ranking.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {canViewField("seo_title") && (
                <div className="space-y-2">
                  <Label htmlFor="seo_title" className="text-sm font-medium">
                    SEO Title
                  </Label>
                  <Input
                    id="seo_title"
                    placeholder="Enter SEO Title"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("seo_title")}
                    disabled={!canEditField("seo_title")}
                  />
                  {errors.seo_title && (
                    <span className="text-red-500 text-sm">
                      {errors.seo_title?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("seo_description") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="seo_description"
                    className="text-sm font-medium"
                  >
                    SEO Description
                  </Label>
                  <Input
                    id="seo_description"
                    placeholder="Enter SEO Description"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("seo_description")}
                    disabled={!canEditField("seo_description")}
                  />
                  {errors.seo_description && (
                    <span className="text-red-500 text-sm">
                      {errors.seo_description?.message as string}
                    </span>
                  )}
                </div>
              )}

              {canViewField("search_tags") && (
                <div className="space-y-2">
                  <Label htmlFor="search_tags" className="text-sm font-medium">
                    Search Tags
                  </Label>
                  <Input
                    id="search_tags"
                    placeholder="Enter Search Tags (comma separated)"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag);
                      setValue("search_tags", tags);
                    }}
                    disabled={!canEditField("search_tags")}
                  />
                  {errors.search_tags && (
                    <span className="text-red-500 text-sm">
                      {errors.search_tags?.message as string}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
