"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import Cookies from "js-cookie";
import { LogOut as logoutAction } from "@/store/slice/auth/authSlice";
import { persistor } from "@/store/store";

interface UnauthorizedScreenProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  thirdaryHref?: string;
  thirdaryLabel?: string;
}

const UnauthorizedScreen: React.FC<UnauthorizedScreenProps> = ({
  title = "Unauthorized",
  description = "You do not have permission to access this area.",
  actionHref = "/",
  actionLabel = "Go to homepage",
  secondaryHref,
  secondaryLabel,
  thirdaryHref,
  thirdaryLabel,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    
       

   
       Cookies.remove("token");
       Cookies.remove("role");
       Cookies.remove("lastlogin");
       localStorage.clear();
       sessionStorage.clear();
       dispatch(logoutAction());
       persistor.purge();
       window.location.href = "/";
     
   
  };
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-wider text-red-600 uppercase">
          Access restricted
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-600 max-w-xl mx-auto">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button asChild variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
  
        {thirdaryHref && thirdaryLabel ? (
          <Button asChild variant="ghost">
            <Link href={thirdaryHref}>{thirdaryLabel}</Link>
          </Button>
        ) : null}

        <Button onClick={handleLogout} variant="ghost">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedScreen;

