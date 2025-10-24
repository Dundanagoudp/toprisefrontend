"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
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
  enquiry_email: z.string().min(1, "Email is required").email("Invalid email address"),
  enquiry_message: z.string().min(1, "Message is required"),
})

type FormValues = z.infer<typeof schema>

export default function ContactPage() {
  const { showToast } = useGlobalToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = useCallback(
    async (data: FormValues) => {
      try {
        await contactUs(data)
        showToast("Message sent successfully!", "success")
        reset()
      } catch (err) {
        console.error(err)
        showToast("Failed to send. Try again.", "error")
      }
    },
    [reset, showToast]
  )

  return (
    <main className="bg-neutral-100 py-16 px-6 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left side text */}
        <section className="space-y-6 lg:pr-8 text-center lg:text-left">
          <h1 className="h2 text-neutral-1000">Get in Touch</h1>
          <p className="b2 text-neutral-700 max-w-md mx-auto lg:mx-0">
            We'd love to hear from you. Fill out the form and our team will get back to you as soon
            as possible.
          </p>
          <div className="space-y-2">
            <p className="b3 text-neutral-800">📞 +91 98765 43210</p>
            <p className="b3 text-neutral-800">✉️ support@example.com</p>
          </div>
        </section>

        {/* Right side form */}
        <section className="bg-white rounded-xl shadow-md p-8 lg:ml-4 w-full max-w-lg mx-auto lg:mx-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="enquiry_name" className="py-2">Name</Label>
              <Input
                id="enquiry_name"
                placeholder="Your name"
                {...register("enquiry_name")}
                disabled={isSubmitting}
              />
              {errors.enquiry_name && (
                <p className="text-sm text-red-600 mt-1">{errors.enquiry_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="enquiry_phone" className="py-2">Mobile</Label>
              <Input
                id="enquiry_phone"
                type="tel"
                placeholder="10–15 digit number"
                {...register("enquiry_phone")}
                disabled={isSubmitting}
              />
              {errors.enquiry_phone && (
                <p className="text-sm text-red-600 mt-1">{errors.enquiry_phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="enquiry_email" className="py-2">Email</Label>
              <Input
                id="enquiry_email"
                type="email"
                placeholder="you@example.com"
                {...register("enquiry_email")}
                disabled={isSubmitting}
              />
              {errors.enquiry_email && (
                <p className="text-sm text-red-600 mt-1">{errors.enquiry_email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="enquiry_message" className="py-2" >Message</Label>
              <Textarea
                id="enquiry_message"
                placeholder="Write your message..."
                className="min-h-[120px]"
                {...register("enquiry_message")}
                disabled={isSubmitting}
              />
              {errors.enquiry_message && (
                <p className="text-sm text-red-600 mt-1">{errors.enquiry_message.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
