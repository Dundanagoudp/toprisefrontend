"use client";

import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/common/search/SearchInput";
import StatCard from "./modules/stat-card";
import ManagementCard from "./modules/management-card";
import ChartCard from "./modules/chart-card";
import DonutChart from "./modules/donut-chart";
import CustomLineChart from "./modules/line-chart";
import UserCountsRadial from "./modules/user-counts-radial";
import UserCountsBar from "./modules/user-counts-bar";
import {
  fetchOrderStats,
  fetchProductStats,
  fetchEmployeeStats,
  fetchDealerStats,
  fetchOrderSummary,
  fetchUserCounts,
} from "@/service/dashboardServices";
import { getOrderStats, getAllOrders } from "@/service/order-service";
import {
  ProductStatsResponse,
  EmployeeStatsResponse,
  DealerStatsResponse,
  UserCountsResponse,
} from "@/types/dashboard-Types";
import {
  OrderStatsResponse,
  OrderSummaryResponse,
  OrderSummaryPeriod,
} from "@/types/dashboard-Types";
import { Button } from "@/components/ui/button";
import DashboardShimmer from "./modules/DashboardShimmer";
import { Calendar } from "lucide-react";

export default function Dashboard() {
  const [searchValue, setSearchValue] = useState("");

  // Set default date range to last two weeks from present day
  const getDefaultDateRange = () => {
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);

    return {
      start: twoWeeksAgo.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    };
  };

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultRange.start);
  const [endDate, setEndDate] = useState<string>(defaultRange.end);

  // Date validation functions
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    // If the new start date is after the current end date, update end date
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    // If the new end date is before the current start date, update start date
    if (newEndDate < startDate) {
      setStartDate(newEndDate);
    }
  };

  const [stats, setStats] = useState<OrderStatsResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [productStats, setProductStats] = useState<
    ProductStatsResponse["data"] | null
  >(null);
  const [employeeSummary, setEmployeeSummary] = useState<
    EmployeeStatsResponse["data"]["summary"] | null
  >(null);
  const [dealerSummary, setDealerSummary] = useState<
    DealerStatsResponse["data"]["summary"] | null
  >(null);
  const [orderSummary, setOrderSummary] = useState<
    OrderSummaryResponse["data"] | null
  >(null);
  const [summaryPeriod, setSummaryPeriod] =
    useState<OrderSummaryPeriod>("week");
  const [userCounts, setUserCounts] = useState<
    UserCountsResponse["data"] | null
  >(null);
  const [orderApiStats, setOrderApiStats] = useState<any>(null);
  const [allOrders, setAllOrders] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const [
          orderRes,
          productRes,
          employeeRes,
          dealerRes,
          summaryRes,
          userCountsRes,
          orderApiRes,
          allOrdersRes,
        ] = await Promise.all([
          fetchOrderStats({ startDate, endDate }),
          fetchProductStats(),
          fetchEmployeeStats(),
          fetchDealerStats(),
          fetchOrderSummary(summaryPeriod),
          fetchUserCounts(),
          getOrderStats(),
          getAllOrders(),
        ]);
        // console.log("Fetched dashboard data",summaryRe);
        if (isMounted) {
          console.log("Dashboard Data Loaded:", {
            orderRes: orderRes,
            summaryRes: summaryRes,
            orderApiRes: orderApiRes,
            allOrdersRes: allOrdersRes,
          });

          setStats(orderRes.data);
          setProductStats(productRes.data);
          setEmployeeSummary(employeeRes.data.summary);
          setDealerSummary(dealerRes.data.summary);
          setOrderSummary(summaryRes.data);
          setUserCounts(userCountsRes.data);
          setOrderApiStats(orderApiRes.data);
          setAllOrders(allOrdersRes.data);
        }
      } catch (e) {
        console.error("Dashboard data loading error:", e);
        // fail silently for now; could add toast
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, summaryPeriod]);

  const orderStats = useMemo(() => {
    if (!stats) {
      return [
        { title: "Total Orders Today", value: "-", color: "#84ebb4" },
        { title: "Orders In Fulfillment", value: "-", color: "#ff5c02" },
        { title: "Orders Picked", value: "-", color: "#ffdb43" },
        { title: "Total Orders", value: "-", color: "#3B82F6" },
        { title: "Orders Delivered", value: "-", color: "#1fc16b" },
        { title: "Orders Cancelled", value: "-", color: "#fb3748" },
      ];
    }
    return [
      { title: "Total Orders", value: stats.totalOrders, color: "#3B82F6" },
      {
        title: "Total Orders Today",
        value: stats.todaysOrders,
        color: "#84ebb4",
      },
      {
        title: "Orders In Fulfillment",
        value: stats.statusCounts.Assigned,
        color: "#ff5c02",
      },
      {
        title: "Orders Picked",
        value: stats.statusCounts.Confirmed,
        color: "#ffdb43",
      },
      {
        title: "Orders Delivered",
        value: stats.statusCounts.Delivered,
        color: "#1fc16b",
      },
      {
        title: "Orders Cancelled",
        value: stats.statusCounts.Cancelled,
        color: "#fb3748",
      },
    ];
  }, [stats]);

  const employeeStats = useMemo(() => {
    if (!employeeSummary || !userCounts) {
      return [
        { label: "Total Employees", value: "-", color: "#3B82F6" },
        { label: "Recently Active", value: "-", color: "#10B981" },
        { label: "Fulfilment Team", value: "-", color: "#F59E0B" },
        { label: "Inventory Team", value: "-", color: "#EF4444" },
      ];
    }
    const fulfilmentTeam =
      (userCounts.FulfillmentAdmins || 0) + (userCounts.FulfillmentStaffs || 0);
    const inventoryTeam =
      (userCounts.InventoryAdmins || 0) + (userCounts.InventoryStaffs || 0);

    return [
      {
        label: "Total Employees",
        value: String(employeeSummary.totalEmployees),
        color: "#3B82F6",
      },
      {
        label: "Recently Active",
        value: String(employeeSummary.recentlyActiveEmployees),
        color: "#10B981",
      },
      {
        label: "Fulfilment Team",
        value: String(fulfilmentTeam),
        color: "#F59E0B",
      },
      {
        label: "Inventory Team",
        value: String(inventoryTeam),
        color: "#EF4444",
      },
    ];
  }, [employeeSummary, userCounts]);

  const dealerStats = useMemo(() => {
    if (!dealerSummary) {
      return [
        { label: "Total Dealers", value: "-", color: "#3B82F6" },
        { label: "Active", value: "-", color: "#10B981" },
        { label: "Upload Access", value: "-", color: "#F59E0B" },
        { label: "Deactivated", value: "-", color: "#EF4444" },
      ];
    }
    return [
      {
        label: "Total Dealers",
        value: String(dealerSummary.totalDealers),
        color: "#3B82F6",
      },
      {
        label: "Active",
        value: String(dealerSummary.activeDealers),
        color: "#10B981",
      },
      {
        label: "Upload Access",
        value: String(dealerSummary.dealersWithUploadAccess),
        color: "#F59E0B",
      },
      {
        label: "Deactivated",
        value: String(dealerSummary.deactivatedDealers),
        color: "#EF4444",
      },
    ];
  }, [dealerSummary]);

  const productData = useMemo(() => {
    if (!productStats) {
      return [
        { name: "APPROVED", value: 0, color: "#6366f1" },
        { name: "PENDING", value: 0, color: "#f97316" },
        { name: "CREATED", value: 0, color: "#10b981" },
        { name: "REJECTED", value: 0, color: "#ef4444" },
      ];
    }
    return [
      { name: "APPROVED", value: productStats.approved, color: "#6366f1" },
      { name: "PENDING", value: productStats.pending, color: "#f97316" },
      { name: "CREATED", value: productStats.created, color: "#10b981" },
      { name: "REJECTED", value: productStats.rejected, color: "#ef4444" },
    ];
  }, [productStats]);

  // Process all orders data to create time series data
  const processAllOrdersData = useMemo(() => {
    if (!allOrders || !Array.isArray(allOrders)) {
      return null;
    }

    // Group orders by date
    const ordersByDate: {
      [key: string]: { count: number; totalAmount: number };
    } = {};

    allOrders.forEach((order: any) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0]; // Get YYYY-MM-DD format

      if (!ordersByDate[orderDate]) {
        ordersByDate[orderDate] = { count: 0, totalAmount: 0 };
      }

      ordersByDate[orderDate].count += 1;
      ordersByDate[orderDate].totalAmount += order.order_Amount || 0;
    });

    // Convert to array and sort by date
    const sortedDates = Object.keys(ordersByDate).sort();

    // Get the last 7 days or available data
    const recentDates = sortedDates.slice(-7);

    return recentDates.map((date) => ({
      date,
      count: ordersByDate[date].count,
      totalAmount: ordersByDate[date].totalAmount,
    }));
  }, [allOrders]);

  // Map API timeSeriesData to chart lines: value1 = currentOrders, value2 = previousOrders, value3 = allOrdersData
  const chartData = useMemo(() => {
    console.log("Chart Data Debug:", {
      orderSummary: orderSummary,
      processAllOrdersData: processAllOrdersData,
      orderApiStats: orderApiStats,
    });

    // If we have all orders data, create chart data from it
    if (processAllOrdersData && processAllOrdersData.length > 0) {
      const allOrdersChartData = processAllOrdersData.map((item, index) => ({
        name: `Day ${index + 1}`,
        value1: item.count,
        value2: 0, // No previous data for all orders
        value3: item.count,
        amount1: item.totalAmount,
        amount2: 0,
        amount3: item.totalAmount,
      }));
      console.log("Using all orders data:", allOrdersChartData);
      return allOrdersChartData;
    }

    // If we have order summary data, use it
    if (
      orderSummary &&
      orderSummary.timeSeriesData &&
      orderSummary.timeSeriesData.length > 0
    ) {
      const baseData = orderSummary.timeSeriesData.map((p) => ({
        name: p.label,
        value1: p.currentOrders,
        value2: p.previousOrders,
        amount1: p.currentAmount,
        amount2: p.previousAmount,
      }));

      // Add order API stats as third line if available
      if (orderApiStats) {
        const totalApiOrders = orderApiStats.totalOrders || 0;
        const avgApiOrders = totalApiOrders / baseData.length;

        return baseData.map((item, index) => ({
          ...item,
          value3: Math.round(
            avgApiOrders +
              (index % 2 === 0 ? avgApiOrders * 0.1 : -avgApiOrders * 0.1)
          ),
          amount3: orderApiStats.statusCounts
            ? Object.values(orderApiStats.statusCounts).reduce(
                (sum: number, count: any) => sum + (count || 0),
                0
              ) * 100
            : 0,
        }));
      }

      console.log("Using order summary data:", baseData);
      return baseData;
    }

    // Fallback: Create sample data if no data is available
    const fallbackData = [
      {
        name: "Mon",
        value1: 0,
        value2: 0,
        value3: 0,
        amount1: 0,
        amount2: 0,
        amount3: 0,
      },
      {
        name: "Tue",
        value1: 0,
        value2: 0,
        value3: 0,
        amount1: 0,
        amount2: 0,
        amount3: 0,
      },
      {
        name: "Wed",
        value1: 0,
        value2: 0,
        value3: 0,
        amount1: 0,
        amount2: 0,
        amount3: 0,
      },
      {
        name: "Thu",
        value1: 0,
        value2: 0,
        value3: 0,
        amount1: 0,
        amount2: 0,
        amount3: 0,
      },
      {
        name: "Fri",
        value1: 0,
        value2: 0,
        value3: 0,
        amount1: 0,
        amount2: 0,
        amount3: 0,
      },
      {
        name: "Sat",
        value1: 0,
        value2: 0,
        value3: 0,
        amount1: 0,
        amount2: 0,
        amount3: 0,
      },
      {
        name: "Sun",
        value1: 0,
        value2: 0,
        value3: 0,
        amount1: 0,
        amount2: 0,
        amount3: 0,
      },
    ];
    console.log("Using fallback data:", fallbackData);
    return fallbackData;
  }, [orderSummary, processAllOrdersData, orderApiStats]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto space-y-6">
        {loading ? (
          <DashboardShimmer />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              {/* <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onClear={() => setSearchValue("")}
            placeholder="Search Spare parts"
            className="w-full sm:max-w-md"
          /> */}

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <div className="flex items-center gap-2 h-10 rounded-lg bg-white border border-neutral-200 px-4 py-0 shadow-sm">
                    <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                    <input
                      type="date"
                      className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-neutral-700 placeholder:text-neutral-500 h-10 p-0 flex-1 outline-none text-sm"
                      value={startDate}
                      max={endDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="relative w-full sm:w-auto">
                  <div className="flex items-center gap-2 h-10 rounded-lg bg-white border border-neutral-200 px-4 py-0 shadow-sm">
                    <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                    <input
                      type="date"
                      className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-neutral-700 placeholder:text-neutral-500 h-10 p-0 flex-1 outline-none text-sm"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Statistics - Moved to be with Order Summary Chart */}

            {/* Management + Product Grid: Responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[50%_20%_28%] gap-4">
              {/* Row 1, Col 1 */}
              <div className="space-y-4">
                <ManagementCard
                  title="Employee Management"
                  stats={employeeStats}
                  className="p-4 rounded-[15px]"
                />
                <ManagementCard
                  title="Dealer Management"
                  stats={dealerStats}
                  className="p-4 rounded-[15px]"
                />
              </div>

              {/* Middle Column - Customer Management and Return Rate */}
              <div className="space-y-4">
                <ChartCard
                  title="User Counts"
                  value={
                    userCounts ? userCounts.total.toLocaleString() : undefined
                  }
                  className="rounded-[15px]"
                  contentClassName="h-64 sm:h-60"
                  hideActions
                >
                  <UserCountsBar
                    data={[
                      { name: "Users", value: userCounts?.Users ?? 0 },
                      { name: "Dealers", value: userCounts?.Dealers ?? 0 },
                      {
                        name: "SuperAdmins",
                        value: userCounts?.SuperAdmins ?? 0,
                      },
                      {
                        name: "Fulfillment Admins",
                        value: userCounts?.FulfillmentAdmins ?? 0,
                      },
                      {
                        name: "Fulfillment Staffs",
                        value: userCounts?.FulfillmentStaffs ?? 0,
                      },
                      {
                        name: "Inventory Admins",
                        value: userCounts?.InventoryAdmins ?? 0,
                      },
                      {
                        name: "Inventory Staffs",
                        value: userCounts?.InventoryStaffs ?? 0,
                      },
                      {
                        name: "Support",
                        value: userCounts?.Customer_Support ?? 0,
                      },
                    ]}
                  />
                </ChartCard>
              </div>

              {/* Col 3 spans both rows */}
              <ChartCard
                title="Product Management"
                className="lg:row-span-2 w-full"
                contentClassName="h-50"
              >
                <DonutChart
                  data={productData}
                  centerValue={(productStats?.total ?? 0).toString()}
                  centerLabel="PRODUCTS"
                />
              </ChartCard>
            </div>

            {/* Bottom Row - Order Summary Widget with Order Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-[72%_28%] gap-4">
              {orderSummary &&
              Array.isArray(orderSummary.timeSeriesData) &&
              orderSummary.timeSeriesData.some(
                (d: any) => d.currentAmount > 0 || d.currentOrders > 0
              ) ? (
                <ChartCard
                  title="Order Summary"
                  value={orderSummary.summary.currentTotalAmount.toLocaleString()}
                  change={orderSummary.summary.comparisonText}
                  changeType={
                    orderSummary.summary.amountPercentageChange < 0
                      ? "negative"
                      : "positive"
                  }
                  className="w-full rounded-[15px] p-2"
                  contentClassName="h-56"
                  compactHeader
                  rightNode={
                    <div className="flex flex-wrap gap-1">
                      <div className="hidden sm:flex items-center text-xs text-neutral-600 mr-2">
                        <span className="font-medium mr-1">Orders:</span>
                        <span className="font-semibold text-neutral-900">
                          {orderSummary.summary.currentTotalOrders}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={
                          summaryPeriod === "week" ? "default" : "outline"
                        }
                        onClick={() => setSummaryPeriod("week")}
                        className="h-7 px-2"
                      >
                        Week
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          summaryPeriod === "month" ? "default" : "outline"
                        }
                        onClick={() => setSummaryPeriod("month")}
                        className="h-7 px-2"
                      >
                        Month
                      </Button>
                    </div>
                  }
                >
                  {/* <div className="space-y-4"> */}
                    <CustomLineChart data={chartData} />
                    {/* Chart Legend */}
                    {/* <div className="flex flex-wrap gap-4 justify-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Current Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Previous Period</span>
                  </div>
                  {(processAllOrdersData || orderApiStats) && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">{processAllOrdersData ? "All Orders Data" : "Order API Data"}</span>
                    </div>
                  )}
                </div> */}
                  {/* </div> */}
                </ChartCard>
              ) : (
                <ChartCard
                  title="Order Summary"
                  value={
                    orderSummary
                      ? orderSummary.summary.currentTotalAmount.toLocaleString()
                      : undefined
                  }
                  change={
                    orderSummary
                      ? orderSummary.summary.comparisonText
                      : undefined
                  }
                  changeType={
                    orderSummary &&
                    orderSummary.summary.amountPercentageChange < 0
                      ? "negative"
                      : "positive"
                  }
                  className="w-full rounded-[15px] p-2"
                  contentClassName="h-32 flex items-center justify-center"
                  compactHeader
                  rightNode={
                    <div className="flex flex-wrap gap-1">
                      {orderSummary && (
                        <div className="hidden sm:flex items-center text-xs text-neutral-600 mr-2">
                          <span className="font-medium mr-1">Orders:</span>
                          <span className="font-semibold text-neutral-900">
                            {orderSummary.summary.currentTotalOrders}
                          </span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant={
                          summaryPeriod === "week" ? "default" : "outline"
                        }
                        onClick={() => setSummaryPeriod("week")}
                        className="h-7 px-2"
                      >
                        Week
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          summaryPeriod === "month" ? "default" : "outline"
                        }
                        onClick={() => setSummaryPeriod("month")}
                        className="h-7 px-2"
                      >
                        Month
                      </Button>
                    </div>
                  }
                >
                  <div className="flex flex-col items-center justify-center h-full text-xs text-gray-400">
                    No order data available for the selected period
                  </div>
                </ChartCard>
              )}

              {/* Order Status Cards */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Order Status
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {orderStats.map((stat, index) => (
                    <StatCard
                      key={index}
                      className="p-3"
                      title={stat.title}
                      value={stat.value}
                      color={stat.color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Returns Dashboard */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Returns Overview"
            className="lg:col-span-2 rounded-[15px] p-4"
            contentClassName="h-48"
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats ? stats.statusCounts.Returned : 0}
                </div>
                <div className="text-lg text-gray-600 mb-4">Total Returns</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="font-semibold text-red-800">Return Rate</div>
                    <div className="text-red-600">
                      {stats ? ((stats.statusCounts.Returned / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Processing</div>
                    <div className="text-blue-600">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard> */}

            {/* <ChartCard
            title="Return Trends"
            className="rounded-[15px] p-4"
            contentClassName="h-48"
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">📊</div>
                <div className="text-sm text-gray-600 mb-2">Return Analytics</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>This Week:</span>
                    <span className="font-semibold">-5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month:</span>
                    <span className="font-semibold">+12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Processing:</span>
                    <span className="font-semibold">2.3 days</span>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard> */}
            {/* </div> */}
          </>
        )}
      </div>
    </div>
  );
}
