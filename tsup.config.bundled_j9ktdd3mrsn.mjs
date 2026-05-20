// tsup.config.ts
import fs from "node:fs";
import path from "node:path";
import { sassPlugin } from "esbuild-sass-plugin";
import { defineConfig } from "tsup";
var tsup_config_default = defineConfig([
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
      "remark-gfm"
    ],
    esbuildPlugins: [sassPlugin({ type: "css", loadPaths: [".", "src"] })],
    loader: { ".svg": "dataurl" },
    splitting: false,
    async onSuccess() {
      const filePath = path.join(process.cwd(), "dist/index.js");
      const content = fs.readFileSync(filePath, "utf-8");
      let newContent = content;
      if (!content.startsWith('"use client"')) {
        newContent = `"use client";
${content}`;
      }
      if (!newContent.includes("import './index.css'")) {
        const lines = newContent.split("\n");
        lines.splice(1, 0, "import './index.css';");
        newContent = lines.join("\n");
      }
      fs.writeFileSync(filePath, newContent);
    }
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
      options.logOverride = { "commonjs-variable-in-esm": "silent" };
    }
  }
]);
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL3Nlc3Npb25zL2ZlcnZlbnQtZXhjaXRpbmctZGlqa3N0cmEvbW50L0dpdEh1Yi9iaWd0YWJsZXQtZGVzaWduLXN5c3RlbS90c3VwLmNvbmZpZy50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvc2Vzc2lvbnMvZmVydmVudC1leGNpdGluZy1kaWprc3RyYS9tbnQvR2l0SHViL2JpZ3RhYmxldC1kZXNpZ24tc3lzdGVtXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9zZXNzaW9ucy9mZXJ2ZW50LWV4Y2l0aW5nLWRpamtzdHJhL21udC9HaXRIdWIvYmlndGFibGV0LWRlc2lnbi1zeXN0ZW0vdHN1cC5jb25maWcudHNcIjtpbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IHNhc3NQbHVnaW4gfSBmcm9tIFwiZXNidWlsZC1zYXNzLXBsdWdpblwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInRzdXBcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKFtcblx0Ly8gUHVyZSBSZWFjdCBjb21wb25lbnRzIGJ1bmRsZVxuXHR7XG5cdFx0ZW50cnk6IHsgaW5kZXg6IFwic3JjL2luZGV4LnRzXCIgfSxcblx0XHRmb3JtYXQ6IFtcImVzbVwiXSxcblx0XHRkdHM6IHRydWUsXG5cdFx0Y2xlYW46IHRydWUsXG5cdFx0dHJlZXNoYWtlOiB0cnVlLFxuXHRcdHNvdXJjZW1hcDogZmFsc2UsXG5cdFx0ZXh0ZXJuYWw6IFtcblx0XHRcdFwicmVhY3RcIixcblx0XHRcdFwicmVhY3QtZG9tXCIsXG5cdFx0XHRcImx1Y2lkZS1yZWFjdFwiLFxuXHRcdFx0XCJyZWFjdC10b2FzdGlmeVwiLFxuXHRcdFx0XCJyZWFjdC1tYXJrZG93blwiLFxuXHRcdFx0XCJyZW1hcmstZ2ZtXCIsXG5cdFx0XSxcblx0XHRlc2J1aWxkUGx1Z2luczogW3Nhc3NQbHVnaW4oeyB0eXBlOiBcImNzc1wiLCBsb2FkUGF0aHM6IFtcIi5cIiwgXCJzcmNcIl0gfSldLFxuXHRcdGxvYWRlcjogeyBcIi5zdmdcIjogXCJkYXRhdXJsXCIgfSxcblx0XHRzcGxpdHRpbmc6IGZhbHNlLFxuXHRcdGFzeW5jIG9uU3VjY2VzcygpIHtcblx0XHRcdGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIFwiZGlzdC9pbmRleC5qc1wiKTtcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIFwidXRmLThcIik7XG5cblx0XHRcdC8vIEFkZCBcInVzZSBjbGllbnRcIiBhbmQgQ1NTIGltcG9ydFxuXHRcdFx0bGV0IG5ld0NvbnRlbnQgPSBjb250ZW50O1xuXHRcdFx0aWYgKCFjb250ZW50LnN0YXJ0c1dpdGgoJ1widXNlIGNsaWVudFwiJykpIHtcblx0XHRcdFx0bmV3Q29udGVudCA9IGBcInVzZSBjbGllbnRcIjtcXG4ke2NvbnRlbnR9YDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWRkIENTUyBpbXBvcnQgYWZ0ZXIgXCJ1c2UgY2xpZW50XCIgaWYgbm90IGFscmVhZHkgcHJlc2VudFxuXHRcdFx0aWYgKCFuZXdDb250ZW50LmluY2x1ZGVzKFwiaW1wb3J0ICcuL2luZGV4LmNzcydcIikpIHtcblx0XHRcdFx0Y29uc3QgbGluZXMgPSBuZXdDb250ZW50LnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0XHRsaW5lcy5zcGxpY2UoMSwgMCwgXCJpbXBvcnQgJy4vaW5kZXguY3NzJztcIik7XG5cdFx0XHRcdG5ld0NvbnRlbnQgPSBsaW5lcy5qb2luKFwiXFxuXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBuZXdDb250ZW50KTtcblx0XHR9LFxuXHR9LFxuXHQvLyBWYW5pbGxhIEpTIGJ1bmRsZSAoZm9yIEhUTUwvQ1NTL0pTLCBUaHltZWxlYWYsIEpTUCwgZXRjLilcblx0e1xuXHRcdGVudHJ5OiB7IFwidmFuaWxsYS9iaWd0YWJsZXRcIjogXCJzcmMvdmFuaWxsYS9iaWd0YWJsZXQuanNcIiB9LFxuXHRcdGZvcm1hdDogW1wiaWlmZVwiXSxcblx0XHRnbG9iYWxOYW1lOiBcIkJpZ3RhYmxldFwiLFxuXHRcdGR0czogZmFsc2UsXG5cdFx0Y2xlYW46IGZhbHNlLFxuXHRcdHRyZWVzaGFrZTogdHJ1ZSxcblx0XHRzb3VyY2VtYXA6IGZhbHNlLFxuXHRcdG1pbmlmeTogdHJ1ZSxcblx0XHRvdXRFeHRlbnNpb246ICgpID0+ICh7IGpzOiBcIi5taW4uanNcIiB9KSxcblx0XHRlc2J1aWxkT3B0aW9ucyhvcHRpb25zKSB7XG5cdFx0XHQvLyBiaWd0YWJsZXQuanMgdXNlcyBVTUQgcGF0dGVybiAobW9kdWxlLmV4cG9ydHMpIGZvciBicm93c2VyIGNvbXBhdGliaWxpdHkuXG5cdFx0XHQvLyBTaW5jZSBwYWNrYWdlLmpzb24gaGFzIFwidHlwZVwiOiBcIm1vZHVsZVwiLCBlc2J1aWxkIHRyZWF0cyBpdCBhcyBFU00gYW5kIHdhcm5zXG5cdFx0XHQvLyBhYm91dCB0aGUgQ29tbW9uSlMgYG1vZHVsZWAgdmFyaWFibGUuIFN1cHByZXNzIHRoaXMgXHUyMDE0IHRoZSBJSUZFIGZvcm1hdCBoYW5kbGVzXG5cdFx0XHQvLyB0aGUgZ2xvYmFsIGV4cG9ydCBhbmQgdGhlIFVNRCBjaGVjayBpcyBpcnJlbGV2YW50IGF0IHJ1bnRpbWUuXG5cdFx0XHRvcHRpb25zLmxvZ092ZXJyaWRlID0geyBcImNvbW1vbmpzLXZhcmlhYmxlLWluLWVzbVwiOiBcInNpbGVudFwiIH07XG5cdFx0fSxcblx0fSxcbl0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVyxPQUFPLFFBQVE7QUFDL1csT0FBTyxVQUFVO0FBQ2pCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsb0JBQW9CO0FBRTdCLElBQU8sc0JBQVEsYUFBYTtBQUFBO0FBQUEsRUFFM0I7QUFBQSxJQUNDLE9BQU8sRUFBRSxPQUFPLGVBQWU7QUFBQSxJQUMvQixRQUFRLENBQUMsS0FBSztBQUFBLElBQ2QsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Q7QUFBQSxJQUNBLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxNQUFNLE9BQU8sV0FBVyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQztBQUFBLElBQ3JFLFFBQVEsRUFBRSxRQUFRLFVBQVU7QUFBQSxJQUM1QixXQUFXO0FBQUEsSUFDWCxNQUFNLFlBQVk7QUFDakIsWUFBTSxXQUFXLEtBQUssS0FBSyxRQUFRLElBQUksR0FBRyxlQUFlO0FBQ3pELFlBQU0sVUFBVSxHQUFHLGFBQWEsVUFBVSxPQUFPO0FBR2pELFVBQUksYUFBYTtBQUNqQixVQUFJLENBQUMsUUFBUSxXQUFXLGNBQWMsR0FBRztBQUN4QyxxQkFBYTtBQUFBLEVBQWtCLE9BQU87QUFBQSxNQUN2QztBQUdBLFVBQUksQ0FBQyxXQUFXLFNBQVMsc0JBQXNCLEdBQUc7QUFDakQsY0FBTSxRQUFRLFdBQVcsTUFBTSxJQUFJO0FBQ25DLGNBQU0sT0FBTyxHQUFHLEdBQUcsdUJBQXVCO0FBQzFDLHFCQUFhLE1BQU0sS0FBSyxJQUFJO0FBQUEsTUFDN0I7QUFFQSxTQUFHLGNBQWMsVUFBVSxVQUFVO0FBQUEsSUFDdEM7QUFBQSxFQUNEO0FBQUE7QUFBQSxFQUVBO0FBQUEsSUFDQyxPQUFPLEVBQUUscUJBQXFCLDJCQUEyQjtBQUFBLElBQ3pELFFBQVEsQ0FBQyxNQUFNO0FBQUEsSUFDZixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsSUFDTCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixjQUFjLE9BQU8sRUFBRSxJQUFJLFVBQVU7QUFBQSxJQUNyQyxlQUFlLFNBQVM7QUFLdkIsY0FBUSxjQUFjLEVBQUUsNEJBQTRCLFNBQVM7QUFBQSxJQUM5RDtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
