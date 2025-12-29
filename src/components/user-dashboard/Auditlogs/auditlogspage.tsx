"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/store/hooks"
import SuperAdminAuditLogs from "./components/SuperAdminAuditLogs"
import InventoryAdminAuditLogs from "./components/InventoryAdminAuditLogs"
import FulfillmentAdminAuditLogs from "./components/FulfillmentAdminAuditLogs"

export default function Auditlogspage() {
  const auth = useAppSelector((state) => state.auth.user)
  
  const userRole = useMemo(() => {
    return auth?.role?.trim() || ""
  }, [auth?.role])

  // Route to appropriate component based on user role
  if (userRole === "Super-admin") {
    return <SuperAdminAuditLogs />
  }

  if (userRole === "Inventory-Admin") {
    return <InventoryAdminAuditLogs />
  }

  if (userRole === "Fulfillment-Admin") {
    return <FulfillmentAdminAuditLogs />
  }

  // Default fallback to SuperAdmin view for unknown roles
  // This ensures backward compatibility
  return <SuperAdminAuditLogs />
}
