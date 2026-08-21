"use client";

import * as React from "react";
import { cn, useSafeLayoutEffect } from "../../../utils";
import "./style.scss";

export type ProseSize = "md" | "lg";

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * 본문 스케일 (기본값: "md").
	 * - `md`: 공지·FAQ·이메일 프리뷰처럼 좁은 폭에 들어가는 본문 (h1 24 / h2 20 / h3 18)
	 * - `lg`: 약관·정책처럼 페이지를 채우는 긴 본문 (h1 28 / h2 24 / h3 20, 제목 위 여백도 넓다)
	 */
	size?: ProseSize;
	/** 루트 div 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLDivElement>;
}

/**
 * 마크다운 등으로 렌더된 본문에 조판을 입힌다.
 *
 * **파서를 포함하지 않는다.** 앱이 `react-markdown` 등으로 만든 결과를 감싸면
 * 자손 셀렉터로 토큰 기반 타이포·간격·색이 적용된다(다크 모드 자동).
 *
 * @example
 * ```tsx
 * <Prose size="lg">
 *   <ReactMarkdown>{policy}</ReactMarkdown>
 * </Prose>
 * ```
 */
export const Prose = ({ size = "md", className, children, ref, ...props }: ProseProps) => {
	// 오버플로 측정을 위해 내부 ref 가 필요하므로, 소비자 ref 와 병합해 둘 다 성립하게 한다.
	const rootRef = React.useRef<HTMLDivElement>(null);
	React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

	// 넓은 표·코드 블록은 자기 안에서 가로 스크롤된다(아래 SCSS). 스크롤 영역은 키보드로도
	// 움직일 수 있어야 하는데(axe `scrollable-region-focusable`), 그 요소를 만드는 건 소비자다.
	// 스크롤 컨테이너로 만든 쪽이 DS 이므로 결과도 DS 가 책임진다 - 실제로 넘칠 때만 탭 정지를
	// 추가하고, 넘치지 않으면 떼어 불필요한 정지가 남지 않게 한다.
	// 레이아웃 측정이라 paint 전에 끝나야 한다 - useEffect 로 미루면 이미 넘치는 표·코드가
	// 한 프레임 동안 tabindex 없이 노출된다. tabs · nav-bar · textarea 와 같은 패턴.
	// children 은 콜백 안에서 쓰지 않지만, 내용이 바뀌면 DOM 을 다시 조회해야 하므로 의존성에 둔다.
	useSafeLayoutEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const targets = Array.from(root.querySelectorAll<HTMLElement>("pre, table"));
		const sync = () => {
			for (const el of targets) {
				if (el.scrollWidth > el.clientWidth) el.setAttribute("tabindex", "0");
				else el.removeAttribute("tabindex");
			}
		};

		// 최초 동기화는 ResizeObserver 유무와 무관하게 한다 - 없다고 건너뛰면 그 환경에서는
		// 넘치는 표·코드에 탭 정지가 아예 붙지 않는다. 관찰은 폭이 바뀔 때 따라가기 위한 것뿐이다.
		sync();
		if (typeof ResizeObserver === "undefined") return;

		const observer = new ResizeObserver(sync);
		observer.observe(root);
		for (const el of targets) observer.observe(el);
		return () => observer.disconnect();
	}, [children]);

	return (
		<div ref={rootRef} className={cn("prose", `prose_size_${size}`, className)} {...props}>
			{children}
		</div>
	);
};

Prose.displayName = "Prose";
