import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite configuration for the manual test harness.
 *
 * The SDK is consumed through `"@feichtmedia/imagehandler-react-sdk": "file:.."`,
 * so npm symlinks the repository root into `node_modules`. Two consequences of
 * that have to be handled explicitly — they are what the former `craco.config.js`
 * worked around on the CRA/webpack side:
 *
 * 1. React has to be deduplicated. The SDK declares `react` as a peer
 *    dependency and npm installs peer dependencies, so a second copy of React
 *    sits in the repository root's `node_modules`. Vite resolves symlinks to
 *    their real path, so without `resolve.dedupe` the SDK would import that
 *    second copy — and two React instances do not share context, which would
 *    make every `<ImageHandler />` bail out with a missing-config error.
 * 2. The dev server has to be allowed to read from outside its root, because
 *    the resolved SDK path lies in the parent directory. This replaces the
 *    removal of CRA's `ModuleScopePlugin`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Read the linked SDK from source instead of pre-bundling it, so that
    // `npm run watch` in the SDK is picked up by the running dev server.
    exclude: ["@feichtmedia/imagehandler-react-sdk"],
  },
  server: {
    // Keep the port the SDK documentation refers to.
    port: 3000,
    fs: {
      // Allow serving the symlinked SDK from the repository root.
      allow: [".."],
    },
  },
});
