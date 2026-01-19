"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, Eye, MoreHorizontal, UserCheck } from "lucide-react";
import { DynamicButton } from "@/components/common/button";
import CreatePicklist from "./CreatePicklist";
import { useToast as GlobalToast } from "@/components/ui/toast";
import AssignDealersPerSkuModal from "../order-popus/AssignDealersPerSkuModal";
import MarkPackedModal from "../order-popus/MarkPackedModal";
import ViewPicklistsModal from "../order-popus/ViewPicklistsModal";
import { useAppSelector } from "@/store/hooks";
import { getDealerById } from "@/service/dealerServices";
import {
  getAllPicklists,
  getPicklistById,
  getPicklistByOrderId,
} from "@/service/pickup-service";
import {
  fetchEmployeeByUserId,
  fetchPicklistsByEmployee,
  getOrderById,
} from "@/service/order-service";

interface ProductItem {
  _id?: string;
  productId?: string;
  productName: string;
  manufacturer_part_name?: string;
  dealerId: any;
  sku?: string;
  quantity?: number;
  mrp: number;
  gst: number | string;
  totalPrice: number;
  image?: string;
  tracking_info?: { status: string };
  return_info?: { is_returned: boolean; return_id: string | null };
  dealerMapped?: any[];
  gst_percentage?: string;
  mrp_gst_amount?: number;
  gst_amount?: number;
  product_total?: number;
  piclistGenerated?: boolean;
  markAsPacked?: boolean;
}

interface AdminProductDetailsProps {
  products: ProductItem[] | null | undefined;
  onProductEyeClick: (product: ProductItem) => void;
  onDealerEyeClick: (dealerId: string) => void;
  orderId?: string;
  onRefresh?: () => void;
  deliveryCharges?: number;
}

// Helpers
const safeDealerId = (dealer: any): string => {
  if (!dealer) return "";
  if (typeof dealer === "string") {
    const lower = dealer.trim().toLowerCase();
    return ["n/a", "na", "null", "undefined", "-"].includes(lower)
      ? ""
      : dealer;
  }
  if (typeof dealer === "number")
    return Number.isFinite(dealer) ? String(dealer) : "";
  const id = dealer._id || dealer.id;
  if (typeof id === "string") {
    const lower = id.trim().toLowerCase();
    return ["n/a", "na", "null", "undefined", "-"].includes(lower) ? "" : id;
  }
  return id ? String(id) : "";
};

// Helper to resolve the actual dealer ID from dealerMapped or dealerId
const getResolvedDealerId = (item: ProductItem): string => {
  // First check dealerMapped array for the actual assigned dealer
  const mappedDealerId = item.dealerMapped?.[0]?.dealerId;
  if (mappedDealerId) return safeDealerId(mappedDealerId);

  // Fallback to item.dealerId
  return safeDealerId(item.dealerId);
};

const getDealerCount = (dealer: any): number => {
  if (!dealer) return 0;
  if (Array.isArray(dealer))
    return dealer.map(safeDealerId).filter(Boolean).length;
  return safeDealerId(dealer) ? 1 : 0;
};

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || "pending";
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    returned: "bg-orange-100 text-orange-800 border-orange-200",
    "inspection in progress": "bg-blue-100 text-blue-800 border-blue-200",
    "inspection completed": "bg-purple-100 text-purple-800 border-purple-200",
    "picklist generated": "bg-orange-100 text-orange-800 border-orange-200",
    packed: "bg-green-100 text-green-800 border-green-200",
  };
  return styles[s] || styles.pending;
};

const getSkuStatus = (item: ProductItem): string => {
  // Packed: If picklist generated and marked as packed (admins don't need inspection)

  if (item.piclistGenerated && item.markAsPacked) {
    return "Packed";
  }
  // Picklist Generated: Only piclistGenerated must be true
  else if (item.piclistGenerated) {
    return "Picklist Generated";
  }
  // Fallback to "Pending"
  else {
    return "Pending";
  }
};

