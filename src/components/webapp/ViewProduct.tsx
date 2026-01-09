"use client";
import {
  Search,
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { useState, useEffect } from "react";
import {
  getProductById,
  getProductsByPage,
  getSimilarProducts,
} from "@/service/product-Service";
import {
  addWishlistByUser,
  getWishlistByUser,
  removeWishlistByUser,
} from "@/service/user/orderService";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Product as ProductType, Product } from "@/types/product-Types";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/toast";
import { getUserProfile } from "@/service/user/userService";
import { useAppSelector } from "@/store/hooks";
import type { AppUser } from "@/types/user-types";
import { getDealerById } from "@/service/dealerServices";
import type { Dealer } from "@/types/dealer-types";
import { usePincode } from "@/hooks/use-pincode";
import { PincodeDialog } from "@/components/webapp/common/PincodeDialog";

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const pageSize = 8;
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  // Recommended products state
  const [recommendedProducts, setRecommendedProducts] = useState<ProductType[]>(
    []
  );
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [addingRecommendedToCart, setAddingRecommendedToCart] = useState<
    string | null
  >(null);
  // Dealer info state
  const [dealerInfo, setDealerInfo] = useState<Dealer | null>(null);
  const [loadingDealer, setLoadingDealer] = useState(false);
  const userId = useAppSelector((state) => state.auth.user?._id);
  const id = useParams<{ id: string }>();
  const { addItemToCart, cartData } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const {
    pincode: savedPincode,
    pincodeData,
    loading: pincodeLoading,
    error: pincodeError,
    validatePincode,
    clearPincodeData,
    hasSavedPincode,
    shouldShowPincodeDialog
  } = usePincode();
  const [showPincodeDialog, setShowPincodeDialog] = useState(false);
  // Pincode input state (separate from Redux state)
  const [pincodeInput, setPincodeInput] = useState(savedPincode || "");

  // Sync local input with saved pincode
  useEffect(() => {
    setPincodeInput(savedPincode || "");
  }, [savedPincode]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const filesOrigin = React.useMemo(
    () => apiBase.replace(/\/api$/, ""),
    [apiBase]
  );
  const buildImageUrl = React.useCallback(
    (path?: string) => {
      if (!path) return "/placeholder.svg";
      if (/^https?:\/\//i.test(path)) return path;
      return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
    },
    [filesOrigin]
  );

  useEffect(() => {
    const fetchUserById = async () => {
      if (!userId) return;
      try {
        const response = await getUserProfile(userId);
        console.log("user", response);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUserById();
  }, [userId]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProductsByPage(currentPage, pageSize, "Approved");
        console.log("productid ", res?.data?.products?.[0]?._id);
        const items = (res?.data?.products ?? []) as ProductType[];
        setProducts(items);
        const tp = res?.data?.pagination?.totalPages;
        if (tp) setTotalPages(tp);
      } catch (e) {
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  // Fetch recommended products when product is loaded
  useEffect(() => {
    if (product) {
      fetchRecommendedProducts();
    }
  }, [product]);

  // Fetch dealer info when product is loaded
  useEffect(() => {
    const fetchDealerInfo = async () => {
      if (
        !product?.available_dealers ||
        product.available_dealers.length === 0
      ) {
        return;
      }

      const dealerRef = product.available_dealers[0]?.dealers_Ref;
      if (!dealerRef) {
        return;
      }

      try {
        setLoadingDealer(true);
        const response = await getDealerById(dealerRef);
        if (response.success && response.data) {
          setDealerInfo(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dealer info:", error);
      } finally {
        setLoadingDealer(false);
      }
    };

    if (product) {
      fetchDealerInfo();
    }
  }, [product]);

  // Check if product is in wishlist when both userId and product are available
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!userId || !product?._id) return;

      try {
        const response = await getWishlistByUser(userId);
        if (response.success && response.data) {
          // Handle different response structures like in ProfilePage
          let wishlistItems: any[] = [];
          if (Array.isArray(response.data)) {
            wishlistItems = response.data;
          } else if (response.data && typeof response.data === "object") {
            if (Array.isArray(response.data.items)) {
              wishlistItems = response.data.items;
            } else if (Array.isArray(response.data.products)) {
              wishlistItems = response.data.products;
            } else if (Array.isArray(response.data.wishlist)) {
              wishlistItems = response.data.wishlist;
            } else if (
              response.data &&
              typeof response.data === "object" &&
              !Array.isArray(response.data)
            ) {
              wishlistItems = [response.data];
            }
          }

          // Check if current product is in wishlist
          const isProductInWishlist = wishlistItems.some((item: any) => {
            const productData = item.productDetails || item;
            return (
              productData._id === product._id ||
              productData.productId === product._id
            );
          });

          setIsInWishlist(isProductInWishlist);
        }
      } catch (error) {
        console.error("Failed to check wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [userId, product?._id]);
  const handleProductClick = (productId: string) => {
    router.push(`/shop/product/${productId}`);
  };

  // Fetch recommended products using similar products endpoint
  const fetchRecommendedProducts = async () => {
    if (!product?._id || !product.brand?._id) {
      setRecommendedProducts([]);
      return;
    }

    setRecommendedLoading(true);
    try {
      const variantIds =
        product.variant?.map((item) => item._id).filter(Boolean) ?? [];

      const response = await getSimilarProducts(product._id, {
        count: 5,
        brand: product.brand._id,
        model: product.model._id,
        variant: variantIds,
      });

      let products: ProductType[] = [];
      const payload = response?.data as any;

      if (Array.isArray(payload)) {
        products = payload as ProductType[];
      } else if (payload?.products && Array.isArray(payload.products)) {
        products = payload.products as ProductType[];
      } else if (payload?.data && Array.isArray(payload.data)) {
        products = payload.data as ProductType[];
      } else if (
        payload?.data?.products &&
        Array.isArray(payload.data.products)
      ) {
        products = payload.data.products as ProductType[];
      }

      const filtered = products.filter(
        (p) => p._id !== product._id && !p.out_of_stock);

      setRecommendedProducts(filtered.slice(0, 5));
      console.log("recommended products", filtered.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch recommended products:", error);
      setRecommendedProducts([]);
    } finally {
      setRecommendedLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product?._id) return;

    // Check if pincode is saved, show dialog if not
    if (shouldShowPincodeDialog()) {
      setShowPincodeDialog(true);
      return;
    }

    try {
      setBuyingNow(true);
      await addItemToCart(product._id, quantity);
      showToast("Product added to cart successfully", "success");
      // Navigate to checkout page
      router.push("/shop/checkout");
    } catch (error: any) {
      if (error.message === "User not authenticated") {
        showToast("Please login to buy products", "error");
        router.push("/login");
      }
      else if (error.message?.includes('not serviceable')) {
        showToast("Product not serviceable at this location", "error");
      }
      else {
        showToast("Failed to add product to cart", "error");
        console.error("Error adding to cart:", error);
      }
    } finally {
      setBuyingNow(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id.id);

        const data = response.data;
        console.log("getProducts API response:", response);
        console.log("data", data);

        // Handle different response structures like other components
        let prod: Product | null = null;

        // Check if data has products array (ProductResponse structure)
        if (
          data.products &&
          Array.isArray(data.products) &&
          data.products.length > 0
        ) {
          prod = data.products[0];
        }
        // Check if data is directly an array
        else if (Array.isArray(data) && data.length > 0) {
          prod = data[0];
        }

        // Check if data is directly a product object
        else if (data && typeof data === "object" && (data as any)._id) {
          prod = data as unknown as Product;
        }

        // Last fallback - treat data as product if it's an object
        else if (
          typeof data === "object" &&
          data !== null &&
          !Array.isArray(data)
        ) {
          prod = data as unknown as Product;
        }

        setProduct(prod);
        console.log("Parsed product:", prod);
      } catch (error) {
        console.error("getProducts API error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id.id) {
      fetchProducts();
    }
  }, [id.id]);

  const handleAddToCart = async () => {
    if (!product?._id) return;

    // Check if pincode is saved, show dialog if not
    if (shouldShowPincodeDialog()) {
      setShowPincodeDialog(true);
      return;
    }

    try {
      setAddingToCart(true);
      await addItemToCart(product._id, quantity);
      showToast("Product added to cart successfully", "success");
    } catch (error: any) {
      if (error.message === "User not authenticated") {
        showToast("Please login to add items to cart", "error");
        router.push("/login");
      } 
      else if (error.message?.includes('not serviceable')) {
        showToast("Product not serviceable at this location", "error");
      }
      else {
        showToast("Failed to add product to cart", "error");
        console.error("Error adding to cart:", error);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePincodeSaved = () => {
    // Pincode is now saved, proceed with the intended action
    // The dialog will automatically close, and the user can retry their action
  };

  const handlePincodeValidation = async () => {
    if (pincodeInput.length !== 6) return;

    const result = await validatePincode(pincodeInput);

    if (result.success) {
      showToast("Pincode validated successfully!", "success");
    } else {
      showToast(result.message || "Invalid pincode", "error");
    }
  };

  const handleAddToWishlist = async () => {
    if (!product?._id || !userId) {
      if (!userId) {
        showToast("Please login to add items to wishlist", "error");
        router.push("/login");
      }
      return;
    }

    try {
      setAddingToWishlist(true);
      const wishlistData = {
        userId: userId,
        productId: product._id,
      };

      if (isInWishlist) {
        // Remove from wishlist
        await removeWishlistByUser(wishlistData);
        setIsInWishlist(false);
        // showToast("Product removed from wishlist", "success");
      } else {
        // Add to wishlist
        await addWishlistByUser(wishlistData);
        setIsInWishlist(true);
        // showToast("Product added to wishlist successfully", "success");
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error);
      // showToast("Failed to update wishlist", "error");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const computeDiscount = (mrp?: number, price?: number) => {
    if (!mrp || !price || mrp <= 0) return 0;
    return Math.max(0, Math.round((1 - price / mrp) * 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product not found
          </h1>
          <p className="text-gray-600">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const images = product.images || ["/placeholder.svg"];
  const mainImage = buildImageUrl(images[selectedImage]);
  const discount = computeDiscount(product.mrp_with_gst, product.selling_price);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      {/* <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href="/" 
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link 
              href="/shop" 
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">Product: {product.product_name}</span>
          </div>
        </div>
      </div> */}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {product?.brand && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/shop/model/${product.brand?._id}`}
                    >
                      {product.brand?.brand_name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {product?.product_name || "Product"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Images Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={mainImage}
                alt={product.product_name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((image, i) => (
                <div
                  key={i}
                  className={`aspect-square bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${
                    selectedImage === i ? "ring-2 ring-red-600" : ""
                  }`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img
                    src={buildImageUrl(image)}
                    alt={`${product.product_name} ${i + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {product.brand?.brand_name || "Brand"}
              </p>
              <h1 className="text-3xl font-bold mb-2">
                {product.product_name}
              </h1>

              {/* Part Number and Vehicle Details */}
              <div className="mb-4 space-y-2">
                {/* Vehicle Details */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {product.brand?.brand_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-medium">
                        {product.brand.brand_name}
                      </span>
                    </div>
                  )}
                  {product.model && product.model.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">
                        {product.model.map((m) => m.model_name).join(", ")}
                      </span>
                    </div>
                  )}
                  {product.variant && product.variant.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Variant:</span>
                      <span className="font-medium">
                        {product.variant.map((v) => v.variant_name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.5) Reviews</span>
              </div> */}
            </div>

            <div className="border-b pb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold">
                  ₹{Number(product.selling_price).toFixed(2)}
                </span>
                {product.mrp_with_gst &&
                  product.mrp_with_gst !== product.selling_price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{Number(product.mrp_with_gst).toFixed(2)}
                      </span>
                      {discount > 0 && (
                        <Badge variant="destructive">{discount}% OFF</Badge>
                      )}
                    </>
                  )}
              </div>
              {/* <p className="text-sm text-green-600">Inclusive of all taxes</p> */}
              {product.out_of_stock  ? (
                <p className="text-sm text-red-600">Out of Stock</p>
              ) : (
                <p className="text-sm text-green-600">In Stock</p>
              )}
              {(() => {
                const currentCartTotal = cartData?.totalPrice || 0;
                const productTotal = Number(product.selling_price) * quantity;
                const potentialCartTotal = currentCartTotal + productTotal;
                const isEligibleForFreeDelivery = potentialCartTotal > 1500;
                
                if (isEligibleForFreeDelivery) {
                  return (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      ✓ Free Delivery on orders above ₹1500
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-4">
              {product.category && (
                <div>
                  <p className="font-semibold mb-2">Category</p>
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {product.category.category_name}
                  </span>
                </div>
              )}

              {product.sub_category && (
                <div>
                  <p className="font-semibold mb-2">Subcategory</p>
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {product.sub_category.subcategory_name}
                  </span>
                </div>
              )}

              {product.make && product.make.length > 0 && (
                <div>
                  <p className="font-semibold mb-3">Compatible Makes</p>
                  <div className="flex flex-wrap gap-2">
                    {product.make.map((make, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {make}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            {/* Pincode Section */}
            <div>
              <p className="font-semibold mb-3">Pincode</p>

              {/* Display saved pincode if available */}
              {/* {hasSavedPincode && pincodeData && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Delivery available at {savedPincode} - {pincodeData.city}, {pincodeData.state}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    {pincodeData.delivery_available && (
                      <>
                        ✓ Delivery available • ₹{pincodeData.delivery_charges} • {pincodeData.estimated_delivery_days} days
                        {pincodeData.cod_available && " • COD available"}
                      </>
                    ) }
                  </div>
                </div>
              )} */}

              {/* Pincode input and validation */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1"
                  maxLength={6}
                />
                <Button
                  onClick={handlePincodeValidation}
                  disabled={pincodeLoading || pincodeInput.length !== 6}
                  variant="outline"
                  size="default"
                >
                  {pincodeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>

              {/* Error message */}
              {pincodeError ? (
                <p className="text-sm text-red-600 mt-2">Delivery not available for this pincode</p>
              ) : (
                <p className="text-sm text-green-600 mt-2">Delivery available at {pincodeData?.city}, {pincodeData?.state}</p>
              )}

              {/* Help text */}
              <p className="text-xs text-muted-foreground mt-2">
                Enter your pincode to check delivery availability and charges
              </p>
            </div>
              <div>
                <p className="font-semibold mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <button
                      className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.out_of_stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  product.out_of_stock ||
                  (Array.isArray(product.available_dealers) &&
                    product.available_dealers.length > 0 &&
                    !product.available_dealers.some((dealer) => dealer.inStock)) ||
                  addingToCart
                }
              >
                {addingToCart ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                {addingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 text-black"
                disabled={
                  product.out_of_stock ||
                  (Array.isArray(product.available_dealers) &&
                    product.available_dealers.length > 0 &&
                    !product.available_dealers.some((dealer) => dealer.inStock)) ||
                  buyingNow
                }
                onClick={handleBuyNow}
              >
                {buyingNow ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {buyingNow ? "Processing..." : "Buy Now"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-4"
                onClick={handleAddToWishlist}
                disabled={addingToWishlist || !userId}
              >
                {addingToWishlist ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}
                  />
                )}
              </Button>
            </div>

            <div className="space-y-4 pt-6 border-t">
              {product.key_specifications && (
                <div>
                  <h3 className="font-semibold mb-2">Product Details</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {product.key_specifications}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.sku_code && (
                  <div>
                    <span className="font-medium">SKU:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.sku_code}
                    </span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="font-medium">Weight:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.weight}kg
                    </span>
                  </div>
                )}
                {product.warranty && (
                  <div>
                    <span className="font-medium">Warranty:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.warranty} months
                    </span>
                  </div>
                )}
                {product.hsn_code && (
                  <div>
                    <span className="font-medium">HSN Code:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.hsn_code}
                    </span>
                  </div>
                )}
                {product.manufacturer_part_name && (
                  <>
                    <div>
                      <span className="font-medium">
                        Manufacturer Part Number:
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {product.manufacturer_part_name}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {product.is_returnable && (
                <div>
                  <h3 className="font-semibold mb-2">Return Policy</h3>
                  <div className="text-sm">
                    <p className="text-green-600">
                      ✓ This product is returnable
                    </p>
                    {product.return_policy && (
                      <p className="text-muted-foreground mt-1">
                        {product.return_policy}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* <div>
                <h3 className="font-semibold mb-2">Delivery Options</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Enter pincode to check delivery date</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Pincode"
                      className="px-3 py-2 border rounded-md flex-1 max-w-xs"
                    />
                    <Button variant="outline">Check</Button>
                  </div>
                  <p className="text-green-600">✓ Free Delivery on orders above ₹500</p>
                  <p className="text-muted-foreground">✓ Easy 30 days return & exchange</p>
                </div>
              </div> */}
            </div>

            {/* Delivery Details Section */}
            {/* <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">📍</span>
                <span className="text-sm font-medium">Deliver to</span>
              </div>
                             <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">Address</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.street || "No address found"}
                   </div>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">City</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.city || "No city found"}
                   </div>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">State</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.state || "No state found"}
                   </div>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">Pin Code</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.pincode || "No pincode found"}
                   </div>
                 </div>
               </div>
                              <div className="flex gap-2">
                  <input type="checkbox" className="mt-0.5" />
                  <label className="text-xs text-muted-foreground">
                    {user?.address?.[0] ? `${user.address[0].addressLine1}, ${user.address[0].city}, ${user.address[0].state} - ${user.address[0].pinCode}` : "No address found"}
                  </label>
                </div>
            </div> */}

            {/* Features and Specification */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Features and Specification
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Key Specifications
                  </p>
                  <p className="text-sm font-medium text-justify">
                    {product.key_specifications}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Manufacturer
                  </p>
                  <p className="text-sm font-medium">
                    {product.brand?.brand_name}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Seller</p>
                  {loadingDealer ? (
                    <p className="text-sm text-muted-foreground">
                      Loading dealer info...
                    </p>
                  ) : dealerInfo ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {dealerInfo.trade_name || dealerInfo.legal_name}
                      </p>
                      {/* {dealerInfo.contact_person && (
                        <p className="text-xs text-muted-foreground">
                          Contact: {dealerInfo.contact_person.name} | {dealerInfo.contact_person.phone_number}
                        </p>
                      )} */}
                      {dealerInfo.Address && (
                        <p className="text-xs text-muted-foreground">
                          {dealerInfo.Address.city}, {dealerInfo.Address.state}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {product.available_dealers[0]?.dealers_Ref ||
                        "Dealer information not available"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        <div className="mt-16 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Recommended Products</h2>
            <p className="text-muted-foreground">
              Products for {product.brand?.brand_name || ""}{" "}
              {product.model && product.model.length > 0 && product.model.map((m) => m.model_name).join(", ") || ""}{" "}
              {product.variant && product.variant.length > 0
                ? product.variant.map((v) => v.variant_name).join(", ")
                : ""}
            </p>
          </div>

          {recommendedLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((recommendedProduct) => {
                const imageSrc = buildImageUrl(recommendedProduct?.images?.[0]);
                const name = recommendedProduct?.product_name || "Product";
                const brand = recommendedProduct?.brand?.brand_name || "";
                const price = recommendedProduct?.selling_price ?? 0;
                const originalPrice = recommendedProduct?.mrp_with_gst ?? price;
                const discount = computeDiscount(originalPrice, price);

                return (
                  <div
                    key={recommendedProduct._id}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(recommendedProduct._id)}
                  >
                    <div className="relative">
                      <div className="aspect-square bg-muted rounded-md mb-4 overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        In Stock
                      </Badge>
                      <button className="absolute top-2 right-2 p-1.5 bg-background rounded-full border hover:bg-muted">
                        <Heart className="w-4 h-4" />
                      </button>
                      {discount > 0 && (
                        <div className="absolute top-2 right-12 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {discount}%
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{brand}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg">
                          ₹{Number(price).toFixed(2)}
                        </span>
                        {originalPrice && originalPrice !== price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{Number(originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          variant="outline"
                          size="sm"
                          disabled={
                            addingRecommendedToCart === recommendedProduct._id
                          }
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              setAddingRecommendedToCart(
                                recommendedProduct._id
                              );
                              await addItemToCart(recommendedProduct._id, 1);
                              showToast(
                                "Product added to cart successfully",
                                "success"
                              );
                            } catch (error: any) {
                              if (error.message === "User not authenticated") {
                                showToast(
                                  "Please login to add items to cart",
                                  "error"
                                );
                                router.push("/login");
                              } else {
                                showToast(
                                  "Failed to add product to cart",
                                  "error"
                                );
                              }
                            } finally {
                              setAddingRecommendedToCart(null);
                            }
                          }}
                        >
                          {addingRecommendedToCart ===
                          recommendedProduct._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 mr-2" />
                          )}
                          {addingRecommendedToCart === recommendedProduct._id
                            ? "Adding..."
                            : "Add"}
                        </Button>
                        <Button
                          className="flex-1"
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(recommendedProduct._id);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No recommended products found for this brand.
              </p>
            </div>
          )}
        </div>
      </div>

      <PincodeDialog
        open={showPincodeDialog}
        onOpenChange={setShowPincodeDialog}
        onPincodeSaved={handlePincodeSaved}
      />
    </div>
  );
}
