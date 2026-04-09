import type { Preview } from "@storybook/react";

const preview: Preview = {
	tags: ["autodocs"],
	initialGlobals: {
		viewport: { value: "responsive" },
	},
	parameters: {
		viewport: {
			options: {
				compact: { name: "Compact (Mobile)", styles: { width: "375px", height: "812px" } },
				medium: { name: "Medium (Tablet)", styles: { width: "768px", height: "1024px" } },
				expanded: { name: "Expanded", styles: { width: "1024px", height: "768px" } },
			},
		},
		controls: { expanded: true },
		nextjs: {
			appDirectory: true,
			navigation: {
				push(...args: any[]) {
					console.log("Navigation push:", ...args);
				},
				replace(...args: any[]) {
					console.log("Navigation replace:", ...args);
				},
			},
		},
	},
};

export default preview;
