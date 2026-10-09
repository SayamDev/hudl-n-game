import { defineConfig, loadEnv } from "vite";
import { createPackStudio } from "./server/pack-studio.mjs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const studio = createPackStudio({ env });
  return {
    base: process.env.BASE_PATH || "/",
    plugins: [
      {
        name: "hudl-pack-studio",
        configureServer(server) {
          server.middlewares.use(studio);
        },
        configurePreviewServer(server) {
          server.middlewares.use(studio);
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "prompt",
        includeAssets: [
          "icon.svg",
          "icon-192.png",
          "icon-512.png",
          "social.png",
        ],
        manifest: {
          name: "Hudl N Game",
          short_name: "Hudl",
          description: "One phone. A whole party.",
          theme_color: "#f3f4ed",
          background_color: "#f3f4ed",
          display: "standalone",
          start_url: ".",
          icons: [
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2,json}"],
          navigateFallback: "index.html",
          navigateFallbackDenylist: [/^\/api\//],
          maximumFileSizeToCacheInBytes: 4000000,
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            motion: ["motion"],
          },
        },
      },
    },
  };
});
