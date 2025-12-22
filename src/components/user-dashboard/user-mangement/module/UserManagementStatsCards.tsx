"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, UserCheck, Loader2 } from "lucide-react";
import { fetchUserCounts, fetchEmployeeStats, fetchDealerStats } from "@/service/dashboardServices";
import { UserCountsData, EmployeeStatsResponse, DealerStatsResponse } from "@/types/dashboard-Types";
import { useAppSelector } from "@/store/hooks";

interface UserManagementStatsCardsProps {
  className?: string;
}

export default function UserManagementStatsCards({ className = "" }: UserManagementStatsCardsProps) {
  const auth = useAppSelector((state) => state.auth.user);
  const userRole = auth?.role?.trim() || "";

  const [userCounts, setUserCounts] = useState<UserCountsData | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStatsResponse['data'] | null>(null);
  const [dealerStats, setDealerStats] = useState<DealerStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const {isSuperAdmin ,isInventoryAdmin} = useMemo(() => {
  if (!auth?.role) return { isSuperAdmin: false, isInventoryAdmin: false };
  return {
    isSuperAdmin: auth?.role === "Super-admin",
    isInventoryAdmin: auth?.role === "Inventory-Admin",
  };
}, [auth?.role]); 
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Determine role filter for employee stats
        // - Fulfillment Admin: sees only fulfillment staff
        // - Inventory Admin: sees only inventory staff
        // - Super Admin: sees all employees
        let employeeRoleFilter: string | undefined;
        if (userRole === "Fulfillment-Admin") {
          employeeRoleFilter = "Fulfillment-Admin";
        } else if (userRole === "Inventory-Admin") {
          employeeRoleFilter = "Inventory-Admin";
        }
        // Super-admin sees all employees (no filter)

        console.log(`Fetching employee stats for role: ${userRole}, filter: ${employeeRoleFilter || 'all'}`);

        // Fetch all stats in parallel
        const [userCountsResponse, employeeStatsResponse, dealerStatsResponse] = await Promise.allSettled([
          fetchUserCounts(),
          fetchEmployeeStats(employeeRoleFilter),
          fetchDealerStats()
        ]);

        // Handle user counts
        if (userCountsResponse.status === 'fulfilled') {
          setUserCounts(userCountsResponse.value.data);
        } else {
          console.warn("Failed to fetch user counts:", userCountsResponse.reason);
        }

        // Handle employee stats
        if (employeeStatsResponse.status === 'fulfilled') {
          setEmployeeStats(employeeStatsResponse.value.data);
        } else {
          console.warn("Failed to fetch employee stats:", employeeStatsResponse.reason);
        }

        // Handle dealer stats
        if (dealerStatsResponse.status === 'fulfilled') {
          setDealerStats(dealerStatsResponse.value.data);
        } else {
          console.warn("Failed to fetch dealer stats:", dealerStatsResponse.reason);
        }

      } catch (err) {
        console.error("Error fetching user management stats:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userRole]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals with fallbacks
  const totalEmployees = employeeStats?.summary?.totalEmployees || 0;
  const totalDealers = dealerStats?.summary?.totalDealers || userCounts?.Dealers || 0;
  const totalUsers = userCounts?.Users || 0;

  // Determine employee title based on user role
  const getEmployeeTitle = () => {
    switch (userRole) {
      case "Fulfillment-Admin":
        return "Fulfillment Staff";
      case "Inventory-Admin":
        return "Inventory Staff";
      default:
        return "Total Employees";
    }
  };

  const getEmployeeDescription = () => {
    switch (userRole) {
      case "Fulfillment-Admin":
        return "Active fulfillment staff in the system";
      case "Inventory-Admin":
        return "Active inventory staff in the system";
      default:
        return "Active employees in the system";
    }
  };

  const statsCards = [
    ...(isInventoryAdmin ? [] : [{
      title: getEmployeeTitle(),
      value: totalEmployees,
      icon: UserCheck,
      description: getEmployeeDescription(),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    }]),
    {
      title: "Total Dealers",
      value: totalDealers,
      icon: Building2,
      description: "Registered dealers",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: "App users",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={index} 
            className={`border ${stat.borderColor} hover:shadow-md transition-shadow duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
