import { Navigate, Outlet } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { SplashScreen } from "@/components/layout/SplashScreen";

import { useAuthStore } from "@/features/auth/store/auth-store";

export function RedirectIfAuthenticated() {
  const status = useAuthStore((state) => state.status);

  if (status === "initializing") {
    return <SplashScreen />;
  }

  if (status === "authenticated") {
    return <Navigate to={app_routes.discover} replace />;
  }

  return <Outlet />;
}
