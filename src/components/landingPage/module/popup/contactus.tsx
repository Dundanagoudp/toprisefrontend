"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactUs } from "@/service/contact-service"



interface ContactFormValues {
    open : boolean;
    onClose: () => void;
    form: {
        name: string;
        email: string;
        message: string;
    };
}
const schema = z.object({
    enquiry_name: z.string().min(1, "Name is required"),
    enquiry_mobile: z.string().min(1, "Mobile number is required"),
    enquiry_email: z.string().email("Invalid email address").min(1, "Email is required"),
    enquiry_message: z.string().min(1, "Message is required"),
})
type FormValues = z.infer<typeof schema>;

export default function ContactDialog({open ,onClose }: ContactFormValues) {
  const { showToast } = useGlobalToast();


    const {  register,
      handleSubmit,
      setValue,
      formState: { errors },
      } = useForm<FormValues>({
      resolver: zodResolver(schema) as any,
    });

const handleFormSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("enquiry_name", data.enquiry_name);
    formData.append("enquiry_mobile", data.enquiry_mobile);
    formData.append("enquiry_email", data.enquiry_email);
    formData.append("enquiry_message", data.enquiry_message);

    await contactUs(formData);
    console.log("Contact form submitted successfully", data);

    onClose();
  }

  return (
    // <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Dialog open={open} onOpenChange={onClose}>
    
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-xl font-semibold">Contact Us</DialogTitle>

          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input id="name" placeholder="Full Name" className="w-full" required
                {...register("enquiry_name")}
              />
              {errors.enquiry_name && (
                <span className="text-red-500 text-xs">{errors.enquiry_name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile Number
              </Label>
              <Input id="mobile" type="tel" placeholder="Enter Your Mobile Number" className="w-full" required
                {...register("enquiry_mobile")}
              />
              {errors.enquiry_mobile && (
                <span className="text-red-500 text-xs">{errors.enquiry_mobile.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input id="email" type="email" placeholder="Enter your email address" className="w-full" required
                {...register("enquiry_email")}
              />
              {errors.enquiry_email && (
                <span className="text-red-500 text-xs">{errors.enquiry_email.message}</span>
              )}
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
                {...register("enquiry_message")}

            
                
              />
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3">
              Contact Us
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    // </div>
  )
}
