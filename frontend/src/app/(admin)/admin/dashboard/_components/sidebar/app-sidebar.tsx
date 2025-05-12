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
  navMain: [
    {
      title: "Dashboard",
      url: "dashboard",
      icon: LayoutDashboard,
      isActive: true,
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
      title: "Products",
      url: "/admin/dashboard/products",
      icon: Package,
      items: [
        {
          title: "All Products",
          url: "/admin/dashboard/products",
        },
        {
          title: "Add Product",
          url: "/admin/dashboard/products/new",
        },
        {
          title: "Product Reviews",
          url: "/admin/dashboard/products/reviews",
        },
      ],
    },
    {
      title: "Categories",
      url: "/admin/dashboard/categories",
      icon: Tag,
      items: [
        {
          title: "All Categories",
          url: "/admin/dashboard/categories",
        },
        {
          title: "Add Category",
          url: "/admin/dashboard/categories/new",
        },
        {
          title: "Manage Attributes",
          url: "/admin/dashboard/categories/attributes",
        },
      ],
    },
    {
      title: "Orders",
      url: "/admin/dashboard/orders",
      icon: ShoppingCart,
      items: [
        {
          title: "All Orders",
          url: "/admin/dashboard/orders",
        },
        {
          title: "Pending Orders",
          url: "/admin/dashboard/orders/pending",
        },
        {
          title: "Processing Orders",
          url: "/admin/dashboard/orders/processing",
        },
        {
          title: "Completed Orders",
          url: "/admin/dashboard/orders/completed",
        },
        {
          title: "Cancelled Orders",
          url: "/admin/dashboard/orders/cancelled",
        },
      ],
    },
    {
      title: "Vendors",
      url: "/admin/dashboard/vendors",
      icon: Store,
      items: [
        {
          title: "All Vendors",
          url: "/admin/dashboard/vendors",
        },
        {
          title: "Pending Approvals",
          url: "/admin/dashboard/vendors/pending",
        },
        {
          title: "Vendor Payouts",
          url: "/admin/dashboard/vendors/payouts",
        },
      ],
    },
    {
      title: "Users",
      url: "/admin/dashboard/users",
      icon: Home,
      items: [
        {
          title: "All Users",
          url: "/admin/dashboard/users",
        },
        {
          title: "Add User",
          url: "/admin/dashboard/users/new",
        },
        {
          title: "User Roles",
          url: "/admin/dashboard/users/roles",
        },
      ],
    },
    {
      title: "Returns & Refunds",
      url: "/admin/dashboard/returns",
      icon: RefreshCcw,
      items: [
        {
          title: "Return Requests",
          url: "/admin/dashboard/returns/requests",
        },
        {
          title: "Processed Returns",
          url: "/admin/dashboard/returns/processed",
        },
        {
          title: "Refund History",
          url: "/admin/dashboard/returns/refunds",
        },
      ],
    },
    {
      title: "Marketing",
      url: "/admin/dashboard/marketing",
      icon: BarChart3,
      items: [
        {
          title: "Promotions",
          url: "/admin/dashboard/marketing/promotions",
        },
        {
          title: "Coupons",
          url: "/admin/dashboard/marketing/coupons",
        },
        {
          title: "Banners",
          url: "/admin/dashboard/marketing/banners",
        },
      ],
    },
    {
      title: "Content",
      url: "/admin/dashboard/content",
      icon: BookOpen,
      items: [
        {
          title: "Pages",
          url: "/admin/dashboard/content/pages",
        },
        {
          title: "Blog Posts",
          url: "/admin/dashboard/content/blog",
        },
        {
          title: "FAQs",
          url: "/admin/dashboard/content/faqs",
        },
      ],
    },
    {
      title: "Settings",
      url: "/admin/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "General Settings",
          url: "/admin/dashboard/settings/general",
        },
        {
          title: "Payment Methods",
          url: "/admin/dashboard/settings/payments",
        },
        {
          title: "Shipping Options",
          url: "/admin/dashboard/settings/shipping",
        },
        {
          title: "Email Templates",
          url: "/admin/dashboard/settings/emails",
        },
        {
          title: "Tax Configuration",
          url: "/admin/dashboard/settings/taxes",
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
