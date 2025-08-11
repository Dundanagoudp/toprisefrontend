"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditPermissionModalProps {
  children: React.ReactNode 
}

export function EditPermissionModal({ children }: EditPermissionModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold">Edit Permission</DialogTitle>
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
            <Label htmlFor="allowed-fields" className="text-base font-medium">
              Allowed Fields
            </Label>
            <Select>
              <SelectTrigger id="allowed-fields" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
                {/* Add more allowed fields options as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="permission" className="text-base font-medium">
              Permission
            </Label>
            <Select>
              <SelectTrigger id="permission" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
                <SelectItem value="read-write-update">Read/Write/Update</SelectItem>
                <SelectItem value="none">None</SelectItem>
                {/* Add more permission options as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white py-2 text-lg font-semibold"
          onClick={() => setOpen(false)} 
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )
}
