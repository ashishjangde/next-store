'use client'

import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SearchBar } from './SearchBar'
import {
  Heart,
  ShoppingCart,
  Store,
  TrendingUp,
  Menu,
  LogIn,
  LayoutDashboard,
  Moon,
  Sun,
  User,
  Settings,
  Package,
  LogOut
} from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuthStore } from '@/store/auth-store'
import { memo, useEffect, useState, useMemo } from 'react'
import AuthWrapper from '@/components/auth/AuthWrapper'
import { AuthActions } from '@/api-actions/auth-actions'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from 'next-themes'

const ProfileDropdown = memo(() => {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const handleLogout = async () => {
    try {
      const response = await AuthActions.logout()
      if (response.data) {
        logout()
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      toast({
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src={user?.profile_picture || "https://i.pravatar.cc/300"} />
          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <User className="w-4 h-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Package className="w-4 h-4" />
          <span>Orders</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span>Appearance</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
                {theme === 'light' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
                {theme === 'dark' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

const MobileMenu = () => {
  const user = useAuthStore(state => state.user)
  const hasRole = useAuthStore(state => state.hasRole)
  const isVendor = useMemo(() => hasRole(['VENDOR']), [hasRole])
  const isAdmin = useMemo(() => hasRole(['ADMIN']), [hasRole])
  const { theme, setTheme } = useTheme()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => setIsClient(true), [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-4 py-4">
          <Link href="/" className="flex items-center px-4 py-2 hover:bg-accent rounded-lg">
            <Logo />
          </Link>
          <div className="px-4">
            <SearchBar />
          </div>
          <nav className="flex flex-col">
            {isAdmin && (
              <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 hover:bg-accent">
                <LayoutDashboard size={20} className="text-primary" />
                <span>Admin Panel</span>
              </Link>
            )}
            {!isVendor && (
              <Link href="/vendor-request" className="flex items-center gap-2 px-4 py-3 hover:bg-accent">
                <Store size={20} />
                <span>Become a Seller</span>
              </Link>
            )}
            {isVendor && (
              <Link href="/vendor/dashboard" className="flex items-center gap-2 px-4 py-3 hover:bg-accent">
                <TrendingUp size={20} className="text-green-600" />
                <span>Dashboard</span>
              </Link>
            )}

            <Link href="/wishlist" className="flex items-center gap-2 px-4 py-3 hover:bg-accent">
              <Heart size={20} />
              <span>Wishlist</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-2 px-4 py-3 hover:bg-accent">
              <div className="relative">
                <ShoppingCart size={20} />
                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 bg-red-600 dark:text-white text-[10px]">8</Badge>
              </div>
              <span>Cart</span>
            </Link>
            {!user && (
              <button className="flex items-center gap-2 px-4 py-3 hover:bg-accent">
                <LogIn size={20} />
                <span>Login</span>
              </button>
            )}
            
            {isClient && (
              <div className="flex items-center justify-between gap-2 px-4 py-3 mt-2 border-t border-border">
                <span>Appearance</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark
                    </>
                  )}
                </Button>
              </div>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function NavbarHome() {
  const user = useAuthStore(state => state.user)
  const hasRole = useAuthStore(state => state.hasRole)
  const isVendor = useMemo(() => hasRole(['VENDOR']), [hasRole])
  const isAdmin = useMemo(() => hasRole(['ADMIN']), [hasRole])

  return (
    <nav className="px-4 md:px-6 py-2 flex fixed top-0 w-full items-center h-[70px] justify-between 
  bg-background/60 backdrop-blur-2xl border-b border-border dark:border-gray-800 z-50 shadow-sm">
      <div className="flex justify-between items-center w-full max-w-[1728px] mx-auto gap-4">
        {/* Mobile menu */}
        <MobileMenu />

        {/* Left section with logo */}
        <div className="flex items-center md:gap-4">
          <Link href="/" className="items-center">
            <Logo />
          </Link>
        </div>

        {/* Center section with search */}
        <div className="hidden md:flex flex-1 justify-center max-w-[720px]">
          <SearchBar />
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Primary navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isAdmin && (
              <Link href="/admin/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-accent text-sm">
                <LayoutDashboard size={18} className="text-primary" />
                <span>Admin Panel</span>
              </Link>
            )}
            {!isVendor && (
              <Link href="/vendor-request" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-accent text-sm">
                <Store size={18} />
                <span>Become a Seller</span>
              </Link>
            )}
            {isVendor && (
              <Link href="/vendor/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-accent text-sm">
                <TrendingUp size={18} className="text-green-600" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block h-8 w-[1px] bg-border mx-2"></div>

          {/* Secondary navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/wishlist" className="hidden md:flex p-2 hover:bg-accent rounded-full">
              <Heart size={20} strokeWidth={1.8} />
            </Link>
            <Link href="/cart" className="hidden md:flex p-2 hover:bg-accent rounded-full relative">
              <ShoppingCart size={20} strokeWidth={1.8} />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 bg-red-600 dark:text-white text-[10px] rounded-full">8</Badge>
            </Link>
            {user ? (
              <ProfileDropdown />
            ) : (
              <AuthWrapper>
                <Button className="flex items-center gap-2 px-4 py-3 rounded-full">
                  <span>Login</span>
                  <LogIn size={20} />
                </Button>
              </AuthWrapper>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
