import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { Alert } from "./bigtablet.js";
import { key, pressEscape, resetVanillaDom, setViewportInset } from "./bigtablet.test-utils";

resetVanillaDom();

// Alert 의 close() 는 퇴출 애니메이션을 기다려 `setTimeout(..., 200)` 안에서 overlay 제거와
// unlockScroll() 을 한다. 실제 타이머로 두면 그 콜백이 이 테스트가 끝난 뒤 **다른 테스트가 도는
// 중에** 발화해 남의 스크롤 잠금 상태를 건드린다. fake timer 로 시점을 직접 통제한다.
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
		// 잠금 해제는 200ms 뒤 - 그 전에는 아직 잠겨 있다.
		expect(document.body.style.overflow).toBe("hidden");

		vi.advanceTimersByTime(200);

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

describe("Alert - 마크업 · 버튼", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const overlay = () => document.querySelector(".bt-alert__overlay") as HTMLElement;

	it("escapes text, wires ARIA ids, and focuses confirm", () => {
		Alert({ title: "<b>제목</b>", message: "<i>내용</i>", variant: "error" });
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
		expect(key(confirm, "Tab").defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(cancel);
		expect(key(cancel, "Tab", { shiftKey: true }).defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(confirm);
		expect(key(confirm, "Tab", { shiftKey: true }).defaultPrevented).toBe(false);
	});

	it("stops trapping after close", () => {
		const { close } = Alert({ message: "m" });
		close();
		expect(key(document.body, "Tab").defaultPrevented).toBe(false);
	});
});
