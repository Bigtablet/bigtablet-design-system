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
	// 대상 목록은 **sync 안에서 매번 다시 조회한다.** 한 번 잡아 두면 나중에 들어온 내용을
	// 놓친다 - `<Prose><AsyncMarkdown /></Prose>` 는 효과가 돌 때 서브트리가 비어 있고,
	// fetch 가 끝나도 `children` 의 정체는 그대로라 효과가 다시 돌지 않는다. 늦게 그려진 넓은
	// 표에 탭 정지가 영영 안 붙는다(axe scrollable-region-focusable).
	//
	// 그래서 의존성도 비운다. `children` 을 넣으면 부모가 리렌더할 때마다(옆 칸에 입력이 하나만
	// 있어도) 옵저버를 헐고 다시 만들고 레이아웃을 동기로 읽는다. DOM 변화는 아래
	// MutationObserver 가 알려준다.
	useSafeLayoutEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const hasResizeObserver = typeof ResizeObserver !== "undefined";
		const observed = new WeakSet<Element>();
		let resizeObserver: ResizeObserver | null = null;

		const sync = () => {
			for (const el of root.querySelectorAll<HTMLElement>("pre, table")) {
				if (el.scrollWidth > el.clientWidth) el.setAttribute("tabindex", "0");
				else el.removeAttribute("tabindex");
				if (resizeObserver && !observed.has(el)) {
					resizeObserver.observe(el);
					observed.add(el);
				}
			}
		};

		if (hasResizeObserver) {
			resizeObserver = new ResizeObserver(sync);
			resizeObserver.observe(root);
		}

		// 최초 동기화는 ResizeObserver 유무와 무관하게 한다 - 없다고 건너뛰면 그 환경에서는
		// 넘치는 표·코드에 탭 정지가 아예 붙지 않는다. 관찰은 폭이 바뀔 때 따라가기 위한 것뿐이다.
		sync();

		const mutationObserver =
			typeof MutationObserver === "undefined"
				? null
				: new MutationObserver(() => {
						sync();
					});
		mutationObserver?.observe(root, { childList: true, subtree: true, characterData: true });

		return () => {
			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
		};
	}, []);

	return (
		<div ref={rootRef} className={cn("prose", `prose_size_${size}`, className)} {...props}>
			{children}
		</div>
	);
};

Prose.displayName = "Prose";
