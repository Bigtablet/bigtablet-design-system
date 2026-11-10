import { beforeEach, describe, expect, it, vi } from "vitest";
// 소스를 직접 import 한다 - bigtablet.alert.test.ts 상단 주석 참고.
import { Toast } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";

resetVanillaDom();

const toasts = () => Array.from(document.querySelectorAll<HTMLElement>(".bt-toast"));
/** 위에서 i 번째 토스트 (0 = 최신). 없으면 테스트를 바로 실패시킨다 */
const nth = (i: number) => {
	const el = toasts()[i];
	if (!el) throw new Error(`toast #${i} not found`);
	return el;
};
const progressOf = (el: Element) => el.querySelector(".bt-toast__progress") as HTMLElement;
const endProgress = (el: Element) => progressOf(el).dispatchEvent(new Event("animationend"));

// jsdom 에는 Web Animations 가 없다 - 닫힌 토스트에 퇴출 transition 하나가 도는 것처럼 세운다.
function stubExitAnimation() {
	let done = () => {};
	const finished = new Promise<void>((resolve) => {
		done = resolve;
	});
	vi.spyOn(HTMLElement.prototype, "getAnimations").mockImplementation(function (this: HTMLElement) {
		return this.dataset.state === "closed" ? [{ finished } as unknown as Animation] : [];
	});
	return { done: () => done() };
}

