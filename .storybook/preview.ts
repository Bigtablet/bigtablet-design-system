import type { Preview } from "@storybook/react";

const preview: Preview = {
	tags: ["autodocs"],
	initialGlobals: {
		viewport: { value: "responsive" },
	},
	parameters: {
		backgrounds: {
			default: "white",
			values: [
				{ name: "white", value: "#FFFFFF" },
				{ name: "dim (color_bg_solid_dim)", value: "#F4F4F4" },
				{ name: "dark", value: "#1A1A1A" },
			],
		},
		options: {
			storySort: {
				method: "alphabetical",
				order: [
					"Guide", ["Introduction", "Installation"],
					"Foundation",
					"Components",
				],
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
			test: "error",
			config: {
				rules: [
					{ id: "color-contrast", enabled: false },
				],
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
