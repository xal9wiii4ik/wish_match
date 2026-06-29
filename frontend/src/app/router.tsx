/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { AppShell } from "@/components/layout/AppShell";
import { RedirectIfAuthenticated } from "@/components/routing/RedirectIfAuthenticated";
import { RequireAuth } from "@/components/routing/RequireAuth";

const LandingPage = lazy(() =>
  import("@/features/landing/LandingPage").then((m) => ({
    default: m.LandingPage,
  }))
);
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  }))
);
const ConfirmEmailPage = lazy(() =>
  import("@/features/auth/pages/ConfirmEmailPage").then((m) => ({
    default: m.ConfirmEmailPage,
  }))
);
const DiscoverPage = lazy(() =>
  import("@/features/wishes/pages/DiscoverPage").then((m) => ({
    default: m.DiscoverPage,
  }))
);
const MapPage = lazy(() =>
  import("@/features/map/pages/MapPage").then((m) => ({ default: m.MapPage }))
);
const MatchesPage = lazy(() =>
  import("@/features/matches/pages/MatchesPage").then((m) => ({
    default: m.MatchesPage,
  }))
);
const MyWishesPage = lazy(() =>
  import("@/features/wishes/pages/MyWishesPage").then((m) => ({
    default: m.MyWishesPage,
  }))
);
const WishCreatePage = lazy(() =>
  import("@/features/wishes/pages/WishCreatePage").then((m) => ({
    default: m.WishCreatePage,
  }))
);
const WishDetailPage = lazy(() =>
  import("@/features/wishes/pages/WishDetailPage").then((m) => ({
    default: m.WishDetailPage,
  }))
);
const ProfilePage = lazy(() =>
  import("@/features/profile/pages/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  }))
);
const SettingsPage = lazy(() =>
  import("@/features/profile/pages/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("@/features/misc/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  }))
);

export const router = createBrowserRouter([
  { path: app_routes.landing, element: <LandingPage /> },
  { path: app_routes.confirm_email, element: <ConfirmEmailPage /> },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: app_routes.login, element: <LoginPage /> },
      { path: app_routes.register, element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: app_routes.discover, element: <DiscoverPage /> },
          { path: app_routes.map, element: <MapPage /> },
          { path: app_routes.matches, element: <MatchesPage /> },
          { path: app_routes.my_wishes, element: <MyWishesPage /> },
          { path: app_routes.wish_create, element: <WishCreatePage /> },
          { path: app_routes.wish_detail, element: <WishDetailPage /> },
          { path: app_routes.profile, element: <ProfilePage /> },
          { path: app_routes.settings, element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
