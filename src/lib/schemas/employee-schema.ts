// lib/schemas/employee-schema.ts
import { z } from "zod";

export const employeeSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ),
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must not exceed 50 characters"),
  mobileNumber: z
    .string()
    .min(1, "Mobile Number is required")
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian mobile number starting with 6-9"
    ),
  role: z.string().min(1, "Role is required"),
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .regex(/^[A-Z0-9-]+$/, "Employee ID must contain only uppercase letters, numbers, and hyphens"),
  fullName: z
    .string()
    .min(1, "Full Name is required")
    .min(2, "Full Name must be at least 2 characters")
    .max(100, "Full Name must not exceed 100 characters")
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      "Full Name can only contain letters, spaces, and basic punctuation (. ' -)"
    ),
  profile_image: z.instanceof(File).optional(),
  roleDescription: z.string().optional(),
  accessLevel: z.string().optional(),
  assignedDealer: z.string().optional(),
  assignedRegion: z.array(z.string()).optional(),
  remarks: z.string().optional(),
  auditTrail: z.string().optional(),
  sendLoginInvite: z.boolean().optional(),
  temporaryPassword: z.string().optional(),
  currentStatus: z.string().optional(),
  lastLogin: z.string().optional(),
  createdBy: z.string().optional(),
  assignedOrdersPicklists: z.array(z.string()).optional(),
  slaType: z.string().optional(),
  slaMaxDispatchTime: z.string().optional(),

  // Optional file upload for profile image
  // profile_image is handled separately as a File object, not part of the Zod schema for form inputs
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
