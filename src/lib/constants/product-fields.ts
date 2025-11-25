/**
 * Product Fields Configuration for Permission Management
 * Categorized list of all available product fields with user-friendly labels
 */

export interface ProductField {
  value: string
  label: string
  category: string
}

export const PRODUCT_FIELD_CATEGORIES = {
  BASIC_INFO: "Basic Information",
  STOCK_PRICING: "Stock & Pricing",
  VEHICLE_COMPATIBILITY: "Vehicle Compatibility",
  TECHNICAL_SPECS: "Technical Specifications",
  MEDIA: "Media & SEO",
  POLICIES: "Policies & Status",
  DEALER_MANAGEMENT: "Dealer Management",
} as const

export const PRODUCT_FIELDS: ProductField[] = [
  // Basic Information
  { value: "sku_code", label: "SKU Code", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "manufacturer_part_name", label: "Manufacturer Part Name", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "product_name", label: "Product Name", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "brand", label: "Brand", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "category", label: "Category", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "sub_category", label: "Sub Category", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "product_type", label: "Product Type", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "description", label: "Description", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "short_description", label: "Short Description", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "warranty", label: "Warranty", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  { value: "certifications", label: "Certifications", category: PRODUCT_FIELD_CATEGORIES.BASIC_INFO },
  
  // Stock & Pricing
  { value: "mrp", label: "MRP", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  { value: "mrp_with_gst", label: "MRP with GST", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  { value: "selling_price", label: "Selling Price", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  { value: "cost_price", label: "Cost Price", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  { value: "stock_quantity", label: "Stock Quantity", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  { value: "low_stock_threshold", label: "Low Stock Threshold", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  { value: "hsn_code", label: "HSN Code", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  { value: "gst_rate", label: "GST Rate", category: PRODUCT_FIELD_CATEGORIES.STOCK_PRICING },
  
  // Vehicle Compatibility
  { value: "is_universal", label: "Is Universal", category: PRODUCT_FIELD_CATEGORIES.VEHICLE_COMPATIBILITY },
  { value: "make", label: "Make", category: PRODUCT_FIELD_CATEGORIES.VEHICLE_COMPATIBILITY },
  { value: "model", label: "Model", category: PRODUCT_FIELD_CATEGORIES.VEHICLE_COMPATIBILITY },
  { value: "year_range", label: "Year Range", category: PRODUCT_FIELD_CATEGORIES.VEHICLE_COMPATIBILITY },
  { value: "variant", label: "Variant", category: PRODUCT_FIELD_CATEGORIES.VEHICLE_COMPATIBILITY },
  { value: "compatible_vehicles", label: "Compatible Vehicles", category: PRODUCT_FIELD_CATEGORIES.VEHICLE_COMPATIBILITY },
  { value: "vehicle_segment", label: "Vehicle Segment", category: PRODUCT_FIELD_CATEGORIES.VEHICLE_COMPATIBILITY },
  
  // Technical Specifications
  { value: "dimensions", label: "Dimensions", category: PRODUCT_FIELD_CATEGORIES.TECHNICAL_SPECS },
  { value: "weight", label: "Weight", category: PRODUCT_FIELD_CATEGORIES.TECHNICAL_SPECS },
  { value: "material", label: "Material", category: PRODUCT_FIELD_CATEGORIES.TECHNICAL_SPECS },
  { value: "color", label: "Color", category: PRODUCT_FIELD_CATEGORIES.TECHNICAL_SPECS },
  { value: "technical_specifications", label: "Technical Specifications", category: PRODUCT_FIELD_CATEGORIES.TECHNICAL_SPECS },
  
  // Media & SEO
  { value: "images", label: "Images", category: PRODUCT_FIELD_CATEGORIES.MEDIA },
  { value: "video_url", label: "Video URL", category: PRODUCT_FIELD_CATEGORIES.MEDIA },
  { value: "seo_title", label: "SEO Title", category: PRODUCT_FIELD_CATEGORIES.MEDIA },
  { value: "seo_description", label: "SEO Description", category: PRODUCT_FIELD_CATEGORIES.MEDIA },
  { value: "seo_keywords", label: "SEO Keywords", category: PRODUCT_FIELD_CATEGORIES.MEDIA },
  { value: "tags", label: "Tags", category: PRODUCT_FIELD_CATEGORIES.MEDIA },
  
  // Policies & Status
  { value: "return_policy", label: "Return Policy", category: PRODUCT_FIELD_CATEGORIES.POLICIES },
  { value: "shipping_policy", label: "Shipping Policy", category: PRODUCT_FIELD_CATEGORIES.POLICIES },
  { value: "is_active", label: "Is Active", category: PRODUCT_FIELD_CATEGORIES.POLICIES },
  { value: "is_featured", label: "Is Featured", category: PRODUCT_FIELD_CATEGORIES.POLICIES },
  
  // Dealer Management
  { value: "dealer_margin", label: "Dealer Margin", category: PRODUCT_FIELD_CATEGORIES.DEALER_MANAGEMENT },
  { value: "dealer_priority", label: "Dealer Priority", category: PRODUCT_FIELD_CATEGORIES.DEALER_MANAGEMENT },
  { value: "dealer_notes", label: "Dealer Notes", category: PRODUCT_FIELD_CATEGORIES.DEALER_MANAGEMENT },
  { value: "admin_notes", label: "Admin Notes", category: PRODUCT_FIELD_CATEGORIES.DEALER_MANAGEMENT },
]

/**
 * Get fields grouped by category
 */
export function getFieldsByCategory(): Record<string, ProductField[]> {
  return PRODUCT_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = []
    }
    acc[field.category].push(field)
    return acc
  }, {} as Record<string, ProductField[]>)
}

/**
 * Get field label by value
 */
export function getFieldLabel(value: string): string {
  const field = PRODUCT_FIELDS.find(f => f.value === value)
  return field?.label || value
}

/**
 * Search fields by query
 */
export function searchFields(query: string): ProductField[] {
  const lowercaseQuery = query.toLowerCase()
  return PRODUCT_FIELDS.filter(
    field =>
      field.label.toLowerCase().includes(lowercaseQuery) ||
      field.value.toLowerCase().includes(lowercaseQuery)
  )
}
