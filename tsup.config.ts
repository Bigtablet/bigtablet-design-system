import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    treeshake: true,
    sourcemap: false,
    external: ["react", "react-dom"],
    esbuildPlugins: [
        sassPlugin({
            type: "css",
            loadPaths: ["." , "src"]
        }),
    ],
    loader: { ".svg": "dataurl" },
});