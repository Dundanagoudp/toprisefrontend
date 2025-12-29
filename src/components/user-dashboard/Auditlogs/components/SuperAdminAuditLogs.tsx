"use client"

import BaseAuditLogs from "./BaseAuditLogs"

export default function SuperAdminAuditLogs() {
  return (
    <BaseAuditLogs
      title="Action Audit Logs"
      description="Track and monitor all user actions across the system - Full Access"
      showModuleFilter={true}
    />
  )
}

