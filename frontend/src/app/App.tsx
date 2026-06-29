import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";

import { create_query_client } from "@/lib/query-client";
import { token_storage } from "@/lib/token-storage";
import { Toaster } from "@/components/ui";
import { SplashScreen } from "@/components/layout/SplashScreen";

import { useAuthStore } from "@/features/auth/store/auth-store";

import { router } from "./router";

export function App() {
  const [query_client] = useState(() => create_query_client());
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();

    const unsubscribe = token_storage.subscribe((token) => {
      if (token === null) {
        query_client.clear();
      }
    });
    return unsubscribe;
  }, [initialize, query_client]);

  return (
    <QueryClientProvider client={query_client}>
      <Suspense fallback={<SplashScreen />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}
