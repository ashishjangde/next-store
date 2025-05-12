"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useQueryState } from "nuqs"
import LoginPage from "./LoginPage"
import RegistrationPage from "./RegistrationPage"
import ForgotPasswordPage from "./ForgotPasswordPage"
import VerifyUserPage from "./VerifyUserPage"
import { ShoppingBag } from "lucide-react"
import Logo from "../Logo"
export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Consolidated useQueryState for auth and hash
  const [auth, setAuth] = useQueryState("auth", {
    defaultValue: "",
    parse: (value) => value as "" | "login" | "register" | "forgot" | "verify",
  })
  const [hash, setHash] = useQueryState("hash")
  const [_, setIdentifier] = useQueryState("identifier")

  const handleClose = () => {
    setAuth("")
    setHash(null)
    setIdentifier(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
  }

  // Pass auth and setAuth as props to child components
  const authProps = {
    auth,
    onAuthChange: setAuth,
    hash,
  }

  const getTitle = () => {
    switch (auth) {
      case "register":
        return "Create an Account"
      case "forgot":
        return "Reset Password"
      case "verify":
        return "Verify Account"
      default:
        return "Welcome Back"
    }
  }

  const getDescription = () => {
    switch (auth) {
      case "register":
        return "Sign up to access exclusive deals and track your orders"
      case "forgot":
        return "Follow the steps to reset your password"
      case "verify":
        return "Enter the verification code sent to your email"
      default:
        return "Sign in to your account to continue shopping"
    }
  }

  return (
    <Dialog
      open={!!auth}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild onClick={() => setAuth("login")}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <Logo />
        </div>
        <DialogHeader className="space-y-3 text-center">
          <DialogTitle className="text-2xl font-bold">
            {getTitle()}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {getDescription()}
          </p>
        </DialogHeader>
        <div className="mt-6">
          {auth === "register" ? (
            <RegistrationPage {...authProps} />
          ) : auth === "forgot" ? (
            <ForgotPasswordPage {...authProps} />
          ) : auth === "verify" ? (
            <VerifyUserPage {...authProps} />
          ) : (
            <LoginPage {...authProps} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
