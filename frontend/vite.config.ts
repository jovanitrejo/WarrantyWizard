import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      "/api": "http://localhost:3001",
    },
=======
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
>>>>>>> cc96240 (updates)
  },
});
