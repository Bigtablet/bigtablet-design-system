import path from "path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-essentials"],
    framework: { name: "@storybook/react-vite", options: {} },
    viteFinal: async (cfg) => {
        cfg.resolve = cfg.resolve || {};
        cfg.resolve.alias = {
            ...(cfg.resolve.alias || {}),
            "src": path.resolve(__dirname, "../src"),
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
        return cfg;
    },
};

export default config;