'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function Breadcrumbs() {
  const pathname = usePathname()

  const generateBreadcrumbs = () => {
    // Remove any query parameters
    const pathWithoutQuery = pathname.split("?")[0]

    // Split pathname into segments
    const segments = pathWithoutQuery.split("/").filter((segment) => segment)

    // Generate breadcrumb items
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
      const isLastItem = index === segments.length - 1

      return {
        href,
        label,
        isLastItem,
      }
    })
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link 
              href="/admin/dashboard" 
              className={cn(
                "flex h-7 items-center justify-center rounded-md px-2",
                "text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent/15 hover:text-sidebar-primary",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
            >
              <Home className="size-3.5 text-muted-foreground" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="size-3 text-muted-foreground/70" />
        </BreadcrumbSeparator>
        
        {breadcrumbs
          .filter(breadcrumb => !['admin', 'dashboard'].includes(breadcrumb.label.toLowerCase()))
          .map((breadcrumb, index, filteredBreadcrumbs) => (
            <BreadcrumbItem key={breadcrumb.href}>
              {breadcrumb.isLastItem || index === filteredBreadcrumbs.length - 1 ? (
                <BreadcrumbPage 
                  className={cn(
                    "h-7 rounded-md px-2 py-1 text-sm",
                    "font-medium text-foreground",
                    "inline-flex items-center"
                  )}
                >
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink
                    asChild
                    className={cn(
                      "inline-flex h-7 items-center justify-center rounded-md px-2 py-1",
                      "text-sm font-medium text-muted-foreground transition-colors",
                      "hover:bg-accent/50 hover:text-accent-foreground",
                      "data-[active]:bg-accent/50 data-[active]:text-accent-foreground"
                    )}
                  >
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                  
                  <BreadcrumbSeparator>
                    <ChevronRight className="size-3 text-muted-foreground/70" />
                  </BreadcrumbSeparator>
                </>
              )}
            </BreadcrumbItem>
          ))
        }
      </BreadcrumbList>
    </Breadcrumb>
  )
}