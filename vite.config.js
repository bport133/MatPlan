import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative asset paths so the build works from a GitHub Pages project
  // subpath (https://<user>.github.io/<repo>/) without hardcoding the repo name.
  base: "./",
  plugins: [react()],
});
