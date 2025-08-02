"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useToast as useGlobalToast } from "@/components/ui/toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { contactUs } from "@/service/contact-service"

const schema = z.object({
  enquiry_name: z.string().min(1, "Name is required"),
  enquiry_phone: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^\d{10,15}$/, "Invalid phone number (10-15 digits)"),
  enquiry_email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  enquiry_message: z.string().min(1, "Message is required"),
})

type FormValues = z.infer<typeof schema>

interface ContactDialogProps {
  open: boolean
  onClose: () => void
}

export default function ContactDialog({ open, onClose }: ContactDialogProps) {
  const { showToast } = useGlobalToast()
  // Removed isSubmitting state, use formState.isSubmitting

  const { 
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const handleFormSubmit = async (data: FormValues) => {
    try {
      // Send as JSON, not FormData
      const formData = new FormData()
      formData.append("enquiry_name", data.enquiry_name)
      formData.append("enquiry_phone", data.enquiry_phone)
      formData.append("enquiry_email", data.enquiry_email)
      formData.append("enquiry_message", data.enquiry_message)
      await contactUs(data)
      showToast("Contact sent successfully!", "success")
      reset()
      try {
        onClose()
      } catch (e) {
        // Safe fallback if onClose fails
        console.error("onClose error:", e)
      }
    } catch (error: any) {
      console.error("Contact form error:", error)
    showToast("Failed to send contact form. Please try again.", "error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">Contact Us</DialogTitle>
          {/* <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="enquiry_name">Name</Label>
            <Input 
              id="enquiry_name" 
              placeholder="Full Name" 
              {...register("enquiry_name")}
            />
            {errors.enquiry_name && (
              <p className="text-sm text-red-500">{errors.enquiry_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquiry_phone">Mobile Number</Label>
            <Input 
              id="enquiry_phone" 
              type="tel" 
              placeholder="Enter Your Mobile Number" 
              {...register("enquiry_phone")}
            />
            {errors.enquiry_phone && (
              <p className="text-sm text-red-500">{errors.enquiry_phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquiry_email">Email</Label>
            <Input 
              id="enquiry_email" 
              type="email" 
              placeholder="Enter your email address" 
              {...register("enquiry_email")}
            />
            {errors.enquiry_email && (
              <p className="text-sm text-red-500">{errors.enquiry_email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquiry_message">Message</Label>
            <Textarea
              id="enquiry_message"
              placeholder="Enter Message"
              className="min-h-[120px]"
              {...register("enquiry_message")}
            />
            {errors.enquiry_message && (
              <p className="text-sm text-red-500">{errors.enquiry_message.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Contact Us"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}