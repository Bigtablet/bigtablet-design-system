/**
 * jsdom 에는 `Element.prototype.getAnimations` 가 없다 - usePresence 는 그러면 바로 언마운트한다.
 * 퇴출 transition 이 도는 상태를 흉내 내려고, 모든 요소가 끝나지 않은 애니메이션 하나를 돌려주게 한다.
 * `finish()` 로 끝낸다. 되돌리기는 setup.ts 의 afterEach 가 `restoreAnimationStub()` 으로 한다 -
 * 테스트가 중간에 실패해도 다음 테스트로 새지 않게.
 */
export function stubPendingAnimation() {
	let finish = () => {};
	const finished = new Promise<void>((resolve) => {
		finish = resolve;
	});
	(Element.prototype as { getAnimations?: () => Animation[] }).getAnimations = () => [
		{ finished } as unknown as Animation,
	];
	return {
		finish: () => {
			finish();
			return finished;
		},
	};
}

export function restoreAnimationStub() {
	delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
}
