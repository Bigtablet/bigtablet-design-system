import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";

export default defineConfig([
  // Pure React components bundle
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    clean: true,
    treeshake: true,
    sourcemap: false,
    external: [
      "react",
      "react-dom",
      "lucide-react",
      "react-toastify",
      "react-markdown",
      "remark-gfm",
    ],
    esbuildPlugins: [sassPlugin({ type: "css", loadPaths: [".", "src"] })],
    loader: { ".svg": "dataurl" },
    splitting: false,
  },
  // Next.js-specific components bundle
  {
    entry: { next: "src/next.ts" },
    format: ["esm"],
    dts: true,
    clean: false,
    treeshake: true,
    sourcemap: false,
    external: ["react", "react-dom", "next/link", "next/image", "next"],
    esbuildPlugins: [sassPlugin({ type: "css", loadPaths: [".", "src"] })],
    loader: { ".svg": "dataurl" },
    splitting: false,
  },
]);
