import { z } from "zod"

export const employeeSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee ID is required." }),
  fullName: z.string().min(1, { message: "Full Name is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  designation: z.string().min(1, { message: "Designation is required." }),
  // uploadImage: z.any().optional(), // For file uploads, validation might be more complex

  mobileNumber: z
    .string()
    .min(10, { message: "Mobile Number must be at least 10 digits." })
    .max(15, { message: "Mobile Number cannot exceed 15 digits." }),
  email: z.string().email({ message: "Invalid email address." }),

  role: z.string().min(1, { message: "Role is required." }),
  roleDescription: z.string().optional(),
  accessLevel: z.string().min(1, { message: "Access Level is required." }),

  assignedDealer: z.string().optional(),
  assignedRegion: z.string().optional(),

  remarks: z.string().optional(),
  auditTrail: z.string().optional(), // This will be read-only

  sendLoginInvite: z.boolean(),
  temporaryPassword: z.string().optional(),
  currentStatus: z.string().min(1, { message: "Current Status is required." }),
  lastLogin: z.string().optional(), // This will be read-only
  createdBy: z.string().optional(), // This will be read-only

  assignedOrdersPicklists: z.string().optional(), // This will be read-only
  slaType: z.string().optional(),
  slaMaxDispatchTime: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.sendLoginInvite && (!data.temporaryPassword || data.temporaryPassword.length < 6)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Temporary Password is required and must be at least 6 characters if login invite is sent.",
      path: ["temporaryPassword"],
    });
  }
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>
