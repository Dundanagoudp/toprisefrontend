"use client";

import { ComponentType } from "react";
import WithProtectionRoute from "./withProtectionRoute";

interface ProtectionRouteOptions {
  redirectTo?: string;
  showLoader?: boolean;
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