describe("Toast", () => {
	beforeEach(() => {
		// jsdom 은 getAnimations 를 정의하지 않아 spyOn 할 자리를 먼저 만든다
		if (!("getAnimations" in HTMLElement.prototype)) {
			Object.defineProperty(HTMLElement.prototype, "getAnimations", {
				configurable: true,
				writable: true,
				value: () => [],
			});
		}
	});

	it("리전을 한 번만 만들고 메시지를 텍스트로 넣는다", () => {
		Toast("<b>저장</b>했습니다", "success");
		Toast("두 번째", "info");

		expect(document.querySelectorAll(".bt-toast-container")).toHaveLength(1);
		const region = document.querySelector(".bt-toast-container");
		expect(region?.getAttribute("role")).toBe("region");
		expect(region?.getAttribute("aria-label")).toBe("알림");
		const first = nth(1);
		expect(first.querySelector(".bt-toast__message")?.textContent).toBe("<b>저장</b>했습니다");
		expect(first.querySelector("b")).toBeNull();
		expect(first.querySelector(".bt-toast__icon--success")).not.toBeNull();
	});

	// 리전은 라이브 리전이 아니고, 문구만 숨은 공지 영역에 들어간다 - error 는 alert, 나머지는 status (#994)
	it("error 는 alert, 나머지는 status 공지 영역에 문구만 넣는다", () => {
		vi.useFakeTimers();
		Toast("실패", "error", { action: { label: "다시", onClick: () => {} } });
		Toast("안내", "info");
		vi.runAllTimers();
		vi.useRealTimers();

		const region = document.querySelector(".bt-toast-container") as HTMLElement;
		expect(region.hasAttribute("aria-live")).toBe(false);
		const announcer = (role: string) =>
			region.querySelector(`.bt-toast__announcer[role="${role}"]`) as HTMLElement;
		expect(announcer("alert").textContent).toBe("실패");
		expect(announcer("status").textContent).toBe("안내");
		// 보이는 메시지는 보조기술에서 뺀다 - 두 번 읽히지 않게
		expect(nth(0).querySelector(".bt-toast__live")?.getAttribute("aria-hidden")).toBe("true");
	});

	it("닫으면 공지 영역의 문구도 뺀다", () => {
		vi.useFakeTimers();
		Toast("하나", "info");
		vi.runAllTimers();
		vi.useRealTimers();
		const status = document.querySelector('.bt-toast__announcer[role="status"]') as HTMLElement;
		expect(status.textContent).toBe("하나");
		(nth(0).querySelector(".bt-toast__close") as HTMLButtonElement).click();
		expect(status.textContent).toBe("");
	});

	it("모르는 tone 은 neutral 로 그린다", () => {
		Toast("a", "toString" as never);
		Toast("b");

		for (const el of toasts()) {
			expect(el.querySelector(".bt-toast__icon--neutral svg")).not.toBeNull();
		}
	});

	it("최신이 위로 쌓이고 5개를 넘으면 가장 오래된 것을 퇴출 경로로 내보낸다", () => {
		const anim = stubExitAnimation();
		for (let i = 1; i <= 6; i++) Toast(`토스트 ${i}`);

		const all = toasts();
		expect(nth(0).textContent).toContain("토스트 6");
		expect(all).toHaveLength(6);
		expect(all.filter((el) => el.dataset.state === "closed").map((el) => el.textContent)).toEqual([
			"토스트 1",
		]);
		anim.done();
	});

	it("막대가 다 줄면 닫히고, 닫기 버튼·dismiss 로도 닫힌다", () => {
		Toast("a");
		const b = Toast("b");
		Toast("c");

		const c = nth(0);
		endProgress(nth(2));
		(c.querySelector(".bt-toast__close") as HTMLElement).click();
		b.dismiss();
		b.dismiss(); // 두 번 불러도 괜찮다

		expect(toasts()).toHaveLength(0);
	});

	it("duration 을 막대 시간으로 넘기고, Infinity 면 막대가 없다", () => {
		Toast("a", "info", { duration: 5000 });
		Toast("b", "info", { duration: Number.POSITIVE_INFINITY });

		const infinite = nth(0);
		const timed = nth(1);
		expect(progressOf(timed).style.getPropertyValue("--bt-toast-duration")).toBe("5000ms");
		expect(progressOf(infinite)).toBeNull();
	});

	it("퇴출 모션이 끝날 때까지 남아 있고, 그동안 inert 다", async () => {
		const anim = stubExitAnimation();
		const t = Toast("a");

		t.dismiss();
		const el = nth(0);
		expect(el.dataset.state).toBe("closed");
		expect(el.hasAttribute("inert")).toBe(true);

		anim.done();
		await vi.waitFor(() => expect(toasts()).toHaveLength(0));
	});

	it("action 은 한 번만 실행되고 토스트를 닫는다", () => {
		const anim = stubExitAnimation();
		const onClick = vi.fn();
		Toast("삭제했습니다", "neutral", { action: { label: "실행 취소", onClick } });

		const btn = document.querySelector(".bt-toast__action") as HTMLElement;
		expect(btn.textContent).toBe("실행 취소");
		btn.click();
		btn.click();

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(nth(0).dataset.state).toBe("closed");
		anim.done();
	});

	it("action 이 throw 해도 토스트는 닫히고 다시 실행되지 않는다", () => {
		const onClick = vi.fn(() => {
			throw new Error("boom");
		});
		Toast("a", "neutral", { action: { label: "되돌리기", onClick } });

		const btn = document.querySelector(".bt-toast__action") as HTMLElement;
		// jsdom 은 리스너 예외를 window "error" 로 보고한다 - 기대한 예외라 여기서 삼킨다
		const swallow = (e: ErrorEvent) => e.preventDefault();
		window.addEventListener("error", swallow);
		vi.spyOn(console, "error").mockImplementation(() => {});
		btn.click();
		btn.click();
		window.removeEventListener("error", swallow);

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(toasts()).toHaveLength(0);
	});

	it("포커스가 있던 토스트가 닫히면 이웃 토스트의 닫기 버튼으로 넘긴다", () => {
		Toast("old");
		Toast("new");
		const newer = nth(0);
		const older = nth(1);
		const closeOf = (el: Element) => el.querySelector(".bt-toast__close") as HTMLElement;

		closeOf(newer).focus();
		closeOf(newer).click();

		expect(document.activeElement).toBe(closeOf(older));
	});

	it("closeLabel · regionLabel 을 바꿀 수 있다", () => {
		Toast("Saved", "success", { closeLabel: "Close", regionLabel: "Notifications" });

		expect(document.querySelector(".bt-toast__close")?.getAttribute("aria-label")).toBe("Close");
		expect(document.querySelector(".bt-toast-container")?.getAttribute("aria-label")).toBe(
			"Notifications",
		);
	});
});
