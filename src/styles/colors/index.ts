// 생성 파일 - 직접 고치지 말 것. 원본은 src/styles/tokens.json, `pnpm tokens` 로 다시 만든다.

export const baseColors = {
	brandPrimary: "#121212",
	blue600: "#1A73E8",
	neutral0: "#FFFFFF",
	neutral50: "#F4F4F4",
	neutral100: "#F2F2F2",
	neutral200: "#E5E5E5",
	neutral300: "#999999",
	neutral400: "#B3B3B3",
	neutral500: "#888888",
	neutral600: "#777777",
	neutral700: "#666666",
	neutral800: "#333333",
	neutral900: "#121212",
	/** dark panel/card bg (Vercel-style) */
	neutral925: "#141414",
	/** darkest page bg (Vercel-style) */
	neutral950: "#0A0A0A",
	/** Text caption - AA 전용값 (neutral scale 과 분리: neutral_500/600 은 border-hover 등 재사용되므로 caption 만 따로) on #fff 5.0:1 / on #F4F4F4 4.57:1 (WCAG AA) */
	textCaptionLight: "#6F6F6F",
	/** on #0A0A0A 5.0:1 / on #141414 4.66:1 (WCAG AA) */
	textCaptionDark: "#808080",
	/** Status - light mode default (darkened for AA on #fff text, 5+:1) 이전 값 (#EF4444 등) 은 #fff 텍스트 조합 시 AA 미달 (2.0~3.7:1) - Tailwind 700 계열로 교체. red-700, with #fff = 6.4:1 */
	statusError: "#B91C1C",
	/** green-700, with #fff = 5.5:1 */
	statusSuccess: "#047857",
	/** amber-700, with #fff = 5.1:1 */
	statusWarning: "#B45309",
	/** blue-700, with #fff = 6.5:1 */
	statusInfo: "#1D4ED8",
	/** Status container - light mode (연한 tint 배경) red-100 */
	statusErrorContainerLight: "#FEE2E2",
	/** green-100 */
	statusSuccessContainerLight: "#DCFCE7",
	/** amber-100 */
	statusWarningContainerLight: "#FEF3C7",
	/** blue-100 */
	statusInfoContainerLight: "#DBEAFE",
	/** Status container - dark mode (deep alpha tint, dark neutral bg 위 식별 가능) Sass rgba(hex, alpha) - 다른 토큰 정의와 hex 일관성 유지. red-900 @ 35% */
	statusErrorContainerDark: "rgba(127, 29, 29, 0.35)",
	/** green-900 @ 35% */
	statusSuccessContainerDark: "rgba(6, 78, 59, 0.35)",
	/** amber-900 @ 35% */
	statusWarningContainerDark: "rgba(120, 53, 15, 0.35)",
	/** blue-900 @ 35% */
	statusInfoContainerDark: "rgba(30, 58, 138, 0.35)",
	/** Status on-container - dark mode (tint 위에서 보일 만한 밝은 색) red-300 */
	statusErrorOnContainerDark: "#FCA5A5",
	/** green-300 */
	statusSuccessOnContainerDark: "#86EFAC",
	/** amber-300 */
	statusWarningOnContainerDark: "#FCD34D",
	/** blue-300 */
	statusInfoOnContainerDark: "#93C5FD",
	/** Status - dark mode 텍스트 / surface 위 직접 사용용 (brightened) dark canvas (neutral_950 #0A0A0A lum ~0.001) 위에서 6+:1 이상 보장. red-400, on neutral_950 ~8.2:1 */
	statusErrorDarkText: "#F87171",
	/** green-400, on neutral_950 ~12.6:1 */
	statusSuccessDarkText: "#4ADE80",
	/** amber-400, on neutral_950 ~15.7:1 */
	statusWarningDarkText: "#FBBF24",
	/** blue-400, on neutral_950 ~9.4:1 */
	statusInfoDarkText: "#60A5FA",
	/** Skeleton - light mode (off-white grays, not in neutral scale) */
	skeletonBase: "#F3F3F3",
	skeletonWave: "#F0F0F0",
	skeletonHighlight: "#FAFAFA",
	/** Alpha */
	alphaBlack5: "rgba(0, 0, 0, 0.05)",
	alphaBlack8: "rgba(0, 0, 0, 0.08)",
	alphaBlack12: "rgba(26, 26, 26, 0.12)",
	alphaBlack38: "rgba(26, 26, 26, 0.38)",
	alphaBlack50: "rgba(0, 0, 0, 0.50)",
	alphaWhite5: "rgba(255, 255, 255, 0.05)",
	alphaWhite8: "rgba(255, 255, 255, 0.08)",
	alphaWhite12: "rgba(255, 255, 255, 0.12)",
	alphaWhite38: "rgba(255, 255, 255, 0.38)",
} as const;

