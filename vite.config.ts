import react from "@vitejs/plugin-react";
import path from "path";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  optimizeDeps: {
    include: ["@supabase/supabase-js"],
  },
});
