"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, X, Eye, Edit, FileUp } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllDealers, getDealerById, getDealerPermissions, setDealerPermissions } from "@/service/dealerServices"

import { 
  addDealerPermissions, 
  updateDealerPermissions, 
  removeDealerPermissions,
  getAllModules 
} from "@/service/settingServices"
import type { Dealer } from "@/types/dealer-types"
import type { PermissionModule } from "@/types/setting-Types"
import { MultiSelectField } from "@/components/ui/multi-select-field"
import { PRODUCT_FIELDS, getFieldLabel } from "@/lib/constants/product-fields"

interface DealerPermissionsProps {
  className?: string
}

export default function DealerPermissions({ className }: DealerPermissionsProps) {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [modules, setModules] = useState<PermissionModule[]>([])
  const [selectedModule, setSelectedModule] = useState("")
  const [selectedRole, setSelectedRole] = useState("admin")
  const [selectedDealers, setSelectedDealers] = useState<string[]>([])

  
  // New nested permission structure
  const [readFields, setReadFields] = useState<string[]>([])
  const [readEnabled, setReadEnabled] = useState(false)
  const [updateFields, setUpdateFields] = useState<string[]>([])
  const [updateEnabled, setUpdateEnabled] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [isAdd, setIsAdd] = useState(false)
  const [isUpdateStock, setIsUpdateStock] = useState(false)
  
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

  //get dealer permissions
  const fetchDealerPermissions = async (dealerId: string) => {
  try{
    const response = await getDealerPermissions(dealerId)
    console.log("Dealer permissions response:", response)
  }
  catch(error) {
    console.error("Error fetching dealer permissions:", error)
    showToast("Failed to fetch dealer permissions", "error")
  }
  
  }

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
        role: selectedRole,
        userIds: selectedDealers,
        permissions: {
          allowedFields,
          read: false,
          write: false,
          update: false,
          delete: false
        }
      }

      await addDealerPermissions(requestData)
      showToast("Permissions added successfully", "success")
      
      // Reset form
      resetForm()
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
        role: selectedRole,
        userIds: selectedDealers,
        permissions: {
          allowedFields,
          read: false,
          write: false,
          update: false,
          delete: false
        }
      }

      await updateDealerPermissions(requestData)
      showToast("Permissions updated successfully", "success")
      
      // Reset form
      resetForm()
    } catch (error) {
      console.error("Error updating permissions:", error)
      showToast("Failed to update permissions", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSetDealerPermissions = async () => {
    if (selectedDealers.length === 0) {
      showToast("Please select at least one dealer", "error")
      return
    }

    // Validate that at least one permission is enabled
    if (!readEnabled && !updateEnabled && !isDelete && !isAdd && !isUpdateStock) {
      showToast("Please enable at least one permission", "error")
      return
    }

    try {
      setLoading(true)

      // Construct the nested permission structure
      const permissionsPayload = {
        readPermissions: {
          isEnabled: readEnabled,
          allowed_fields: readFields
        },
        updatePermissions: {
          isEnabled: updateEnabled,
          allowed_fields: updateFields
        },
        isDelete,
        isAdd,
        isUpdateStock
      }

      // Call setDealerPermissions for each selected dealer
      const promises = selectedDealers.map(dealerId =>
        setDealerPermissions(dealerId, permissionsPayload)
      )

      await Promise.all(promises)
      
      showToast(
        `Permissions set successfully for ${selectedDealers.length} dealer${selectedDealers.length > 1 ? 's' : ''}`,
        "success"
      )
      
      // Reset form
      resetForm()
    } catch (error) {
      console.error("Error setting dealer permissions:", error)
      showToast("Failed to set dealer permissions", "error")
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

  const resetForm = () => {
    setSelectedDealers([])
    setReadFields([])
    setReadEnabled(false)
    setUpdateFields([])
    setUpdateEnabled(false)
    setIsDelete(false)
    setIsAdd(false)
    setIsUpdateStock(false)
    setAllowedFieldsInput("")
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

            {/* Info Alert */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Permission Management Options</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li><strong>Set Dealer Permissions:</strong> Configure granular read/update/action permissions for product fields</li>
                      <li><strong>Module Permissions:</strong> Manage module-level permissions (legacy system for batch operations)</li>
                      <li><strong>Field Selection:</strong> Use the searchable dropdown to select specific fields or "Select All" for unrestricted access</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
      </div>

      {/* Module Selection */}
      {/* <Card>
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
      </Card> */}

      {/* Role Selection */}
      {/* <Card>
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
      </Card> */}

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
                  selectedDealers.includes(dealer._id)
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleDealerSelection(dealer._id)}
              >
                <Checkbox
                  checked={selectedDealers.includes(dealer._id)}
                  onCheckedChange={() => toggleDealerSelection(dealer._id)}
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
          {/* Read Permissions */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={readEnabled}
                  onCheckedChange={(checked) => setReadEnabled(!!checked)}
                  id="read-enabled"
                />
                <Label htmlFor="read-enabled" className="flex items-center gap-2 cursor-pointer">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold">Read Permissions</span>
                </Label>
              </div>
              {readEnabled && (
                <Badge variant="secondary">
                  {readFields.length} field{readFields.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>
            {readEnabled && (
              <div>
                <Label>Allowed Fields for Reading</Label>
                <MultiSelectField
                  options={PRODUCT_FIELDS.map(field => ({
                    value: field.value,
                    label: field.label,
                    category: field.category
                  }))}
                  selected={readFields}
                  onChange={setReadFields}
                  placeholder="Select fields that can be read..."
                  searchPlaceholder="Search fields..."
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select specific fields or leave empty to allow all fields
                </p>
              </div>
            )}
          </div>

          {/* Update Permissions */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={updateEnabled}
                  onCheckedChange={(checked) => setUpdateEnabled(!!checked)}
                  id="update-enabled"
                />
                <Label htmlFor="update-enabled" className="flex items-center gap-2 cursor-pointer">
                  <Edit className="w-4 h-4" />
                  <span className="font-semibold">Update Permissions</span>
                </Label>
              </div>
              {updateEnabled && (
                <Badge variant="secondary">
                  {updateFields.length} field{updateFields.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>
            {updateEnabled && (
              <div>
                <Label>Allowed Fields for Updating</Label>
                <MultiSelectField
                  options={PRODUCT_FIELDS.map(field => ({
                    value: field.value,
                    label: field.label,
                    category: field.category
                  }))}
                  selected={updateFields}
                  onChange={setUpdateFields}
                  placeholder="Select fields that can be updated..."
                  searchPlaceholder="Search fields..."
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select specific fields or leave empty to allow all fields
                </p>
              </div>
            )}
          </div>

          {/* Action Permissions */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Action Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isAdd}
                  onCheckedChange={(checked) => setIsAdd(!!checked)}
                  id="is-add"
                />
                <Label htmlFor="is-add" className="cursor-pointer">Can Add New Products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isDelete}
                  onCheckedChange={(checked) => setIsDelete(!!checked)}
                  id="is-delete"
                />
                <Label htmlFor="is-delete" className="cursor-pointer">Can Delete Products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isUpdateStock}
                  onCheckedChange={(checked) => setIsUpdateStock(!!checked)}
                  id="is-update-stock"
                />
                <Label htmlFor="is-update-stock" className="cursor-pointer flex items-center gap-1">
                  <FileUp className="w-4 h-4" />
                  Can Update Stock
                </Label>
              </div>
            </div>
          </div>

          {/* Permission Summary */}
          {(readEnabled || updateEnabled || isDelete || isAdd || isUpdateStock) && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Permission Summary</h4>
              <ul className="space-y-1 text-sm">
                {readEnabled && (
                  <li>✓ Read access to {readFields.length > 0 ? `${readFields.length} specific fields` : 'all fields'}</li>
                )}
                {updateEnabled && (
                  <li>✓ Update access to {updateFields.length > 0 ? `${updateFields.length} specific fields` : 'all fields'}</li>
                )}
                {isAdd && <li>✓ Can add new products</li>}
                {isDelete && <li>✓ Can delete products</li>}
                {isUpdateStock && <li>✓ Can update stock quantities</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleSetDealerPermissions}
          disabled={loading || selectedDealers.length === 0}
          className="bg-red-600 hover:bg-red-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Set Dealer Permissions
        </Button>
        
        {/* <Button
          onClick={handleAddPermissions}
          disabled={loading || !selectedModule || selectedDealers.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Module Permissions
        </Button>
        
        <Button
          onClick={handleUpdatePermissions}
          disabled={loading || !selectedModule || selectedDealers.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Update Module Permissions
        </Button>
        
        <Button
          onClick={handleRemovePermissions}
          disabled={loading || !selectedModule || selectedDealers.length === 0}
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Module Permissions
        </Button> */}
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
