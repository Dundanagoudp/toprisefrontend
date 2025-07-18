"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// Toast types
export type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="text-green-600 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2l4-4" />
    </svg>
  ),
  error: (
    <svg className="text-red-600 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
    </svg>
  ),
  warning: (
    <svg className="text-yellow-600 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
    </svg>
  ),
};

const barColors: Record<ToastType, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white shadow-lg rounded-md p-4 min-w-[300px] max-w-xs border relative animate-fade-in"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <span className="font-medium text-gray-800">{toast.message}</span>
            </div>
            <div className={`h-1 mt-3 rounded ${barColors[toast.type]} animate-toast-bar`}></div>
          </div>
        ))}
      </div>
      {/* Global styles for toast animations */}
      <style>{`
        @keyframes toast-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-bar {
          animation: toast-bar 2.8s linear forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease;
        }
      `}</style>
    </ToastContext.Provider>
  );
}; 