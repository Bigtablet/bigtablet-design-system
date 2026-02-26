import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";
import fs from "fs";
import path from "path";

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
    async onSuccess() {
      const filePath = path.join(process.cwd(), "dist/index.js");
      const content = fs.readFileSync(filePath, "utf-8");

      // Add "use client" and CSS import
      let newContent = content;
      if (!content.startsWith('"use client"')) {
        newContent = '"use client";\n' + content;
      }

      // Add CSS import after "use client" if not already present
      if (!newContent.includes("import './index.css'")) {
        const lines = newContent.split('\n');
        lines.splice(1, 0, "import './index.css';");
        newContent = lines.join('\n');
      }

      fs.writeFileSync(filePath, newContent);
    },
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
    async onSuccess() {
      const filePath = path.join(process.cwd(), "dist/next.js");
      const content = fs.readFileSync(filePath, "utf-8");

      // Add "use client" and CSS import
      let newContent = content;
      if (!content.startsWith('"use client"')) {
        newContent = '"use client";\n' + content;
      }

      // Add CSS import after "use client" if not already present
      if (!newContent.includes("import './next.css'")) {
        const lines = newContent.split('\n');
        lines.splice(1, 0, "import './next.css';");
        newContent = lines.join('\n');
      }

      fs.writeFileSync(filePath, newContent);
    },
  },
  // Vanilla JS bundle (for HTML/CSS/JS, Thymeleaf, JSP, etc.)
  {
    entry: { "vanilla/bigtablet": "src/vanilla/bigtablet.js" },
    format: ["iife"],
    globalName: "Bigtablet",
    dts: false,
    clean: false,
    treeshake: true,
    sourcemap: false,
    minify: true,
    outExtension: () => ({ js: ".min.js" }),
    esbuildOptions(options) {
      // bigtablet.js uses UMD pattern (module.exports) for browser compatibility.
      // Since package.json has "type": "module", esbuild treats it as ESM and warns
      // about the CommonJS `module` variable. Suppress this — the IIFE format handles
      // the global export and the UMD check is irrelevant at runtime.
      options.logOverride = { "commonjs-variable-in-esm": "silent" };
    },
  },
]);
