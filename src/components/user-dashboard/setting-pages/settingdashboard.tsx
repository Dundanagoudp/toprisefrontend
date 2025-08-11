"use client"
import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DeliveryChargeSettings } from "./modules/delivery-charge-settings"
import { DynamicButton } from "@/components/common/button"

export default function SettingPage() {
  const [activeSetting, setActiveSetting] = useState("Permission Access")
  const [activeModule, setActiveModule] = useState("Dealer")

  // Roles per module
  const rolesPerModule: Record<string, string[]> = {
    Dealer: ["Dealer"],
    "Order Management": ["Super Admin"],
    "Employee Management": ["Inventory Admin"],
  }

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

  const modules = [
    { name: "Dealer", id: "Dealer" },
    { name: "Order Management", id: "Order Management" },
    { name: "Employee Management", id: "Employee Management" },
  ]

  return (
    <div className="flex flex-col p-6 gap-6">
      {activeSetting === "Permission Access" && (
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <DynamicButton
              text="Create Module"
              customClassName="bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white"
            />
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr_1fr] gap-6">
        
        {/* Left Column: Setting Categories */}
        <div className="flex flex-col gap-2">
          {settingsNav.map((item) => (
            <div
              key={item.id}
              className={`py-2 px-3 rounded-md cursor-pointer ${
                activeSetting === item.id ? "text-primary-red font-medium bg-gray-50" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveSetting(item.id)}
            >
              {item.name}
            </div>
          ))}
        </div>

        {/* Middle Column: Module and Roles Permission Access */}
        {activeSetting === "Permission Access" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 font-semibold text-sm text-gray-600">
              <div>Module</div>
              <div>Roles Permission Access</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Module List */}
              <div className="flex flex-col gap-2">
                {modules.map((moduleItem) => (
                  <div
                    key={moduleItem.id}
                    className={`py-2 cursor-pointer ${activeModule === moduleItem.id ? "text-primary-red" : ""}`}
                    onClick={() => setActiveModule(moduleItem.id)}
                  >
                    {moduleItem.name}
                  </div>
                ))}
              </div>
              {/* Roles List for Active Module */}
              <RolesPermissionAccess
                roles={rolesPerModule[activeModule] || []}
                activeModule={activeModule}
              />
            </div>
          </div>
        )}

        {/* Right Column: Dealer Details Cards - Only show if activeModule is "Dealer" */}
        {activeSetting === "Permission Access" && activeModule === "Dealer" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between font-semibold text-sm text-gray-600 mb-2">
              <div>Dealer Details</div>
              <DynamicButton
                variant="outline"
                icon={<Plus className="w-4 h-4" />}
                text="Add Role"
                customClassName="w-fit border-[var(--new-300)] text-[var(--new-300)] hover:bg-[var(--new-50)] hover:text-[var(--new-400)] bg-transparent"
              />
            </div>
            <DealerDetailsCard
              dealerId="056789"
              dealerName="A. Sharma"
              email="ABC@gmail.com"
              phone="+91 8523694712"
              allowedFields="True"
              permissions="Read/Write/Update"
            />
            <DealerDetailsCard
              dealerId="056789"
              dealerName="A. Sharma"
              email="ABC@gmail.com"
              phone="+91 8523694712"
              allowedFields="True"
              permissions="Read/Write/Update"
            />
          </div>
        )}

        {/* Conditional rendering for Delivery Charge Settings */}
        {activeSetting === "Delivery Charge" && <DeliveryChargeSettings />}

        {/* Placeholder for other settings */}
        {activeSetting !== "Permission Access" && activeSetting !== "Delivery Charge" && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Content for {activeSetting} will be displayed here.
          </div>
        )}
      </div>
    </div>
  )
}

// RolesPermissionAccess component
function RolesPermissionAccess({ roles, activeModule }: { roles: string[]; activeModule: string }) {
  return (
    <div className="flex flex-col gap-2">
      {roles.map((role) => (
        <div key={role} className="flex items-center justify-between py-2">
          <span className={activeModule === "Dealer" && role === "Dealer" ? "text-primary-red" : ""}>{role}</span>
          <Trash2 className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500" />
        </div>
      ))}
      <DynamicButton
        variant="outline"
        icon={<Plus className="w-4 h-4" />}
        text="Add Role"
        customClassName="w-fit border-[var(--new-300)] text-[var(--new-300)] hover:bg-[var(--new-50)] hover:text-[var(--new-400)] bg-transparent mt-2"
      />
    </div>
  )
}

interface DealerDetailsCardProps {
  dealerId: string
  dealerName: string
  email: string
  phone: string
  allowedFields: string
  permissions: string
}

function DealerDetailsCard({ dealerId, dealerName, email, phone, allowedFields, permissions }: DealerDetailsCardProps) {
  return (
    <Card className="p-4 border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Checkbox
            id="dealer-checkbox"
            className="data-[state=checked]:bg-[var(--new-300)] data-[state=checked]:border-[var(--new-300)]"
          >
            <Check className="h-4 w-4 text-white" />
          </Checkbox>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <div className="text-gray-500">Dealer ID</div>
            <div className="font-medium">{dealerId}</div>
          </div>
          <div>
            <div className="text-gray-500">Dealer Name</div>
            <div className="font-medium">{dealerName}</div>
          </div>
          <div>
            <div className="text-gray-500">Email</div>
            <div className="font-medium">{email}</div>
          </div>
          <div>
            <div className="text-gray-500">Phone</div>
            <div className="font-medium">{phone}</div>
          </div>
          <div>
            <div className="text-gray-500">Allowed Fields</div>
            <div className="font-medium">{allowedFields}</div>
          </div>
          <div>
            <div className="text-gray-500">Permissions</div>
            <div className="font-medium">{permissions}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
