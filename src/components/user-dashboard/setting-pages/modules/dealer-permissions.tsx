"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, X } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllDealers } from "@/service/dealerServices"
import { 
  addDealerPermissions, 
  updateDealerPermissions, 
  removeDealerPermissions,
  getAllModules 
} from "@/service/settingServices"
import type { Dealer } from "@/types/dealer-types"
import type { PermissionModule } from "@/types/setting-Types"

interface DealerPermissionsProps {
  className?: string
}

export default function DealerPermissions({ className }: DealerPermissionsProps) {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [modules, setModules] = useState<PermissionModule[]>([])
  const [selectedModule, setSelectedModule] = useState("")
  const [selectedRole, setSelectedRole] = useState("admin")
  const [selectedDealers, setSelectedDealers] = useState<string[]>([])
  const [permissions, setPermissions] = useState({
    allowedFields: [] as string[],
    read: false,
    write: false,
    update: false,
    delete: false
  })
  const [allowedFieldsInput, setAllowedFieldsInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [dealersLoading, setDealersLoading] = useState(false)
  const [modulesLoading, setModulesLoading] = useState(false)
  const { showToast } = useToast()

  // Fetch dealers and modules on component mount
  useEffect(() => {
    fetchDealers()
    fetchModules()
  }, [])

  const fetchDealers = async () => {
    try {
      setDealersLoading(true)
      const response = await getAllDealers()
      if (response.success) {
        setDealers(response.data || [])
      }
    } catch (error) {
      console.error("Error fetching dealers:", error)
      showToast("Failed to fetch dealers", "error")
    } finally {
      setDealersLoading(false)
    }
  }

  const fetchModules = async () => {
    try {
      setModulesLoading(true)
      const response = await getAllModules()
      setModules(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedModule(response.data[0].module)
      }
    } catch (error) {
      console.error("Error fetching modules:", error)
      showToast("Failed to fetch modules", "error")
    } finally {
      setModulesLoading(false)
    }
  }

  const handleAddPermissions = async () => {
    if (!selectedModule || selectedDealers.length === 0) {
      showToast("Please select a module and at least one dealer", "error")
      return
    }

    try {
      setLoading(true)
      
      // Parse allowed fields from comma-separated string
      const allowedFields = allowedFieldsInput
        .split(",")
        .map(field => field.trim())
        .filter(field => field.length > 0)

      const requestData = {
        module: selectedModule,
        role: selectedRole, // Use selected role
        userIds: selectedDealers,
        permissions: {
          ...permissions,
          allowedFields
        }
      }

      await addDealerPermissions(requestData)
      showToast("Permissions added successfully", "success")
      
      // Reset form
      setSelectedDealers([])
      setPermissions({
        allowedFields: [],
        read: false,
        write: false,
        update: false,
        delete: false
      })
      setAllowedFieldsInput("")
    } catch (error) {
      console.error("Error adding permissions:", error)
      showToast("Failed to add permissions", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePermissions = async () => {
    if (!selectedModule || selectedDealers.length === 0) {
      showToast("Please select a module and at least one dealer", "error")
      return
    }

    try {
      setLoading(true)
      
      // Parse allowed fields from comma-separated string
      const allowedFields = allowedFieldsInput
        .split(",")
        .map(field => field.trim())
        .filter(field => field.length > 0)

      const requestData = {
        module: selectedModule,
        role: selectedRole, // Use selected role
        userIds: selectedDealers,
        permissions: {
          ...permissions,
          allowedFields
        }
      }

      await updateDealerPermissions(requestData)
      showToast("Permissions updated successfully", "success")
      
      // Reset form
      setSelectedDealers([])
      setPermissions({
        allowedFields: [],
        read: false,
        write: false,
        update: false,
        delete: false
      })
      setAllowedFieldsInput("")
    } catch (error) {
      console.error("Error updating permissions:", error)
      showToast("Failed to update permissions", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePermissions = async () => {
    if (!selectedModule || selectedDealers.length === 0) {
      showToast("Please select a module and at least one dealer", "error")
      return
    }

    try {
      setLoading(true)
      
      const requestData = {
        module: selectedModule,
        role: selectedRole, // Use selected role
        userIds: selectedDealers
      }

      await removeDealerPermissions(requestData)
      showToast("Permissions removed successfully", "success")
      
      // Reset form
      setSelectedDealers([])
    } catch (error) {
      console.error("Error removing permissions:", error)
      showToast("Failed to remove permissions", "error")
    } finally {
      setLoading(false)
    }
  }

  const toggleDealerSelection = (userId: string) => {
    setSelectedDealers(prev => (prev.includes(userId) ? [] : [userId]))
  }

  if (dealersLoading || modulesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dealer Permissions</h2>
        <p className="text-gray-600">Manage permissions for dealers across different modules</p>
      </div>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Module</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module._id} value={module.module}>
                  {module.module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="dealer">Dealer</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Dealer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Dealers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {dealers.map((dealer) => (
              <div
                key={dealer._id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDealers.includes(dealer.user_id._id)
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleDealerSelection(dealer.user_id._id)}
              >
                <Checkbox
                  checked={selectedDealers.includes(dealer.user_id._id)}
                  onCheckedChange={() => toggleDealerSelection(dealer.user_id._id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{dealer.trade_name || dealer.legal_name}</p>
                  <p className="text-xs text-gray-500 truncate">{dealer.user_id?.email || 'No email'}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedDealers.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Selected: {selectedDealers.length} dealer{selectedDealers.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Toggles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={permissions.read}
                onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, read: !!checked }))}
              />
              <Label>Read</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={permissions.write}
                onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, write: !!checked }))}
              />
              <Label>Write</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={permissions.update}
                onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, update: !!checked }))}
              />
              <Label>Update</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={permissions.delete}
                onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, delete: !!checked }))}
              />
              <Label>Delete</Label>
            </div>
          </div>

          {/* Allowed Fields */}
          <div>
            <Label htmlFor="allowedFields">Allowed Fields (comma-separated)</Label>
            <Input
              id="allowedFields"
              placeholder="field1, field2, field3"
              value={allowedFieldsInput}
              onChange={(e) => setAllowedFieldsInput(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to allow all fields, or specify specific fields separated by commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleAddPermissions}
          disabled={loading || !selectedModule || selectedDealers.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Permissions
        </Button>
        
        <Button
          onClick={handleUpdatePermissions}
          disabled={loading || !selectedModule || selectedDealers.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Update Permissions
        </Button>
        
        <Button
          onClick={handleRemovePermissions}
          disabled={loading || !selectedModule || selectedDealers.length === 0}
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Permissions
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      )}
    </div>
  )
}
