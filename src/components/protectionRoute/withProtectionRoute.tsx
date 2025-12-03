"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slice/auth/authSlice";
import { getAuthToken, getUserIdFromToken, getUserRoleFromCookies } from "@/utils/auth";
import UnauthorizedScreen from "./UnauthorizedScreen";

interface WithProtectionRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLoader?: boolean;
  allowedRoles?: string[];
  unauthorizedFallback?: React.ReactNode;
}

const WithProtectionRoute: React.FC<WithProtectionRouteProps> = ({
  children,
  redirectTo = "/login",
  showLoader = true,
  allowedRoles,
  unauthorizedFallback,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (isAuthenticated && user) {
          setIsLoading(false);
          return;
        }

        const token = getAuthToken();
        const userId = getUserIdFromToken();
        const roleFromCookies = getUserRoleFromCookies();

        if (token && userId) {
          dispatch(
            loginSuccess({
              id: userId,
              _id: userId,
              token,
              role: roleFromCookies ?? undefined,
            })
          );
          setIsLoading(false);
        } else {
          console.log("No valid authentication found, redirecting to login");
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push(redirectTo);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, user, router, dispatch, redirectTo]);

  if (isLoading && showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = user?.role ?? getUserRoleFromCookies();
    const isAuthorized = role ? allowedRoles.includes(role) : false;

    if (!isAuthorized) {
      return (
        <>
          {unauthorizedFallback ?? (
            <UnauthorizedScreen description="Please contact your administrator if you believe this is an error." />
          )}
        </>
      );
    }
  }

  return <>{children}</>;
};

export default WithProtectionRoute;
