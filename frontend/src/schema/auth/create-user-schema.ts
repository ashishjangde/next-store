import { z } from "zod";

export const CreateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    profile_picture: z
        .any()
        .optional()
        .refine(
            (file) => !file || file instanceof File,
            "Invalid file"
        ),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain uppercase, lowercase, number and special character"
        ),
    confirmPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain uppercase, lowercase, number and special character"
        ),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const LoginSchema = z.object({
    identifier: z.string().min(3, "Username or email is required"),
    password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number and special character"
    )
});

export const VerifyUserSchema = z.object({
    verification_code: z
        .string()
        .min(6, "Verification code must be at least 6 characters")
        .max(6, "Verification code must be at most 6 characters"),
});


// This type represents what we validate in the form
export type VerifyUserFormData = z.infer<typeof VerifyUserSchema>;

export const ForgotPassowrdSchema = z.object({
    identifier: z.string().min(3, "Username or email is required"),
})

export const VerifiyVerificationCodeSchema = z.object({
    identifier: z.string().min(3, "Username or email is required"),
    verification_code: z.string().length(6, "Verification code must be exactly 6 characters"),
});

export const ResetPasswordSchma = z.object({
    identifier: z.string().min(3, "Username or email is required"),
    verification_code: z.string().length(6, "Verification code must be exactly 6 characters"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain uppercase, lowercase, number and special character"
        )
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export interface VerifyUserinput {
    identifier: string;
    verification_code: string;
}
export type ForgotPassowrdInput = z.infer<typeof ForgotPassowrdSchema>;
export type VerifiyVerificationCodeSchema = z.infer<typeof VerifiyVerificationCodeSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchma>

