"use client";

import { useAppSelector } from "@/store/hooks";
import AdminOrdersTable from "./module/AdminOrdersTable";
import StaffPicklistsTable from "./module/StaffPicklistsTable";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersTable() {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role || "";

  // Admin Roles
  const isAdmin = ["Super-admin", "Fulfillment-Admin", "Fullfillment-Admin"].includes(role);

  if (isAdmin) {
    return <AdminOrdersTable />;
  }

  if (role === "Fulfillment-Staff") {
    return <StaffPicklistsTable/>;
  }

  // Fallback / Unauthorized
  return (
    <Card>
      <CardContent className="p-8 text-center text-red-500">
        Unauthorized: Unknown Role ({role})
      </CardContent>
    </Card>
  );
}