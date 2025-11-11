import path from "path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-essentials"],
    framework: { name: "@storybook/react-vite", options: {} },
    staticDirs: ["../public"],
    viteFinal: async (cfg) => {
        cfg.resolve = cfg.resolve || {};
        cfg.resolve.alias = {
            ...(cfg.resolve.alias || {}),
            "src": path.resolve(__dirname, "../src"),
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
            'process.env': {},
        };
        return cfg;
    },
};

export default config;