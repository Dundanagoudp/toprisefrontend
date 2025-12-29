"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DynamicButton from "@/components/common/button/button";
import { getUserOrders } from "@/service/user/orderService";
import { useAppSelector } from "@/store/hooks";

interface OrderConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
}

export default function OrderConfirmationDialog({
  open,
  onClose,
  orderId
}: OrderConfirmationDialogProps) {
  const router = useRouter();
  const userId = useAppSelector((state) => state.auth.user?._id);
  const [recentOrderId, setRecentOrderId] = useState<string | null>(null);

  // Close dialog after 5 seconds automatically (optional)
  // useEffect(() => {
  //   if (open) {
  //     const timer = setTimeout(() => {
  //       onClose();
  //     }, 5000); // Auto-close after 5 seconds
  //     return () => clearTimeout(timer);
  //   }
  // }, [open, onClose]);

  // Fetch recent order ID when orderId is not provided
  useEffect(() => {
    if (open && !orderId && userId) {
      const fetchRecentOrder = async () => {
        try {
          const response = await getUserOrders(userId);
          if (response.success && response.data && response.data.length > 0) {
            setRecentOrderId(response.data[0].orderId);
          }
        } catch (error) {
          console.error('Failed to fetch recent order:', error);
        }
      };
      fetchRecentOrder();
    }
  }, [open, orderId, userId]);

  const handleViewOrders = async () => {
    if (!userId) {
      router.push('/profile?tab=orders');
      onClose();
      return;
    }

    try {
      const response = await getUserOrders(userId);
      if (response.success && response.data && response.data.length > 0) {
        // Navigate to the first order
        const firstOrder = response.data[0];
        router.push(`/shop/order/${firstOrder._id}`);
      } else {
        // No orders, go to orders tab
        router.push('/profile?tab=orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback to orders tab
      router.push('/profile?tab=orders');
    }
    onClose();
  };
    const handleViewOrderDetails = () => {
    if (orderId) {
      router.push(`/shop/order/${orderId}`);
      onClose();
    }
  };

  return (

    <Dialog open={open} onOpenChange={(open) => { if (!open) { router.push('/'); } }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Order Confirmed</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <div className="mx-auto my-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Thank you for your order!
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Your order has been placed successfully.
          </p>
          {(orderId || recentOrderId) && (
            <p className="text-sm text-gray-500 mb-4">
              Order ID: <span className="font-medium">{orderId || recentOrderId || "N/A"}</span>
            </p>
          )}
          <p className="text-sm text-gray-500">
            You will receive an email confirmation shortly.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          {orderId ?(
            <DynamicButton 
              variant="outline" 
              onClick={handleViewOrderDetails}
            >
              View Order Details
            </DynamicButton>
          ) : (
            <DynamicButton 
              variant="outline" 
              onClick={handleViewOrders}
            >
              View Orders
            </DynamicButton>
          )}

          <DynamicButton onClick={() => {
            onClose();
            router.push('/');
          }}>
            Continue Shopping
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
