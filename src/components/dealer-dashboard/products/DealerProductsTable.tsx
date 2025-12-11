"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  ShoppingCart,
  BarChart3,
  MoreVertical,
  MoreHorizontal,
  Plus,
  Minus
} from "lucide-react";
import { 
  getDealerProducts, 
  formatCurrency, 
  formatProductDate,
  getStockStatusColor,
  getStockStatusText,
  getPriorityColor,
  getPriorityText,
  canEditField,
  canManage,
  updateStockByDealer,
  type DealerProduct,
  type DealerProductsResponse,
  type ProductsSummary
} from "@/service/dealer-products-service";
import { getDealerIdFromUserId } from "@/service/dealerServices";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface ProductTableRowProps {
  product: DealerProduct;
  onViewDetails: (product: DealerProduct) => void;
  onUpdateStock: (product: DealerProduct) => void;
}

const ProductTableRow = ({ product, onViewDetails, onUpdateStock }: ProductTableRowProps) => {

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="w-16">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.product_name}
            className="w-12 h-12 rounded-lg object-cover border"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-semibold text-gray-900">{product.product_name}</div>
          <div className="text-sm text-gray-600">SKU: {product.sku_code}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            {product.brand.brand_name}
          </Badge>
          <div className="text-sm text-gray-600">{product.category.category_name}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{formatCurrency(product.pricing.mrp_with_gst)}</div>
          <div className="text-sm text-blue-600">{formatCurrency(product.pricing.dealer_selling_price)}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{product.dealer_info.quantity_available}</div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getStockStatusColor(product.dealer_info.in_stock, product.dealer_info.quantity_available)}`}
          >
            {getStockStatusText(product.dealer_info.in_stock, product.dealer_info.quantity_available)}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-semibold text-green-600">{product.pricing.dealer_margin}%</div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getPriorityColor(product.dealer_info.dealer_priority)}`}
          >
            {getPriorityText(product.dealer_info.dealer_priority)}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm font-medium">{product.brand.brand_name}</div>
          <div className="text-xs text-gray-600">
            {product.model.model_name}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600">
          {formatProductDate(product.updated_at)}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(product)}>
              <Eye className="h-4 w-4 mr-2" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStock(product)}>
              <Edit className="h-4 w-4 mr-2" />
              Update stock
            </DropdownMenuItem>
          
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

interface SummaryCardProps {
  summary: ProductsSummary;
  loading: boolean;
}

