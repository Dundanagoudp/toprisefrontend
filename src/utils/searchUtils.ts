/**
 * Utility functions for safe search operations
 */

/**
 * Safely converts a value to lowercase string for search comparison
 * @param value - The value to convert
 * @returns Lowercase string or empty string if value is null/undefined
 */
export const safeToLowerCase = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  if (typeof value === 'number') {
    return value.toString().toLowerCase();
  }
  return String(value).toLowerCase();
};

/**
 * Safely checks if a searchable field contains the search query
 * @param field - The field to search in
 * @param query - The search query
 * @returns true if field contains query, false otherwise
 */
export const safeIncludes = (field: any, query: string): boolean => {
  try {
    const fieldValue = safeToLowerCase(field);
    const searchQuery = safeToLowerCase(query);
    return fieldValue.includes(searchQuery);
  } catch (error) {
    console.warn('Error in safeIncludes:', error);
    return false;
  }
};

/**
 * Safely searches through product fields
 * @param product - The product object to search
 * @param query - The search query
 * @returns true if any searchable field contains the query
 */
export const searchProduct = (product: any, query: string): boolean => {
  if (!query || !product) {
    return false;
  }

  try {
    const searchQuery = query.trim().toLowerCase();
    if (!searchQuery) {
      return false;
    }

    // List of fields to search in
    const searchableFields = [
      product.product_name,
      product.manufacturer_part_name,
      product.name,
      product.category?.category_name,
      product.sub_category?.subcategory_name,
      product.brand?.brand_name,
      product.product_type,
      product.tags, // Add tags support
      product.description,
      product.sku,
      product.part_number
    ];

    // Check if any field contains the search query
    return searchableFields.some(field => {
      if (Array.isArray(field)) {
        // Handle array fields like tags
        return field.some(item => safeIncludes(item, searchQuery));
      }
      return safeIncludes(field, searchQuery);
    });
  } catch (error) {
    console.error('Error in searchProduct:', error);
    return false;
  }
};

/**
 * Safely filters an array of products based on search query
 * @param products - Array of products to filter
 * @param query - Search query
 * @returns Filtered array of products
 */
export const filterProductsBySearch = (products: any[], query: string): any[] => {
  if (!products || !Array.isArray(products)) {
    return [];
  }

  if (!query || !query.trim()) {
    return products;
  }

  try {
    return products.filter(product => searchProduct(product, query));
  } catch (error) {
    console.error('Error in filterProductsBySearch:', error);
    return products; // Return original array if filtering fails
  }
};
