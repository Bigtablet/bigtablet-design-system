import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { Alert } from "./bigtablet.js";
import { key, pressEscape, resetVanillaDom, setViewportInset } from "./bigtablet.test-utils";

resetVanillaDom();

// Alert 의 close() 는 퇴출 애니메이션이 끝난 뒤 overlay 를 걷고 unlockScroll() 을 한다(#909).
// jsdom 에는 getAnimations 가 없어 "돌고 있는 애니메이션 없음" 으로 보고 바로 걷는다 -
// 기다리는 경로는 아래 "퇴출 모션" describe 가 getAnimations 를 세워 확인한다.
// fake timer 는 그 전 지연 구현에서 남은 것으로, 타이머가 남의 테스트로 새지 않게 계속 둔다.
describe("Alert", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		setViewportInset(0);
	});

	afterEach(() => {
		// 남은 지연 콜백(overlay 제거 + unlockScroll)을 이 테스트 안에서 소진시킨 뒤 되돌린다.
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("Escape 로 닫으면 onCancel 을 경유한다", () => {
		const onCancel = vi.fn();
		Alert({ title: "삭제", message: "정말?", showCancel: true, onCancel });

		pressEscape();

		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("오버레이 클릭으로 닫아도 onCancel 을 경유한다", () => {
		const onCancel = vi.fn();
		Alert({ title: "삭제", message: "정말?", showCancel: true, onCancel });

		(document.querySelector(".bt-alert__overlay") as HTMLElement).click();

		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("닫으면 스크롤 잠금이 풀린다", () => {
		Alert({ title: "삭제", message: "정말?", showCancel: true });
		expect(document.body.dataset.btOpenModals).toBe("1");

		pressEscape();
		// 돌고 있는 애니메이션이 없으면 바로 풀린다 - 딤이 사라진 뒤 휠이 막혀 있지 않게
		expect(document.querySelector(".bt-alert__overlay")).toBeNull();
		expect(document.body.style.overflow).toBe("");
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});

	it("closeOnOverlay: false 면 오버레이 클릭으로 닫히지 않는다", () => {
		const onCancel = vi.fn();
		const alert = Alert({ title: "삭제", message: "정말?", closeOnOverlay: false, onCancel });

		(document.querySelector(".bt-alert__overlay") as HTMLElement).click();

		expect(onCancel).not.toHaveBeenCalled();

		// 이 케이스는 끝까지 열려 있으므로 직접 닫는다 - 안 닫으면 Alert 가 `document` 에 건
		// keydown 리스너와 스크롤 잠금이 파일 끝까지 남는다.
		alert?.close();
	});
});

describe("Alert - 퇴출 모션 (#909)", () => {
	// jsdom 에는 Web Animations 가 없다 - 오버레이에 퇴출 애니메이션 하나가 도는 것처럼 세운다.
	function stubExitAnimation(settle: "resolve" | "reject" = "resolve") {
		let done = () => {};
		const finished = new Promise<void>((resolve, reject) => {
			done =
				settle === "resolve" ? resolve : () => reject(new DOMException("aborted", "AbortError"));
		});
		const spy = vi.spyOn(HTMLElement.prototype, "getAnimations").mockImplementation(function (
			this: HTMLElement,
		) {
			return this.classList.contains("is-closing") ? [{ finished } as unknown as Animation] : [];
		});
		return { done, restore: () => spy.mockRestore() };
	}

	beforeEach(() => {
		setViewportInset(0);
		// jsdom 은 getAnimations 를 정의하지 않아 spyOn 할 자리를 먼저 만든다
		if (!("getAnimations" in HTMLElement.prototype)) {
			Object.defineProperty(HTMLElement.prototype, "getAnimations", {
				configurable: true,
				writable: true,
				value: () => [],
			});
		}
	});

	it("퇴출 애니메이션이 끝날 때까지 오버레이와 스크롤 잠금을 유지한다", async () => {
		const anim = stubExitAnimation();
		Alert({ title: "삭제", message: "정말?", showCancel: true });

		pressEscape();
		const overlay = document.querySelector(".bt-alert__overlay");
		expect(overlay?.classList.contains("is-closing")).toBe(true);
		expect(overlay?.hasAttribute("inert")).toBe(true);
		expect(document.body.dataset.btOpenModals).toBe("1");

		anim.done();
		await vi.waitFor(() => expect(document.querySelector(".bt-alert__overlay")).toBeNull());
		expect(document.body.dataset.btOpenModals).toBeUndefined();
		anim.restore();
	});

	it("닫히는 중 연타·Escape 에도 close 가 다시 돌지 않는다", async () => {
		const anim = stubExitAnimation();
		const onCancel = vi.fn();
		Alert({ title: "삭제", message: "정말?", showCancel: true, onCancel });

		pressEscape();
		pressEscape();
		(document.querySelector("[data-alert-cancel]") as HTMLElement).click();
		(document.querySelector(".bt-alert__overlay") as HTMLElement).click();
		expect(onCancel).toHaveBeenCalledTimes(1);

		anim.done();
		await vi.waitFor(() => expect(document.querySelector(".bt-alert__overlay")).toBeNull());
		// 잠금 카운터가 음수로 내려가지 않고 깨끗이 풀린다
		expect(document.body.dataset.btOpenModals).toBeUndefined();
		expect(document.body.style.overflow).toBe("");
		anim.restore();
	});

	it("닫히는 중 확인을 연타해도 onConfirm 은 한 번만 돈다", async () => {
		const anim = stubExitAnimation();
		const onConfirm = vi.fn();
		Alert({ title: "삭제", message: "정말?", onConfirm });

		const confirm = document.querySelector("[data-alert-confirm]") as HTMLElement;
		confirm.click();
		confirm.click();
		expect(onConfirm).toHaveBeenCalledTimes(1);

		anim.done();
		await vi.waitFor(() => expect(document.querySelector(".bt-alert__overlay")).toBeNull());
		anim.restore();
	});

	it("진입 도중 닫혀 애니메이션이 취소돼도 오버레이를 걷는다", async () => {
		const anim = stubExitAnimation("reject");
		Alert({ title: "삭제", message: "정말?" });

		pressEscape();
		anim.done();
		await vi.waitFor(() => expect(document.querySelector(".bt-alert__overlay")).toBeNull());
		expect(document.body.dataset.btOpenModals).toBeUndefined();
		anim.restore();
	});

	it("포커스는 퇴출 모션을 기다리지 않고 바로 트리거로 돌아간다", () => {
		const anim = stubExitAnimation();
		const trigger = document.createElement("button");
		document.body.appendChild(trigger);
		trigger.focus();
		Alert({ title: "삭제", message: "정말?" });

		pressEscape();
		expect(document.activeElement).toBe(trigger);
		anim.done();
		anim.restore();
		trigger.remove();
	});
});

describe("Alert - 마크업 · 버튼", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const overlay = () => document.querySelector(".bt-alert__overlay") as HTMLElement;

	it("escapes text, wires ARIA ids, and focuses confirm", () => {
		Alert({ title: "<b>제목</b>", message: "<i>내용</i>", tone: "error" });
		const panel = overlay().querySelector(".bt-alert__modal") as HTMLElement;
		const title = overlay().querySelector(".bt-alert__title") as HTMLElement;
		const message = overlay().querySelector(".bt-alert__message") as HTMLElement;
		expect(overlay()).toHaveClass("bt-alert--error", "is-open");
		expect(title.textContent).toBe("<b>제목</b>");
		expect(panel.getAttribute("role")).toBe("alertdialog");
		expect(panel.getAttribute("aria-modal")).toBe("true");
		expect(panel.getAttribute("aria-labelledby")).toBe(title.id);
		expect(panel.getAttribute("aria-describedby")).toBe(message.id);
		expect(document.activeElement).toBe(overlay().querySelector("[data-alert-confirm]"));
	});

	it("falls back to the info tone when tone is passed as undefined", () => {
		Alert({ message: "m", tone: undefined });
		expect(overlay()).toHaveClass("bt-alert--info");
	});

	it("omits the title and cancel button by default and aligns actions", () => {
		Alert({ message: "m" });
		expect(overlay().querySelector(".bt-alert__title")).toBeNull();
		expect(overlay().querySelector(".bt-alert__modal")?.hasAttribute("aria-labelledby")).toBe(
			false,
		);
		expect(overlay().querySelector("[data-alert-cancel]")).toBeNull();
		expect(overlay().querySelector<HTMLElement>(".bt-alert__actions")?.style.justifyContent).toBe(
			"flex-end",
		);
		expect(overlay().querySelector("[data-alert-confirm]")).not.toHaveClass("bt-button--danger");

		for (const [align, css] of [
			["left", "flex-start"],
			["center", "center"],
		] as const) {
			document.body.innerHTML = "";
			Alert({ message: "m", actionsAlign: align });
			expect(overlay().querySelector<HTMLElement>(".bt-alert__actions")?.style.justifyContent).toBe(
				css,
			);
		}
	});

	it("routes confirm and cancel to their callbacks and removes the overlay after the fade", () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		Alert({
			message: "m",
			showCancel: true,
			destructive: true,
			confirmText: "삭제",
			cancelText: "취소",
			onConfirm,
			onCancel,
		});
		const confirm = overlay().querySelector("[data-alert-confirm]") as HTMLButtonElement;
		expect(confirm).toHaveClass("bt-button--danger", "bt-button--filled");
		expect(overlay().querySelector("[data-alert-cancel]")).toHaveClass("bt-button--outline");
		confirm.click();
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).not.toHaveBeenCalled();
		vi.advanceTimersByTime(200);
		expect(document.querySelector(".bt-alert__overlay")).toBeNull();

		Alert({ message: "m", showCancel: true, onConfirm, onCancel });
		(overlay().querySelector("[data-alert-cancel]") as HTMLButtonElement).click();
		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("traps Tab between its buttons", () => {
		Alert({ message: "m", showCancel: true });
		const cancel = overlay().querySelector("[data-alert-cancel]") as HTMLElement;
		const confirm = overlay().querySelector("[data-alert-confirm]") as HTMLElement;
		// 첫 포커스는 취소 - React useFocusTrap 과 같다 (#973)
		expect(document.activeElement).toBe(cancel);
		expect(key(cancel, "Tab", { shiftKey: true }).defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(confirm);
		expect(key(confirm, "Tab").defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(cancel);
		expect(key(cancel, "Tab").defaultPrevented).toBe(false);
	});

	it("stops trapping after close", () => {
		const { close } = Alert({ message: "m" });
		close();
		// 앞 테스트들의 Alert 가 열린 채라 body 대신 페이지 버튼에서 - body 는 가장 위 대화상자가 가져간다
		const page = document.createElement("button");
		document.body.appendChild(page);
		page.focus();
		expect(key(page, "Tab").defaultPrevented).toBe(false);
	});

	it("onConfirm 에서 띄운 다음 Alert 의 포커스를 빼앗지 않는다 (#898)", () => {
		const trigger = document.createElement("button");
		document.body.appendChild(trigger);
		trigger.focus();
		Alert({
			message: "삭제할까요?",
			onConfirm: () => Alert({ message: "삭제됨", confirmText: "닫기" }),
		});
		(document.querySelector("[data-alert-confirm]") as HTMLButtonElement).click();
		expect(document.activeElement?.textContent).toBe("닫기");
		(document.activeElement as HTMLButtonElement).click();
		expect(document.activeElement).toBe(trigger);
	});
});
