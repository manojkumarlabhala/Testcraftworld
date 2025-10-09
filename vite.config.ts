import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('react-dom')) return 'vendor_react';
          if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-')) return 'vendor_markdown';
          if (id.includes('highlight.js') || id.includes('rehype-highlight')) return 'vendor_highlight';
          if (id.includes('@uiw/react-md-editor')) return 'vendor_md_editor';
          if (id.includes('recharts')) return 'vendor_recharts';
          return 'vendor_misc';
        }
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // PostCSS config is auto-detected (postcss.config.mjs). No explicit path needed.
});