// Unified Product Row Component
const ProductRow = ({
  item,
  resolvedDealerId,
  actions,
  isAuth,
  hasPicklist,
  orderStatus,
  deliveryCharges,
  totalProducts,
}: any) => {
  const [expanded, setExpanded] = useState(false);

  // Step 1: Isolate conditional logic into clear boolean constants
  const hasDealer = !!resolvedDealerId;
  const showAssignDealers = isAuth && !hasDealer;
  const showCreatePicklist = isAuth && hasDealer && !item.piclistGenerated;
  const showMarkPacked = isAuth && item.piclistGenerated && !item.markAsPacked;

  // Prefer item-level tracking status; fallback to overall orderStatus
  const packedSource = (
    item?.tracking_info?.status ||
    orderStatus ||
    ""
  ).toLowerCase();
  const isOrderPacked = React.useMemo(() => {
    if (item?.markAsPacked === true) {
      return true;
    }

    // Fall back to original logic using tracking_info.status or orderStatus
    const status = item?.tracking_info?.status || orderStatus || "";
    return (
      status.toLocaleLowerCase() === "packed" ||
      status.toLocaleLowerCase() === "packed completed" ||
      status.toLocaleLowerCase() === "packedcompleted"
    );
  }, [item?.markAsPacked, item?.tracking_info?.status, orderStatus]);

  // Debug once if orderStatus absent but item shows packed
  useEffect(() => {
    if (!orderStatus && packedSource.includes("packed")) {
      console.warn(
        "[ProductRow] Using item.tracking_info.status for packed state since orderStatus is empty",
        item?.tracking_info?.status
      );
    }
  }, [orderStatus, packedSource, item?.tracking_info?.status]);

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
      {/* Product Name & SKU */}
      <div className="lg:col-span-3">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            {item.productName}
          </span>
          <span className="text-xs text-gray-500">SKU: {item.sku}</span>
          <button
            onClick={() => actions.viewProduct(item)}
            className="lg:hidden text-xs text-blue-600 mt-1 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> View Details
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex justify-between lg:block lg:col-span-1">
        <span className="lg:hidden text-sm text-gray-500 font-medium">
          Qty:
        </span>
        <span className="text-sm text-gray-900">{item.quantity || 1}</span>
      </div>

      {/* Dealers */}
      <div className="flex justify-between items-center lg:justify-start lg:col-span-2 lg:gap-2">
        <span className="lg:hidden text-sm text-gray-500 font-medium">
          Dealers:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm">{getDealerCount(item.dealerId)}</span>
          <button
            onClick={() => actions.viewDealer(resolvedDealerId)}
            className="text-gray-400 hover:text-blue-600"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status & Tracking */}
      <div className="flex flex-col gap-2 lg:col-span-2">
        <div className="flex items-center justify-between lg:justify-start lg:gap-2">
          <span className="lg:hidden text-sm text-gray-500 font-medium">
            Status:
          </span>
          <Badge
            className={`text-xs px-2 py-0.5 ${getStatusBadge(
              getSkuStatus(item)
            )}`}
          >
            {getSkuStatus(item)}
          </Badge>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1 lg:col-span-2">
        <div className="flex justify-between lg:justify-start">
          <span className="lg:hidden text-sm text-gray-500 font-medium">
            Total:
          </span>
          <span className="text-sm font-medium">
            ₹{item.totalPrice?.toLocaleString()}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline w-fit"
        >
          <span
            className={`w-3 h-3 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
          Breakdown
        </button>
        {expanded && (
          <div className="bg-gray-50 p-2 rounded text-xs space-y-1 border border-gray-100">
            <p>GST: {item.gst_percentage}%</p>
            {deliveryCharges > 0 && totalProducts > 0 && (
              <p>Delivery: ₹{(deliveryCharges / totalProducts).toFixed(2)}</p>
            )}
            <p>Total: ₹{item.product_total?.toLocaleString()}</p>
            {item.return_info?.is_returned && (
              <p className="text-orange-600">
                Returned: {item.return_info.return_id}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="lg:col-span-2 flex justify-end">
        {isOrderPacked ? (
          <Badge className="text-xs px-2 py-0.5 bg-green-100 text-green-800 border-green-200">
            Packed Completed
          </Badge>
        ) : (orderStatus === "Cancelled") ? (
          <Badge className="text-xs px-2 py-0.5 bg-red-100 text-red-800 border-red-200">
            Cancelled
          </Badge>
        ) : (
          isAuth && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DynamicButton
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DynamicButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {showAssignDealers && (
                  <DropdownMenuItem
                    onClick={() => actions.trigger("assignDealers", item)}
                  >
                    <UserCheck className="h-4 w-4 mr-2" /> Assign Dealers
                  </DropdownMenuItem>
                )}
                {/* Only show create picklist if order status is not cancelled or canceled */}
                {showCreatePicklist && (
                  <DropdownMenuItem
                    onClick={() => actions.trigger("createPicklist", item)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Create Picklist
                  </DropdownMenuItem>
                )}
                {showMarkPacked && (
                  <DropdownMenuItem
                    onClick={() => actions.trigger("markPacked", item)}
                  >
                    <Package className="h-4 w-4 mr-2" /> Mark Packed
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        )}
      </div>
    </div>
  );
};

// Main Component
export default function AdminProductDetails({
  products,
  onProductEyeClick,
  onDealerEyeClick,
  orderId = "",
  onRefresh,
  deliveryCharges = 0,
}: AdminProductDetailsProps) {
  const { showToast } = GlobalToast();
  const auth = useAppSelector((state) => state.auth.user);
  const isAuthorized = [
    "Super-admin",
    "Fulfillment-Admin",
    "Fullfillment-Admin",
  ].includes(auth?.role);

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);

  const [modalsOpen, setModalsOpen] = useState({
    action: false,
    viewPick: false,
    createPick: false,
  });
  const [picklistSkus, setPicklistSkus] = useState<Set<string>>(new Set());
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [dealerInfoMap, setDealerInfoMap] = useState<
    Record<string, { trade_name: string; legal_name: string }>
  >({});
  const [pincode, setPincode] = useState<string>("");
  // Group products by dealerId -> array of sku + quantity
  const dealerSkuGroups: Record<
    string,
    Array<{ sku: string; quantity: number }>
  > = React.useMemo(() => {
    const map: Record<string, Array<{ sku: string; quantity: number }>> = {};
    (products || []).forEach((p) => {
      const dId = getResolvedDealerId(p);
      // Only include products where picklist hasn't been generated yet
      if (!dId || !p.sku || p.piclistGenerated === true) return;
      if (!map[dId]) map[dId] = [];
      map[dId].push({ sku: p.sku, quantity: p.quantity || 1 });
    });
    return map;
  }, [products]);

  const fetchPicklists = async () => {
    if (!orderId) return;
    try {
      const response = await getPicklistById(orderId);
      if (response.success && response.data) {
        const skus = new Set<string>();
        response.data
          .filter((p: any) => p.linkedOrderId === orderId)
          .forEach((picklist: any) => {
            picklist.skuList?.forEach((skuItem: any) => {
              if (skuItem.sku) {
                skus.add(skuItem.sku);
              }
            });
          });

        setPicklistSkus(skus);
      }
    } catch (error) {
      console.error("Failed to fetch picklists:", error);
    }
  };

  useEffect(() => {
    fetchPicklists();
    if (orderId) {
      getOrderById(orderId)
        .then((res: any) => {
          const status = res?.data?.status || "";
          setOrderStatus(status);
     
          setPincode(res?.data?.customerDetails?.pincode || "");
        })

        .catch(() => {
          setOrderStatus("");
        });
    }
  }, [orderId]);
  const refreshAllData = async () => {
    await Promise.all([
      fetchPicklists(),
      orderId
        ? getOrderById(orderId).then((res: any) => {
            const status = res?.data?.status || "";
            setOrderStatus(status);
          })
        : Promise.resolve(),
    ]);
    onRefresh?.();
  };

  // Fetch dealer info for displaying trade_name in CreatePicklist
  useEffect(() => {
    const ids = Object.keys(dealerSkuGroups || {});
    if (!ids.length) {
      setDealerInfoMap({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await getDealerById(id);
              const dealer = (res as any)?.data;
              return [
                id,
                {
                  trade_name: dealer?.trade_name || "",
                  legal_name: dealer?.legal_name || "",
                },
              ] as const;
            } catch {
              return [id, { trade_name: "", legal_name: "" }] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<
            string,
            { trade_name: string; legal_name: string }
          > = {};
          results.forEach(([id, info]) => {
            map[id] = info;
          });
          setDealerInfoMap(map);
        }
      } catch {
        if (!cancelled) setDealerInfoMap({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dealerSkuGroups]);

  const handleAction = async (type: string, item: ProductItem) => {
    setSelectedItem(item);

    if (type === "createPicklist") {
      setModalsOpen((p) => ({ ...p, createPick: true }));
    } else if (type === "markPacked") {
      setModalsOpen((p) => ({ ...p, viewPick: true }));
    } else {
      setActiveAction(type);
      setModalsOpen((p) => ({ ...p, action: true }));
    }
  };

  const actionHandlers = {
    trigger: handleAction,
    viewProduct: onProductEyeClick,
    viewDealer: onDealerEyeClick,
  };

  // Check if a dealer has any picklist
  const dealerHasPicklist = (dealerId: string): boolean => {
    const skus = dealerSkuGroups[dealerId] || [];
    return skus.some((sku) => picklistSkus.has(sku.sku));
  };

  // Check if at least one item has piclistGenerated === false (for bulk Create Picklist)
  const hasItemsWithoutPicklist =
    products?.some((item) => item.piclistGenerated === false) ?? false;

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Product Details</CardTitle>
              <p className="text-sm text-gray-600">
                Products ordered by the customer
              </p>
            </div>
            <span className="text-sm text-gray-500">
              {products?.length || 0} Products
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Header */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center bg-gray-50 p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
            <div className="lg:col-span-3">Product Name</div>
            <div className="lg:col-span-1">Qty</div>
            <div className="lg:col-span-2">Dealers</div>
            <div className="lg:col-span-2">Status</div>
            <div className="lg:col-span-2">Total</div>
            <div className="lg:col-span-2 text-right">Actions</div>
          </div>

          {/* Product List */}
          <div className="divide-y divide-gray-100">
            {products?.map((item: ProductItem, i: number) => (
              <ProductRow
                key={item._id || i}
                item={item}
                resolvedDealerId={getResolvedDealerId(item)}
                actions={actionHandlers}
                isAuth={isAuthorized}
                hasPicklist={picklistSkus.has(item.sku || "")}
                orderStatus={orderStatus}
                deliveryCharges={deliveryCharges}
                totalProducts={products?.length || 1}
              />
            ))}
            {!products?.length && (
              <div className="p-8 text-center text-gray-500">
                No products found.
              </div>
            )}
          </div>

          {/* Footer Action */}
          {isAuthorized && products && products.length > 0 && (
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-1.5">
              <DynamicButton
                text="View All Picklists"
                variant="outline"
                onClick={() => {
                  const firstDealer = products[0]?.dealerId;
                  const dId = safeDealerId(firstDealer);
                  if (!dId) {
                    showToast("No dealer found for this order", "error");
                    return;
                  }
                  setSelectedItem(products[0]);
                  setModalsOpen((p) => ({ ...p, viewPick: true }));
                }}
              />
              {/* Bulk Create Picklist - only show if at least one item has piclistGenerated === false */}

              {hasItemsWithoutPicklist && orderStatus !== "Cancelled" && (
                <DynamicButton
                  text="Create Picklist"
                  onClick={() => {
                    setSelectedItem(null);
                    setModalsOpen((p) => ({ ...p, createPick: true }));
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {modalsOpen.action && (
        <>
          <AssignDealersPerSkuModal
            open={activeAction === "assignDealers"}
            onOpenChange={async (o: boolean) => {
              setModalsOpen((p) => ({ ...p, action: o }));
              if (!o) {
                setActiveAction(null);
                await refreshAllData(); // Refresh all data
              }
            }}
            orderId={orderId}
            products={(products || []).map((p) => ({
              sku: p.sku,
              dealerId: getResolvedDealerId(p),
              productId: p.productId,
              quantity: p.quantity || 1,
            }))}
            onSuccess={() => refreshAllData()}
            pincode={pincode}
            
          />
          <MarkPackedModal
            open={activeAction === "markPacked"}
            onOpenChange={async (o: boolean) => {
              setModalsOpen((p) => ({ ...p, action: o }));
              if (!o) {
                setActiveAction(null);
                await refreshAllData(); // Refresh all data
              }
            }}
            orderId={orderId}
            dealerId={selectedItem ? getResolvedDealerId(selectedItem) : ""}
            sku={selectedItem?.sku || ""}
            productName={selectedItem?.productName || ""}
            mpn={selectedItem?.manufacturer_part_name || ""}
            onSuccess={() => refreshAllData()}
          />
        </>
      )}

      <CreatePicklist
        open={modalsOpen.createPick}
        onClose={async () => {
          setModalsOpen((p) => ({ ...p, createPick: false }));
          fetchPicklists();
          await refreshAllData();
        }}
        orderId={orderId}
        defaultDealerId={safeDealerId(selectedItem?.dealerId)}
        defaultSkuList={
          selectedItem
            ? [
                {
                  sku: selectedItem.sku || "",
                  quantity: selectedItem.quantity || 1,
                },
              ]
            : []
        }
        groupedDealerSkus={dealerSkuGroups}
        dealerInfoMap={dealerInfoMap}
      />

      <ViewPicklistsModal
        open={modalsOpen.viewPick}
        onOpenChange={async (o: boolean) => {
          setModalsOpen((p) => ({ ...p, viewPick: o }));
          if (!o) {
            await refreshAllData(); // Refresh all data when modal closes
          }
        }}
        dealerId={safeDealerId(selectedItem?.dealerId)}
        orderId={orderId}
      />
    </>
  );
}
