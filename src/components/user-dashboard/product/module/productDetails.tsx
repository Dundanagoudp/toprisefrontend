"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { Productcard } from "./productCard";
import { getProductById, getProducts } from "@/service/product-Service";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types/product-Types";
import { aproveProduct, deactivateProduct } from "@/service/product-Service";
import DynamicButton from "../../../common/button/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductByIdSuccess, fetchProductByIdRequest, fetchProductByIdFailure } from "@/store/slice/product/productByIdSlice";

export default function ViewProductDetails() {
  const [status, setStatus] = React.useState<string>("Created");
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isEditLoading, setIsEditLoading] = React.useState<boolean>(false);
  const id = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();


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
    } else if (newStatus === "Pending") {
      await deactivateProduct(id.id);
    }
  };
  const handleEdit = (idObj: { id: string }) => {
    setIsEditLoading(true);
    router.push(`/user/dashboard/product/productedit/${idObj.id}`);
  };
  React.useEffect(() => {
    const fetchProducts = async () => {
        dispatch(fetchProductByIdRequest());
      try {
        const response = await getProductById(id.id);
        // response is ProductResponse, which has data: Product[]
        const data = response.data;
        let prod: Product | null = null;
        if (Array.isArray(data) && data.length > 0) {
          prod = data[0];
        } else if (
          typeof data === "object" &&
          data !== null &&
          !Array.isArray(data)
        ) {
          prod = data as Product;
        }
        setProduct(prod);
        dispatch(fetchProductByIdSuccess(prod));
        if (prod && prod.live_status) {
          setStatus(prod.live_status);
        }
        console.log("getProducts API response:", response);
      } catch (error) {
        console.error("getProducts API error:", error);
        dispatch(fetchProductByIdFailure(error as string));
      }
    };
    fetchProducts();
  }, []);

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
            <Select onValueChange={handleStatusChange} value={status}>
              <SelectTrigger
                className={`min-w-[120px] ${getStatusColor(status)}`}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Created">Created</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <DynamicButton
              variant= "outline"
              customClassName=" bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-600 text-red-600"
              onClick={()=> handleEdit(id)}
              icon={<Pencil/>}
              text="Edit Product"
              loading={isEditLoading}
              loadingText="Redirecting..."
            />
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
                    { label: "Model", value: product.model?.model_name || "-" },
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
                      value: product.is_universal ? "True" : "False",
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
                      value: product.is_consumable ? "True" : "False",
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
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 ">
                {product && Array.isArray(product.images) && product.images.length > 0 ? (
                  <>
                    {/* Show the first image as main */}
                    <img
                      src={product.images[0]}
                      alt="Main"
                      className="aspect-video bg-gray-200 rounded-md object-cover"
                    />
                    {/* Show remaining images, if any */}
                    <div className={`grid grid-cols-2 gap-2`}>
                      {product.images
                        .slice(1)
                        .map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`img-${idx + 1}`}
                            className="aspect-square bg-gray-200 rounded-md object-cover"
                          />
                        ))}
                    </div>
                  </>
                ) : (
                  // No images at all
                  <div className="col-span-2 aspect-video bg-gray-200 rounded-md" />
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 ">Video URL</span>
                  {/* No videoUrl in Product, so show N/A */}
                  <span className="text-sm text-gray-400">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Brochure Available
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {product && typeof product.brochure_available === "boolean"
                      ? product.brochure_available ? "True" : "False"
                      : "False"}
                  </span>
                </div>
              </div>
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
                      label: "GST %",
                      value: product.gst_percentage
                        ? String(product.gst_percentage)
                        : "-",
                    },
                    {
                      label: "Returnable",
                      value: product.is_returnable ? "True" : "False",
                    },
                    {
                      label: "Return Policy",
                      value: product.return_policy || "-",
                    },
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
            data={
              product
                ? [
                    {
                      label: "Available Dealers",
                      value: product.available_dealers
                        ? JSON.stringify(product.available_dealers)
                        : "-",
                    },
                    {
                      label: "Quantity per Dealer",
                      value:
                        product.no_of_stock !== undefined
                          ? String(product.no_of_stock)
                          : "-",
                    },
                    // Dealer Margin % not present in Product type
                    {
                      label: "Dealer Priority Override",
                      value:
                        product.fulfillment_priority !== undefined
                          ? String(product.fulfillment_priority)
                          : "-",
                    },
                    // Stock Expiry Rule not present in Product type
                    {
                      label: "Last Stock Update",
                      value:
                        product.available_dealers?.last_stock_update || "-",
                    },
                    {
                      label: "Last Inquired At",
                      value: product.last_stock_inquired || "-",
                    },
                  ]
                : []
            }
          />

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

            {/* Status, Audit & Metadata */}
            <Productcard
              title="Status, Audit & Metadata"
              description="The pricing and tax information required for listing and billing."
              data={
                product
                  ? [
                      { label: "Created By", value: product.created_by || "-" },
                      {
                        label: "Modified At / By",
                        value: product.updated_at || "-",
                      },
                    ]
                  : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
