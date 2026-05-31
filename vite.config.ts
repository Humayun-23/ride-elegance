import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Plugin to make Vite's injected CSS load asynchronously, eliminating render-blocking delays for the App Shell
const asyncCssPlugin = () => ({
  name: 'async-css',
  enforce: 'post' as const,
  transformIndexHtml(html: string) {
    return html.replace(
      /<link rel="stylesheet"(.*?)href="(.*?\.css)">/g,
      `<link rel="preload" as="style"$1href="$2">\n    <link rel="stylesheet" media="print" onload="this.media='all'"$1href="$2">\n    <noscript><link rel="stylesheet"$1href="$2"></noscript>`
    );
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["ride-elegance.onrender.com"],
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), asyncCssPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  // Removed manualChunks to allow Vite's default aggressive code-splitting. 
  // This drastically reduces the "Unused JavaScript" downloaded on the initial page load, improving LCP.
}));
