import type { Preview } from "@storybook/react";

const preview: Preview = {
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
        nextjs: {
            appDirectory: true,
            navigation: {
                push(...args: any[]) {
                    console.log('Navigation push:', ...args);
                },
                replace(...args: any[]) {
                    console.log('Navigation replace:', ...args);
                },
            },
        },
    }
};


export default preview;