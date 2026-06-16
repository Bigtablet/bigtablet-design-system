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

	statusError: "#EF4444",
	statusSuccess: "#10B981",
	statusWarning: "#F59E0B",
	statusInfo: "#3B82F6",

	// Navy - Bigtablet 초기 홈페이지 컬러. #47555E 메인 navy + sky blue 패밀리.
	navy50: "#F2F5F8",
	navy100: "#DDE3E9",
	navy200: "#B4C2CD",
	navy300: "#7AA5D2",
	navy400: "#5A8DCB",
	navy500: "#4C7CB6",
	navy600: "#47555E",
	navy700: "#3D4852",
	navy800: "#303841",
	navy900: "#1F2630",

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
		caption: baseColors.neutral500,
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

	// Accent (Bigtablet navy) - 메인 brand 검정과 함께 B2C/마케팅 강조에 사용.
	accent: {
		subtle: baseColors.navy50,
		muted: baseColors.navy100,
		light: baseColors.navy300,
		default: baseColors.navy600,
		strong: baseColors.navy800,
		onSurface: baseColors.neutral0,
	},
} as const;
