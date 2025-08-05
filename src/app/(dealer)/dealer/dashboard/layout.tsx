'use client';

import { Inter, DM_Serif_Display } from "next/font/google";
import { Separator } from "@/components/ui/separator"
import { useAppSelector } from "@/store/hooks";

import { WithProtectionRoute } from "@/components/protectionRoute";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dealer-sidebar";
import { DynamicBreadcrumb } from "@/components/dealer-dashboard/DynamicBreadcrumbdealer";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 
  return (
    <WithProtectionRoute redirectTo="/login">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DynamicBreadcrumb />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </WithProtectionRoute>
  );
}
