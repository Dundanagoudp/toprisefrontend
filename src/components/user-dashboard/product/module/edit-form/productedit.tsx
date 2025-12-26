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
import { selectCurrentProduct, selectProductLoading, selectProductError } from "@/store/slice/product/productByIdSlice";
import { getDealersByBrand } from "@/service/dealerServices";
import { fetchProductByIdThunk } from "@/store/slice/product/productByIdThunks";
import { DynamicBreadcrumb } from "@/components/user-dashboard/DynamicBreadcrumb";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getCategories,
  getSubCategories,
  getTypes,
  getBrandByType,
  getModelByBrand,
  getYearRange,
  getvarientByModel,
  getVariantsByModelIds,
  editProduct,
  getProductById,
  getSubcategoriesByCategoryId,
  getCategoriesByType,
} from "@/service/product-Service";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types/product-Types";
import { useToast as useGlobalToast } from "@/components/ui/toast";

const schema = z.object({
  manufacturer_part_name: z
    .string()
    .min(1, "Manufacturer Part Number is required"),
  product_name: z.string().min(1, "Product Name is required"),
  brand: z.string().optional(),
  hsn_code: z.number().optional().refine((val) => val !== undefined && val.toString().length <= 8, {
    message: "HSN code must be 8 digits",
  }),
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().min(1, "Sub-category is required"),
  product_type: z.string().min(1, "Product type is required"),
  vehicle_type: z.string().optional(),
  // Added fields
  no_of_stock: z.coerce
    .number()
    .int({ message: "No. of Stock must be an integer" }),
  updatedBy: z.string().optional(),
  admin_notes: z.string().optional(),
  // Vehicle Compatibility
  make: z.string().min(1, "Make is required"),
  make2: z.string().optional(),
  model: z.array(z.string()).min(1, "At least one model is required"),
  year_range: z.array(z.string()).optional(),

  variant: z.array(z.string()).min(1, "At least one variant is required"),
  fitment_notes: z.string().optional(),
  is_universal: z.string().optional(),
  is_consumable: z.string().optional(),
  // Technical Specifications
  key_specifications: z.string().optional(),
  weight: z.coerce
    .number()
    .min(0, "Weight must be a positive number")
    .optional(),
  certifications: z.string().optional(),
  warranty: z.string().optional(),
  // Media & Documentation
  images: z.string().optional(),
  videoUrl: z.string().optional(),
  // Pricing details
  mrp_with_gst: z.number().min(1, "MRP is required"),
  gst_percentage: z.number().min(1, "GST is required"),
  selling_price: z.number().min(1, "Selling Price is required"),
  // Return & Availability
  is_returnable: z.boolean(),
  // return_policy: z.string().min(1, "Return Policy is required"),
  // Dealer-Level Mapping & Routing
  dealerAssignments: z
    .array(
      z.object({
        dealerId: z.string().min(1, "Dealer is required"),
        quantity: z.coerce.number(),
        margin: z.coerce.number().optional(),
        priority: z.coerce.number().optional(),
      })
    )
    .optional(),
  LastinquiredAt: z.string().optional(),
  // Status, Audit & Metadata
  active: z.string().optional(),
  createdBy: z.string().optional(),
  modifiedAtBy: z.string().optional(),
  changeLog: z.string().optional(),
  // SEO & Search Optimization
  seo_title: z.string().optional(),
  searchTags: z.string().optional(),
  search_tags: z.array(z.string()).optional(),
  seo_description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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

export default function ProductEdit() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // State for dropdown options
  const auth = useAppSelector((state) => state.auth.user);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [yearRangeOptions, setYearRangeOptions] = useState<any[]>([]);
  const [varientOptions, setVarientOptions] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [yearRangeSelected, setYearRangeSelected] = useState<string[]>([]);

  // State for dependent dropdowns
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>("");
  const [selectedbrandId, setSelectedBrandId] = useState<string>("");
  const [modelId, setModelId] = useState<string[]>([]); // Changed to array
  const id = useParams();
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);

  // Redux state
  const product = useAppSelector(selectCurrentProduct);
  const isLoadingProduct = useAppSelector(selectProductLoading);
  const productError = useAppSelector(selectProductError);

  // State for image uploads and previews
  const [selectedImages, setSelectedImages] = useState<File[]>([]); // new uploads
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>(
    []
  ); // new upload previews
  const [existingImages, setExistingImages] = useState<string[]>([]); // URLs of images from backend
  const [removedExistingIndexes, setRemovedExistingIndexes] = useState<
    number[]
  >([]); // indexes of removed existing images
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDealers, setAvailableDealers] = useState<any[]>([]);
  const [dealerAssignments, setDealerAssignments] = useState<
    Array<{
      dealerId: string;
      quantity: number;
      margin?: number;
      priority?: number;
    }>
  >([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const { showToast } = useGlobalToast();
  const allowedRoles = ["Super-admin", "Inventory-Admin", "Inventory-Staff"];
  
  // Loading state to track initial data loading
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  // Combine Redux error with local error
  const apiError = productError;


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

  // Refs to track previous values and prevent infinite loops
  const prevVehicleTypeRef = useRef<string>("");
  const prevCategoryRef = useRef<string>("");
  const prevBrandRef = useRef<string>("");
  const prevModelRef = useRef<string[]>([]);

  // Helper function for form population
  const populateFormWithProduct = useCallback((product: Product) => {
    // Set dependent state first
    const vehicleTypeId = product.brand?.type?._id || "";
    const brandId = product.brand?._id || "";

    // Handle multiple models
    const modelIds = product.model?.map((m: { _id: string }) => m._id) || [];

    // Handle multiple variants
    const variantIds = product.variant?.map((v: { _id: string }) => v._id) || [];

    setSelectedProductTypeId(vehicleTypeId);
    setSelectedBrandId(brandId);
    setModelId(modelIds);
    setYearRangeSelected(product.year_range?.map(y => y._id) || []);

    // Update refs to prevent effects from running
    prevVehicleTypeRef.current = vehicleTypeId;
    prevCategoryRef.current = product.category?._id || "";
    prevBrandRef.current = brandId;
    prevModelRef.current = modelIds;

    // Populate form
        reset({
          manufacturer_part_name: product.manufacturer_part_name || "",
          product_name: product.product_name || "",
          brand: product.brand?._id || "",
          hsn_code: product.hsn_code ? Number(product.hsn_code) : undefined,
          category: product.category?._id || "",
          sub_category: product.sub_category?._id || "",
          product_type: product.product_type || "",
          vehicle_type: product.brand?.type?._id || "",
          no_of_stock: product.no_of_stock || 0,
          selling_price: product.selling_price || 0,
          updatedBy: product.updated_at || "",
          admin_notes: product.admin_notes || "",
          make: product.make && product.make.length > 0 ? product.make[0] : "",
          make2: product.make && product.make.length > 1 ? product.make[1] : "",
      model: modelIds,
          year_range: product.year_range?.map((y) => y._id) || [],
      variant: variantIds,
          fitment_notes: product.fitment_notes || "",
          key_specifications: product.key_specifications ?? "",
          is_universal: product.is_universal ? "yes" : "no",
          is_consumable: product.is_consumable ? "yes" : "no",
          weight: product.weight || 0,
          certifications: product.certifications || "",
          warranty: product.warranty?.toString() || "",
          images: product.images?.join(",") || "",
      videoUrl: (product as any).video_url || (product as any).videoUrl || "",
          mrp_with_gst: product.mrp_with_gst || 0,
          gst_percentage: product.gst_percentage || 0,
          is_returnable: product.is_returnable || false,
          dealerAssignments: [],
          LastinquiredAt: product.last_stock_inquired || "",
          seo_title: product.seo_title || "",
          searchTags: product.search_tags?.join(",") || "",
          search_tags: product.search_tags || [],
          seo_description: product.seo_description || "",
        });

      // Initialize image previews for existing images
      if (product.images && Array.isArray(product.images)) {
        setExistingImages(product.images);
      } else {
        setExistingImages([]);
      }
      setSelectedImages([]);
      setSelectedImagePreviews([]);
      setRemovedExistingIndexes([]);

      // Populate dealer assignments from available_dealers
      if (
        product.available_dealers &&
        Array.isArray(product.available_dealers) &&
        product.available_dealers.length > 0
      ) {
        const assignments = product.available_dealers
          .filter((dealer) => dealer.dealers_Ref)
          .map((dealer) => ({
            dealerId: dealer.dealers_Ref || "",
            quantity: Number(dealer.quantity_per_dealer) || 0,
            margin: Number(dealer.dealer_margin) || 0,
            priority: Number(dealer.dealer_priority_override) || 0,
          }));

        setDealerAssignments(
          assignments as {
            dealerId: string;
            quantity: number;
            margin?: number;
            priority?: number;
          }[]
        );
      } else {
        setDealerAssignments([]);
      }
  }, [reset]);


// Function to fetch dealers by brand (NEW: Changed from category to brand)
const fetchDealersByBrand = async (brandId: string) => {
  if (!brandId) {
    setAvailableDealers([]);
    return;
  }

  try {
    setLoadingDealers(true);
    const response = await getDealersByBrand(brandId); // Changed function name
    console.log("Dealers by brand response:", response);

    const dealers = Array.isArray(response.data) ? response.data : [];
    console.log("Setting dealers:", dealers);
    setAvailableDealers(dealers);
  } catch (error) {
    console.error("Failed to fetch dealers by brand:", error);
    setAvailableDealers([]);
  } finally {
    setLoadingDealers(false);
  }
};
  // Handle image file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImagePreviews((prev) => [
            ...prev,
            reader.result as string,
          ]);
        };
        reader.readAsDataURL(file);
      });
      setValue("images", ""); // not used for validation here
    }
  };
  // Effect 1: Initial Data Fetch (Once on Mount)
  // Master effect: Load all data simultaneously without page reload
  useEffect(() => {
    const loadAllData = async () => {
      if (!id.id || typeof id.id !== "string") {
        return;
      }

      setIsInitialDataLoaded(false);
      setInitialLoadError(null);

      try {
        // Step 1: Fetch product data from Redux
        const productAction = await dispatch(fetchProductByIdThunk(id.id));
        const fetchedProduct = productAction.payload;

        if (!fetchedProduct || typeof fetchedProduct === 'string') {
          throw new Error("Product not found");
        }

        // Extract IDs from product
        const typeId = fetchedProduct.brand?.type?._id;
        const categoryId = fetchedProduct.category?._id;
        const brandId = fetchedProduct.brand?._id;
        const modelIds = Array.isArray(fetchedProduct.model)
          ? fetchedProduct.model.map((m: { _id: string }) => m._id)
          : [];

        // Step 2: Fetch ALL data in parallel
        const [
          typesResponse,
          yearRangesResponse,
          categoriesResponse,
          subCategoriesResponse,
          brandsResponse,
          modelsResponse,
          variantsResponse,
        ] = await Promise.all([
          getTypes(),
          getYearRange(),
          typeId ? getCategoriesByType(typeId) : Promise.resolve({ data: [] }),
          categoryId ? getSubcategoriesByCategoryId(categoryId) : Promise.resolve({ data: [] }),
          typeId ? getBrandByType(typeId) : Promise.resolve({ data: [] }),
          brandId ? getModelByBrand(brandId) : Promise.resolve({ data: [] }),
          modelIds.length > 0 ? getVariantsByModelIds(modelIds) : Promise.resolve({ data: [] }),
        ]);

        // Step 3: Set all dropdown options
        setTypeOptions(
          Array.isArray(typesResponse.data)
            ? typesResponse.data
            : Array.isArray(typesResponse.data?.products)
            ? typesResponse.data.products
            : []
        );
        setYearRangeOptions(Array.isArray(yearRangesResponse.data) ? yearRangesResponse.data : []);
        setCategoryOptions(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
        setSubCategoryOptions(Array.isArray(subCategoriesResponse.data) ? subCategoriesResponse.data : []);
        setBrandOptions(Array.isArray(brandsResponse.data) ? brandsResponse.data : []);
        setModelOptions(Array.isArray(modelsResponse.data) ? modelsResponse.data : []);
        setVarientOptions(Array.isArray(variantsResponse.data) ? variantsResponse.data : []);

        // Step 4: Fetch dealers by brand
        if (brandId) {
          await fetchDealersByBrand(brandId);
        }

        // Step 5: Populate form with product data
        populateFormWithProduct(fetchedProduct);

        // Mark as loaded
        setIsInitialDataLoaded(true);
      } catch (error: any) {
        console.error("Failed to load data:", error);
        const errorMessage = error.message || "Failed to load product data";
        setInitialLoadError(errorMessage);
        showToast(errorMessage, "error");
        setIsInitialDataLoaded(true); // Set to true to show error state
      }
    };

    loadAllData();
  }, [id.id, dispatch, showToast, populateFormWithProduct]);

  // Interactive useEffects for user-triggered changes

  // When user changes vehicle type → fetch categories and brands
  useEffect(() => {
    // Only run if initial data is loaded and value actually changed
    if (!isInitialDataLoaded) return;

    const vehicleType = watch("vehicle_type");
    if (vehicleType && vehicleType !== prevVehicleTypeRef.current) {
      prevVehicleTypeRef.current = vehicleType;
      setSelectedProductTypeId(vehicleType);

      // Fetch categories and brands for new type
      Promise.all([
        getCategoriesByType(vehicleType),
        getBrandByType(vehicleType)
      ]).then(([cats, brands]) => {
        setCategoryOptions(Array.isArray(cats.data) ? cats.data : []);
        setBrandOptions(Array.isArray(brands.data) ? brands.data : []);
        // Clear dependent selections
        setValue("category", "");
        setValue("brand", "");
        setValue("model", []);
        setValue("variant", []);
      }).catch((error) => {
        console.error("Failed to fetch categories and brands:", error);
        showToast("Failed to load options for selected vehicle type", "error");
      });
    }
  }, [selectedProductTypeId, isInitialDataLoaded, showToast]); // Removed watch and setValue from deps

  // When user changes category → fetch subcategories
  useEffect(() => {
    // Only run if initial data is loaded and value actually changed
    if (!isInitialDataLoaded) return;

    const category = watch("category");
    if (category && category !== prevCategoryRef.current) {
      prevCategoryRef.current = category;
      setSelectedCategoryId(category);

      getSubcategoriesByCategoryId(category)
        .then((subCats) => {
          setSubCategoryOptions(Array.isArray(subCats.data) ? subCats.data : []);
        }).catch((error) => {
          console.error("Failed to fetch subcategories:", error);
          showToast("Failed to load options for selected category", "error");
        });
    }
  }, [selectedCategoryId, isInitialDataLoaded, showToast]); // Removed watch and setValue from deps

  // When user changes brand → fetch models and dealers
  useEffect(() => {
    // Only run if initial data is loaded and value actually changed
    if (!isInitialDataLoaded) return;

    const brand = watch("brand");
    if (brand && brand !== prevBrandRef.current) {
      prevBrandRef.current = brand;
      setSelectedBrandId(brand);
      setIsLoadingBrands(true);

      // Fetch models and dealers in parallel
      Promise.all([
        getModelByBrand(brand),
        fetchDealersByBrand(brand)
      ]).then(([modelsResponse, dealersResponse]) => {
        setModelOptions(Array.isArray(modelsResponse.data) ? modelsResponse.data : []);
        setValue("model", []);
        setValue("variant", []);
      }).catch((error) => {
        console.error("Failed to fetch models and dealers:", error);
        showToast("Failed to load models and dealers for selected brand", "error");
      })
      .finally(() => {
        setIsLoadingBrands(false);
      });
    }
  }, [selectedbrandId, isInitialDataLoaded, showToast]); // Removed watch and setValue from deps

  // When user changes models → fetch variants
  useEffect(() => {
    // Only run if initial data is loaded and value actually changed
    if (!isInitialDataLoaded) return;

    const models = watch("model");
    if (Array.isArray(models) && models.length > 0) {
      const modelIds = models.filter(id => id && id.trim() !== "");

      if (modelIds.length > 0 && JSON.stringify(modelIds) !== JSON.stringify(prevModelRef.current)) {
        prevModelRef.current = modelIds;
        setModelId(modelIds);

        getVariantsByModelIds(modelIds)
          .then((response) => {
            setVarientOptions(Array.isArray(response.data) ? response.data : []);
            // Clear variant selection when models change
            setValue("variant", []);
          })
          .catch((error) => {
            console.error("Failed to fetch variants:", error);
            showToast("Failed to load variants for selected models", "error");
          });
      }
    } else if (models === undefined || models.length === 0) {
      if (prevModelRef.current.length > 0) {
        prevModelRef.current = [];
        setVarientOptions([]);
        setModelId([]);
      }
    }
  }, [modelId, isInitialDataLoaded, showToast]); // Removed watch and setValue from deps





  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    if (typeof id.id === "string") {
      const formData = new FormData();

      // 1. Append dealer assignments (filter out empty dealerIds)
      const validAssignments = dealerAssignments.filter(
        (a) => a.dealerId && a.dealerId.trim() !== ""
      );

      validAssignments.forEach((assignment, index) => {
        formData.append(
          `available_dealers[${index}][dealers_Ref]`,
          assignment.dealerId
        );
        formData.append(
          `available_dealers[${index}][quantity_per_dealer]`,
          assignment.quantity.toString()
        );
        formData.append(
          `available_dealers[${index}][dealer_margin]`,
          (assignment.margin || 0).toString()
        );
        formData.append(
          `available_dealers[${index}][dealer_priority_override]`,
          (assignment.priority || 0).toString()
        );
        formData.append(
          `available_dealers[${index}][inStock]`,
          (assignment.quantity > 0).toString()
        );
      });

      // 2. Append other form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "images" && key !== "dealerAssignments" && value != null) {
          if (key === "is_returnable") {
            formData.append(key, value ? "true" : "false");
          } else if (Array.isArray(value)) {
            value.forEach((v) =>
              formData.append(
                `${key}[]`,
                typeof v === "string" ? v : JSON.stringify(v)
              )
            );
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // 3. Handle images
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      const remainingExistingImages = existingImages.filter(
        (url, idx) => !removedExistingIndexes.includes(idx)
      );

      if (remainingExistingImages.length > 0) {
        remainingExistingImages.forEach((url) => {
          formData.append("existingImages[]", url);
        });
        formData.append(
          "existingImagesJson",
          JSON.stringify(remainingExistingImages)
        );
      }

      try {
        const response = await editProduct(id.id, formData);
        showToast("Product updated successfully", "success");
        setTimeout(() => {
          router.push("/user/dashboard/product");
        }, 1500);
      } catch (error: any) {
        console.error("Failed to edit product:", error);
        showToast("Failed to update product", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showToast("Invalid product ID", "error");
      setIsSubmitting(false);
    }
  };
  if (!auth || !allowedRoles.includes(auth.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }
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

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {apiError && !isLoadingProduct && !isInitialDataLoaded && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {apiError}
        </div>
      )}

      {(isLoadingProduct || !isInitialDataLoaded) ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">Loading all product data...</p>
            <p className="mt-1 text-sm text-gray-500">Fetching product details, dropdowns, and dealers</p>
          </div>
        </div>
      ) : !product || initialLoadError ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              {initialLoadError || "Product not found or failed to load."}
            </p>
            <Button onClick={() => router.push("/product")}>
              Back to Products
            </Button>
          </div>
        </div>
      ) : (
        <>
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
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-sm font-medium">
                    Product Name
                  </Label>
                  <Input
                    id="product_name"
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
                    className="text-sm font-medium"
                  >
                    Manufacturer Part Number (MPN)
                  </Label>
                  <Input
                    id="manufacturer_part_name"
                    placeholder="Part Number"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("manufacturer_part_name")}
                  />
                  {errors.manufacturer_part_name && (
                    <span className="text-red-500 text-sm">
                      {errors.manufacturer_part_name.message}
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
                    type="number"
                    placeholder="Enter HSN Code"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    maxLength={8}
                    {...register("hsn_code", { valueAsNumber: true })}
                  />
                  {errors.hsn_code && (
                    <span className="text-red-500 text-sm">
                      {errors.hsn_code.message}
                    </span>
                  )}
                </div>
                       {/* Vehicle Type */}
                       <div className="space-y-2">
                  <Label htmlFor="vehicle_type" className="text-sm font-medium">
                    Vehicle Type
                  </Label>
                  <Select
                    value={watch("vehicle_type") || ""}
                    onValueChange={(value) => {
                      setValue("vehicle_type", value);
                      setSelectedProductTypeId(value);
                    }}
                  >
                    <SelectTrigger
                      id="vehicle_type"
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
                          <SelectItem key={type._id} value={type._id}>
                            {type.type_name}
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
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category
                  </Label>
                  <Select
                    value={watch("category") || ""}
                    onValueChange={(value) => {
                      setValue("category", value);
                      setSelectedCategoryId(value);
                      setValue("sub_category", ""); // Reset subcategory when category changes
                    } }
                    disabled={!selectedProductTypeId}
                  >
                    <SelectTrigger
                      id="category"
                      className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                    >
                      <SelectValue placeholder={
                        selectedProductTypeId
                          ? "Select"
                          : "Select vehicle type first"
                      } />
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
                    value={watch("sub_category") || ""}
                    onValueChange={(value) => setValue("sub_category", value)}
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
                          no Sub-categories found
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
                  <Label htmlFor="productType" className="text-sm font-medium">
                    Product Type
                  </Label>
                  <Select
                    value={watch("product_type") || ""}
                    onValueChange={(value) => setValue("product_type", value)}
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

                      setSelectedBrandId(value);
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
                          <SelectItem key={brand._id} value={brand._id}>
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
                  <Label htmlFor="make" className="text-sm font-medium">
                    Make
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
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium">
                    Model <span className="text-red-500">*</span>
                  </Label>

                  <div className="border rounded-lg p-3 bg-gray-50 max-h-52 overflow-y-auto">
                    {selectedbrandId && modelOptions.length === 0 ? (
                      <p className="text-gray-500 text-sm">Loading models...</p>
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
                    <span className="text-red-500 text-sm">
                      {errors.model.message}
                    </span>
                  )}
                </div>
                {/* Variant */}
                <div className="space-y-2">
                  <Label htmlFor="variant" className="text-sm font-medium">
                    Variant <span className="text-red-500">*</span>
                  </Label>

                  <div className="border rounded-lg p-3 bg-gray-50 max-h-52 overflow-y-auto">
                    {varientOptions.length === 0 && modelId.length === 0 ? (
                      <p className="text-gray-500 text-sm">No variants found</p>
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
                {/* Year Range */}
                <div className="space-y-2">
                  <Label htmlFor="yearRange" className="text-sm font-medium">
                    Year Range
                  </Label>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded bg-gray-50">
                    {yearRangeOptions.map((year) => (
                      <label
                        key={year._id}
                        className="flex items-center gap-2 bg-white p-2 rounded border cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={yearRangeSelected.includes(year._id)}
                          onChange={() => {
                            let updated;
                            if (yearRangeSelected.includes(year._id)) {
                              updated = yearRangeSelected.filter(
                                (id) => id !== year._id
                              );
                            } else {
                              updated = [...yearRangeSelected, year._id];
                            }
                            setYearRangeSelected(updated);
                            setValue("year_range", updated);
                          }}
                        />
                        <span className="text-sm">{year.year_name}</span>
                      </label>
                    ))}
                  </div>

                  {errors.year_range && (
                    <span className="text-red-500 text-sm">
                      {errors.year_range.message}
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
                  <Label htmlFor="isUniversal" className="text-sm font-medium">
                    Is Universal
                  </Label>
                  <Select
                    value={watch("is_universal") || ""}
                    onValueChange={(value) => setValue("is_universal", value)}
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
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Technical Specifications
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Add all relevant technical details to help users understand
                  the product quality and features.
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

                {/* Weight */}
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
                    className="text-sm font-medium"
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
                    value={watch("is_consumable") || ""}
                    onValueChange={(value) => setValue("is_consumable", value)}
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
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Media & Documentation
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Upload product images, videos, and brochures to enhance
                  product representation and credibility.
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
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);

                      if (files.length > 0) {
                        setSelectedImages((prev) => [...prev, ...files]);

                        setSelectedImagePreviews((prev) => [
                          ...prev,
                          ...files.map((f) => URL.createObjectURL(f)),
                        ]);

                        // Reset the input value to allow selecting the same files again
                        e.target.value = "";
                      }
                    }}
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Existing images from backend, not removed */}
                    {existingImages.map((src, idx) =>
                      removedExistingIndexes.includes(idx) ? null : (
                        <div
                          key={"existing-" + idx}
                          className="relative inline-block"
                        >
                          <img
                            src={src}
                            alt={`Existing ${idx + 1}`}
                            className="h-20 w-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            onClick={() =>
                              setRemovedExistingIndexes((prev) => [
                                ...prev,
                                idx,
                              ])
                            }
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                    {/* New uploads */}
                    {selectedImagePreviews.map((src, idx) => (
                      <div key={"new-" + idx} className="relative inline-block">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="h-20 w-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          onClick={() => {
                            setSelectedImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            setSelectedImagePreviews((prev) =>
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
                  {errors.images && (
                    <span className="text-red-500 text-sm">
                      {errors.images.message}
                    </span>
                  )}
                </div>
                {/* Video URL */}
                {/* <div className="space-y-2">
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
            </div> */}
              </CardContent>
            </Card>
            {/* Pricing details */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Pricing & Tax
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Provide the pricing and tax information required for listing
                  and billing.
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MRP (with gst) */}
                <div className="space-y-2">
                  <Label htmlFor="mrp" className="text-sm font-medium">
                    MRP (with GST)
                  </Label>
                  <Input
                    id="mrp_with_gst"
                    type="number"
                    placeholder="Enter MRP"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    {...register("mrp_with_gst", { valueAsNumber: true })}
                  />
                  {errors.mrp_with_gst && (
                    <span className="text-red-500 text-sm">
                      {errors.mrp_with_gst.message}
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
                    onKeyDown={handleNumericKeyDown}
                    {...register("selling_price", { valueAsNumber: true })}
                  />
                  {errors.selling_price && (
                    <span className="text-red-500 text-sm">
                      {errors.selling_price.message}
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
                    type="number"
                    placeholder="Enter GST"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    onKeyDown={handleNumericKeyDown}
                    {...register("gst_percentage", { valueAsNumber: true })}
                  />
                  {errors.gst_percentage && (
                    <span className="text-red-500 text-sm">
                      {errors.gst_percentage.message}
                    </span>
                  )}
                </div>
                {/* is_returnable */}
                <div className="space-y-2">
                  <Label htmlFor="returnable" className="text-sm font-medium">
                    Returnable
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
                    htmlFor="return_policy"
                    className="text-sm font-medium"
                  >
                    Return Policy
                  </Label>
                  <Input
                    id="return_policy"
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
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Dealer-Level Mapping & Routing
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Dealer product quantity and quality
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Multiple Dealer Assignments */}
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Dealer Assignments{" "}
                      {dealerAssignments.length > 0 &&
                        `(${dealerAssignments.length} assigned)`}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newAssignment = {
                          dealerId: "",
                          quantity: 0,
                          margin: 0,
                          priority: 0,
                        };
                        const updated = [...dealerAssignments, newAssignment];
                        setDealerAssignments(updated);
                        // Debug logs after adding the new dealer assignment
                        console.log(
                          "[ProductEdit] Added new dealer assignment:",
                          newAssignment
                        );
                        console.log(
                          `[ProductEdit] Dealer assignments count: ${updated.length}`,
                          updated
                        );
                        console.log(
                          `[ProductEdit] Available dealers count: ${availableDealers.length}`,
                          availableDealers
                        );
                      }}
                      className="text-xs"
                    >
                      + Add Dealer
                    </Button>
                  </div>

                  {/* Debug Info - Remove in production */}
                  {/* {process.env.NODE_ENV === "development" && (
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                      <p>Available Dealers: {availableDealers.length}</p>
                      <p>Current Assignments: {dealerAssignments.length}</p>
                      {dealerAssignments.length > 0 && (
                        <div>
                          <p>Assignment Details:</p>
                          {dealerAssignments.map((assignment, idx) => (
                            <div key={idx} className="ml-2">
                              - Dealer ID: {assignment.dealerId}, Qty:{" "}
                              {assignment.quantity}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )} */}

                  {dealerAssignments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-sm">No dealers assigned yet</p>
                      <p className="text-xs mt-1">
                        Click "Add Dealer" to assign dealers to this product
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dealerAssignments.map((assignment, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Dealer Selection */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Dealer
                              </Label>
                              <Select
                                value={assignment.dealerId}
                                onValueChange={(value) => {
                                  const updated = [...dealerAssignments];
                                  updated[index].dealerId = value;
                                  setDealerAssignments(updated);
                                }}
                              >
                                <SelectTrigger className="bg-white border-gray-200 rounded-[6px] p-2 text-xs">
                                  <SelectValue placeholder="Select dealer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {loadingDealers ? (
                                    <SelectItem value="loading" disabled>
                                      Loading...
                                    </SelectItem>
                                  ) : availableDealers.length === 0 ? (
                                    <SelectItem value="no-dealers" disabled>
                                      No dealers available
                                    </SelectItem>
                                  ) : (
                                    availableDealers.map((dealer) => (
                                      <SelectItem
                                        key={dealer._id}
                                        value={dealer._id}
                                      >
                                        {dealer.legal_name} ({dealer.trade_name}
                                        )
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Quantity
                              </Label>
                              <Input
                                type="number"
                                value={assignment.quantity}
                                onChange={(e) => {
                                  const updated = [...dealerAssignments];
                                  updated[index].quantity =
                                    parseInt(e.target.value) || 1;
                                  setDealerAssignments(updated);
                                }}
                                className="bg-white border-gray-200 rounded-[6px] p-2 text-xs"
                                placeholder="Qty"
                              />
                            </div>

                            {/* Margin */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Margin %
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                value={assignment.margin || ""}
                                onChange={(e) => {
                                  const updated = [...dealerAssignments];
                                  updated[index].margin =
                                    parseFloat(e.target.value) || 0;
                                  setDealerAssignments(updated);
                                }}
                                className="bg-white border-gray-200 rounded-[6px] p-2 text-xs"
                                placeholder="Margin"
                              />
                            </div>

                            {/* Priority & Remove */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Priority
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={assignment.priority || ""}
                                  onChange={(e) => {
                                    const updated = [...dealerAssignments];
                                    updated[index].priority =
                                      parseInt(e.target.value) || 0;
                                    setDealerAssignments(updated);
                                  }}
                                  className="bg-white border-gray-200 rounded-[6px] p-2 text-xs flex-1"
                                  placeholder="Priority"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (dealerAssignments.length <= 1) {
                                      setShowDeleteWarning(true);
                                      return;
                                    }
                                    // Actually remove the dealer from the array instead of just resetting values
                                    const updated = dealerAssignments.filter(
                                      (_, i) => i !== index
                                    );
                                    setDealerAssignments(updated);
                                    setValue("dealerAssignments", updated);
                                  }}
                                  className="px-2 py-2 text-red-600 hover:bg-red-50"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Current Dealer Assignments Summary */}
                  {dealerAssignments.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Current Dealer Assignments:
                      </h4>
                      <div className="space-y-2">
                        {dealerAssignments.map((assignment, index) => {
                          const dealer = availableDealers.find(
                            (d) => d._id === assignment.dealerId
                          );
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                            >
                              <div className="flex-1">
                                <span className="font-medium">
                                  {dealer
                                    ? `${dealer.legal_name} (${dealer.trade_name})`
                                    : `Dealer ID: ${assignment.dealerId}`}
                                </span>
                                {dealer && (
                                  <span className="text-gray-500 ml-2">
                                    ID: {dealer._id}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 text-gray-600">
                                <span>Qty: {assignment.quantity}</span>
                                <span>Margin: {assignment.margin || 0}%</span>
                                <span>
                                  Priority: {assignment.priority || 0}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {/* Last Inquired At */}
                {/* <div className="space-y-2">
                  <Label
                    htmlFor="LastinquiredAt"
                    className="text-sm font-medium"
                  >
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
                </div> */}
                {/* Admin Notes */}
                {/* <div className="space-y-2">
                  <Label htmlFor="admin_notes" className="text-sm font-medium">
                    Admin Notes
                  </Label>
                  <Input
                    id="admin_notes"
                    placeholder="Enter Admin Notes"
                    className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                    {...register("admin_notes")}
                  />
                  {errors.admin_notes && (
                    <span className="text-red-500 text-sm">
                      {errors.admin_notes.message}
                    </span>
                  )}
                </div> */}
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
                  <Label htmlFor="seo_title" className="text-sm font-medium">
                    SEO Title
                  </Label>
                  <Input
                    id="seo_title"
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

                {/* Search Tags Array (Chips) */}
                <div className="space-y-2">
                  <Label
                    htmlFor="searchTagsArray"
                    className="text-sm font-medium"
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
                    name="search_tags"
                    placeHolder="Add tag and press enter"
                  />
                  {errors.search_tags && (
                    <span className="text-red-500 text-sm">
                      {errors.search_tags.message}
                    </span>
                  )}
                </div>
                {/* SEO Description */}
                <div className="space-y-2 col-span-full">
                  <Label
                    htmlFor="seoDescription"
                    className="text-sm font-medium"
                  >
                    SEO Description
                  </Label>
                  <Input
                    id="seo_description"
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
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </>
      )}
      <Dialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Remove Dealer</DialogTitle>
            <DialogDescription>
              At least one dealer must be assigned to the product. You cannot
              remove the last dealer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowDeleteWarning(false)}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
