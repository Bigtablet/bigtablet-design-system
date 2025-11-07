import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";

export default defineConfig([
    {
        entry: { index: "src/index.ts" },  
        format: ["esm"],
        dts: true,
        clean: true,
        treeshake: true,
        sourcemap: false,
        external: ["react", "react-dom", "lucide-react", "react-toastify"],
        esbuildPlugins: [
            sassPlugin({ type: "css", loadPaths: [".", "src"] }),
        ],
        loader: { ".svg": "dataurl" },
        splitting: false,
    },
    {
        entry: { client: "src/client.ts" },
        format: ["esm"],
        dts: true,
        clean: false,
        treeshake: true,
        sourcemap: false,
        external: ["react", "react-dom", "lucide-react", "react-toastify"],
        esbuildPlugins: [
            sassPlugin({ type: "css", loadPaths: [".", "src"] }),
        ],
        loader: { ".svg": "dataurl" },
        splitting: false,
    },
]);