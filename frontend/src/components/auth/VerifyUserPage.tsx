"use client"

import { AuthActions } from "@/api-actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { VerifyUserSchema, type VerifyUserFormData } from "@/schema/auth-schema"
import { useAuthStore } from "@/store/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { useEffect } from "react"

export default function VerifyUserPage({ onAuthChange }: { onAuthChange: (value: string) => void }) {
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  const [identifier] = useQueryState("identifier")

  const verifyMutation = useMutation({
    mutationFn: (data: { verification_code: string }) => {
      if (!identifier) throw new Error("No identifier provided");
      return AuthActions.verifyUser({
        identifier,
        verification_code: data.verification_code,
      });
    },
    onSuccess: (response) => {
      if (response?.data) {
        setUser(response.data)
        toast({
          title: "Success",
          description: "Your account has been verified. Welcome!",
        })
        onAuthChange("")
      }
    },
    onError: (error :any) =>{
      const errorMessage = error?.response?.data?.apiError?.message
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  })

  const form = useForm<VerifyUserFormData>({
    resolver: zodResolver(VerifyUserSchema),
    defaultValues: {
      verification_code: "",
    },
  })

  useEffect(() => {
    if (!identifier) {
      toast({
        title: "Error",
        description: "No identifier provided. Please try registering again.",
        variant: "destructive",
      })
      onAuthChange("register")
    }
  }, [identifier, onAuthChange, toast])

  const onSubmit = (data: VerifyUserFormData) => {
    if (!identifier) return;
    verifyMutation.mutate(data);
  }

  if (!identifier) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="verification_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Enter verification code" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-11" 
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </Button>

          <div className="text-center text-sm">
            Already verified?{' '}
            <Button
              variant="link"
              className="p-0 text-primary"
              onClick={() => onAuthChange("login")}
            >
              Sign in
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}