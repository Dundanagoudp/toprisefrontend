import { z } from "zod"

export const dealerSchema = z.object({
  dealerId: z.string().min(1, { message: "Dealer ID is required." }),
  legalName: z.string().min(1, { message: "Legal Name is required." }),
  tradeName: z.string().min(1, { message: "Trade Name is required." }),

  gstin: z.string().optional(),
  pan: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),

  address: z.string().min(1, { message: "Address is required." }),
  contactPerson: z.string().min(1, { message: "Contact Person is required." }),
  mobileNumber: z
    .string()
    .min(10, { message: "Mobile Number must be at least 10 digits." })
    .max(15, { message: "Mobile Number cannot exceed 15 digits." }),
  email: z.string().email({ message: "Invalid email address." }),

  isActive: z.string().min(1, { message: "Please specify if dealer is active." }),
  productCategoriesAllowed: z.string().optional(),
  uploadAccessEnabled: z.string().min(1, { message: "Please specify upload access." }),
  certifications: z.string().optional(),

  defaultMargin: z.string().optional(),
  slaType: z.string().optional(),
  slaMaxDispatchTime: z.string().optional(),

  lastUploadDate: z.string().optional(), // Read-only
  lastFulfillmentDate: z.string().optional(), // Read-only

  assignedTopriseEmployee: z.string().optional(),
  onboardingDate: z.string().optional(),
  remarks: z.string().optional(),
})

export type DealerFormValues = z.infer<typeof dealerSchema>
