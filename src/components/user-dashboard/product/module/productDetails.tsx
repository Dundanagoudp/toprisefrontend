"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Eye, Clock, ChevronRight } from "lucide-react";
import { Productcard } from "./productCard";
import { getProductById, getProducts } from "@/service/product-Service";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types/product-Types";
import {
  aproveProduct,
  deactivateProduct,
  rejectSingleProduct,
} from "@/service/product-Service";
import { getAppUserById } from "@/service/user-service";
import DynamicButton from "../../../common/button/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentProduct, selectProductLoading, selectProductError } from "@/store/slice/product/productByIdSlice";
import { fetchProductByIdThunk } from "@/store/slice/product/productByIdThunks";
import RejectReason from "./tabs/Super-Admin/dialogue/RejectReason";
import { useToast as GlobalToast } from "@/components/ui/toast";
import SuperAdminDealersModal from "./SuperAdminDealersModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ViewProductDetails() {
  const { showToast } = GlobalToast();
  const [status, setStatus] = React.useState<string>("Created");
  const [isEditLoading, setIsEditLoading] = React.useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [showDealersModal, setShowDealersModal] = React.useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = React.useState(false);
  const [userNamesMap, setUserNamesMap] = React.useState<
    Record<string, string>
  >({});
  const auth = useAppSelector((state) => state.auth.user);
  const authState = useAppSelector((state) => state.auth);
  const id = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state for product
  const product = useAppSelector(selectCurrentProduct);
  const loading = useAppSelector(selectProductLoading);
  const productError = useAppSelector(selectProductError);

  const allowedRoles = ["Super-admin", "Inventory-Admin", "Inventory-Staff"];

  // Helper function to parse and format the change logs
  const formatChangeLog = (log: any) => {
    let oldValue, newValue;

    try {
      oldValue =
        typeof log.old_value === "string"
          ? JSON.parse(log.old_value)
          : log.old_value;
      newValue =
        typeof log.new_value === "string"
          ? JSON.parse(log.new_value)
          : log.new_value;
    } catch (e) {
      // If parsing fails, use the raw values
      oldValue = log.old_value;
      newValue = log.new_value;
    }

    const changes = log.changes
      .split(", ")
      .map((change: string) => change.trim());

    return {
      ...log,
      parsedOldValue: oldValue,
      parsedNewValue: newValue,
      changesList: changes,
    };
  };

  // Helper function to render different types of values
  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500 text-sm">No value</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`text-sm px-2 py-1 rounded ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {value ? "True" : "False"}
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500 text-sm">Empty array</span>;
      }

      return (
        <div className="space-y-1">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="text-sm bg-white p-2 rounded border border-gray-100"
            >
              {typeof item === "object" ? (
                <div className="space-y-1">
                  {Object.entries(item).map(([key, val]) => (
                    <div key={key} className="flex">
                      <span className="font-medium text-gray-600 mr-2">
                        {key}:
                      </span>
                      <span className="text-gray-800">{String(val)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-800">{String(item)}</span>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-600 mr-2 text-sm">
                {key}:
              </span>
              <span className="text-gray-800 text-sm">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-sm text-gray-800">{String(value)}</span>;
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "Created":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "Approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "Pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Function to handle product approval
  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);

    if (newStatus === "Approved") {
      await aproveProduct(id.id);
      await fetchProductData();
    }

    // else if (newStatus === "Pending") {
    //   await deactivateProduct(id.id);
    //   await fetchProductData();
    // }
    else if (newStatus === "Rejected") {
      setIsRejectDialogOpen(true);
    }
  };

  // Function to fetch user names for change logs
  const fetchUserNames = async (userIds: string[]) => {
    const uniqueUserIds = [...new Set(userIds.filter((id) => id && id.trim()))];
    const namesMap: Record<string, string> = {};

    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const response = await getAppUserById(userId);
          if (response.success && response.data) {
            const user = response.data;
            // Try to get name from various possible fields
            const name =
              user.username ||
              (user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName) ||
              user.email ||
              userId;
            namesMap[userId] = name;
          } else {
            namesMap[userId] = userId; // Fallback to ID if fetch fails
          }
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
          namesMap[userId] = userId; // Fallback to ID if fetch fails
        }
      })
    );

    setUserNamesMap((prev) => ({ ...prev, ...namesMap }));
  };

  // Function to refresh product data
  const fetchProductData = async () => {
    try {
      await dispatch(fetchProductByIdThunk(id.id as string)).unwrap();

      if (product?.live_status) {
        setStatus(product.live_status);
      }
      console.log("Product data:", product);
      // Fetch user names for change logs
      if (product?.change_logs && Array.isArray(product.change_logs)) {
        const userIds = product.change_logs
          .map((log: any) => log.modified_by)
          .filter((id: string) => id && !userNamesMap[id]);
        if (userIds.length > 0) {
          await fetchUserNames(userIds);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product data:", error);
      showToast("Failed to load product details", "error");
    }
  };

  React.useEffect(() => {
    if (id.id) {
      fetchProductData();
    }
  }, [id.id]);

  // Set status when product loads
  React.useEffect(() => {
    if (product?.live_status) {
      setStatus(product.live_status);
    }
  }, [product]);

  // Function to handle product rejection
  const handleRejectProduct = async (data: { reason: string }) => {
    try {
      console.log("Rejecting product with reason:", data.reason);
      console.log("User ID for rejection:", auth?._id);

      // Pass user ID to ensure audit logging works
      const userId = auth?._id || authState?.user?._id;
      if (!userId) {
        throw new Error("User authentication required to reject product");
      }
      await rejectSingleProduct(id.id, data.reason, userId);
      setIsRejectDialogOpen(false);

      // Show success message
      showToast("Product rejected successfully", "success");

      // Refresh product data after rejection
      await fetchProductData();
    } catch (error: any) {
      console.error("Error rejecting product:", error);
      const errorMessage = error.message || "Failed to reject product";
      showToast(errorMessage, "error");
    }
  };

  const handleEdit = (idObj: { id: string }) => {
    setIsEditLoading(true);
    router.push(`/user/dashboard/product/productedit/${idObj.id}`);
  };

  React.useEffect(() => { }, []);

  // Update status if product changes
  React.useEffect(() => {
    if (product && product.live_status) {
      setStatus(product.live_status);
    }
  }, [product]);

  return (
    <div className="min-h-screen bg-(neutral-100)-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
              Product Overview
            </h1>
            <p className="text-base font-medium font-sans text-gray-500">
              Add your product description
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              onValueChange={handleStatusChange}
              value={status}
              disabled={!allowedRoles.includes(auth.role)}
            >
              <SelectTrigger
                className={`min-w-[120px] ${getStatusColor(status)}`}
                disabled={!allowedRoles.includes(auth.role)}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                {/* <SelectItem value="Pending">Pending</SelectItem> */}
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {allowedRoles.includes(auth.role) && (
              <DynamicButton
                variant="outline"
                customClassName="bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-600 text-red-600"
                onClick={() => handleEdit(id)}
                text="Edit Product"
                icon={<Pencil />}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-8">
        {/* Core Product Identity */}
        <div>
          <Productcard
            title="Core Product Identity"
            description="the core identifiers that define the product's identity, brand, and origin."
            data={
              product
                ? [
                  { label: "SKU Code", value: product.sku_code || "-" },
                  {
                    label: "Manufacturer Part Number (MPN)",
                    value: product.manufacturer_part_name || "-",
                  },
                  {
                    label: "Product Name",
                    value: product.product_name || "-",
                  },
                  { label: "Brand", value: product.brand?.brand_name || "-" },
                  {
                    label: "Category",
                    value: product.category?.category_name || "-",
                  },
                  {
                    label: "Sub-category",
                    value: product.sub_category?.subcategory_name || "-",
                  },
                  {
                    label: "Product Type",
                    value: product.product_type || "-",
                  },
                  {
                    label: "Vehicle Type",
                    value: product.brand?.type?.type_name || "-",
                  },
                  { label: "HSN Code", value: product.hsn_code || "-" },
                ]
                : []
            }
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Compatibility */}
          <Productcard
            title="Vehicle Compatibility"
            description="The vehicle make, model, and variant the product is compatible with."
            data={
              product
                ? [
                  {
                    label: "Make",
                    value: Array.isArray(product.make)
                      ? product.make.join(", ")
                      : "-",
                  },
                  { label: "Model", value: Array.isArray(product.model)
                    ? product.model.map((m) => m.model_name).join(", ")
                    : "-",
                  },
                  {
                    label: "Year Range",
                    value: Array.isArray(product.year_range)
                      ? product.year_range.map((y) => y.year_name).join(", ")
                      : "-",
                  },
                  {
                    label: "Variant",
                    value: Array.isArray(product.variant)
                      ? product.variant.map((v) => v.variant_name).join(", ")
                      : "-",
                  },
                  {
                    label: "Fitment Notes",
                    value: product.fitment_notes || "-",
                  },
                  {
                    label: "Is Universal",
                    value: product.is_universal ? "Yes" : "No",
                  },
                ]
                : []
            }
          />

          {/* Technical Specifications */}
          <Productcard
            title="Technical Specifications"
            description="Relevant technical details to help users understand the product quality and features."
            data={
              product
                ? [
                  {
                    label: "Key Specifications",
                    value: product.key_specifications || "-",
                  },
                  {
                    label: "Dimensions",
                    value: product.weight ? `${product.weight} kg` : "-",
                  },
                  {
                    label: "Certifications",
                    value: product.certifications || "-",
                  },
                  {
                    label: "Warranty",
                    value: product.warranty
                      ? `${product.warranty} months`
                      : "-",
                  },
                  {
                    label: "Is Consumable",
                    value: product.is_consumable ? "Yes" : "No",
                  },
                ]
                : []
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media & Assets */}
          <Productcard
            title="Media & Assets"
            description="product images, videos, and brochures to enhance visual representation and credibility."
            data={[]}
          >
            <div className="space-y-4">
              {product &&
                Array.isArray(product.images) &&
                product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {product.images.map((img: string, idx: number) => (
                    <div key={idx} className={idx === 0 ? "col-span-2" : ""}>
                      <img
                        src={img}
                        alt={`img-${idx}`}
                        className={`w-full bg-gray-200 rounded-md object-cover ${idx === 0 ? "aspect-video" : "aspect-square"
                          }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-md" />
              )}
            </div>
          </Productcard>

          {/* Pricing & Tax */}
          <Productcard
            title="Pricing & Tax"
            description="The pricing and tax information required for listing and billing."
            data={
              product
                ? [
                  {
                    label: "MRP (with GST)",
                    value: product.mrp_with_gst
                      ? `₹${product.mrp_with_gst}`
                      : "-",
                  },
                  {
                    label: "Selling Price",
                    value: product.selling_price
                      ? `₹${product.selling_price}`
                      : "-",
                  },
                  {
                    label: "GST %",
                    value: product.gst_percentage
                      ? String(product.gst_percentage)
                      : "-",
                  },
                  {
                    label: "Returnable",
                    value: product.is_returnable ? "Yes" : "No",
                  },
                  // {
                  //   label: "Return Policy",
                  //   value: product.return_policy || "-",
                  // },
                ]
                : []
            }
          />
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Dealer-Level Mapping & Routing */}
          <Productcard
            title="Dealer-Level Mapping & Routing"
            description="the core identifiers that define the product's identity, brand, and origin."
            data={[]}
          >
            {product &&
              product.available_dealers &&
              Array.isArray(product.available_dealers) &&
              product.available_dealers.length > 0 && (
                <div className="mt-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Available Dealers
                  </h4>
                  <DynamicButton
                    variant="outline"
                    customClassName="text-red-600 border-red-200 hover:bg-red-50 text-sm px-2 py-1"
                    onClick={() => setShowDealersModal(true)}
                    icon={<Eye className="w-4 h-4" />}
                    text={`${product.available_dealers.length} Dealers Available`}
                  />
                </div>
              )}
          </Productcard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO & Search Optimization */}
            <Productcard
              title="SEO & Search Optimization"
              description="The pricing and tax information required for listing and billing."
              data={
                product
                  ? [
                    { label: "SEO Title", value: product.seo_title || "-" },
                    {
                      label: "SEO Description",
                      value: product.seo_description || "-",
                    },
                    {
                      label: "Search Tags",
                      value: Array.isArray(product.search_tags)
                        ? product.search_tags.join(", ")
                        : "-",
                    },
                  ]
                  : []
              }
            />

            {/* Product History */}
            <Productcard
              title="Product History"
              description="Track the history of changes and modifications made to this product."
              data={
                product
                  ? [
                    {
                      label: "Product Version",
                      value: product.product_Version || "-",
                    },
                    {
                      label: "Iteration Number",
                      value: product.iteration_number
                        ? String(product.iteration_number)
                        : "-",
                    },
                    {
                      label: "Live Status",
                      value: product.live_status || "-",
                    },
                    {
                      label: "QC Status",
                      value: product.Qc_status || "-",
                    },
                    {
                      label: "Created At",
                      value: product.created_at
                        ? new Date(product.created_at).toLocaleDateString()
                        : "-",
                    },
                    {
                      label: "Last Updated",
                      value: product.updated_at
                        ? new Date(product.updated_at).toLocaleDateString()
                        : "-",
                    },
                  ]
                  : []
              }
            >
              {product &&
                product.change_logs &&
                Array.isArray(product.change_logs) &&
                product.change_logs.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Change History
                      </h4>
                      {product.change_logs.length > 3 && (
                        <DynamicButton
                          variant="outline"
                          customClassName="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-2 py-1"
                          onClick={() => setShowHistoryDrawer(true)}
                          icon={<ChevronRight className="w-3 h-3" />}
                          text="View More"
                        />
                      )}
                    </div>
                    <div className="space-y-3">
                      {[...product.change_logs]
                        .sort((a: any, b: any) => {
                          const dateA = new Date(a.modified_At).getTime();
                          const dateB = new Date(b.modified_At).getTime();
                          return dateB - dateA; // Descending order (most recent first)
                        })
                        .slice(0, 3)
                        .map((log: any, index: number) => {
                          const formattedLog = formatChangeLog(log);
                          return (
                            <div
                              key={log._id || index}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">
                                  Iteration {log.iteration_number}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    log.modified_At
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-xs text-gray-700 mb-1">
                                <span className="font-medium">
                                  Modified by:
                                </span>{" "}
                                {userNamesMap[log.modified_by] ||
                                  log.modified_by ||
                                  "Unknown"}
                              </div>
                              <div className="text-xs text-gray-700 mb-1">
                                <span className="font-medium">Changes:</span>{" "}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {formattedLog.changesList.map(
                                    (change: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                                      >
                                        {change}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
            </Productcard>
          </div>
        </div>
      </div>
      <RejectReason
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onSubmit={handleRejectProduct}
      />

      {/* Super Admin Dealers Modal */}
      <SuperAdminDealersModal
        open={showDealersModal}
        onClose={() => setShowDealersModal(false)}
        product={product}
      />

      {/* Product History Timeline Drawer */}
      <Sheet open={showHistoryDrawer} onOpenChange={setShowHistoryDrawer}>
        <SheetContent
          side="right"
          className="
    !w-[95vw] 
    !max-w-[900px] 
    !h-screen 
    !p-0 
    bg-gray-50 
    flex flex-col
  "
        >

          <SheetHeader className="bg-white p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <SheetTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base sm:text-lg truncate">
                  Product Change History
                </div>
                <div className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
                  Complete timeline of all product modifications
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          {product &&
            product.change_logs &&
            Array.isArray(product.change_logs) && (
              <ScrollArea className="flex-1 px-2 sm:px-4 py-4 overflow-y-auto">
                <div className="space-y-4 sm:space-y-6">
                  {(() => {
                    const sortedLogs = [...product.change_logs]
                      .sort((a, b) => Number(b.iteration_number) - Number(a.iteration_number));

                    return sortedLogs.map((log: any, index: number) => {
                      const formattedLog = formatChangeLog(log);
                      return (
                        <div key={log._id || index} className="relative">
                          {/* Timeline connector */}
                          {index < sortedLogs.length - 1 && (
                            <div className="absolute left-5 sm:left-6 top-10 sm:top-12 w-0.5 h-12 sm:h-16 bg-gray-200"></div>
                          )}

                          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start gap-3 sm:gap-4">
                              {/* Timeline dot */}
                              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-semibold text-blue-600">
                                  {log.iteration_number}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                    Iteration {log.iteration_number}
                                  </h3>
                                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                    {new Date(
                                      log.modified_At
                                    ).toLocaleDateString()}{" "}
                                    at{" "}
                                    {new Date(
                                      log.modified_At
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
                                      Modified by:
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded truncate">
                                      {userNamesMap[log.modified_by] ||
                                        log.modified_by ||
                                        "Unknown"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-sm font-medium text-gray-700">
                                      Changes:
                                    </span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {formattedLog.changesList.map(
                                        (change: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                          >
                                            {change}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                      <div className="min-w-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">
                                          Previous Values:
                                        </span>
                                        <div className="mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                          <div className="overflow-x-auto">
                                            {renderValue(
                                              formattedLog.parsedOldValue
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">
                                          New Values:
                                        </span>
                                        <div className="mt-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                                          <div className="overflow-x-auto">
                                            {renderValue(
                                              formattedLog.parsedNewValue
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </ScrollArea>
            )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
