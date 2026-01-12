import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { LogOut } from '@/store/slice/auth/authSlice';
import { getAuthToken } from '@/utils/auth';

export const useSessionTimeoutAdmin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    dispatch(LogOut(undefined));
    router.push('/admin/login');
  };

  const checkTokenExpiration = () => {
    const token = getAuthToken();
    if (!token) {
      logout();
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; 
      const currentTime = Date.now();

      if (currentTime >= expirationTime) {
        logout();
      } else {
        // Set timeout for remaining time
        const timeUntilExpiry = expirationTime - currentTime;
        timeoutRef.current = setTimeout(checkTokenExpiration, timeUntilExpiry);
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    checkTokenExpiration();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
};
