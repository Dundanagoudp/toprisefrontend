"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import SearchInput from "@/components/common/search/SearchInput"
import StatCard from "./modules/stat-card"
import ManagementCard from "./modules/management-card"
import ChartCard from "./modules/chart-card"
import DonutChart from "./modules/donut-chart"
import CustomLineChart from "./modules/line-chart"


export default function Dashboard() {
  const [searchValue, setSearchValue] = useState("")

  const orderStats = [
    { title: "Total Orders Today", value: "140", color: "#84ebb4" },
    { title: "Orders In Fulfillment", value: "90", color: "#ff5c02" },
    { title: "Orders Picked", value: "20", color: "#ffdb43" },
    { title: "Orders Delivered", value: "20", color: "#1fc16b" },
    { title: "Orders Cancelled", value: "10", color: "#fb3748" },
  ]

  const employeeStats = [
    { label: "Total Employees", value: "57,984+", color: "#3B82F6" },
    { label: "Active", value: "99,999+", color: "#10B981" },
    { label: "Suspend", value: "57,984+", color: "#F59E0B" },
    { label: "Deactivated", value: "57,984+", color: "#EF4444" },
  ]

  const dealerStats = [
    { label: "Top Dealer", value: "500", color: "#3B82F6" },
    { label: "Active", value: "1000", color: "#10B981" },
    { label: "Suspend", value: "100", color: "#F59E0B" },
    { label: "Deactivated", value: "50", color: "#EF4444" },
  ]

  // Updated product data colors to match screenshot
  const productData = [
    { name: "APPROVED", value: 30, color: "#6366f1" },
    { name: "PENDING", value: 25, color: "#f97316" },
    { name: "CREATED", value: 25, color: "#10b981" },
    { name: "REJECTED", value: 20, color: "#ef4444" },
  ]

  // Updated chart data to create more realistic curves
  const chartData = [
    { name: "1", value1: 150, value2: 180 },
    { name: "5", value1: 165, value2: 175 },
    { name: "10", value1: 140, value2: 220 },
    { name: "15", value1: 240, value2: 200 },
    { name: "20", value1: 220, value2: 180 },
    { name: "25", value1: 200, value2: 160 },
    { name: "30", value1: 210, value2: 170 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onClear={() => setSearchValue("")}
            placeholder="Search Spare parts"
          />

          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
              Filters
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
              <Calendar className="h-4 w-4" />
              Date
            </Button>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {orderStats.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} color={stat.color} />
          ))}
        </div>

        {/* Management + Product Grid: 2 rows x 3 columns, donut spans rows */}
        <div className="grid grid-cols-1 lg:grid-cols-[50%_20%_28%] gap-4">
          {/* Row 1, Col 1 */}
         <div className="space-y-4 ">
            <ManagementCard title="Employee Management" stats={employeeStats} className="p-4 rounded-[15px]" />
            <ManagementCard title="Dealer Management" stats={dealerStats} className="p-4 rounded-[15px]" />
          </div>
          {/* Middle Column - Customer Management and Return Rate */}
          <div className="space-y-4">
            <ChartCard
              title="Customer Management"
              value="2917"
              change="7.2%"
              className="rounded-[15px] h-40"
              changeType="positive"
              // contentClassName="h-8"
            >
              <div className="w-full  h-full flex items-center justify-center">
                <svg viewBox="0 0 200 80" className="w-full h-full mb-15">
                  <path d="M 20,50 Q 60,30 100,35 T 180,25" fill="none" stroke="#10b981" strokeWidth="2" />
                  <circle cx="180" cy="25" r="3" fill="#10b981" />
                </svg>
              </div>
            </ChartCard>
                               <ChartCard
              title="Customer Management"
              value="2917"
              change="7.2%"
              className="rounded-[15px] h-40"
              changeType="positive"
              // contentClassName="h-8"
              
            >
              <div className="w-full  h-full flex items-center justify-center">
                <svg viewBox="0 0 200 80" className="w-full h-full mb-15">
                  <path d="M 20,50 Q 60,30 100,35 T 180,25" fill="none" stroke="#10b981" strokeWidth="2" />
                  <circle cx="180" cy="25" r="3" fill="#10b981" />
                </svg>
              </div>
            </ChartCard>
     
          </div>
          {/* Col 3 spans both rows */}
          <ChartCard title="Product Management" className="lg:row-span-2" contentClassName="h-50  ">
            <DonutChart data={productData} centerValue="3986" centerLabel="PRODUCTS" />
          </ChartCard>

          {/* Row 2, Col 1 */}

        </div>

        {/* Bottom Row - Order Summary Widget */}
        <div className=" grid grid-cols-1 gap-4">
          <ChartCard
            title="Order Summary Widget"
            value="123,456,789"
            change="+20% Than last week"
            changeType="positive"
            className="w-[72%] rounded-[15px] p-2"
            contentClassName="h-56"
            hideActions
            compactHeader
          >
            <CustomLineChart data={chartData} />
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
