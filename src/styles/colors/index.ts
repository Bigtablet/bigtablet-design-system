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

	// status — SCSS _index.scss 와 동일한 AA 통과(red/green/amber/blue-700) 값
	statusError: "#B91C1C",
	statusSuccess: "#047857",
	statusWarning: "#B45309",
	statusInfo: "#1D4ED8",

	alphaBlack5: "rgba(0, 0, 0, 0.05)",
	alphaBlack8: "rgba(0, 0, 0, 0.08)",
	alphaBlack12: "rgba(26, 26, 26, 0.12)",
	alphaBlack38: "rgba(26, 26, 26, 0.38)",
	alphaBlack50: "rgba(0, 0, 0, 0.50)",
	alphaWhite5: "rgba(255, 255, 255, 0.05)",
	alphaWhite8: "rgba(255, 255, 255, 0.08)",
	alphaWhite12: "rgba(255, 255, 255, 0.12)",
} as const;

// ── Semantic colors ───────────────────────────────────────────────────────────

export const colors = {
	brand: {
		primary: baseColors.brandPrimary,
		onPrimary: baseColors.neutral0,
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
		hoverOnDark: baseColors.alphaWhite5,
		pressedOnDark: baseColors.alphaWhite12,
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
} as const;
