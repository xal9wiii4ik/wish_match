import { Navigate, Outlet, useLocation } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { SplashScreen } from "@/components/layout/SplashScreen";

import { useAuthStore } from "@/features/auth/store/auth-store";

export function RequireAuth() {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === "initializing") {
    return <SplashScreen />;
  }

  if (status === "unauthenticated") {
    return (
      <Navigate to={app_routes.login} replace state={{ from: location }} />
    );
  }

  return <Outlet />;
}
