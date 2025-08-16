"use client"
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog" 
import DynamicButton from "@/components/common/button/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"



interface CreatePickListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePickList({ isOpen, onClose }: CreatePickListProps) {
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Pick List</DialogTitle>
          </DialogHeader>
          <Card>
            <CardTitle>Pick List Details</CardTitle>
            <CardContent>
              <CardDescription>
                Fill in the details to create a new pick list.
              </CardDescription>
            </CardContent>
          </Card>
          <DynamicButton text="Create" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
