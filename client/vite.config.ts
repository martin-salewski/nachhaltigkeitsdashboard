import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/random-api": {
        target: "https://www.randomnumberapi.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/random-api/, "/api/v1.0/random"),
      },
    },
  },
});