const SummaryCard = ({ summary, loading }: SummaryCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2 text-blue-500" />
          Products Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{summary.totalProducts}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.totalInStock}</div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.totalOutOfStock}</div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.averagePrice)}</div>
            <div className="text-sm text-gray-600">Avg Price</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DealerProductsTable() {
  const [products, setProducts] = useState<DealerProduct[]>([]);
  const [summary, setSummary] = useState<ProductsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DealerProduct | null>(null);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);
  
  const { showToast } = useToast();
  const router = useRouter();

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (categoryFilter !== "all") filters.category = categoryFilter;
      if (brandFilter !== "all") filters.brand = brandFilter;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
      
      const response = await getDealerProducts(undefined, page, 12, filters);
      
      setProducts(response.data.products);
      setSummary(response.data.summary);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, brandFilter, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchProducts(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleViewDetails = (product: DealerProduct) => {
    // Store product data in sessionStorage for the details page
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    router.push(`/dealer/dashboard/product/productdetails/${product._id}`);
  };

  const handleUpdateStock = (product: DealerProduct) => {
    setSelectedProduct(product);
    setStockQuantity(product.dealer_info.quantity_available);
    setIsUpdateStockOpen(true);
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct) return;
    
    setUpdatingStock(true);
    try {
      console.log("product info",selectedProduct)
      const dealerId = await getDealerIdFromUserId();
      await updateStockByDealer(selectedProduct._id, dealerId, stockQuantity);
      showToast("Stock updated successfully", "success");
      setIsUpdateStockOpen(false);
      fetchProducts(currentPage);
    } catch (err: any) {
      console.error("Failed to update stock:", err);
      showToast(err?.response?.data?.message || "Failed to update stock", "error");
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  // Build unique category and brand options using object IDs
  const categoryOptions = Array.from(
    new Map(
      products
        .map(p => p.category)
        .filter((c: any) => c && c._id && c.category_name)
        .map((c: any) => [c._id, { id: c._id as string, name: c.category_name as string }])
    ).values()
  );
  const brandOptions = Array.from(
    new Map(
      products
        .map(p => p.brand)
        .filter((b: any) => b && b._id && b.brand_name)
        .map((b: any) => [b._id, { id: b._id as string, name: b.brand_name as string }])
    ).values()
  );

  const getComputedStatus = (p: DealerProduct): "in-stock" | "low-stock" | "out-of-stock" => {
    const qty = p?.dealer_info?.quantity_available ?? 0;
    const inStock = p?.dealer_info?.in_stock ?? qty > 0;
    if (!inStock || qty <= 0) return "out-of-stock";
    if (qty > 0 && qty < 5) return "low-stock";
    return "in-stock";
  };

  const normalized = (s: string | undefined | null) => String(s || "").toLowerCase();

  const filteredProducts = products.filter((p) => {
    // Brand filter
    if (brandFilter !== "all" && String(p.brand?._id || "") !== String(brandFilter)) return false;
    // Category filter
    if (categoryFilter !== "all" && String(p.category?._id || "") !== String(categoryFilter)) return false;
    // Status filter
    if (statusFilter !== "all") {
      const st = getComputedStatus(p);
      if (st !== statusFilter) return false;
    }
    // Search filter (name, sku, brand, category)
    if (searchTerm) {
      const q = normalized(searchTerm);
      const hay = [p.product_name, p.sku_code, p.brand?.brand_name, p.category?.category_name]
        .map(normalized)
        .join("\n");
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  console.log("filteredProducts",filteredProducts)

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <SummaryCard summary={summary!} loading={true} />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand/Category</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Margin/Priority</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-12 w-12 rounded-lg" /></TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600">Manage your product inventory and pricing</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <SummaryCard summary={summary!} loading={loading} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search Products"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand</label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brandOptions.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="updated_at">Last Updated</SelectItem>
                  <SelectItem value="product_name">Product Name</SelectItem>
                  <SelectItem value="dealer_selling_price">Price</SelectItem>
                  <SelectItem value="quantity_available">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Products ({products.length})
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => router.push("/dealer/dashboard/product/addproduct")}
                size="sm"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== "all" || brandFilter !== "all" || statusFilter !== "all"
                  ? "No products match your current filters."
                  : "You haven't added any products yet."}
              </p>
              <Button onClick={() => router.push("/dealer/dashboard/product/addproduct")}>
                <Package className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand/Category</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Margin/Priority</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <ProductTableRow 
                      key={product._id} 
                      product={product} 
                      onViewDetails={handleViewDetails}
                      onUpdateStock={handleUpdateStock}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Update Stock Dialog */}
      <Dialog open={isUpdateStockOpen} onOpenChange={setIsUpdateStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img 
                    src={selectedProduct.images[0]} 
                    alt={selectedProduct.product_name}
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{selectedProduct.product_name}</div>
                  <div className="text-sm text-gray-600">SKU: {selectedProduct.sku_code}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Current Stock: <span className="font-medium">{selectedProduct.dealer_info.quantity_available}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStockQuantity(Math.max(0, stockQuantity - 1))}
                    disabled={updatingStock}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={updatingStock}
                    className="w-24 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStockQuantity(stockQuantity + 1)}
                    disabled={updatingStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateStockOpen(false)} disabled={updatingStock}>
                  Cancel
                </Button>
                <Button onClick={handleStockUpdate} disabled={updatingStock}>
                  {updatingStock ? "Updating..." : "Update Stock"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

