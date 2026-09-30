import { afterEach, describe, expect, it, vi } from "vitest";
import { registerOverlay } from "./overlay-stack";

/**
 * 공유 오버레이 Escape 스택의 단위 테스트.
 *
 * 스택은 모듈 스코프라 테스트 간 누수를 막아야 한다 - 등록/리스너를 tracker 로 모아
 * afterEach 에서 강제 정리한다 (어떤 assert 가 던져도 스택이 반드시 비워지도록).
 */

const cleanups: Array<() => void> = [];

/** registerOverlay + 자동 정리 등록 */
const open = (fn: () => void) => {
	const unreg = registerOverlay(fn);
	cleanups.push(unreg);
	return unreg;
};

/** window 레벨 소비자 리스너 + 자동 정리 등록 (document bubble → window 로 올라온다) */
const consumerOnWindow = (fn: () => void) => {
	window.addEventListener("keydown", fn);
	cleanups.push(() => window.removeEventListener("keydown", fn));
};

/** document.body 에서 Escape 발생 → body(target) → document(bubble) → window(bubble) */
const pressEscape = () =>
	document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

afterEach(() => {
	for (const c of cleanups.splice(0)) c();
	vi.restoreAllMocks();
});

describe("overlay-stack", () => {
	it("calls only the top (last-registered) overlay's onEscape", () => {
		const first = vi.fn();
		const second = vi.fn();
		open(first);
		open(second);

		pressEscape();

		expect(second).toHaveBeenCalledTimes(1);
		expect(first).not.toHaveBeenCalled();
	});

	it("falls back to the next overlay once the top unregisters (LIFO)", () => {
		const first = vi.fn();
		const second = vi.fn();
		open(first);
		const unregSecond = open(second);

		unregSecond();
		pressEscape();

		// 최상단이 빠지면 그 아래가 새 최상단이 되어 Escape 를 받는다
		expect(first).toHaveBeenCalledTimes(1);
		expect(second).not.toHaveBeenCalled();
	});

	it("attaches no listener while the stack is empty (does not swallow global Escape)", () => {
		const consumer = vi.fn();
		consumerOnWindow(consumer);

		// 등록 전 - 레지스트리 리스너가 없어 소비자 핸들러가 그대로 받는다
		pressEscape();
		expect(consumer).toHaveBeenCalledTimes(1);
	});

	it("stops the Escape from reaching window-level consumer handlers while open", () => {
		const consumer = vi.fn();
		consumerOnWindow(consumer);
		const onEscape = vi.fn();
		open(onEscape);

		pressEscape();

		// stopImmediatePropagation 으로 window 로의 전파까지 차단 (최상단 오버레이만 반응)
		expect(onEscape).toHaveBeenCalledTimes(1);
		expect(consumer).not.toHaveBeenCalled();
	});

	it("leaves the top overlay alone when a child already consumed the Escape via preventDefault", () => {
		// 목록 훅(Combobox·Dropdown)은 stopPropagation 없이 preventDefault 로만 "처리했다" 를
		// 알린다. 그 신호를 안 보면 Modal 안에서 목록을 Esc 로 닫는 순간 Modal 까지 닫힌다(#697).
		const onEscape = vi.fn();
		open(onEscape);

		const consumed = new KeyboardEvent("keydown", {
			key: "Escape",
			bubbles: true,
			cancelable: true,
		});
		consumed.preventDefault();
		document.body.dispatchEvent(consumed);
		expect(onEscape).not.toHaveBeenCalled();

		// 소비되지 않은 다음 Escape 는 그대로 최상단을 닫는다.
		pressEscape();
		expect(onEscape).toHaveBeenCalledTimes(1);
	});

	it("releases the global listener again once the stack empties", () => {
		const onEscape = vi.fn();
		open(onEscape)();

		const consumer = vi.fn();
		consumerOnWindow(consumer);
		pressEscape();

		// 스택이 비면 레지스트리 리스너가 제거되어 소비자가 다시 Escape 를 받는다
		expect(onEscape).not.toHaveBeenCalled();
		expect(consumer).toHaveBeenCalledTimes(1);
	});

	it("ignores non-Escape keys", () => {
		const onEscape = vi.fn();
		open(onEscape);

		document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		expect(onEscape).not.toHaveBeenCalled();
	});

	it("unregister is idempotent and only removes its own entry", () => {
		const first = vi.fn();
		const second = vi.fn();
		open(first);
		const unregSecond = open(second);

		unregSecond();
		unregSecond(); // 두 번째 호출은 no-op - first 를 지우지 않아야 함

		pressEscape();
		expect(first).toHaveBeenCalledTimes(1);
	});
});