export const colors = {
	brand: {
		/** Brand */
		primary: "#121212",
		onPrimary: "#FFFFFF",
		primaryContainer: "rgba(0, 0, 0, 0.05)",
	},
	text: {
		/** Text */
		heading: "#121212",
		body: "#666666",
		caption: "#6F6F6F",
		brand: "#121212",
		inverse: "#FFFFFF",
		disabled: "rgba(26, 26, 26, 0.38)",
	},
	bg: {
		/** Background */
		solid: "#FFFFFF",
		solidDim: "#F4F4F4",
		additive: "rgba(0, 0, 0, 0.05)",
		disabled: "rgba(26, 26, 26, 0.12)",
		overlay: "rgba(0, 0, 0, 0.50)",
		inverseSurface: "#333333",
	},
	state: {
		/** State */
		hoverOnLight: "rgba(0, 0, 0, 0.05)",
		pressedOnLight: "rgba(26, 26, 26, 0.12)",
		focusOnLight: "rgba(0, 0, 0, 0.08)",
		hoverOnDark: "rgba(255, 255, 255, 0.05)",
		pressedOnDark: "rgba(255, 255, 255, 0.12)",
		focusOnDark: "rgba(255, 255, 255, 0.08)",
	},
	border: {
		/** Border */
		default: "#E5E5E5",
		hover: "#B3B3B3",
		subtle: "rgba(0, 0, 0, 0.08)",
		focus: "#121212",
		disabled: "#F2F2F2",
	},
	status: {
		/** Status - solid (light=darkened for AA, dark=동일) */
		error: "#B91C1C",
		success: "#047857",
		warning: "#B45309",
		info: "#1D4ED8",
		/** Status - on-default (solid bg 위 텍스트) */
		errorOnDefault: "#FFFFFF",
		successOnDefault: "#FFFFFF",
		warningOnDefault: "#FFFFFF",
		infoOnDefault: "#FFFFFF",
		/** Status - container (tint 배경, soft variant 용) */
		errorContainer: "#FEE2E2",
		successContainer: "#DCFCE7",
		warningContainer: "#FEF3C7",
		infoContainer: "#DBEAFE",
		/** Status - on-container (tint 위 텍스트) */
		errorOnContainer: "#B91C1C",
		successOnContainer: "#047857",
		warningOnContainer: "#B45309",
		infoOnContainer: "#1D4ED8",
		/** Status - on-surface (앱 surface 위 직접 텍스트, light/dark 자동 swap) */
		errorOnSurface: "#B91C1C",
		successOnSurface: "#047857",
		warningOnSurface: "#B45309",
		infoOnSurface: "#1D4ED8",
	},
	accent: {
		/** Accent */
		subtle: "rgba(0, 0, 0, 0.05)",
		muted: "rgba(26, 26, 26, 0.12)",
		light: "#B3B3B3",
		/** light 는 검정(brand), dark 는 흰색으로 반전 */
		default: "#121212",
		strong: "#121212",
		onSurface: "#FFFFFF",
	},
	skeleton: {
		/** CSS custom property 기반 - `[data-theme="dark"]` 에서 자동 전환. fallback 값은 standalone import (colors 미포함) 시 light 동작 보장. */
		base: "#F3F3F3",
		wave: "#F0F0F0",
		highlight: "#FAFAFA",
	},
} as const;
