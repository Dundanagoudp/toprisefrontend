import { z } from "zod"

export const productSchema = z.object({
  // Core Product Identity
  sku_code: z.string().min(1, "SKU Code is required"),
  no_of_stock: z.number().int({ message: "No. of Stock must be an integer" }).min(0, "Stock cannot be negative"),
  manufacturer_part_name: z.string().optional(),
  product_name: z.string().min(1, "Product Name is required"),
  hsn_code: z.number().int().optional(),
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().min(1, "Sub-category is required"),
  product_type: z.string().min(1, "Product type is required"),
  vehicle_type: z.string().optional(),

  // Vehicle Compatibility
  brand: z.string().min(1, "Brand is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year_range: z.string().optional(),
  variant: z.string().min(1, "Variant is required"),
  fitment_notes: z.string().optional(),
  fulfillment_priority: z.number().int({ message: "Fulfillment Priority must be an integer" }).optional(),
  is_universal: z.boolean(),

  // Technical Specifications
  keySpecifications: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.number().optional(),
  certifications: z.string().optional(),
  warranty: z.number().int().optional(),
  is_consumable: z.boolean(),

  // Media & Documentation
  images: z.string().optional(),
  videoUrl: z.string().optional(),
  brochure_available: z.string(),

  // Pricing & Tax
  mrp_with_gst: z.number().min(0, "MRP must be positive"),
  selling_price: z.number().min(0, "Selling Price must be positive"),
  gst_percentage: z.number().min(0, "GST percentage must be positive").max(100, "GST cannot exceed 100%"),
  is_returnable: z.boolean(),
  return_policy: z.string().optional(),
})

export type FormValues = z.infer<typeof productSchema>
