// 생성 파일 - 직접 고치지 말 것. 원본은 src/styles/tokens.json, `pnpm tokens` 로 다시 만든다.

export const motion = {
	easing: {
		/** 감속 진입 */
		enter: "cubic-bezier(0.16, 1, 0.3, 1)",
		/** 가속 퇴출 */
		exit: "cubic-bezier(0.4, 0, 1, 1)",
	},
	transition: {
		/** hover, icon */
		fast: "0.1s ease-in-out",
		/** 메뉴 열림 */
		base: "0.2s ease-in-out",
		/** 레이아웃 변화 */
		slow: "0.3s ease-in-out",
		emphasized: "0.25s cubic-bezier(0.4, 0, 0.2, 1)",
		bounce: "0.3s cubic-bezier(0.16, 1, 0.3, 1)",
		fade: "0.15s ease-in-out",
		slide: "0.25s cubic-bezier(0.16, 1, 0.3, 1)",
		scale: "0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
		state: "0.18s ease-in-out",
		enterFast: "0.15s cubic-bezier(0.16, 1, 0.3, 1)",
		enterBase: "0.2s cubic-bezier(0.16, 1, 0.3, 1)",
		exitFast: "0.12s cubic-bezier(0.4, 0, 1, 1)",
		exitBase: "0.15s cubic-bezier(0.4, 0, 1, 1)",
	},
} as const;
