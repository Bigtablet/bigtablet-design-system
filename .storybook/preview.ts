import type { Decorator, Preview } from "@storybook/react";

/**
 * Theme decorator — globals.theme 값에 따라 document.documentElement에 data-theme 적용.
 * ThemeProvider 없이도 모든 스토리에서 light/dark 토글 가능.
 */
const withTheme: Decorator = (Story, context) => {
	const theme = (context.globals.theme as string | undefined) ?? "light";

	if (typeof document !== "undefined") {
		if (theme === "dark") {
			document.documentElement.setAttribute("data-theme", "dark");
		} else if (theme === "light") {
			document.documentElement.setAttribute("data-theme", "light");
		} else {
			document.documentElement.removeAttribute("data-theme");
		}
	}

	return Story();
};

const preview: Preview = {
	tags: ["autodocs"],
	decorators: [withTheme],
	initialGlobals: {
		viewport: { value: "responsive" },
		theme: "light",
	},
	globalTypes: {
		theme: {
			name: "Theme",
			description: "라이트/다크 테마 전환",
			defaultValue: "light",
			toolbar: {
				icon: "circlehollow",
				items: [
					{ value: "light", icon: "sun", title: "Light" },
					{ value: "dark", icon: "moon", title: "Dark" },
					{ value: "system", icon: "browser", title: "System (prefers-color-scheme)" },
				],
				dynamicTitle: true,
			},
		},
	},
	parameters: {
		backgrounds: {
			default: "auto",
			values: [
				{ name: "auto", value: "var(--bt-color-bg-solid, #FFFFFF)" },
				{ name: "white", value: "#FFFFFF" },
				{ name: "dim", value: "#F4F4F4" },
				{ name: "dark", value: "#1F2630" },
			],
		},
		options: {
			storySort: {
				method: "alphabetical",
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
			test: "error",
			config: {
				rules: [{ id: "color-contrast", enabled: false }],
			},
		},
		controls: { expanded: true },
		nextjs: {
			appDirectory: true,
			navigation: {
				push(...args: unknown[]) {
					console.log("Navigation push:", ...args);
				},
				replace(...args: unknown[]) {
					console.log("Navigation replace:", ...args);
				},
			},
		},
	},
};

export default preview;
