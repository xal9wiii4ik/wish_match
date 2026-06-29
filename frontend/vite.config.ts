import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const api_proxy_target = env.VITE_DEV_API_PROXY ?? "http://localhost:8000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/v1": {
          target: api_proxy_target,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
    },
  };
});
