"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Platform</SidebarGroupLabel>      <SidebarMenu>
        {items.map((item) => {
          // Check if current path matches this navigation item
          const isItemActive = item.isActive || 
            pathname.includes(`/vendor/${item.url}`) ||
            item.items?.some(subItem => pathname === subItem.url)
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={cn(
                      "transition-colors duration-200 ease-in-out",
                      isItemActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary focus-visible:text-primary active:text-primary" 
                        : "hover:bg-sidebar-accent/20 hover:text-primary active:bg-sidebar-accent/30"
                    )}
                  >
                    {item.icon && (
                      <item.icon className={cn(
                        "size-5",
                        isItemActive ? "text-primary" : "text-sidebar-foreground/70"
                      )} />
                    )}
                    <span className={cn(
                      "font-medium",
                      isItemActive ? "text-primary" : "text-sidebar-foreground"
                    )}>
                      {item.title}
                    </span>
                    <ChevronRight className={cn(
                      "ml-auto size-4 transition-transform duration-200",
                      isItemActive 
                        ? "text-primary/70 group-data-[state=open]/collapsible:rotate-90" 
                        : "text-sidebar-foreground/50 group-data-[state=open]/collapsible:rotate-90"
                    )} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-in fade-in-10 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubItemActive = pathname === subItem.url
                      
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link 
                              href={subItem.url}
                              className={cn(
                                "w-full rounded-md px-2 py-1.5 text-sm",
                                "transition-colors duration-200 ease-in-out",
                                isSubItemActive 
                                  ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary focus:text-primary focus-visible:text-primary active:text-primary data-[active=true]:text-primary" 
                                  : "text-sidebar-foreground hover:bg-sidebar-accent/15 hover:text-primary"
                              )}
                              data-active={isSubItemActive}
                            >
                              {isSubItemActive && (
                                <motion.div
                                  layoutId="active-nav-item"
                                  className="absolute left-0 top-0 h-full w-1 rounded-r-sm bg-primary"
                                />
                              )}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
