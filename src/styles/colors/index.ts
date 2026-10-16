// ── Base colors ───────────────────────────────────────────────────────────────

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
	neutral925: "#141414",
	neutral950: "#0A0A0A",

	// caption 전용 AA 값 (neutral_500 과 분리 — SCSS _index.scss 와 동일)
	textCaptionLight: "#6F6F6F",
	textCaptionDark: "#808080",

	// status — SCSS _index.scss 와 동일한 AA 통과(red/green/amber/blue-700) 값
	statusError: "#B91C1C",
	statusSuccess: "#047857",
	statusWarning: "#B45309",
	statusInfo: "#1D4ED8",

	// status - dark 테마에서 surface 위 직접 쓰는 밝은 값
	statusErrorDarkText: "#F87171",
	statusSuccessDarkText: "#4ADE80",
	statusWarningDarkText: "#FBBF24",
	statusInfoDarkText: "#60A5FA",

	// status container (연한 tint 배경) - light / dark
	statusErrorContainerLight: "#FEE2E2",
	statusSuccessContainerLight: "#DCFCE7",
	statusWarningContainerLight: "#FEF3C7",
	statusInfoContainerLight: "#DBEAFE",
	statusErrorContainerDark: "rgba(127, 29, 29, 0.35)",
	statusSuccessContainerDark: "rgba(6, 78, 59, 0.35)",
	statusWarningContainerDark: "rgba(120, 53, 15, 0.35)",
	statusInfoContainerDark: "rgba(30, 58, 138, 0.35)",

	// status on-container - dark (light 는 status* 와 같다)
	statusErrorOnContainerDark: "#FCA5A5",
	statusSuccessOnContainerDark: "#86EFAC",
	statusWarningOnContainerDark: "#FCD34D",
	statusInfoOnContainerDark: "#93C5FD",

	// skeleton - light (neutral 스케일 밖의 off-white)
	skeletonBase: "#F3F3F3",
	skeletonWave: "#F0F0F0",
	skeletonHighlight: "#FAFAFA",

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

// ── Semantic colors ───────────────────────────────────────────────────────────
// light 테마 값이다 - 인라인 스타일이 dark 테마를 따라가야 하면 `cssVars.colors` 를 쓴다.
// 키는 CSS 변수 `--bt-color-{그룹}-{키 kebab}` 와 1:1 이다(`src/styles/tokens.test.ts` 가 검사).

export const colors = {
	brand: {
		primary: baseColors.brandPrimary,
		onPrimary: baseColors.neutral0,
		primaryContainer: baseColors.alphaBlack5,
	},

	text: {
		heading: baseColors.neutral900,
		body: baseColors.neutral700,
		caption: baseColors.textCaptionLight,
		brand: baseColors.brandPrimary,
		inverse: baseColors.neutral0,
		disabled: baseColors.alphaBlack38,
	},

	bg: {
		solid: baseColors.neutral0,
		solidDim: baseColors.neutral50,
		additive: baseColors.alphaBlack5,
		disabled: baseColors.alphaBlack12,
		overlay: baseColors.alphaBlack50,
		inverseSurface: baseColors.neutral800,
	},

	state: {
		hoverOnLight: baseColors.alphaBlack5,
		pressedOnLight: baseColors.alphaBlack12,
		focusOnLight: baseColors.alphaBlack8,
		hoverOnDark: baseColors.alphaWhite5,
		pressedOnDark: baseColors.alphaWhite12,
		focusOnDark: baseColors.alphaWhite8,
	},

	border: {
		default: baseColors.neutral200,
		hover: baseColors.neutral400,
		subtle: baseColors.alphaBlack8,
		focus: baseColors.neutral900,
		disabled: baseColors.neutral100,
	},

	status: {
		error: baseColors.statusError,
		success: baseColors.statusSuccess,
		warning: baseColors.statusWarning,
		info: baseColors.statusInfo,
		// solid 배경 위 텍스트
		errorOnDefault: baseColors.neutral0,
		successOnDefault: baseColors.neutral0,
		warningOnDefault: baseColors.neutral0,
		infoOnDefault: baseColors.neutral0,
		// 연한 tint 배경 (soft variant)
		errorContainer: baseColors.statusErrorContainerLight,
		successContainer: baseColors.statusSuccessContainerLight,
		warningContainer: baseColors.statusWarningContainerLight,
		infoContainer: baseColors.statusInfoContainerLight,
		// tint 배경 위 텍스트
		errorOnContainer: baseColors.statusError,
		successOnContainer: baseColors.statusSuccess,
		warningOnContainer: baseColors.statusWarning,
		infoOnContainer: baseColors.statusInfo,
		// 앱 surface 위 직접 텍스트 (dark 에서 밝은 값으로 바뀐다)
		errorOnSurface: baseColors.statusError,
		successOnSurface: baseColors.statusSuccess,
		warningOnSurface: baseColors.statusWarning,
		infoOnSurface: baseColors.statusInfo,
	},

	// Accent (brand 검정 기반 - light=검정, dark=흰색 반전)
	accent: {
		subtle: baseColors.alphaBlack5,
		muted: baseColors.alphaBlack12,
		light: baseColors.neutral400,
		default: baseColors.brandPrimary,
		strong: baseColors.neutral900,
		onSurface: baseColors.neutral0,
	},

	skeleton: {
		base: baseColors.skeletonBase,
		wave: baseColors.skeletonWave,
		highlight: baseColors.skeletonHighlight,
	},
} as const;
