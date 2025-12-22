"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderAnalyticsTab from "./modules/OrderAnalyticsTab";
import PaymentsTab from "./modules/PaymentsTab";
import ProductAnalyticsTab from "./modules/ProductAnalyticsTab";

export default function Reportspage() {
  const [activeTab, setActiveTab] = useState("order-analytics");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive reports and analytics
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order-analytics">Order Analytics</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="product-analytics">Product Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="order-analytics" className="space-y-6">
          <OrderAnalyticsTab />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentsTab />
        </TabsContent>

        <TabsContent value="product-analytics" className="space-y-6">
          <ProductAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
