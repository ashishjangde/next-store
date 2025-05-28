import { z } from "zod";

// Schema for updating user profile
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),
  
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .regex(
      /^[a-zA-Z0-9._]{3,30}$/,
      "Username can only contain letters, numbers, dots and underscores, and must be between 3-30 characters"
    )
    .optional(),
  
  email: z
    .string()
    .email("Please provide a valid email address")
    .optional(),
});

// Schema for changing password
export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  
  confirmPassword: z
    .string()
    .min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirm password do not match",
  path: ["confirmPassword"],
});

// Schema for profile picture upload
export const ProfilePictureSchema = z.object({
  profile_picture: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only JPEG, PNG and WebP files are allowed"
    ),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ProfilePictureInput = z.infer<typeof ProfilePictureSchema>;