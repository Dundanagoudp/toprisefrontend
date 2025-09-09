'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Eye, Loader2 } from 'lucide-react';

interface Product {
  _id: string;
  sku_code: string;
  product_name: string;
  brand: string;
  images: string[];
  selling_price: number;
  mrp_with_gst: number;
  product_type: string;
  category: string;
  sub_category: string;
  live_status: string;
  created_at: string;
  updated_at: string;
}

interface ProductListingProps {
  products: Product[];
  onProductSelect: (productName: string) => void;
  isLoading?: boolean;
}

const ProductListing = ({
  products,
  onProductSelect,
  isLoading = false
}: ProductListingProps) => {
  const [displayLimit, setDisplayLimit] = useState<number>(12);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const router = useRouter();
  const { addItemToCart } = useCart();
  const { toast } = useToast();

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase]);

  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg";
    if (/^https?:\/\//i.test(path)) return path;
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  }, [filesOrigin]);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 12);
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      setAddingToCart(productId);
      await addItemToCart(productId, 1);
      toast({
        title: "Added to Cart",
        description: `${productName} has been added to your cart.`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Add to Cart",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/shop/product/${productId}`);
  };

  const displayedProducts = products.slice(0, displayLimit);
  const hasMoreProducts = displayLimit < products.length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
        <p className="text-muted-foreground">
          No products available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Select Product
        </h2>
        <p className="text-muted-foreground">
          Choose from {products.length} available product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedProducts.map((product) => (
          <div
            key={product._id}
            className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <div className="flex flex-col gap-3">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={buildImageUrl(product.images?.[0])}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-2">
                  {product.product_name}
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-primary font-semibold">
                    Rs {product.selling_price?.toLocaleString() || 'N/A'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {product.sku_code}
                  </span>
                </div>
                {/* <p className="text-xs text-muted-foreground mb-3">
                  {product.category} • {product.sub_category}
                </p> */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProduct(product._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-transparent hover:bg-secondary/50 border border-border rounded-md transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button
                    onClick={() => handleAddToCart(product._id, product.product_name)}
                    disabled={addingToCart === product._id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart === product._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-3 h-3" />
                    )}
                    {addingToCart === product._id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMoreProducts && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Load More Products ({products.length - displayLimit} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
