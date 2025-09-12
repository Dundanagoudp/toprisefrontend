import Ordertable from '@/components/dealer-dashboard/ordermanagement/Order-table'
import DealerOrderStats from '@/components/dealer-dashboard/order-management/DealerOrderStats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'

export default function page() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">Order Statistics</TabsTrigger>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Dashboard</h1>
            <p className="text-gray-600">Overview of your order statistics and picklist status</p>
          </div>
          <DealerOrderStats />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">Manage and track your orders</p>
          </div>
          <Ordertable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
