"use client"

import * as React from "react"
import {
  BarChart3,
  BookOpen,
  Box,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Package,
  RefreshCcw,
  RotateCw,
  Settings2,
  ShoppingCart,
  Tag,
  UploadCloud,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import Logo from "@/components/Logo"
import Link from "next/link"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/vendor/dashboard",
        },
        {
          title: "Sales Analytics",
          url: "/vendor/dashboard/analytics",
        },
      ],
    },
    {
      title: "Product Management",
      url: "/vendor/dashboard/products",
      icon: Package,
      items: [
        {
          title: "View Products",
          url: "/vendor/products",
        },
        {
          title: "Add New Product",
          url: "/vendor/products/new",
        }
      ],
    },
    {
      title: "Orders Management",
      url: "/vendor/orders",
      icon: ShoppingCart,
      items: [
        {
          title: "New Orders",
          url: "/vendor/orders/new",
        },
        {
          title: "Shipped Orders",
          url: "/vendor/orders/shipped",
        },
        {
          title: "Completed Orders",
          url: "/vendor/orders/completed",
        },
        {
          title: "Cancelled/Returned",
          url: "/vendor/orders/cancelled",
        },
        {
          title: "Shipping Labels",
          url: "/vendor/orders/shipping-labels",
        },
      ],
    },
    {
      title: "Payments & Settlements",
      url: "/vendor/payments",
      icon: CreditCard,
      items: [
        {
          title: "View Earnings",
          url: "/vendor/payments/earnings",
        },
        {
          title: "Payment Cycle",
          url: "/vendor/payments/cycle",
        },
        {
          title: "Download Reports",
          url: "/vendor/payments/reports",
        },
      ],
    },
    {
      title: "Returns & Claims",
      url: "/vendor/returns",
      icon: RefreshCcw,
      items: [
        {
          title: "View Returns",
          url: "/vendor/returns/list",
        },
        {
          title: "Manage Disputes",
          url: "/vendor/returns/disputes",
        },
      ],
    },
    {
      title: "Settings",
      url: "/vendor/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile Settings",
          url: "/vendor/settings/profile",
        },
        {
          title: "Store Settings",
          url: "/vendor/settings/store",
        },
        {
          title: "Payment Settings",
          url: "/vendor/settings/payment",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur-sm" 
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border/50">
        <Link 
          href="/vendor/dashboard" 
          className="flex items-center px-1 rounded-lg 
                    transition-colors duration-200 ease-in-out
                    text-sidebar-primary hover:text-sidebar-primary/90 
                    focus-visible:outline-none focus-visible:ring-1 
                    focus-visible:ring-sidebar-ring"
        >
          {
            open ? (
              <Logo />
            ) : (
              <h1 className="text-sidebar-primary text-xl font-semibold tracking-tight">
                NS
              </h1>
            )
          }
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
      </SidebarFooter>
      <SidebarRail className="bg-sidebar-accent/10" />
    </Sidebar>
  )
}
