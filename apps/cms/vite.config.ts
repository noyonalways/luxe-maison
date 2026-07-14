import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET ?? "http://localhost:5000";

const apiProxy = {
  "/api": {
    target: apiProxyTarget,
    changeOrigin: true,
  },
  "/health": {
    target: apiProxyTarget,
    changeOrigin: true,
  },
} as const;

/** Comma-separated hosts, or `*` / `true` to allow all (needed behind Dokploy/reverse proxies). */
function parseAllowedHosts(
  value: string | undefined,
): true | string[] {
  if (!value || value === "*" || value.toLowerCase() === "true") {
    return true;
  }
  return value
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: { ...apiProxy },
  },
  preview: {
    host: process.env.HOST ?? "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    allowedHosts: parseAllowedHosts(process.env.PREVIEW_ALLOWED_HOSTS),
    proxy: { ...apiProxy },
  },
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
