"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import AdminLayoutWrapper from "../applayout/AdminLayoutWrapper";
import { useSessionTimeout } from "@/hooks/use-session-timeout";

const ADMIN_ROLES = [
  "Fulfillment-Admin",
  "Fulfillment-Staff",
  "Fullfillment-staff",
  "Inventory-Admin",
  "Inventory-Staff",
  "Dealer",
  "Super-admin",
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  useSessionTimeout();

  useEffect(() => {
    if (isAuthenticated && user?.role && ADMIN_ROLES.includes(user.role)) {
      router.replace("/user/dashboard");
    }
  }, [isAuthenticated, user?.role, router]);

  return (
    <>
      <AdminLayoutWrapper showHeaderFooter={true}>
        {children}
      </AdminLayoutWrapper>
    </>
  );
} 