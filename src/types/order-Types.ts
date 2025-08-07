export interface orderResponse {
    success: boolean;
    message: string;
    data: Order[];
}
interface Order {
  _id: string;
  orderId: string;
  orderDate: string; 
  deliveryCharges: number;
  GST: number;
  orderType: string;
  orderSource: string;
  skus: Array<{
    sku: string;
    quantity: number;
    productId: string;
    productName: string;
    _id: string;
  }>;
  order_Amount: number;
  customerDetails: {
    userId: string;
    name: string;
    phone: string;
    address: string;
    pincode: string;
    email: string;
    userInfo: null | any; 
  };
  paymentType: string;
  status: string;
  timestamps: {
    createdAt: string; 
  };
  dealerMapping: any[]; 
  auditLogs: any[];     
  createdAt: string;    
  updatedAt: string;    
  __v: number;
}