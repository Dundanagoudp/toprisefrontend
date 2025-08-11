"use client"

import type React from "react"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface AddRoleModalProps {
  children: React.ReactNode // To allow the button to trigger the modal
}

export function AddRoleModal({ children }: AddRoleModalProps) {
  const [open, setOpen] = useState(false)

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
            <Select>
              <SelectTrigger id="module-name" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dealer">Dealer</SelectItem>
                <SelectItem value="order-management">Order Management</SelectItem>
                <SelectItem value="employee-management">Employee Management</SelectItem>
                {/* Add more modules as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-base font-medium">
              Role
            </Label>
            <Select>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="inventory-admin">Inventory Admin</SelectItem>
                <SelectItem value="dealer-role">Dealer</SelectItem>
                {/* Add more roles as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white py-2 text-lg font-semibold"
          onClick={() => setOpen(false)} // Close modal on save for now
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )
}
