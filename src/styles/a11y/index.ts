// 생성 파일 - 직접 고치지 말 것. 원본은 src/styles/tokens.json, `pnpm tokens` 로 다시 만든다.

export const a11y = {
	/** a11y 최소 권장 */
	tapMinSize: "44px",
	tapTarget: {
		/** 데스크탑 인라인 폼, 컴팩트 UI. 인터랙티브 컨트롤의 하한이다 - 터치 입력이 있는 화면에서는 responsive_height 로 승급할 것 - 예외: 마우스 전용 내부 도구(admin 등)는 28px 까지 허용 */
		dense: "32px",
		/** 데스크탑 기본 */
		compact: "40px",
		/** 모바일/터치 기본 (44 초과) */
		comfortable: "48px",
		/** 강조 CTA, 풀스크린 액션 */
		spacious: "56px",
	},
	focusRing: "0 0 0 2px #FFFFFF, 0 0 0 4px #121212",
	focusRingError: "0 0 0 2px #FFFFFF, 0 0 0 4px #B91C1C",
	focusRingSuccess: "0 0 0 2px #FFFFFF, 0 0 0 4px #047857",
} as const;

export const controlHeight = {
	/** 컨트롤·아바타처럼 크기 단계가 있는 요소는 픽셀을 직접 쓰지 말고 이 단계를 참조한다. 값은 위 tap target 과 같다 - 이름만 "크기 단계" 로 읽히게 붙인 것이라 responsive_height 의 승급 규칙(sm→md→lg→xl)도 그대로 맞물린다. */
	sm: "32px",
	md: "40px",
	lg: "48px",
	xl: "56px",
} as const;
