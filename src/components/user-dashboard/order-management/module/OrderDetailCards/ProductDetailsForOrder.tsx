import AdminProductDetails from './AdminProductDetails';
import StaffProductDetails from './StaffProductDetails';
import { useAppSelector } from '@/store/hooks';

interface ProductDetailsForOrderProps {
  products: any[] | null | undefined;
  onProductEyeClick: (product: any) => void;
  onDealerEyeClick: (dealerId: string) => void;
  picklistId?: string;
  onRefresh?: () => void;
  deliveryCharges?: number;
}

export default function ProductDetailsForOrder({
  products,
  onProductEyeClick,
  onDealerEyeClick,
  picklistId,
  onRefresh,
  deliveryCharges,
}: ProductDetailsForOrderProps) {
  const auth = useAppSelector((state) => state.auth.user);
  const isAdmin = ["Super-admin", "Fulfillment-Admin", "Fullfillment-Admin"].includes(auth?.role);

  return isAdmin ? (
    <AdminProductDetails
      products={products}
      onProductEyeClick={onProductEyeClick}
      onDealerEyeClick={onDealerEyeClick}
      picklistId={picklistId}
      onRefresh={onRefresh}
      deliveryCharges={deliveryCharges}
    />
  ) : (
    <StaffProductDetails
      products={products}
      onProductEyeClick={onProductEyeClick}
      onDealerEyeClick={onDealerEyeClick}
      picklistId={picklistId}
      onRefresh={onRefresh}
      deliveryCharges={deliveryCharges}
    />
  );
}
