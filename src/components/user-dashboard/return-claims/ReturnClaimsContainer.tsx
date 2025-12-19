"use client";

import { useAppSelector } from "@/store/hooks";
import { Card, CardContent } from "@/components/ui/card";
import AdminReturnClaims from "./AdminReturnClaims";
import FulfillmentReturnClaims from "./FulfillmentReturnClaims";

export default function ReturnClaimsContainer() {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role || "";

  // Admin Roles
  const isAdmin = ["Super-admin", "Fulfillment-Admin", "Fullfillment-Admin"].includes(role);

  if (isAdmin) {
    return <AdminReturnClaims />;
  }

  if (role === "Fulfillment-Staff") {
    return <FulfillmentReturnClaims />;
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
