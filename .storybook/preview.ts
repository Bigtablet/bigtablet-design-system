import type { Decorator, Preview } from "@storybook/react";
import { createElement as h, Fragment } from "react";

/**
 * Theme decorator — globals.theme 값에 따라 document.documentElement에 data-theme 적용.
 * ThemeProvider 없이도 모든 스토리에서 light/dark 토글 가능.
 */
const withTheme: Decorator = (Story, context) => {
	const theme = (context.globals.theme as string | undefined) ?? "light";

	if (typeof document !== "undefined") {
		if (theme === "system") {
			document.documentElement.removeAttribute("data-theme");
		} else {
			document.documentElement.setAttribute("data-theme", theme);
		}
	}

	return Story();
};

/**
 * 각 story의 description.story 값을 story 위에 짧은 caption으로 표시.
 * variant별/사이즈별 사용처 가이드를 디자이너도 한눈에 볼 수 있게.
 * Docs view에서는 비활성 (이미 자체 표시되므로 중복 방지).
 */
const withStoryCaption: Decorator = (Story, context) => {
	if (context.viewMode === "docs") return Story();

	const storyDesc = (context.parameters?.docs?.description as { story?: string } | undefined)?.story;
	if (!storyDesc) return Story();

	const captionStyle = {
		display: "block",
		width: "fit-content",
		padding: "8px 14px",
		marginTop: 24,
		background: "var(--bt-color-bg-solid-dim, #F4F4F4)",
		borderLeft: "3px solid var(--bt-color-accent-default, #47555E)",
		borderRadius: "0 8px 8px 0",
		fontSize: 13,
		lineHeight: 1.55,
		color: "var(--bt-color-text-body, #303841)",
		maxWidth: 720,
		clear: "both" as const,
	} as const;

	return h(Fragment, null,
		h(Story, null),
		h("div", { style: captionStyle, "aria-label": "스토리 설명" },
			h("span", { style: { color: "var(--bt-color-accent-default, #47555E)", fontWeight: 600, marginRight: 6 } }, "ℹ"),
			storyDesc,
		),
	);
};

const preview: Preview = {
	tags: ["autodocs"],
	decorators: [withStoryCaption, withTheme],
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
		// Controls/Actions 패널 활성 — args가 명시된 story에서 size/variant 등 enum prop을 dropdown으로 조작 가능.
		// disableSaveFromUI: UI에서 args 변경 시 뜨는 "Update story / Create new story" 다이얼로그 비활성 (잡음 제거)
		controls: { expanded: true, disableSaveFromUI: true },
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
