"use client"

import type React from "react"
import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge" 
interface CreateModuleModalProps {
  children: React.ReactNode 
}

export function CreateModuleModal({ children }: CreateModuleModalProps) {
  const [open, setOpen] = useState(false)
  const [moduleName, setModuleName] = useState("")
  const [roles, setRoles] = useState<string[]>([])
  const [currentRoleInput, setCurrentRoleInput] = useState("")

  const handleAddRole = () => {
    if (currentRoleInput.trim() && !roles.includes(currentRoleInput.trim())) {
      setRoles([...roles, currentRoleInput.trim()])
      setCurrentRoleInput("")
    }
  }

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles(roles.filter((role) => role !== roleToRemove))
  }

  const handleSave = () => {
    // Here you would typically send the moduleName and roles to your backend
    console.log("Saving Module:", { module: moduleName, roles })
    // Reset form and close modal
    setModuleName("")
    setRoles([])
    setCurrentRoleInput("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold">Create Module</DialogTitle>
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
              placeholder="e.g., Products"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-input" className="text-base font-medium">
              Roles
            </Label>
            <div className="flex gap-2">
              <Input
                id="role-input"
                placeholder="Add a role (e.g., admin)"
                value={currentRoleInput}
                onChange={(e) => setCurrentRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddRole()
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddRole}
                className="border-[var(--new-300)] text-[var(--new-300)] hover:bg-[var(--new-50)] hover:text-[var(--new-400)] bg-transparent"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="pr-1">
                  {role}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveRole(role)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white py-2 text-lg font-semibold"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )
}
