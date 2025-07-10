"use client";

// Function to get a cookie value
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null; // SSR guard

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Function to set a cookie
export function setCookie(
  name: string,
  value: string,
  options: { days?: number; httpOnly?: boolean; secure?: boolean } = {}
) {
  if (typeof document === "undefined") return; // SSR guard

  let cookie = `${name}=${value}`;

  if (options.days) {
    const date = new Date();
    date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
    cookie += `; expires=${date.toUTCString()}`;
  }

  cookie += `; path=/`;
  if (options.secure) cookie += `; Secure`;
  // Note: HttpOnly can't be set from client-side JavaScript
  // It must be set by the server in the HTTP response headers

  document.cookie = cookie;
}

// Function to delete a cookie
export function deleteCookie(name: string) {
  setCookie(name, "", { days: -1 });
}
