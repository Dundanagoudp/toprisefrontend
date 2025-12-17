import AdminProductDetails from './AdminProductDetails';
import StaffProductDetails from './StaffProductDetails';
import { useAppSelector } from '@/store/hooks';

interface ProductDetailsForOrderProps {
  products: any[] | null | undefined;
  onProductEyeClick: (product: any) => void;
  onDealerEyeClick: (dealerId: string) => void;
  orderId?: string;
  onRefresh?: () => void;
  deliveryCharges?: number;
}

export default function ProductDetailsForOrder(props: ProductDetailsForOrderProps) {
  const auth = useAppSelector((state) => state.auth.user);
  const isAdmin = ["Super-admin", "Fulfillment-Admin", "Fullfillment-Admin"].includes(auth?.role);

  return isAdmin ? <AdminProductDetails {...props} /> : <StaffProductDetails {...props} />;
}
