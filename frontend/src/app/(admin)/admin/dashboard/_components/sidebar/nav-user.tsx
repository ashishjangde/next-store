"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/auth-store"
import { AuthActions } from "@/api-actions/auth-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await AuthActions.logout();
      if (response.data) {
        logout();
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });
        router.push('/');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "rounded-md bg-sidebar-accent/10 border border-sidebar-border/30",
                "data-[state=open]:bg-sidebar-accent/20 data-[state=open]:border-sidebar-border/50",
                "hover:bg-sidebar-accent/15 hover:border-sidebar-border/40",
                "transition-all duration-200 ease-in-out"
              )}
            >
              <Avatar className="h-8 w-8 rounded-md border border-sidebar-border/20">
                <AvatarImage 
                  src={user.profile_picture || "https://i.pravatar.cc/300"} 
                  alt={user.name} 
                  className="object-cover"
                />
                <AvatarFallback className="rounded-md bg-sidebar-primary/10 text-sidebar-primary">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/60">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "bottom"}
            align="end"
            sideOffset={4}
            alignOffset={-4}
          > 
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 focus:bg-accent/80">
                <User className="mr-2 size-4 text-muted-foreground" />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 focus:bg-accent/80">
                <Settings className="mr-2 size-4 text-muted-foreground" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 focus:bg-accent/80">
                <Bell className="mr-2 size-4 text-muted-foreground" />
                <span>Notifications</span>
                <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="my-1" />
            
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 focus:bg-accent/80">
                <Sparkles className="mr-2 size-4 text-amber-500" />
                <span className="font-medium">Upgrade to Pro</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 focus:bg-accent/80">
                <BadgeCheck className="mr-2 size-4 text-muted-foreground" />
                <span>Verification Status</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 focus:bg-accent/80">
                <CreditCard className="mr-2 size-4 text-muted-foreground" />
                <span>Billing</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="my-1" />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
