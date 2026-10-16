export const a11y = {
	// light 테마 값 - dark 를 따라가려면 `cssVars.a11y`
	focusRing: "0 0 0 3px rgba(0, 0, 0, 0.15)",
	focusRingError: "0 0 0 3px rgba(239, 68, 68, 0.30)",
	focusRingSuccess: "0 0 0 3px rgba(16, 185, 129, 0.30)",

	tapMinSize: "44px",

	tapTarget: {
		dense: "32px",
		compact: "40px",
		comfortable: "48px",
		spacious: "56px",
	},
} as const;

/** 크기 단계가 있는 컨트롤·아바타의 높이 - SCSS `$control_height_*` 와 같다 (값은 `a11y.tapTarget`) */
export const controlHeight = {
	sm: a11y.tapTarget.dense,
	md: a11y.tapTarget.compact,
	lg: a11y.tapTarget.comfortable,
	xl: a11y.tapTarget.spacious,
} as const;
