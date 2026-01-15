import path from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
    stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    staticDirs: ["../public"],
    viteFinal: async (cfg) => {
        cfg.resolve = cfg.resolve || {};
        cfg.resolve.alias = {
            ...(cfg.resolve.alias || {}),
            src: path.resolve(__dirname, "../src"),
            "next/link": path.resolve(__dirname, "./mocks/next-link.tsx"),
            "next/image": path.resolve(__dirname, "./mocks/next-image.tsx"),
        };

        cfg.css = {
            ...(cfg.css || {}),
            preprocessorOptions: {
                scss: {
                    ...(cfg.css?.preprocessorOptions?.scss || {}),
                    loadPaths: ["src"],
                    quietDeps: true,
                },
            },
        };

        cfg.define = {
            ...(cfg.define || {}),
            "process.env": {},
        };

        return cfg;
    },
};

export default config;