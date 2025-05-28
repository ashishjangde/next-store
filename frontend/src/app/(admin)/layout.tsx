'use client'
import { ScrollArea } from "@/components/ui/scroll-area";
import SideBarIndex from "./admin/_components/sidebar";
import { withAuth } from "@/components/custom/withAuth";

function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden w-full h-full">
      <SideBarIndex>
        <div className="relative w-full">
          <ScrollArea className="md:h-[calc(100vh-64px)] w-full">
            <div className="p-2">
              {children}
              </div>
          </ScrollArea>
        </div>
      </SideBarIndex>
    </div>
  )
}


export default withAuth(VendorLayout, {
  allowedRoles:['ADMIN']
})