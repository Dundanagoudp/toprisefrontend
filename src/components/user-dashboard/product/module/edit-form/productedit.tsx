"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// @ts-ignore
import { TagsInput } from "react-tag-input-component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategories,
  getSubCategories,
  getTypes,
  getBrandByType,
  getModelByBrand,
  getYearRange,
  getvarientByModel,
  editProduct,
  getProductById,
} from "@/service/product-Service";
import { useParams } from "next/navigation";
import { Product } from "@/types/product-Types";

const schema = z.object({
  
  skuCode: z.string().min(1, "SKU Code is required"),
  manufacturerPartNumber: z.string().optional(),
  productName: z.string().min(1, "Product Name is required"),
  brand: z.string().optional(),
  hsnCode: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  productType: z.string().min(1, "Product type is required"),
  // Added fields
  noOfStock: z.coerce
    .number()
    .int({ message: "No. of Stock must be an integer" }),
  sellingPrice: z.coerce
    .number()
    .int({ message: "Selling Price must be an integer" }),
  updatedBy: z.string().optional(),
  fulfillmentPriority: z.coerce
    .number()
    .int({ message: "Fulfillment Priority must be an integer" })
    .optional(),
  adminNotes: z.string().optional(),
  // Vehicle Compatibility
  make: z.string().min(1, "Make is required"),
  make2: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  yearRange: z.string().optional(),
  variant: z.string().min(1, "Variant is required"),
  fitmentNotes: z.string().optional(),
  isUniversal: z.string().optional(),
  isConsumable: z.string().optional(),
  // Technical Specifications
  keySpecifications: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  certifications: z.string().optional(),
  warranty: z.string().optional(),
  // Media & Documentation
  images: z.string().optional(),
  videoUrl: z.string().optional(),
  brouchureAvailable: z.string().optional(),
  // Pricing details
  mrp: z.string().min(1, "MRP is required"),
  gst: z.string().min(1, "GST is required"),
  // Return & Availability
  returnable: z.string().min(1, "Returnable is required"),
  returnPolicy: z.string().min(1, "Return Policy is required"),
  // Dealer-Level Mapping & Routing
  availableDealers: z.string().optional(),
  quantityPerDealer: z.string().optional(),
  dealerMargin: z.string().optional(),
  dealerPriorityOverride: z.string().optional(),
  stockExpiryRule: z.string().optional(),
  lastStockUpdate: z.string().optional(),
  LastinquiredAt: z.string().optional(),
  // Status, Audit & Metadata
  active: z.string().optional(),
  createdBy: z.string().optional(),
  modifiedAtBy: z.string().optional(),
  changeLog: z.string().optional(),
  // SEO & Search Optimization
  seoTitle: z.string().optional(),
  searchTags: z.string().optional(),
  searchTagsArray: z.array(z.string()).optional(),
  seoDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProductEdit() {
  // State for dropdown options
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [yearRangeOptions, setYearRangeOptions] = useState<any[]>([]);
  const [varientOptions, setVarientOptions] = useState<any[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  // State for dependent dropdowns
  const [selectedProductTypeId, setSelectedProductTypeId] =
    useState<string>("");
  const [selectedbrandId, setSelectedBrandId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const id = useParams();
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });
  // State for image uploads and previews
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>(
    []
  );
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(filesArray);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setSelectedImagePreviews(previews);
      // Update form value as array of file names or handle as needed
      setValue("images", previews.join(","));
    }
  };

  // Fetch dropdown data
  useEffect(() => {
    const getCategoryOptions = async () => {
      try {
        const response = await getCategories();

        setCategoryOptions(response.data.map((category: any) => category));
      } catch (error) {
        console.error("Failed to fetch category options:", error);
      }
    };
    getCategoryOptions();
  }, []);

  useEffect(() => {
    const getSubCategoryOptions = async () => {
      try {
        const response = await getSubCategories();
        setSubCategoryOptions(response.data.map((category: any) => category));
      } catch (error) {
        console.error("Failed to fetch subcategory options:", error);
      }
    };
    getSubCategoryOptions();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getTypes();
        setTypeOptions(response.data.map((type: any) => type));
        console.log("Type Options:", response.data);
      } catch (error) {
        console.error("Failed to fetch type options:", error);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchYearRange = async () => {
      try {
        const response = await getYearRange();
        setYearRangeOptions(response.data.map((year: any) => year));
      } catch (error) {
        console.error("Failed to fetch year range options:", error);
      }
    };
    fetchYearRange();
  }, []);

  // Fetch brands when product type changes
  useEffect(() => {
    if (!selectedProductTypeId) {
      setBrandOptions([]);
      return;
    }

    let isMounted = true;
    const fetchBrandsByType = async () => {
      setIsLoadingBrands(true);
      try {
        const response = await getBrandByType(selectedProductTypeId);
        console.log("Brand Options:", response.data);
        if (isMounted) {
          setBrandOptions(response.data.map((brand: any) => brand));
        }
      } catch (error) {
        if (isMounted) setBrandOptions([]);
        console.error("Failed to fetch brands by type:", error);
      } finally {
        if (isMounted) setIsLoadingBrands(false);
      }
    };

    fetchBrandsByType();
    return () => {
      isMounted = false;
    };
  }, [selectedProductTypeId]);

  // Fetch models when brand changes
  useEffect(() => {
    if (!selectedbrandId) {
      setModelOptions([]);
      return;
    }
    const fetchModelsByBrand = async () => {
      try {
        const response = await getModelByBrand(selectedbrandId);
        setModelOptions(response.data.map((model: any) => model));
        console.log("Model Options:", response.data);
      } catch (error) {
        setModelOptions([]);
        console.error("Failed to fetch models by brand:", error);
      }
    };
    fetchModelsByBrand();
  }, [selectedbrandId]);

  // Fetch variants when model changes
  useEffect(() => {
    if (!modelId) {
      setVarientOptions([]);
      return;
    }
    const fetchVarientByModel = async () => {
      try {
        const response = await getvarientByModel(modelId);
        setVarientOptions(response.data.map((varient: any) => varient));
        console.log("Varient Options:", response.data);
      } catch (error) {
        console.error("Failed to fetch varient options:", error);
      }
    };
    fetchVarientByModel();
  }, [modelId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (typeof id.id === "string") {
          const response = await getProductById(id.id);
          // response is ProductResponse, which has data: Product[]
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            setProduct(data[0]);
          } else if (
            typeof data === "object" &&
            data !== null &&
            !Array.isArray(data)
          ) {
            setProduct(data as Product);
          } else {
            setProduct(null);
          }
          console.log("getProducts API response:", response);
        } else {
          console.error("Product ID is missing or invalid.");
        }
      } catch (error) {
        console.error("getProducts API error:", error);
      }
    };
    fetchProducts();
  }, []);

  // Populate form with fetched product data
  useEffect(() => {
    if (product) {
      reset({
        skuCode: product.sku_code || "",
        manufacturerPartNumber: product.manufacturer_part_name || "",
        productName: product.product_name || "",
        brand: product.brand?.brand_name || "",
        hsnCode: product.hsn_code || "",
        category: product.category?._id || "",
        subCategory: product.sub_category?._id || "",
        productType: product.product_type || "",
        noOfStock: product.no_of_stock,
        sellingPrice: product.selling_price,
        updatedBy: product.updated_at || "",
        fulfillmentPriority: product.fulfillment_priority,
        adminNotes: product.admin_notes || "",
        make: product.make && product.make.length > 0 ? product.make[0] : "",
        make2: product.make && product.make.length > 1 ? product.make[1] : "",
        model: product.model.model_name || "",
        yearRange:
          product.year_range && product.year_range.length > 0
            ? product.year_range[0].year_name
            : "",
        variant:
          product.variant && product.variant.length > 0
            ? product.variant[0].variant_name
            : "",
        fitmentNotes: product.fitment_notes || "",
        isUniversal: product.is_universal ? "yes" : "no",
        isConsumable: product.is_consumable ? "yes" : "no",
        keySpecifications: product.key_specifications || "",
        dimensions: "",
        weight: product.weight?.toString() || "",
        certifications: product.certifications || "",
        warranty: product.warranty?.toString() || "",
        images: product.images?.join(",") || "",
        videoUrl: "",
        brouchureAvailable: product.brochure_available ? "yes" : "no",
        mrp: product.mrp_with_gst?.toString() || "",
        gst: product.gst_percentage?.toString() || "",
        returnable: product.is_returnable ? "yes" : "no",
        returnPolicy: product.return_policy || "",
        availableDealers: "",
        quantityPerDealer: "",
        dealerMargin: "",
        dealerPriorityOverride: "",
        stockExpiryRule: "",
        lastStockUpdate: product.available_dealers?.last_stock_update || "",
        LastinquiredAt: product.last_stock_inquired || "",
        seoTitle: product.seo_title || "",
        searchTags: product.search_tags?.join(",") || "",
        searchTagsArray: product.search_tags || [],
        seoDescription: product.seo_description || "",
      });
      // Initialize image previews for existing images
      if (product.images && Array.isArray(product.images)) {
        setSelectedImagePreviews(product.images);
      } else {
        setSelectedImagePreviews([]);
      }
    }
  }, [product, reset]);

  // Set dependent dropdown IDs only when options and product are available
  useEffect(() => {
    if (product && typeOptions.length > 0) {
      const selectedTypeObj = typeOptions.find(
        (t) => t.type_name === product.product_type
      );
      setSelectedProductTypeId(selectedTypeObj?._id || "");
    }
  }, [product, typeOptions]);

  useEffect(() => {
    if (product && brandOptions.length > 0 && product.brand) {
      const selectedBrandObj = brandOptions.find(
        (b) => b.brand_name === product.brand?.brand_name
      );
      setSelectedBrandId(selectedBrandObj?._id || "");
    }
  }, [product, brandOptions]);

  useEffect(() => {
    if (product && modelOptions.length > 0 && product.model) {
      const selectedModelObj = modelOptions.find(
        (m) => m.model_name === product.model?.model_name
      );
      setModelId(selectedModelObj?._id || "");
    }
  }, [product, modelOptions]);

  const onSubmit = async (data: FormValues) => {
    setApiError("");
    setIsSubmitting(true);
    console.log("onSubmit called. Data:", data);
    if (typeof id.id === "string") {
      const preparedData = {
        ...data,

        category:
          categoryOptions.find((cat) => cat.category_name === data.category)
            ?._id || data.category,
        subCategory:
          subCategoryOptions.find(
            (sub) => sub.subcategory_name === data.subCategory
          )?._id || data.subCategory,
        productType:
          typeOptions.find((type) => type.type_name === data.productType)
            ?._id || data.productType,
        brand:
          selectedbrandId ||
          brandOptions.find((brand) => brand.brand_name === data.brand)?._id,
        model:
          modelId ||
          modelOptions.find((model) => model.model_name === data.model)?._id,

        variant: (() => {
          const found = varientOptions.find(
            (v) => v.variant_name === data.variant
          );
          return found && found._id ? [found._id] : [];
        })(),
        yearRange:
          yearRangeOptions.find((year) => year.year_name === data.yearRange)
            ?._id || data.yearRange,
      };

      console.log("Prepared data with ObjectIds:", preparedData);

      if (selectedImages.length === 0) {
        // No images - send as JSON
        console.log("Sending as JSON (no images)");
        try {
          const response = await editProduct(id.id, preparedData);
          console.log("Edit Product Response:", response);
          console.log("Updated Product Data:", preparedData);
          setApiError("");
        } catch (error: any) {
          console.error("Failed to edit product (JSON):", error);
          console.error(
            "Error details:",
            error.response?.data || error.message
          );
          setApiError(
            error.response?.data?.message ||
              error.message ||
              "Failed to update product"
          );
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // Has images - send as FormData
        console.log("Sending as FormData (with images)");
        const formData = new FormData();

        // Append all prepared fields except images
        Object.entries(preparedData).forEach(([key, value]) => {
          if (key !== "images" && value != null) {
            if (Array.isArray(value)) {
              value.forEach((v) => formData.append(key, v));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        // Append image files
        selectedImages.forEach((file) => {
          formData.append("images", file);
        });

        // Debug: Log FormData contents
        console.log("FormData contents:");
        for (let pair of formData.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        try {
          const response = await editProduct(id.id, formData);
          console.log("Edit Product Response:", response);
          console.log("Updated Product Data:", preparedData);
          setApiError("");
        } catch (error: any) {
          console.error("Failed to edit product (FormData):", error);
          console.error(
            "Error details:",
            error.response?.data || error.message
          );
          setApiError(
            error.response?.data?.message ||
              error.message ||
              "Failed to update product"
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    } else {
      console.error("Product ID is missing or invalid.");
      setApiError("Product ID is missing or invalid.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {apiError && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {apiError}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Edit Product
          </h1>
          <p className="text-sm text-gray-500">
            Edit your product details below
          </p>
        </div>
      </div>
      <form
        id="edit-product-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Core Product Identity */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">
              Core Product Identity
            </CardTitle>
            <p className="text-sm text-gray-500">
              Classify the product for catalog structure, filterability, and
              business logic.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sku Code */}
            <div className="space-y-2">
              <Label htmlFor="skuCode" className="text-sm font-medium">
                Sku Code
              </Label>
              <Input
                id="sku_code"
                placeholder="Enter Sku Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("skuCode")}
              />
              {errors.skuCode && (
                <span className="text-red-500 text-sm">
                  {errors.skuCode.message}
                </span>
              )}
            </div>
            {/* No. of Stock */}
            <div className="space-y-2">
              <Label htmlFor="noOfStock" className="text-sm font-medium">
                No. of Stock
              </Label>
              <Input
                id="no_of_stock"
                type="number"
                step="1"
                min="0"
                placeholder="Enter No. of Stock"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("noOfStock", { valueAsNumber: true })}
              />
              {errors.noOfStock && (
                <span className="text-red-500 text-sm">
                  {errors.noOfStock.message}
                </span>
              )}
            </div>
            {/* Manufacturer Part Number */}
            <div className="space-y-2">
              <Label
                htmlFor="manufacturerPartNumber"
                className="text-sm font-medium"
              >
                Manufacturer Part Number (MPN)
              </Label>
              <Input
                id="manufacturer_part_name"
                placeholder="Part Number"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("manufacturerPartNumber")}
              />
              {errors.manufacturerPartNumber && (
                <span className="text-red-500 text-sm">
                  {errors.manufacturerPartNumber.message}
                </span>
              )}
            </div>
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-sm font-medium">
                Product Name
              </Label>
              <Input
                id="product_name"
                placeholder="Enter Product Name"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("productName")}
              />
              {errors.productName && (
                <span className="text-red-500 text-sm">
                  {errors.productName.message}
                </span>
              )}
            </div>
            {/* Brand */}

            {/* HSN Code */}
            <div className="space-y-2">
              <Label htmlFor="hsnCode" className="text-sm font-medium">
                HSN Code
              </Label>
              <Input
                id="hsn_code"
                placeholder="Enter HSN Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("hsnCode")}
              />
              {errors.hsnCode && (
                <span className="text-red-500 text-sm">
                  {errors.hsnCode.message}
                </span>
              )}
            </div>
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={watch("category") || ""}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger
                  id="category"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.length === 0 ? (
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
              <Label htmlFor="subCategory" className="text-sm font-medium">
                Sub-category
              </Label>
              <Select
                value={watch("subCategory") || ""}
                onValueChange={(value) => setValue("subCategory", value)}
              >
                <SelectTrigger
                  id="sub_category"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {subCategoryOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
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
              {errors.subCategory && (
                <span className="text-red-500 text-sm">
                  {errors.subCategory.message}
                </span>
              )}
            </div>
            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-sm font-medium">
                Product Type
              </Label>
              <Select
                value={watch("productType") || ""}
                onValueChange={(value) => {
                  setValue("productType", value);

                  const selectedType = typeOptions.find(
                    (type) => type.type_name === value
                  );
                  setSelectedProductTypeId(selectedType?._id || "");
                }}
              >
                <SelectTrigger
                  id="product_type"
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
                    typeOptions.map((type) => (
                      <SelectItem
                        key={type._id || type.type_name}
                        value={type.type_name}
                      >
                        {type.type_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.productType && (
                <span className="text-red-500 text-sm">
                  {errors.productType.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Vehicle Compatibility */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">
              Vehicle Compatibility
            </CardTitle>
            <p className="text-sm text-gray-500">
              Specify which vehicle make, model, and variant the product is
              compatible with.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium">
                Brand
              </Label>
              <Select
                value={watch("brand") || ""}
                onValueChange={(value) => {
                  setValue("brand", value);

                  const selectedBrand = brandOptions.find(
                    (p) => p.brand_name === value
                  );
                  setSelectedBrandId(selectedBrand?._id || "");
                }}
              >
                <SelectTrigger
                  id="brand"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select Product Type first" />
                </SelectTrigger>
                <SelectContent>
                  {!selectedProductTypeId ? (
                    <SelectItem value="no-type" disabled>
                      Please select product type first
                    </SelectItem>
                  ) : isLoadingBrands ? (
                    <SelectItem value="loading" disabled>
                      Loading brands...
                    </SelectItem>
                  ) : brandOptions.length === 0 ? (
                    <SelectItem value="no-brands" disabled>
                      No brands found
                    </SelectItem>
                  ) : (
                    brandOptions.map((brand) => (
                      <SelectItem key={brand._id} value={brand.brand_name}>
                        {brand.brand_name}
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
              <Label htmlFor="model" className="text-sm font-medium">
                Model
              </Label>
              <Select
                value={watch("model") || ""}
                onValueChange={(value) => {
                  setValue("model", value);
                  // Find the selected model to get its ID for filtering variants
                  const selectedModel = modelOptions.find(
                    (model) => model.model_name === value
                  );
                  setModelId(selectedModel?._id || "");
                }}
              >
                <SelectTrigger
                  id="model"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select Brand first" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      {selectedbrandId ? "Loading..." : "Select Brand first"}
                    </SelectItem>
                  ) : (
                    modelOptions.map((model) => (
                      <SelectItem
                        key={model._id || model.model_name}
                        value={model.model_name}
                      >
                        {model.model_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.model && (
                <span className="text-red-500 text-sm">
                  {errors.model.message}
                </span>
              )}
            </div>
            {/* Year Range */}
            <div className="space-y-2">
              <Label htmlFor="yearRange" className="text-sm font-medium">
                Year Range
              </Label>
              <Select
                value={watch("yearRange") || ""}
                onValueChange={(value) => setValue("yearRange", value)}
              >
                <SelectTrigger
                  id="year_range"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {yearRangeOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    yearRangeOptions.map((year) => (
                      <SelectItem
                        key={year._id || year.year_name}
                        value={year.year_name}
                      >
                        {year.year_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.yearRange && (
                <span className="text-red-500 text-sm">
                  {errors.yearRange.message}
                </span>
              )}
            </div>
            {/* Variant */}
            <div className="space-y-2">
              <Label htmlFor="variant" className="text-sm font-medium">
                Variant
              </Label>
              <Select
                value={watch("variant") || ""}
                onValueChange={(value) => setValue("variant", value)}
              >
                <SelectTrigger
                  id="variant"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select Model first" />
                </SelectTrigger>
                <SelectContent>
                  {varientOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      {modelId ? "Loading..." : "Select Model first"}
                    </SelectItem>
                  ) : (
                    varientOptions.map((variant) => (
                      <SelectItem
                        key={variant._id || variant.variant_name}
                        value={variant.variant_name}
                      >
                        {variant.variant_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.variant && (
                <span className="text-red-500 text-sm">
                  {errors.variant.message}
                </span>
              )}
            </div>
            {/* Fitment Notes */}
            <div className="space-y-2">
              <Label htmlFor="fitmentNotes" className="text-sm font-medium">
                Fitment Notes
              </Label>
              <Input
                id="fitment_notes"
                placeholder="Enter Fitment Notes"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fitmentNotes")}
              />
              {errors.fitmentNotes && (
                <span className="text-red-500 text-sm">
                  {errors.fitmentNotes.message}
                </span>
              )}
            </div>
            {/* Fulfillment Priority */}
            <div className="space-y-2">
              <Label
                htmlFor="fulfillmentPriority"
                className="text-sm font-medium"
              >
                Fulfillment Priority
              </Label>
              <Input
                id="fulfillment_priority"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Fulfillment Priority"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fulfillmentPriority", { valueAsNumber: true })}
              />
              {errors.fulfillmentPriority && (
                <span className="text-red-500 text-sm">
                  {errors.fulfillmentPriority.message}
                </span>
              )}
            </div>
            {/* Is Universal */}
            <div className="space-y-2">
              <Label htmlFor="isUniversal" className="text-sm font-medium">
                Is Universal
              </Label>
              <Select
                value={watch("isUniversal") || ""}
                onValueChange={(value) => setValue("isUniversal", value)}
              >
                <SelectTrigger
                  id="is_universal"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.isUniversal && (
                <span className="text-red-500 text-sm">
                  {errors.isUniversal.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Technical Specifications */}
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
            {/* Key Specifications */}
            <div className="space-y-2">
              <Label
                htmlFor="keySpecifications"
                className="text-sm font-medium"
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
            </div>
            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-sm font-medium">
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
              <Label htmlFor="weight" className="text-sm font-medium">
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
              <Label htmlFor="certifications" className="text-sm font-medium">
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
              <Label htmlFor="warranty" className="text-sm font-medium">
                Warranty
              </Label>
              <Input
                id="warranty"
                placeholder="Enter Warranty"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("warranty")}
              />
              {errors.warranty && (
                <span className="text-red-500 text-sm">
                  {errors.warranty.message}
                </span>
              )}
            </div>
            {/* Is Consumable */}
            <div className="space-y-2">
              <Label htmlFor="isConsumable" className="text-sm font-medium">
                Is Consumable
              </Label>
              <Select
                value={watch("isConsumable") || ""}
                onValueChange={(value) => setValue("isConsumable", value)}
              >
                <SelectTrigger
                  id="is_consumable"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.isConsumable && (
                <span className="text-red-500 text-sm">
                  {errors.isConsumable.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Media & Documentation */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">
              Media & Documentation
            </CardTitle>
            <p className="text-sm text-gray-500">
              Upload product images, videos, and brochures to enhance product
              representation and credibility.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images Upload with Preview */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-sm font-medium">
                Images
              </Label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
              />
              <div className="flex space-x-2 mt-2">
                {selectedImagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                ))}
              </div>
              {errors.images && (
                <span className="text-red-500 text-sm">
                  {errors.images.message}
                </span>
              )}
            </div>
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-sm font-medium">
                Video URL
              </Label>
              <Input
                id="videoUrl"
                placeholder="Paste Link"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("videoUrl")}
              />
              {errors.videoUrl && (
                <span className="text-red-500 text-sm">
                  {errors.videoUrl.message}
                </span>
              )}
            </div>
            {/* Brochure Available */}
            <div className="space-y-2">
              <Label
                htmlFor="brouchureAvailable"
                className="text-sm font-medium"
              >
                Brochure Available
              </Label>
              <Select
                value={watch("brouchureAvailable") || ""}
                onValueChange={(value) => setValue("brouchureAvailable", value)}
              >
                <SelectTrigger
                  id="brouchureAvailable"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.brouchureAvailable && (
                <span className="text-red-500 text-sm">
                  {errors.brouchureAvailable.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Pricing details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">
              Pricing & Tax
            </CardTitle>
            <p className="text-sm text-gray-500">
              Provide the pricing and tax information required for listing and
              billing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MRP (with GST) */}
            <div className="space-y-2">
              <Label htmlFor="mrp" className="text-sm font-medium">
                MRP (with GST)
              </Label>
              <Input
                id="mrp_with_gst"
                placeholder="Enter MRP"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("mrp")}
              />
              {errors.mrp && (
                <span className="text-red-500 text-sm">
                  {errors.mrp.message}
                </span>
              )}
            </div>
            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="text-sm font-medium">
                Selling Price
              </Label>
              <Input
                id="selling_price"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Selling Price"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("sellingPrice", { valueAsNumber: true })}
              />
              {errors.sellingPrice && (
                <span className="text-red-500 text-sm">
                  {errors.sellingPrice.message}
                </span>
              )}
            </div>
            {/* GST % */}
            <div className="space-y-2">
              <Label htmlFor="gst" className="text-sm font-medium">
                GST %
              </Label>
              <Input
                id="gst_percentage"
                placeholder="Enter GST"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("gst")}
              />
              {errors.gst && (
                <span className="text-red-500 text-sm">
                  {errors.gst.message}
                </span>
              )}
            </div>
            {/* Returnable */}
            <div className="space-y-2">
              <Label htmlFor="returnable" className="text-sm font-medium">
                Returnable
              </Label>
              <Input
                id="returnable"
                placeholder="Enter Returnable"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("returnable")}
              />
              {errors.returnable && (
                <span className="text-red-500 text-sm">
                  {errors.returnable.message}
                </span>
              )}
            </div>
            {/* Return Policy */}
            <div className="space-y-2">
              <Label htmlFor="return_policy" className="text-sm font-medium">
                Return Policy
              </Label>
              <Input
                id="returnPolicy"
                placeholder="Enter Return Policy"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("returnPolicy")}
              />
              {errors.returnPolicy && (
                <span className="text-red-500 text-sm">
                  {errors.returnPolicy.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Dealer-Level Mapping & Routing */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">
              Dealer-Level Mapping & Routing
            </CardTitle>
            <p className="text-sm text-gray-500">
              Dealer product quantity and quality
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Dealers */}
            <div className="space-y-2">
              <Label htmlFor="availableDealers" className="text-sm font-medium">
                Available Dealers
              </Label>
              <Input
                id="availableDealers"
                placeholder="Enter Available Dealers"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("availableDealers")}
              />
              {errors.availableDealers && (
                <span className="text-red-500 text-sm">
                  {errors.availableDealers.message}
                </span>
              )}
            </div>
            {/* Quantity per Dealer */}
            <div className="space-y-2">
              <Label
                htmlFor="quantityPerDealer"
                className="text-sm font-medium"
              >
                Quantity per Dealer
              </Label>
              <Input
                id="quantityPerDealer"
                placeholder="Enter Quantity"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("quantityPerDealer")}
              />
              {errors.quantityPerDealer && (
                <span className="text-red-500 text-sm">
                  {errors.quantityPerDealer.message}
                </span>
              )}
            </div>
            {/* Dealer Margin % */}
            <div className="space-y-2">
              <Label htmlFor="dealerMargin" className="text-sm font-medium">
                Dealer Margin %
              </Label>
              <Input
                id="dealerMargin"
                placeholder="Enter Margin"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("dealerMargin")}
              />
              {errors.dealerMargin && (
                <span className="text-red-500 text-sm">
                  {errors.dealerMargin.message}
                </span>
              )}
            </div>
            {/* Dealer Priority Override */}
            <div className="space-y-2">
              <Label
                htmlFor="dealerPriorityOverride"
                className="text-sm font-medium"
              >
                Dealer Priority Override
              </Label>
              <Input
                id="dealerPriorityOverride"
                placeholder="Enter Override"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("dealerPriorityOverride")}
              />
              {errors.dealerPriorityOverride && (
                <span className="text-red-500 text-sm">
                  {errors.dealerPriorityOverride.message}
                </span>
              )}
            </div>
            {/* Stock Expiry Rule */}
            <div className="space-y-2">
              <Label htmlFor="stockExpiryRule" className="text-sm font-medium">
                Stock Expiry Rule
              </Label>
              <Input
                id="stockExpiryRule"
                placeholder="Enter Rule"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("stockExpiryRule")}
              />
              {errors.stockExpiryRule && (
                <span className="text-red-500 text-sm">
                  {errors.stockExpiryRule.message}
                </span>
              )}
            </div>
            {/* Last Stock Update */}
            <div className="space-y-2">
              <Label htmlFor="lastStockUpdate" className="text-sm font-medium">
                Last Stock Update
              </Label>
              <Input
                id="lastStockUpdate"
                placeholder="Enter Update"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("lastStockUpdate")}
              />
              {errors.lastStockUpdate && (
                <span className="text-red-500 text-sm">
                  {errors.lastStockUpdate.message}
                </span>
              )}
            </div>
            {/* Last Inquired At */}
            <div className="space-y-2">
              <Label htmlFor="LastinquiredAt" className="text-sm font-medium">
                Last Inquired At
              </Label>
              <Input
                id="LastinquiredAt"
                placeholder="Enter Last Inquired At"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("LastinquiredAt")}
              />
              {errors.LastinquiredAt && (
                <span className="text-red-500 text-sm">
                  {errors.LastinquiredAt.message}
                </span>
              )}
            </div>
            {/* Admin Notes */}
            <div className="space-y-2">
              <Label htmlFor="adminNotes" className="text-sm font-medium">
                Admin Notes
              </Label>
              <Input
                id="admin_notes"
                placeholder="Enter Admin Notes"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("adminNotes")}
              />
              {errors.adminNotes && (
                <span className="text-red-500 text-sm">
                  {errors.adminNotes.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* SEO & Search Optimization */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">
              SEO & Search Optimization
            </CardTitle>
            <p className="text-sm text-gray-500">
              Optimize product visibility and search performance.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seoTitle" className="text-sm font-medium">
                SEO Title
              </Label>
              <Input
                id="seo_title"
                placeholder="Enter SEO Title"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("seoTitle")}
              />
              {errors.seoTitle && (
                <span className="text-red-500 text-sm">
                  {errors.seoTitle.message}
                </span>
              )}
            </div>

            {/* Search Tags Array (Chips) */}
            <div className="space-y-2">
              <Label htmlFor="searchTagsArray" className="text-sm font-medium">
                Search Tags
              </Label>
              <TagsInput
                value={
                  Array.isArray(watch("searchTagsArray"))
                    ? watch("searchTagsArray")
                    : []
                }
                onChange={(tags: string[]) => setValue("searchTagsArray", tags)}
                name="searchTagsArray"
                placeHolder="Add tag and press enter"
              />
              {errors.searchTagsArray && (
                <span className="text-red-500 text-sm">
                  {errors.searchTagsArray.message}
                </span>
              )}
            </div>
            {/* SEO Description */}
            <div className="space-y-2 col-span-full">
              <Label htmlFor="seoDescription" className="text-sm font-medium">
                SEO Description
              </Label>
              <Input
                id="seo_description"
                placeholder="Enter SEO Description"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("seoDescription")}
              />
              {errors.seoDescription && (
                <span className="text-red-500 text-sm">
                  {errors.seoDescription.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
