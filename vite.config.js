import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative asset paths so the build works from a GitHub Pages project
  // subpath (https://<user>.github.io/<repo>/) without hardcoding the repo name.
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // MatPlan.jsx is one large file, so there's no route to split app
        // code into smaller chunks without restructuring it — but React and
        // Supabase change on almost no deploy, while the app chunk changes
        // on nearly every one. Splitting them out lets a returning coach's
        // browser reuse its cached vendor chunk and re-fetch only the
        // (much smaller) app chunk after a normal update.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("/react-dom/") || id.includes("/react/") || id.includes("/scheduler/")) return "vendor-react";
          return "vendor";
        },
      },
    },
  },
});
