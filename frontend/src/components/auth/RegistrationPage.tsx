"use client"

import { AuthActions } from "@/api-actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type CreateUserInput, CreateUserSchema } from "@/schema/auth-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { useMutation } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { Separator } from "@/components/ui/separator"
import { AtSign, Camera, LockKeyhole, Mail, User, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
// import { useRouter } from "next/navigation"

export default function RegistrationPage({ onAuthChange }: { onAuthChange: (value: string) => void }) {
  const {toast} = useToast()
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [_, setAuth] = useQueryState("auth", {
    defaultValue: "",
    parse: (value) => value as "" | "login" | "register" | "verify",
  })
  const [__, setIdentifier] = useQueryState("identifier")

  const { isPending, mutate } = useMutation({
    mutationFn: AuthActions.registerUser,
    onSuccess: (response) => {
      if (response?.data) {
        toast({
          title: "Success",
          description: "Registration successful! Please verify your account.",
        })
        setIdentifier(response.data.email)
        setAuth("verify")
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.apiError?.message
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (data: CreateUserInput) => {
    mutate(data)
  }

  const handleGoogleLogin = () => {
    AuthActions.googleLogin();
  }

  const handleGithubLogin = () => {
    AuthActions.githubLogin();
  }

  const nextStep = async () => {
    let canProceed = false;

    if (step === 1) {
      const nameValid = await form.trigger("name");
      const emailValid = await form.trigger("email");
      canProceed = nameValid && emailValid;
    } else if (step === 2) {
      const usernameValid = await form.trigger("username");
      canProceed = usernameValid;
    } else if (step === 3) {
      // Don't validate passwords when just moving to step 3
      canProceed = true;
    }

    if (canProceed && step < totalSteps) {
      setStep(step + 1);
      // Clear any existing password errors when moving to step 3
      if (step === 2) {
        form.clearErrors(["password", "confirmPassword"]);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Personal Information"
      case 2:
        return "Account Details"
      case 3:
        return "Set Password"
      default:
        return "Create Account"
    }
  }

  const getButtonText = () => {
    if (isPending) return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {step === totalSteps ? "Creating account..." : "Processing..."}
      </>
    );
    return step === totalSteps ? "Create account" : "Next step";
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{getStepTitle()}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={nextStep}
            disabled={step === totalSteps}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="John Doe" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input type="email" placeholder="john@example.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 2 && (
            <>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="johndoe" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profile_picture"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Profile Picture (optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Camera className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="file"
                          accept="image/*"
                          className="pl-10"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 3 && (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="password" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="password" 
                          className="pl-10" 
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button 
            type={step === totalSteps ? "submit" : "button"}
            onClick={step !== totalSteps ? (e) => {
              e.preventDefault();
              nextStep();
            } : undefined}
            className="w-full h-11" 
            disabled={isPending}
          >
            {getButtonText()}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 text-primary"
              onClick={() => onAuthChange("login")}
            >
              Sign in
            </Button>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with OAuth</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" onClick={handleGoogleLogin} className="h-11 relative text-gray-950 bg-white hover:bg-white shadow-2xl rounded-full">
                  <FcGoogle className="absolute left-4 h-5 w-5" />
                  <span>Google</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleGithubLogin}
                  className="h-11 relative bg-gray-900 hover:bg-gray-900 text-white shadow-2xl rounded-full"
                >
                  <FaGithub className="absolute left-4 h-5 w-5" />
                  <span>GitHub</span>
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
