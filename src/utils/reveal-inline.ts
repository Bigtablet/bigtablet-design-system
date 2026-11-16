/**
 * @description
 * 가로로 스크롤되는 `container` 안에서 `target` 이 다 보이도록 `scrollLeft` 만 옮긴다 (#1014).
 * `scrollIntoView` 는 조상 스크롤러(페이지)까지 세로로 움직여 쓰지 않는다. 이미 보이면 그대로 둔다.
 */
export const revealInline = (container: HTMLElement, target: HTMLElement) => {
	const box = container.getBoundingClientRect();
	const rect = target.getBoundingClientRect();
	if (rect.left < box.left) container.scrollLeft -= box.left - rect.left;
	else if (rect.right > box.right) container.scrollLeft += rect.right - box.right;
};
