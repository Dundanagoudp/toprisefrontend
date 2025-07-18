"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slice/auth/authSlice";
import { getAuthToken, getUserIdFromToken } from "@/utils/auth";

interface WithProtectionRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLoader?: boolean;
}

const WithProtectionRoute: React.FC<WithProtectionRouteProps> = ({
  children,
  redirectTo = "/login",
  showLoader = true,
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

        if (token && userId) {
      
          dispatch(loginSuccess({ 
            id: userId, 
            token: token 
          }));
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

  return <>{children}</>;
};

export default WithProtectionRoute;
