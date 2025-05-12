"use client"

import { AuthActions } from "@/api-actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type LoginInput, LoginSchema } from "@/schema/auth/create-user-schema"
import { useAuthStore } from "@/store/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { Separator } from "@/components/ui/separator"
import { LockKeyhole, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage({ onAuthChange }: { onAuthChange: (value: string) => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const { setUser } = useAuthStore()

  const { mutate, isPending } = useMutation({
    mutationFn: AuthActions.login,
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data)
        router.push("/")
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.apiError?.message
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })



  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginInput) => {
    mutate(data)
  }

  const handleGoogleLogin = () => {
    AuthActions.googleLogin();
  }

  const handleGithubLogin = () => {
    AuthActions.githubLogin();
  }

  const [_, setAuth] = useQueryState("auth", {
    defaultValue: "",
    parse: (value) => value as "" | "login" | "register",
  })

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button
                    variant="link"
                    className="px-0 text-xs text-primary hover:text-primary"
                    onClick={() => onAuthChange("forgot")}
                    type="button"
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input type="password" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-11 bg-primary" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Button
              variant="link"
              className="p-0 text-primary "
              onClick={() => onAuthChange("register")}
            >
              Create an account
            </Button>
          </div>

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
        </form>
      </Form>
    </div>
  );
}
