"use client";

import { ComponentType, ReactNode } from "react";
import WithProtectionRoute from "./withProtectionRoute";

interface ProtectionRouteOptions {
  redirectTo?: string;
  showLoader?: boolean;
  allowedRoles?: string[];
  unauthorizedFallback?: ReactNode;
}

/**
 * Higher-Order Component that wraps a component with route protection
 * @param WrappedComponent - The component to protect
 * @param options - Configuration options for the protection
 * @returns Protected component
 */
function withProtectedRoute<T extends object>(
  WrappedComponent: ComponentType<T>,
  options: ProtectionRouteOptions = {}
) {
  const ProtectedComponent = (props: T) => {
    return (
      <WithProtectionRoute
        redirectTo={options.redirectTo}
        showLoader={options.showLoader}
        allowedRoles={options.allowedRoles}
        unauthorizedFallback={options.unauthorizedFallback}
      >
        <WrappedComponent {...props} />
      </WithProtectionRoute>
    );
  };

  // Set display name for debugging
  ProtectedComponent.displayName = `withProtectedRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ProtectedComponent;
}

export default withProtectedRoute;
