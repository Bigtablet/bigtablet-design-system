/**
 * 스프링의 진입 시작값(`from`)을 만든다.
 *
 * react-spring 은 `from` 이 없으면 **첫 렌더의 `to` 를 초기값으로 잡는다**. 그래서 컴포넌트가
 * 처음부터 열린 상태로 마운트되면(전역 오버레이 스택, `{isOpen && <Modal open />}` 같은 조건부
 * 렌더) 보간 구간이 0 이 되어 등장 애니메이션이 사라진다.
 *
 * 반대로 reduced-motion 에서는 `from` 을 주면 안 된다. 주면 첫 프레임에 `from` 이 DOM 에 커밋된
 * 뒤 `immediate` 가 목표값으로 점프해, 모션 대신 **한 프레임 깜빡임**이 남는다(실측 확인).
 *
 * 두 조건을 한 곳에서 만족시킨다. 스프레드해서 쓴다:
 *
 * ```tsx
 * useSpring({
 *   ...springEnterFrom(reduced, "scale(0.96)"),
 *   to: { opacity: open ? 1 : 0, transform: open ? "scale(1)" : "scale(0.96)" },
 *   immediate: reduced,
 * });
 * ```
 *
 * @param reduced `useReducedMotion()` 결과. true 면 빈 객체를 돌려 `from` 자체를 생략한다
 * @param transform 진입 시작 transform. 생략하면 `opacity` 만 준다(오버레이처럼 transform 이
 *   붙으면 안 되는 요소 - `position: fixed` 자손의 containing block 이 되어버린다)
 */
export function springEnterFrom(
	reduced: boolean,
	transform?: string,
): { from?: { opacity: number; transform?: string } } {
	if (reduced) return {};

	return { from: transform === undefined ? { opacity: 0 } : { opacity: 0, transform } };
}

/** 중앙 패널 오버레이(Modal·AlertModal)의 닫힌 상태 transform. 진입 시작값 = 퇴출 목표값. */
export const OVERLAY_PANEL_CLOSED_TRANSFORM = "scale(0.96) translateY(-4px)";

/** 같은 오버레이의 열린 상태 transform. */
export const OVERLAY_PANEL_OPEN_TRANSFORM = "scale(1) translateY(0px)";

/**
 * 오버레이 진입·퇴출 공용 스프링 설정.
 *
 * `clamp: true` - 진입에도 오버슈트를 두지 않는다. 감쇠비 0.84 에서 오버슈트는 변화량의
 * 0.8%(패널 scale 기준 0.03%)라 눈에 보이지 않는 반면, 진입/퇴출이 갈리는 값이 하나 늘어난다.
 */
export const OVERLAY_SPRING_CONFIG = { tension: 280, friction: 28, clamp: true } as const;
