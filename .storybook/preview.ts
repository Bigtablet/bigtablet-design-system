import type { Preview } from "@storybook/react";

const preview: Preview = {
	tags: ["autodocs"],
	initialGlobals: {
		viewport: { value: "responsive" },
	},
	parameters: {
		options: {
			storySort: {
				order: ["Guide", ["Introduction", "Installation"], "Foundation", "Components"],
			},
		},
		viewport: {
			options: {
				compact: { name: "Compact (Mobile)", styles: { width: "375px", height: "550px" } },
				medium: { name: "Medium (Tablet)", styles: { width: "768px", height: "550px" } },
				expanded: { name: "Expanded", styles: { width: "1024px", height: "550px" } },
			},
		},
		a11y: {
			test: "todo",
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
