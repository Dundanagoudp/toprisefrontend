'use client';
import { paymentCreation } from "@/service/user/payment-service";
import {useRazorpay} from "react-razorpay";



interface options {
    key: string;
    amount: any;
    currency: string;
    name: string;
    description: string;
    order_id: any;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    notes: {
        address: string;
    };
    theme: {
        color: string;
    };
}
export default function PaymentButton() {
  
  const { Razorpay } = useRazorpay();
  
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;



  return <button onClick={handlePayment}>Pay with Razorpay</button>;
}