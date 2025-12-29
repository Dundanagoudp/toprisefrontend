"use client"

import BaseAuditLogs from "./BaseAuditLogs"

export default function InventoryAdminAuditLogs() {
  return (
    <BaseAuditLogs
      title="Product Audit Logs"
      description="Track and monitor product-related actions across the system"
      allowedModules={["PRODUCT"]}
      defaultModuleFilter="PRODUCT"
      showModuleFilter={false}
      allowedRoles={["Inventory-Admin", "Inventory-Staff", "Inventory-staff"]}
    />
  )
}

