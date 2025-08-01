"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContactDialogContextType {
  openContactDialog: () => void
  closeContactDialog: () => void
}

const ContactDialogContext = createContext<ContactDialogContextType | undefined>(undefined)

export function useContactDialog() {
  const context = useContext(ContactDialogContext)
  if (!context) {
    throw new Error("useContactDialog must be used within a ContactDialogProvider")
  }
  return context
}

export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openContactDialog = () => setOpen(true)
  const closeContactDialog = () => setOpen(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted")
    setOpen(false)
  }

  return (
    <ContactDialogContext.Provider value={{ openContactDialog, closeContactDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-xl font-semibold">Contact Us</DialogTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={closeContactDialog}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input id="name" placeholder="Full Name" className="w-full" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile Number
              </Label>
              <Input id="mobile" type="tel" placeholder="Enter Your Mobile Number" className="w-full" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input id="email" type="email" placeholder="Enter your email address" className="w-full" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Enter Message"
                className="min-h-[120px] w-full resize-none border-2 border-blue-400 focus:border-blue-500"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3">
              Contact Us
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </ContactDialogContext.Provider>
  )
}
