'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayoutWrapper({
  children,
  showHeaderFooter,
}: {
  children: React.ReactNode;
  showHeaderFooter: boolean;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isUserRoute, setIsUserRoute] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAdminRoute(pathname.startsWith('/admin'));
    setIsUserRoute(pathname.startsWith('/user'));
    setIsLoginPage(pathname === '/login');
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* {showHeaderFooter && !isAdminRoute && !isLoginPage && !isUserRoute && <LoadingProgress />}
      {showHeaderFooter && !isAdminRoute && !isLoginPage && !isUserRoute && <Header />} */}
      <main className="flex-grow">
        {children}
      </main>
      {/* {showHeaderFooter && !isAdminRoute && !isLoginPage && !isUserRoute && <Footer />} */}
    </div>
  );
} 