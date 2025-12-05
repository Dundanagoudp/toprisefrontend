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
import {
  ChevronRight,
  Edit,
  Package,
  Truck,
  UserCheck,
  Eye,
  MoreHorizontal,
  ClipboardCheck,
  CircleX,
} from "lucide-react";
import { DynamicButton } from "@/components/common/button";
import CreatePicklist from "./CreatePicklist";
import { useToast as GlobalToast } from "@/components/ui/toast";
import AssignDealersPerSkuModal from "../order-popus/AssignDealersPerSkuModal";
import MarkPackedModal from "../order-popus/MarkPackedModal";
import ViewPicklistsModal from "../order-popus/ViewPicklistsModal";
import { useAppSelector } from "@/store/hooks";
import { updateOrderStatusByDealer } from "@/service/dealerOrder-services";
import { getDealerById } from "@/service/dealerServices";
import { getCookie, getAuthToken } from "@/utils/auth";
import {
  getAllPicklists,
  getPicklistById,
  getPicklistByOrderId,
  inspectPicklist,
  stopPicklistInspection,
} from "@/service/pickup-service";
import {
  fetchEmployeeByUserId,
  fetchPicklistsByEmployee,
  getOrderById,
} from "@/service/order-service";
import OrdersDashboard from "../../orders-dashboard";
import { s } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

interface ProductItem {
  _id?: string;
  productId?: string;
  productName: string;
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
}

interface ProductDetailsForOrderProps {
  products: ProductItem[] | null | undefined;
  onProductEyeClick: (product: ProductItem) => void;
  onDealerEyeClick: (dealerId: string) => void;
  orderId?: string;
  onRefresh?: () => void;
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
  };
  return styles[s] || styles.pending;
};

