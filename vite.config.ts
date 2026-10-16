import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "src/shared": path.resolve(__dirname, "src/shared"),
      "src/view": path.resolve(__dirname, "src/view"),
      "src/modules": path.resolve(__dirname, "src/modules"),
      "src/security": path.resolve(__dirname, "src/security"),
      "src/services": path.resolve(__dirname, "src/services"),
      "src/i18n": path.resolve(__dirname, "src/i18n"),
    },
  },
});
