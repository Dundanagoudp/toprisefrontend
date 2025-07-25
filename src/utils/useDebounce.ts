import { useRef, useCallback } from "react";

/**
 * Custom debounce hook that delays the execution of a function
 * until after a specified delay has passed since its last invocation.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Object containing the debounced callback and cleanup function
 */
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  callbackRef.current = callback;

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Return both the debounced function and cleanup
  return { debouncedCallback, cleanup };
};

export default useDebounce;
