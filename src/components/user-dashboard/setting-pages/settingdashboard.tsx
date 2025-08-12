"use client"

import { useState } from "react"
import { DeliveryChargeSettings } from "./modules/delivery-charge-settings"
import PermissionAccess from "./modules/permission-access"

export default function SettingPage() {
  const [activeSetting, setActiveSetting] = useState("Permission Access")

  const settingsNav = [
    { name: "Permission Access", id: "Permission Access" },
    { name: "Delivery Charge", id: "Delivery Charge" },
    { name: "Minimum Order Value", id: "Minimum Order Value" },
    { name: "Smtp", id: "Smtp" },
    { name: "Minimum Ticket", id: "Minimum Ticket" },
    { name: "Serviceable Areas", id: "Serviceable Areas" },
    { name: "Versioning", id: "Versioning" },
    { name: "Support Email", id: "Support Email" },
    { name: "Support Phone", id: "Support Phone" },
    { name: "TNC", id: "TNC" },
    { name: "Privacy Policy", id: "Privacy Policy" },
  ]

  return (
    <div className="flex flex-col p-3 gap-3">
      <div className="flex flex-col md:flex-row">
        {/* Left Column: Setting Categories (now a separate sidebar) */}
        <div className="md:w-[250px] w-full flex md:flex-col flex-row gap-1 p-2 md:overflow-visible overflow-x-auto border-b md:border-0">
          {settingsNav.map((item) => (
            <div
              key={item.id}
              className={`py-1 px-2 rounded-md cursor-pointer whitespace-nowrap ${
                activeSetting === item.id ? "text-primary-red font-medium bg-gray-50" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveSetting(item.id)}
            >
              {item.name}
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-3 md:mt-0 mt-3">
          {activeSetting === "Permission Access" && <PermissionAccess />}
          {activeSetting === "Delivery Charge" && <DeliveryChargeSettings />}
          
          {/* Placeholder for other settings */}
          {activeSetting !== "Permission Access" && activeSetting !== "Delivery Charge" && (
            <div className="flex items-center justify-center h-48 text-gray-500">
              Content for {activeSetting} will be displayed here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


