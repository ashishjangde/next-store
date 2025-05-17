import { z } from "zod";

// Define vendor status enum to match backend
export const VendorStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);

// Schema for creating a new vendor
export const CreateVendorSchema = z.object({
  gst_number: z
    .string()
    .min(1, "GST number is required")
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Please provide a valid GST number format"
    ),
  pan_number: z
    .string()
    .min(1, "PAN number is required")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please provide a valid PAN number format"),
  shop_name: z.string().min(1, "Shop name is required"),
  shop_address: z.string().min(1, "Shop address is required"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"),
});

// Schema for updating vendor information
export const UpdateVendorSchema = z.object({
  shop_name: z.string().min(1, "Shop name is required").optional(),
  shop_address: z.string().min(1, "Shop address is required").optional(),
  phone_number: z
    .string()
    .regex(/^[0-9]{10}$/, "Please provide a valid 10-digit phone number")
    .optional(),
});

// Schema for updating vendor status (admin only)
export const UpdateVendorStatusSchema = z.object({
  status: VendorStatusEnum,
});



export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>;
export type UpdateVendorStatusInput = z.infer<typeof UpdateVendorStatusSchema>;
