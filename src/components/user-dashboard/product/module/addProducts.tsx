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
  addProduct,
  getBrandByType,
  getCategories,
  getModelByBrand,
  getModels,
  getSubCategories,
  getTypes,
  getvarientByModel,
  getYearRange,
} from "@/service/product-Service";
import { useEffect, useState } from "react";

const schema = z.object({
  // Core Product Identity
  skuCode: z.string().min(1, "SKU Code is required"),
  manufacturerPartNumber: z.string().optional(),
  productName: z.string().min(1, "Product Name is required"),
  brand: z.string().optional(),
  hsnCode: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  productType: z.string().min(1, "Product type is required"),

  // Vehicle Compatibility
  make: z.string().min(1, "Make is required"),
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
  images: z.string().optional(), // Assuming string for now, could be FileList later
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
  seoDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AddProducts() {
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);
  const [filteredBrandOptions, setFilteredBrandOptions] = useState<any[]>([]);
  const [selectedProductTypeId, setSelectedProductTypeId] =
    useState<string>("");
  const [selectedbrandId, setSelectedBrandId] = useState<string>("");
  const [yearRangeOptions, setYearRangeOptions] = useState<any[]>([]);
  const [varientOptions, setVarientOptions] = useState<any[]>([]);
  const [modelId, setModelId] = useState<string>("");
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isUniversal: "no",
      isConsumable: "no",
      brouchureAvailable: "no",
      active: "yes",
    },
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  // 1. Add state for image preview and file
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  useEffect(() => {
    const getCategoryOptions = async () => {
      try {
        const response = await getCategories();
        console.log("Category Options:", response);
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
        console.error("Failed to fetch category options:", error);
      }
    };

    getSubCategoryOptions();
  }, []);

  useEffect(() => {
    if (!selectedProductTypeId) {
      setFilteredBrandOptions([]);
      return;
    }
    const fetchBrandsByType = async () => {
      try {
        const response = await getBrandByType(selectedProductTypeId);
        setFilteredBrandOptions(response.data.map((brand: any) => brand));
      } catch (error) {
        setFilteredBrandOptions([]);
        console.error("Failed to fetch brands by type:", error);
      }
    };
    fetchBrandsByType();
  }, [selectedProductTypeId]);
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
    if (!modelId) {
      setVarientOptions([]);
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
    const fetchYearRange = async () => {
      try {
        const response = await getYearRange();
        setYearRangeOptions(response.data.map((year: any) => year));
        console.log("Year Range Options:", response.data);
      } catch (error) {
        console.error("Failed to fetch year range options:", error);
      }
    };
    fetchYearRange();
  }, []);
  const onSubmit = async (data: FormValues) => {
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "images") {
          formData.append(key, value ?? "");
        }
      });
      if (imageFile) {
        formData.append("images", imageFile);
      }
      await addProduct(formData); // expects FormData
      // Optionally show a toast or reset form here
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Add Product
          </h1>
          <p className="text-sm text-gray-500">Add your product description</p>
        </div>
        {/* Save button removed from here */}
      </div>
      <form
        id="add-product-form"
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
                id="skuCode"
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
            {/* Manufacturer Part Number */}
            <div className="space-y-2">
              <Label
                htmlFor="manufacturerPartNumber"
                className="text-sm font-medium"
              >
                Manufacturer Part Number (MPN)
              </Label>
              <Input
                id="manufacturerPartNumber"
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
                id="productName"
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
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium">
                Brand
              </Label>
              <Input
                id="brand"
                placeholder="Enter Brand"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("brand")}
              />
              {errors.brand && (
                <span className="text-red-500 text-sm">
                  {errors.brand.message}
                </span>
              )}
            </div>
            {/* HSN Code */}
            <div className="space-y-2">
              <Label htmlFor="hsnCode" className="text-sm font-medium">
                HSN Code
              </Label>
              <Input
                id="hsnCode"
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
                onValueChange={(value) => setValue("category", value)}
                value={undefined} // Let react-hook-form control value if needed
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
                      <SelectItem
                        key={cat._id || cat.category_name}
                        value={cat.category_name}
                      >
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
              <Select onValueChange={(value) => setValue("subCategory", value)}>
                <SelectTrigger
                  id="subCategory"
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
                      <SelectItem
                        key={cat._id || cat.subcategory_name}
                        value={cat.subcategory_name}
                      >
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
                onValueChange={(value) => {
                  setValue("productType", value);
                  const found = typeOptions.find(
                    (cat: any) => cat.type_name === value
                  );
                  setSelectedProductTypeId(found?._id || "");
                }}
              >
                <SelectTrigger
                  id="productType"
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
                      <SelectItem
                        key={cat._id || cat.type_name}
                        value={cat.type_name}
                      >
                        {cat.type_name}
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
            {/* Make */}
            <div className="space-y-2">
              <Label htmlFor="make" className="text-sm font-medium">
                Make
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("make", value);
                  const found = filteredBrandOptions.find(
                    (cat: any) => cat.brand_name === value
                  );
                  setSelectedBrandId(found?._id || "");
                }}
              >
                <SelectTrigger
                  id="make"
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
                      <SelectItem key={option._id} value={option.brand_name}>
                        {option.brand_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.make && (
                <span className="text-red-500 text-sm">
                  {errors.make.message}
                </span>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">
                Model
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("model", value);
                  const found = modelOptions.find(
                    (cat: any) => cat.model_name === value
                  );
                  setModelId(found?._id || "");
                }}
              >
                <SelectTrigger
                  id="model"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectedbrandId && modelOptions.length === 0 ? (
                    <SelectItem value="no-models" disabled>
                      No models found 
                    </SelectItem>
                  ) : modelOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Please select Make first
                    </SelectItem>
                  ) : (
                    modelOptions.map((option) => (
                      <SelectItem key={option._id} value={option.model_name}>
                        {option.model_name}
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
              <Select onValueChange={(value) => setValue("yearRange", value)}>
                <SelectTrigger
                  id="yearRange"
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
                    yearRangeOptions.map((option) => (
                      <SelectItem key={option._id} value={option.year_name}>
                        {option.year_name}
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
              <Select onValueChange={(value) => setValue("variant", value)}>
                <SelectTrigger
                  id="variant"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {varientOptions.length === 0 && modelId.length === 0 ? (
                    <SelectItem value="no-varient" disabled> Vairent not found </SelectItem>
                  ) : varientOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      please select model first
                    </SelectItem>
                  ) : (
                    varientOptions.map((option) => (
                      <SelectItem key={option._id} value={option.variant_name}>
                        {option.variant_name}
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
                id="fitmentNotes"
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
            {/* Is Universal */}
            <div className="space-y-2">
              <Label htmlFor="isUniversal" className="text-sm font-medium">
                Is Universal
              </Label>
              <Select
                onValueChange={(value) => setValue("isUniversal", value)}
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
                onValueChange={(value) => setValue("isConsumable", value)}
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
            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-sm font-medium">
                Images
              </Label>
              <input
                id="images"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(null);
                  }
                  setValue("images", file ? file.name : ""); // for validation
                }}
              />
              <Button
                type="button"
                className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 w-full text-left text-gray-700 hover:bg-gray-100"
                onClick={() => document.getElementById('images')?.click()}
              >
                {imageFile ? `Selected: ${imageFile.name}` : 'Choose Image'}
              </Button>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 max-h-32 rounded border" />
              )}
              {errors.images && (
                <span className="text-red-500 text-sm">{errors.images.message}</span>
              )}
            </div>
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-sm font-medium">
                Video URL
              </Label>
              <Input
                id="videoUrl"
                placeholder="Past Link"
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
                onValueChange={(value) => setValue("brouchureAvailable", value)}
                defaultValue="no"
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
                id="mrp"
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
            {/* GST % */}
            <div className="space-y-2">
              <Label htmlFor="gst" className="text-sm font-medium">
                GST %
              </Label>
              <Input
                id="gst"
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
              <Label htmlFor="returnPolicy" className="text-sm font-medium">
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
                 <div className="space-y-2">
              <Label htmlFor="LastinquiredAt" className="text-sm font-medium">
                Last inquired At
              </Label>
              <Input
                id="Enter "
                placeholder="Enter Margin"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("LastinquiredAt")}
              />
              {errors.dealerMargin && (
                <span className="text-red-500 text-sm">
                  {errors.dealerMargin.message}
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
              Provide the pricing and tax information required for listing and
              billing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seoTitle" className="text-sm font-medium">
                SEO Title
              </Label>
              <Input
                id="seoTitle"
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
            {/* Search Tags */}
            <div className="space-y-2">
              <Label htmlFor="searchTags" className="text-sm font-medium">
                Search Tags
              </Label>
              <Input
                id="searchTags"
                placeholder="Enter Search Tags"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("searchTags")}
              />
              {errors.searchTags && (
                <span className="text-red-500 text-sm">
                  {errors.searchTags.message}
                </span>
              )}
            </div>
            {/* SEO Description */}
            <div className="space-y-2">
              <Label htmlFor="seoDescription" className="text-sm font-medium">
                SEO Description
              </Label>
              <Input
                id="seoDescription"
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
            disabled={submitLoading}
          >
            {submitLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
