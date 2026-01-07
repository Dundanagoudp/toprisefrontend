'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/components/ui/toast';
import { usePincode } from '@/hooks/use-pincode';
import { PincodeDialog } from '@/components/webapp/common/PincodeDialog';
import { ShoppingCart, Eye, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

interface Product {
  available_dealers?: AvailableDealer[];
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
  out_of_stock?: boolean;
  no_of_stock?: number;
}

interface ProductListingProps {
  products: Product[];
  onProductSelect: (productName: string) => void;
  isLoading?: boolean;
}
interface AvailableDealer {
  inStock?: boolean;
  quantity_per_dealer?: number;
}


const ProductListing = ({
  products,
  onProductSelect,
  isLoading = false
}: ProductListingProps) => {
  const [displayLimit, setDisplayLimit] = useState<number>(12);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showPincodeDialog, setShowPincodeDialog] = useState(false);
  const [pendingCartAction, setPendingCartAction] = useState<{ productId: string; productName: string } | null>(null);
  const router = useRouter();
  const { addItemToCart } = useCart();
  const { showToast } = useToast();
  const { shouldShowPincodeDialog } = usePincode();

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
    // Check if pincode is saved, show dialog if not
    if (shouldShowPincodeDialog()) {
      setPendingCartAction({ productId, productName });
      setShowPincodeDialog(true);
      return;
    }

    try {
      setAddingToCart(productId);
     await addItemToCart(productId, 1);
 

    } catch (error: any) {
      if (error.message === 'User not authenticated') {
        showToast("Please login to add items to cart", "error");
        router.push("/login");
      } else if (error.message?.includes('not serviceable')) {
        showToast("Product not serviceable at this location", "error");
      } else {
        showToast("Failed to add product to cart", "error");
        console.error("Error adding to cart:", error);
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const handlePincodeSaved = async () => {
    // Execute the pending cart action now that pincode is saved
    if (pendingCartAction) {
      const { productId, productName } = pendingCartAction;
      try {
        setAddingToCart(productId);
        await addItemToCart(productId, 1);
        showToast(`${productName} has been added to your cart.`, "success");
      } catch (error: any) {
        if (error.message === 'User not authenticated') {
          showToast("Please login to add items to cart", "error");
          router.push("/login");
        } else if (error.message?.includes('not serviceable')) {
          showToast("Product not serviceable at this location", "error");
        } else {
          showToast("Failed to add product to cart", "error");
          console.error("Error adding to cart:", error);
        }
      } finally {
        setAddingToCart(null);
        setPendingCartAction(null);
      }
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
          Choose from {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedProducts.map((product) => {
          const isOutOfStock = product.out_of_stock ?? false;
          
          return (
            <div
              key={product._id}
              className={`bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all ${
                isOutOfStock ? 'opacity-75' : ''
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
                  <img
                    src={buildImageUrl(product.images?.[0])}
                    alt={product.product_name}
                    onClick={() => handleViewProduct(product._id)}
                    className="w-full h-full object-cover"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center cursor-pointer" onClick={() => handleViewProduct(product._id)}>
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-2">
                    {product.product_name}
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-semibold">
                      Rs {product.selling_price?.toLocaleString() || 'N/A'}
                    </span>
                    {/* <span className="text-xs text-muted-foreground">
                      {product.sku_code}
                    </span> */}
                  </div>
                  <div className="flex gap-2">
                    {/* <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleViewProduct(product._id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-transparent hover:bg-secondary/50 border border-border rounded-md transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button> */}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAddToCart(product._id, product.product_name);
                      }}
                      disabled={addingToCart === product._id || isOutOfStock}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-md transition-colors ${
                        isOutOfStock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {addingToCart === product._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-3 h-3" />
                      )}
                      {addingToCart === product._id ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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

      <PincodeDialog
        open={showPincodeDialog}
        onOpenChange={setShowPincodeDialog}
        onPincodeSaved={handlePincodeSaved}
      />
    </div>
  );
};

export default ProductListing;
