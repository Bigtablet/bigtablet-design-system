// 생성 파일 - 직접 고치지 말 것. 원본은 src/styles/tokens.json, `pnpm tokens` 로 다시 만든다.

export const skeleton = {
	color: {
		/** CSS custom property 기반 - `[data-theme="dark"]` 에서 자동 전환. fallback 값은 standalone import (colors 미포함) 시 light 동작 보장. */
		base: "#E5E5E5",
		wave: "#E2E2E2",
		highlight: "#F0F0F0",
	},
	gradient: "linear-gradient(90deg, #E5E5E5 25%, #F0F0F0 37%, #E2E2E2 63%)",
	radius: {
		sm: "6px",
		md: "8px",
		lg: "12px",
	},
	height: {
		/** 4px */
		xs: "0.25rem",
		/** 8px */
		sm: "0.5rem",
		/** 12px */
		md: "0.75rem",
		/** 16px */
		lg: "1rem",
		/** 20px */
		xl: "1.25rem",
	},
	animation: {
		duration: "1.4s",
		timing: "ease-in-out",
	},
} as const;
