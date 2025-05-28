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
  Store,
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
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [    {
      title: "Dashboard",
      url: "dashboard",
      icon: LayoutDashboard,
      items: [
        {
          title: "Overview",
          url: "/admin/dashboard",
        },
        {
          title: "Analytics",
          url: "/admin/dashboard/analytics",
        },
        {
          title: "Reports",
          url: "/admin/dashboard/reports",
        },
      ],
    },
    {
      title: "Categories",
      url: "categories",
      icon: Tag,
      items: [
        {
          title: "All Categories",
          url: "/admin/categories",
        }
      ],
    },
    {
      title: "Attributes",
      url: "attributes",
      icon: ClipboardList,
      items: [
        {
          title: "All Attributes",
          url: "/admin/attributes",
        },
        {
          title: "Add Attribute",
          url: "/admin/attributes/new",
        },
      ],
    },
    {
      title: "Vendors",
      url: "vendors",
      icon: Store,
      items: [
        {
          title: "All Vendors",
          url: "/admin/vendors",
        },
        {
          title: "Vendor Payouts",
          url: "/admin/vendors/payouts",
        },
      ],
    },
    {
      title: "Users",
      url: "users",
      icon: Home,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
        {
          title: "Add User",
          url: "/admin/users/new",
        },
        {
          title: "User Roles",
          url: "/admin/users/roles",
        },
      ],
    },
    {
      title: "Marketing",
      url: "marketing",
      icon: BarChart3,
      items: [
        {
          title: "Promotions",
          url: "/admin/marketing/promotions",
        },
        {
          title: "Coupons",
          url: "/admin/marketing/coupons",
        },
        {
          title: "Banners",
          url: "/admin/marketing/banners",
        },
      ],
    },
    {
      title: "Content",
      url: "content",
      icon: BookOpen,
      items: [
        {
          title: "Pages",
          url: "/admin/content/pages",
        },
        {
          title: "Blog Posts",
          url: "/admin/content/blog",
        },
        {
          title: "FAQs",
          url: "/admin/content/faqs",
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
          href="/admin/dashboard" 
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
        {/* <NavUser /> */}
      </SidebarFooter>
      <SidebarRail className="bg-sidebar-accent/10" />
    </Sidebar>
  )
}
