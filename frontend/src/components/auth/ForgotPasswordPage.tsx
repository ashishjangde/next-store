"use client"

import { AuthActions } from "@/api-actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {KeyRound, Loader2, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import * as z from "zod"

// Define step-specific schemas
const Step1Schema = z.object({
  identifier: z.string().min(3, "Username or email is required"),
})

const Step2Schema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits")
})

const ResetWithHashSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type Step1Type = z.infer<typeof Step1Schema>
type Step2Type = z.infer<typeof Step2Schema>
type ResetWithHashType = z.infer<typeof ResetWithHashSchema>

export default function ForgotPasswordPage({ onAuthChange, hash }: { onAuthChange: (value: string) => void, hash: string | null }) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [identifier, setIdentifier] = useState<string>("")
  const [verificationCode, setVerificationCode] = useState<string>("")

  const handleClose = () => {
    onAuthChange("login")
  }

  // If hash is present, show only the password reset form
  useEffect(() => {
    if (hash) {
      setVerificationCode(hash)
      setStep(3)
    }
  }, [hash])

  // Step 1: Request Password Reset
  const step1Form = useForm<Step1Type>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      identifier: "",
    },
  })

  // Step 2: Verify Code
  const step2Form = useForm<Step2Type>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      code: "",
    },
  })

  // Reset with Hash Form
  const resetWithHashForm = useForm<ResetWithHashType>({
    resolver: zodResolver(ResetWithHashSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Step 1: Request Password Reset
  const requestResetMutation = useMutation({
    mutationFn: AuthActions.forgotPassword,
    onSuccess: (response) => {
      if (response?.data?.message) {
        toast({
          title: "Check your email",
          description: response.data.message,
        })
        setStep(2)
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.apiError?.errors
        ? Object.values(error.response.data.apiError.errors)[0]
        : error?.response?.data?.apiError?.message || "Failed to send reset link"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // Step 2: Verify Code
  const verifyCodeMutation = useMutation({
    mutationFn: AuthActions.verifyVerificationCode,
    onSuccess: (response) => {
      if (response?.data) {
        toast({
          title: "Success",
          description: "Code verified successfully",
        })
        setStep(3)
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.apiError?.errors
        ? Object.values(error.response.data.apiError.errors)[0]
        : error?.response?.data?.apiError?.message || "Invalid verification code"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // Reset Password with Hash or Code
  const resetPasswordMutation = useMutation({
    mutationFn: (data: { password: string }) => 
      AuthActions.resetPassword({ 
        identifier,
        verification_code: verificationCode,
        password: data.password 
      }),
    onSuccess: (response) => {
      if (response?.data?.message) {
        toast({
          title: "Success",
          description: "Password reset successful. Please login with your new password.",
        })
        onAuthChange("login")
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.apiError?.errors
        ? Object.values(error.response.data.apiError.errors)[0]
        : error?.response?.data?.apiError?.message || "Failed to reset password"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (data: Step1Type | Step2Type | ResetWithHashType) => {
    if (!hash && step === 1) {
      const { identifier: id } = data as Step1Type
      setIdentifier(id)
      requestResetMutation.mutate({ identifier: id })
    } else if (step === 2) {
      const { code } = data as Step2Type
      setVerificationCode(code)
      verifyCodeMutation.mutate({ 
        identifier, 
        verification_code: code 
      })
    } else if (step === 3) {
      const { password } = data as ResetWithHashType
      resetPasswordMutation.mutate({ password })
    }
  }

  const getStepTitle = () => {
    if (hash) return "Reset Password"
    switch (step) {
      case 1:
        return "Reset Password"
      case 2:
        return "Enter Verification Code"
      case 3:
        return "New Password"
      default:
        return "Reset Password"
    }
  }

  const isPending = requestResetMutation.isPending || verifyCodeMutation.isPending || resetPasswordMutation.isPending

  const getButtonText = () => {
    if (isPending) return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </>
    )
    if (hash) return "Reset Password"
    switch (step) {
      case 1:
        return "Send Reset Code"
      case 2:
        return "Verify Code"
      case 3:
        return "Reset Password"
      default:
        return "Continue"
    }
  }

  // If we have a hash, only show the password reset form
  if (hash) {
    return (
      <div className="space-y-6">
        <Form {...resetWithHashForm}>
          <form onSubmit={resetWithHashForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={resetWithHashForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input type="password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetWithHashForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input type="password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isPending}
            >
              {getButtonText()}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Remember your password?{' '}
          <Button
            variant="link"
            className="p-0 text-primary"
            onClick={handleClose}
          >
            Sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{getStepTitle()}</span>
          <div className="w-8" />
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>

      {step === 1 && (
        <Form {...step1Form}>
          <form onSubmit={step1Form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={step1Form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="johndoe or john@example.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isPending}
            >
              {getButtonText()}
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={step2Form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      maxLength={6}
                      placeholder="Enter 6-digit code" 
                      className="text-center tracking-widest text-lg"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isPending}
            >
              {getButtonText()}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => step1Form.handleSubmit(onSubmit)()}
                disabled={isPending}
              >
                Didn't receive code? Send again
              </Button>
            </div>
          </form>
        </Form>
      )}

      {step === 3 && !hash && (
        <Form {...resetWithHashForm}>
          <form onSubmit={resetWithHashForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={resetWithHashForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input type="password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetWithHashForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input type="password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isPending}
            >
              {getButtonText()}
            </Button>
          </form>
        </Form>
      )}

      <div className="text-center text-sm">
        Remember your password?{' '}
        <Button
          variant="link"
          className="p-0 text-primary"
          onClick={handleClose}
        >
          Sign in
        </Button>
      </div>
    </div>
  )
}