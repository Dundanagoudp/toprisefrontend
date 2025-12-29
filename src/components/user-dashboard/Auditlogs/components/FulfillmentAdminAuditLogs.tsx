"use client"

import BaseAuditLogs from "./BaseAuditLogs"

export default function FulfillmentAdminAuditLogs() {
  return (
    <BaseAuditLogs
      title="Order & User Audit Logs"
      description="Track and monitor order and user-related actions across the system"
      allowedModules={["ORDER", "USER"]}
      showModuleFilter={true}
      allowedRoles={["Fulfillment-Admin", "Fulfillment-Staff", "Fullfillment-staff"]}
    />
  )
}

