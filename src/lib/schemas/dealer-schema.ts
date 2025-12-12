import * as z from "zod"

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
  state: z.string().min(1, "State is required"),
})

const contactPersonSchema = z.object({
  name: z.string().min(1, "Contact person name is required"),
  email: z.string().email("Invalid email format"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
})

const assignedEmployeeSchema = z.object({
  assigned_user: z.string().min(1, "Assigned user is required"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
})

export const dealerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  phone_Number: z.string().min(10, "Phone number must be at least 10 digits"),
  legal_name: z.string().min(1, "Legal name is required"),
  trade_name: z.string().min(1, "Trade name is required"),
  GSTIN: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters"),
  Pan: z.string().min(10, "PAN must be 10 characters").max(10, "PAN must be 10 characters"),
  Address: addressSchema,
  contact_person: contactPersonSchema,
  upload_access_enabled: z.boolean().default(true),
  default_margin: z.number().min(0, "Margin must be positive").max(100, "Margin cannot exceed 100%"),
  last_fulfillment_date: z.string(),
  assigned_Toprise_employee: z.array(assignedEmployeeSchema).length(1, "Exactly one Fulfilment Staff must be assigned"),
  SLA_type: z.string().min(1, "SLA type is required"),
  onboarding_date: z.string(),
  remarks: z.string().optional(),
  brands_allowed: z.array(z.string()).min(1, "At least one brand must be selected"),
})

export type DealerFormValues = z.infer<typeof dealerSchema>
