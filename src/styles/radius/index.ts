// 생성 파일 - 직접 고치지 말 것. 원본은 src/styles/tokens.json, `pnpm tokens` 로 다시 만든다.

export const radius = {
	/** 컴포넌트·소비자용 - `var(--bt-*, 원값)`. `:root { --bt-radius-md: 4px }` 처럼 덮어쓰면 따라간다. 문자열이라 Sass 산술(`* 2`, 단항 `-`)이 안 된다 - `calc(2 * #{$x})` 를 쓰거나 원값(`_base_`)을 쓴다. */
	none: "0px",
	xs: "4px",
	sm: "6px",
	md: "8px",
	lg: "12px",
	xl: "16px",
	full: "9999px",
} as const;
