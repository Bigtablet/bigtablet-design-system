// ── Base colors ───────────────────────────────────────────────────────────────

export const baseColors = {
	brandPrimary: "#121212",
	blue600: "#1A73E8",

	neutral0: "#FFFFFF",
	neutral50: "#F4F4F4",
	neutral200: "#E5E5E5",
	neutral300: "#999999",
	neutral400: "#B3B3B3",
	neutral500: "#888888",
	neutral700: "#666666",
	neutral900: "#121212",

	statusError: "#EF4444",
	statusSuccess: "#10B981",
	statusWarning: "#F59E0B",
	statusInfo: "#3B82F6",

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
		body: baseColors.neutral500,
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
		disabled: "#F2F2F2",
	},

	status: {
		error: baseColors.statusError,
		success: baseColors.statusSuccess,
		warning: baseColors.statusWarning,
		info: baseColors.statusInfo,
	},
} as const;
