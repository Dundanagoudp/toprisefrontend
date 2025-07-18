# Route Protection Components

This directory contains components for protecting routes and pages from unauthorized access.

## Components

### 1. `WithProtectionRoute` - Wrapper Component

A React component that wraps your content and protects it from unauthorized access.

#### Usage:

```tsx
import { WithProtectionRoute } from "@/components/protectionRoute";

function MyPage() {
  return (
    <WithProtectionRoute redirectTo="/login">
      <div>
        <h1>Protected Content</h1>
        <p>This content is only visible to authenticated users.</p>
      </div>
    </WithProtectionRoute>
  );
}
```

#### Props:

- `children`: React.ReactNode - The content to protect
- `redirectTo`: string (optional) - Where to redirect if not authenticated (default: "/login")
- `showLoader`: boolean (optional) - Whether to show loading spinner (default: true)

### 2. `withProtectedRoute` - Higher-Order Component (HOC)

A HOC that wraps any component with route protection.

#### Usage:

```tsx
import { withProtectedRoute } from "@/components/protectionRoute";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This is a protected dashboard page.</p>
    </div>
  );
}

// Wrap the component with protection
export default withProtectedRoute(Dashboard, {
  redirectTo: "/login",
  showLoader: true
});
```

#### Options:

- `redirectTo`: string (optional) - Where to redirect if not authenticated
- `showLoader`: boolean (optional) - Whether to show loading spinner

## How it Works

1. **Authentication Check**: The component checks if the user is authenticated by:
   - Looking at the Redux auth state
   - Checking for valid tokens in cookies
   - Validating the token and extracting user ID

2. **Redirect Logic**: If no valid authentication is found, the user is redirected to the specified login page.

3. **Loading State**: While checking authentication, a loading spinner is shown (can be disabled).

4. **Protected Content**: Only authenticated users can see the protected content.

## Integration with Redux

The protection route integrates with your Redux auth slice:

```typescript
// Redux state structure expected:
interface AuthState {
  isAuthenticated: boolean;
  user: any;
  // ... other auth fields
}
```

## Example Implementations

### Protect a Page Layout:

```tsx
// In your layout.tsx
import { WithProtectionRoute } from "@/components/protectionRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WithProtectionRoute redirectTo="/login">
      <SidebarProvider>
        <AppSidebar />
        <main>{children}</main>
      </SidebarProvider>
    </WithProtectionRoute>
  );
}
```

### Protect Individual Components:

```tsx
// Protect a specific component
import { withProtectedRoute } from "@/components/protectionRoute";

const UserProfile = () => {
  return <div>User Profile Content</div>;
};

export default withProtectedRoute(UserProfile);
```

### Protect with Custom Redirect:

```tsx
// Redirect to a specific page
import { WithProtectionRoute } from "@/components/protectionRoute";

function AdminPanel() {
  return (
    <WithProtectionRoute redirectTo="/admin/login">
      <div>Admin Content</div>
    </WithProtectionRoute>
  );
}
```

## Notes

- The protection route automatically handles token validation and user authentication
- It integrates seamlessly with your existing Redux auth system
- Loading states are handled automatically
- The component is fully TypeScript typed for better development experience
