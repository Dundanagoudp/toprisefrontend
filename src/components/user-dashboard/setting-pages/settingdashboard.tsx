"use client"

import { useState } from "react"
import { DeliveryChargeSettings } from "./modules/delivery-charge-settings"
import PermissionAccess from "./modules/permission-access"
import DealerPermissions from "./modules/dealer-permissions"
import { PincodeManagement } from "./modules/pincode-management"
import { SlaTypesTab } from "./modules/sla-violationstab"
import { GeneralSettings } from "./modules/general-settings"

export default function SettingPage() {
  const [activeSetting, setActiveSetting] = useState("Dealer Permissions")

  const settingsNav = [
    // { name: "Permission Access", id: "Permission Access" },
    { name: "Dealer Permissions", id: "Dealer Permissions" },
    { name: "Other Settings", id: "Other Settings" },
    { name: "Pincodes", id: "Pincodes" },
    { name: "SLA Types", id: "SLA Types" },
    { name: "General", id: "General" },
  ]

  return (
    <div className="flex flex-col p-3 gap-3">
      <div className="flex flex-col lg:flex-row">
        {/* <CHANGE> Improved mobile tab navigation with better scrolling and spacing */}
        <div className="lg:w-[250px] w-full flex lg:flex-col flex-row gap-2 p-3 lg:overflow-visible overflow-x-auto border-b lg:border-0 lg:border-r lg:border-gray-200">
          <div className="flex lg:flex-col flex-row gap-2 lg:gap-1 min-w-max lg:min-w-0">
            {settingsNav.map((item) => (
              <button
                key={item.id}
                className={`py-2 px-3 lg:py-2 lg:px-3 rounded-lg cursor-pointer whitespace-nowrap text-base font-normal transition-all duration-200 min-w-max lg:min-w-0 lg:w-full text-left ${
                  activeSetting === item.id
                    ? "text-[#c72920] font-semibold"
                    : "text-black"
                }`}
                onClick={() => setActiveSetting(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* <CHANGE> Better spacing and padding for main content area */}
        <div className="flex-1 p-4 lg:p-6">
          {/* {activeSetting === "Permission Access" && <PermissionAccess />} */}
          {activeSetting === "Dealer Permissions" && <DealerPermissions />}
          {activeSetting === "General" && <GeneralSettings />}
          {activeSetting === "Other Settings" && <DeliveryChargeSettings />}
          {activeSetting === "Pincodes" && <PincodeManagement />}
          {activeSetting === "SLA Types" && <SlaTypesTab />}
        </div>
      </div>
    </div>
  )
}