// Unified Product Row Component
const ProductRow = ({
  item,
  actions,
  isAuth,
  isStaff,
  hasPicklist,
  scanStatus,
  orderStatus,
}: any) => {
  const [expanded, setExpanded] = useState(false);
  // hide isInspectionInProgress flag when scanStatus is "In Progress" and "Completed"
  const isInspectionInProgress =
    scanStatus === "In Progress" || scanStatus === "Completed";
  //hide isStopInspection flag when scanStatus is "In Progress" and "Completed"
  const isStopInspection =
    scanStatus === "In Progress" || scanStatus === "Completed";
  // Prefer item-level tracking status; fallback to overall orderStatus
  const packedSource = (
    item?.tracking_info?.status || orderStatus || ""
  ).toLowerCase();
  const isOrderPacked =
    packedSource === "packed" || packedSource === "packed completed";

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
            onClick={() => actions.viewDealer(safeDealerId(item.dealerId))}
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
              item.tracking_info?.status
            )}`}
          >
            {item.tracking_info?.status || "Pending"}
          </Badge>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline w-fit"
        >
          <ChevronRight
            className={`w-3 h-3 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />{" "}
          Tracking Info
        </button>

        {expanded && (
          <div className="bg-gray-50 p-2 rounded text-xs space-y-1 border border-gray-100 mt-1">
            <p>
              <span className="font-semibold">SKU:</span> {item.sku}
            </p>
            <p>
              <span className="font-semibold">GST:</span> {item.gst_percentage}%
            </p>
            <p>
              <span className="font-semibold">Total:</span> ₹
              {item.product_total?.toLocaleString()}
            </p>
            {item.return_info?.is_returned && (
              <p className="text-orange-600">
                Returned: {item.return_info.return_id}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex justify-between lg:block lg:col-span-2">
        <span className="lg:hidden text-sm text-gray-500 font-medium">
          Total:
        </span>
        <span className="text-sm font-medium">
          ₹{item.totalPrice?.toLocaleString()}
        </span>
      </div>

      {/* Actions */}
      <div className="lg:col-span-2 flex justify-end">
        {isOrderPacked ? (
          <Badge className="text-xs px-2 py-0.5 bg-green-100 text-green-800 border-green-200">Packed Completed</Badge>
        ) : (
          (isAuth || isStaff) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DynamicButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </DynamicButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuth && !safeDealerId(item.dealerId) && (
                  <DropdownMenuItem onClick={() => actions.trigger("assignDealers", item)}>
                    <UserCheck className="h-4 w-4 mr-2" /> Assign Dealers
                  </DropdownMenuItem>
                )}
                {isAuth && safeDealerId(item.dealerId) && !hasPicklist && (
                  <DropdownMenuItem onClick={() => actions.trigger("createPicklist", item)}>
                    <Edit className="h-4 w-4 mr-2" /> Create Picklist
                  </DropdownMenuItem>
                )}
                {isAuth && scanStatus !== "Completed" && (
                  <DropdownMenuItem onClick={() => actions.trigger("markPacked", item)}>
                    <Package className="h-4 w-4 mr-2" /> Mark Packed
                  </DropdownMenuItem>
                )}
                {isStaff && !isInspectionInProgress && (
                  <DropdownMenuItem onClick={() => actions.trigger("inspect", item)}>
                    <ClipboardCheck className="h-4 w-4 mr-2" /> Inspect Picklist
                  </DropdownMenuItem>
                )}
                {isStaff && isStopInspection && scanStatus !== "Completed" && (
                  <DropdownMenuItem onClick={() => actions.trigger("stopInspect", item)}>
                    <CircleX className="h-4 w-4 mr-2" /> Stop Inspection
                  </DropdownMenuItem>
                )}
                {isStaff && (
                  <DropdownMenuItem onClick={() => actions.trigger("markPacked", item)}>
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
export default function ProductDetailsForOrder({
  products,
  onProductEyeClick,
  onDealerEyeClick,
  orderId = "",
  onRefresh,
}: ProductDetailsForOrderProps) {
  const { showToast } = GlobalToast();
  const auth = useAppSelector((state) => state.auth.user);
  const isAuthorized = [
    "Super-admin",
    "Fulfillment-Admin",
    "Fullfillment-Admin",
  ].includes(auth?.role);
  const isFulfillmentStaff = auth?.role === "Fulfillment-Staff";

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  
  const [modalsOpen, setModalsOpen] = useState({
    action: false,
    viewPick: false,
    createPick: false,
  });
  const [picklistSkus, setPicklistSkus] = useState<Set<string>>(new Set());
  const [picklistScanStatuses, setPicklistScanStatuses] = useState<
    Map<string, string>
  >(new Map());
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [dealerInfoMap, setDealerInfoMap] = useState<Record<string, { trade_name: string; legal_name: string }>>({});

  // Group products by dealerId -> array of sku + quantity
  const dealerSkuGroups: Record<string, Array<{ sku: string; quantity: number }>> = React.useMemo(() => {
    const map: Record<string, Array<{ sku: string; quantity: number }>> = {};
    (products || []).forEach((p) => {
      const dId = safeDealerId(p.dealerId);
      if (!dId || !p.sku) return;
      if (!map[dId]) map[dId] = [];
      map[dId].push({ sku: p.sku, quantity: p.quantity || 1 });
    });
    return map;
  }, [products]);

  // get employee details
  const fetchEmployeeDetails = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userIdFromToken = payload.id || payload.userId;
      setUserId(userIdFromToken);

      const empRes = await fetchEmployeeByUserId(userIdFromToken);
      const empId = empRes?.employee?._id;

      if (empId) {
        setEmployeeId(empId);
      }
    } catch (error) {
      console.error("Failed to fetch employee details:", error);
    }
  };

  const fetchPicklists = async () => {
    if (!orderId) return;
    try {
      const response = await getPicklistById(orderId);
      if (response.success && response.data) {
        const skus = new Set<string>();
        const scanStatuses = new Map<string, string>();

        response.data
          .filter((p: any) => p.linkedOrderId === orderId)
          .forEach((picklist: any) => {
            picklist.skuList?.forEach((skuItem: any) => {
              if (skuItem.sku) {
                skus.add(skuItem.sku);
                // Store the picklist-level scanStatus for each SKU
                scanStatuses.set(skuItem.sku, picklist.scanStatus);
              }
            });
          });

        setPicklistSkus(skus);
        setPicklistScanStatuses(scanStatuses);
      }
    } catch (error) {
      console.error("Failed to fetch picklists:", error);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
    fetchPicklists();
    if (orderId) {
      getOrderById(orderId)
        .then((res) => {
          const status = res?.data?.[0]?.status || "";
          setOrderStatus(status);
        })
        
        .catch(() => {
          setOrderStatus("");
        });
    }
  }, [orderId]);

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
              return [id, { trade_name: dealer?.trade_name || "", legal_name: dealer?.legal_name || "" }] as const;
            } catch {
              return [id, { trade_name: "", legal_name: "" }] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, { trade_name: string; legal_name: string }> = {};
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

    if (type === "markShipped") {
      try {
        const weightInput = window.prompt(
          "Enter total weight (kg) for shipment:",
          ""
        );
        if (weightInput === null) return;
        const totalWeightKg = parseFloat(weightInput);
        if (Number.isNaN(totalWeightKg) || totalWeightKg <= 0) {
          showToast("Please enter a valid weight in kg", "error");
          return;
        }

        let dealerIdResolved = safeDealerId(item.dealerId);
        if (!dealerIdResolved) {
          dealerIdResolved = getCookie("dealerId") || "";
          if (!dealerIdResolved) {
            const token = getAuthToken();
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                dealerIdResolved = payload.dealerId || payload.id || "";
              } catch {}
            }
          }
        }

        if (!orderId || !dealerIdResolved) {
          showToast("Missing order ID or dealer ID", "error");
          return;
        }

        await updateOrderStatusByDealer(
          String(dealerIdResolved),
          String(orderId),
          totalWeightKg
        );
        showToast("Order marked as shipped", "success");
        onRefresh?.();
      } catch (e) {
        showToast("Failed to mark as shipped", "error");
      }
      return;
    }

    if (type === "inspect") {
      try {
        if (!employeeId) {
          showToast("Employee ID not found", "error");
          return;
        }

        const picklistRes = await getPicklistByOrderId(orderId, employeeId);

        const picklistId = picklistRes?.data?.picklists?.[0]?.picklistId;
        if (!picklistId) {
          showToast("No picklist found", "error");
          return;
        }

        const result = await inspectPicklist(picklistId, employeeId, {
          sku: item.sku,
        });
        if (result.success) {
          showToast("Picklist inspection started", "success");
          onRefresh?.();
          // window.location.href = `/user/dashboard/picklist?picklistId=${picklistId}`;
        }
      } catch (error) {
        console.error("Inspect picklist error:", error);
        showToast("Failed to start inspection", "error");
      }
      return;
    }
    // top stop inspection
    if (type === "stopInspect") {
      try {
        if (!employeeId) {
          showToast("Employee ID not found", "error");
          return;
        }

        const picklistRes = await getPicklistByOrderId(orderId, employeeId);
        const picklistId = picklistRes?.data?.picklists?.[0]?.picklistId;
        if (!picklistId) {
          showToast("No picklist found", "error");
          return;
        }
        const stopInspect = await stopPicklistInspection(
          picklistId,
          employeeId,
          { sku: item.sku }
        );
        if (stopInspect.success) {
          showToast("Picklist inspection stopped", "success");
          onRefresh?.();
          // window.location.href = `/user/dashboard/picklist?picklistId=${picklistId}`;
        }
      } catch (error) {
        console.error("Stop inspect picklist error:", error);
        showToast("Failed to stop inspection", "error");
      }
      return;
    }

    if (type === "createPicklist") {
      setModalsOpen((p) => ({ ...p, createPick: true }));
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

  // Determine if all product picklist scan statuses are Completed
  const allScanCompleted = products?.length
    ? products.every(
        (p) => picklistScanStatuses.get(p.sku || "") === "Completed"
      )
    : false;

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
                actions={actionHandlers}
                isAuth={isAuthorized}
                isStaff={isFulfillmentStaff}
                hasPicklist={picklistSkus.has(item.sku || "")}
                scanStatus={picklistScanStatuses.get(item.sku || "")}
                orderStatus={orderStatus}
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
              {/* hide is scan status is "Completed" */}
              {!allScanCompleted && (
                <DynamicButton
                  text="Create Picklist"
                  onClick={() => {
                    setSelectedItem(null); // no pre-selected item
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
            onOpenChange={(o: boolean) => {
              setModalsOpen((p) => ({ ...p, action: o }));
              if (!o) {
                setActiveAction(null);
                onRefresh?.();
              }
            }}
            orderId={orderId}
            products={(products || []).map((p) => ({
              sku: p.sku,
              dealerId: p.dealerId,
              productId: p.productId,
            }))}
            onSuccess={() => onRefresh?.()}
          />
          <MarkPackedModal
            open={activeAction === "markPacked"}
            onOpenChange={(o: boolean) => {
              setModalsOpen((p) => ({ ...p, action: o }));
              if (!o) {
                setActiveAction(null);
                onRefresh?.();
              }
            }}
            orderId={orderId}
            dealerId={safeDealerId(selectedItem?.dealerId)}
            sku={selectedItem?.sku || ""}
            onSuccess={() => onRefresh?.()}
          />
        </>
      )}

      <CreatePicklist
        open={modalsOpen.createPick}
        onClose={() => {
          setModalsOpen((p) => ({ ...p, createPick: false }));
          fetchPicklists();
          onRefresh?.();
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
        onOpenChange={(o: boolean) =>
          setModalsOpen((p) => ({ ...p, viewPick: o }))
        }
        dealerId={safeDealerId(selectedItem?.dealerId)}
        orderId={orderId}
      />
    </>
  );
}
