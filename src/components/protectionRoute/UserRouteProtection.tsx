"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

const ADMIN_ROLES = [
  "Fulfillment-Admin",
  "Fulfillment-Staff",
  "Fullfillment-staff",
  "Inventory-Admin",
  "Inventory-Staff",
  "Dealer",
  "Super-admin",
];

const ADMIN_ROUTES = ["/user", "/admin", "/dealer"];
const AUTH_ROUTES = ["/login", "/admin/login", "/signup", "/reset-password"];

export default function UserRouteProtection({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;

    const isAdmin = ADMIN_ROLES.includes(user.role);
    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    if (isAdmin && !isAdminRoute && !isAuthRoute) {
      router.replace("/user/dashboard");
    }
  }, [isAuthenticated, user?.role, pathname, router]);

  return <>{children}</>;
}

