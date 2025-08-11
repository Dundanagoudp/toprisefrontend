"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { addRolesToModule } from "@/service/settingServices"
import type { AddRolesToModuleRequest } from "@/types/setting-Types"
import { useToast } from "@/components/ui/toast"

interface AddRoleModalProps {
  children: React.ReactNode
  moduleName: string
  onRoleAdded?: () => void
}

export function AddRoleModal({ children, moduleName, onRoleAdded }: AddRoleModalProps) {
  const [open, setOpen] = useState(false)
  const [roleName, setRoleName] = useState("")
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSave = async () => {
    if (!roleName.trim()) {
      showToast("Role name is required", "error")
      return
    }

    if (!moduleName) {
      showToast("Module name is required", "error")
      return
    }

    try {
      setLoading(true)
      const requestData: AddRolesToModuleRequest = {
        module: moduleName,
        roles: [roleName.trim()]
        // Removed updatedBy field to fix 500 error
      }

      await addRolesToModule(requestData)
      showToast("Role added successfully", "success")
      
      // Reset form and close modal
      setRoleName("")
      setOpen(false)
      
      // Call callback to refresh roles list
      onRoleAdded?.()
    } catch (error) {
      console.error("Error adding role:", error)
      showToast("Failed to add role", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold">Add Role</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="module-name" className="text-base font-medium">
              Module Name
            </Label>
            <Input
              id="module-name"
              value={moduleName}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-base font-medium">
              Role Name
            </Label>
            <Input
              id="role"
              placeholder="Enter role name (e.g., Super Admin)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white py-2 text-lg font-semibold"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Adding..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
