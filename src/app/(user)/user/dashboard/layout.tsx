'use client';

import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/user-dashboard/DynamicBreadcrumb";
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { WithProtectionRoute } from "@/components/protectionRoute";
import { useState } from "react";
import { Bell } from "lucide-react";
import { NotificationsPanel } from "@/components/notifications/modules/notifications-panel";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
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
            <div className="ml-auto px-4">
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative rounded-full p-2 hover:bg-gray-100 transition-colors"
                aria-label="Open notifications"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>
            </div>
          </header>
          <NotificationsPanel
            open={isNotifOpen}
            onOpenChange={setIsNotifOpen}
            onCountUpdate={setNotifCount}
          />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </WithProtectionRoute>
  );
}
