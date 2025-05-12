'use client';
import GlobalQueryClientProvider from "./GlobalQueryClientProvider"
import { ThemeProvider } from "@/components/context/ThemeProvider";
import { AuthInitializer } from "../auth/AuthInitializer";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from "@/components/ui/toaster"

export default function GlobalContextProvider({
  children
}: {
  children: Readonly<React.ReactNode>
}) {
  return (
    <NuqsAdapter>
      <AuthInitializer>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >
          <GlobalQueryClientProvider>
            {children}
            <Toaster />
          </GlobalQueryClientProvider>
        </ThemeProvider>
      </AuthInitializer>
    </NuqsAdapter>
  )
}
