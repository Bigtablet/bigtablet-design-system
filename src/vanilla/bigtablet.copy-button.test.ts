import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// 소스를 직접 import 한다 - bigtablet.alert.test.ts 상단 주석 참고.
import { CopyButton, init } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";

resetVanillaDom();

const mount = (
	html = '<button class="bt-button bt-button--sm bt-button--outline" data-bt-copy="10.8.0.2/32">복사</button>',
) => {
	document.body.innerHTML = `<div>${html}</div>`;
	return document.querySelector("button") as HTMLButtonElement;
};
const statusOf = (btn: HTMLElement) => btn.nextElementSibling as HTMLElement;
const flush = () => new Promise((r) => setTimeout(r, 0));

const setClipboard = (writeText?: (text: string) => Promise<void>) => {
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: writeText ? { writeText } : undefined,
	});
};
const setExecCommand = (ok: boolean) => {
	const fn = vi.fn(() => ok);
	Object.defineProperty(document, "execCommand", { configurable: true, writable: true, value: fn });
	return fn;
};

describe("CopyButton (#918)", () => {
	beforeEach(() => {
		setExecCommand(false);
	});
	afterEach(() => {
		setClipboard(undefined);
		vi.useRealTimers();
	});

	it("data-bt-copy 값을 복사하고 문구를 잠시 바꾼 뒤 되돌린다 - 이름은 고정", async () => {
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const writeText = vi.fn(() => Promise.resolve());
		setClipboard(writeText);
		const onCopy = vi.fn();
		const btn = mount();
		CopyButton(btn, { onCopy });

		btn.click();
		await vi.waitFor(() => expect(btn.textContent).toBe("복사됨"));
		expect(writeText).toHaveBeenCalledWith("10.8.0.2/32");
		expect(onCopy).toHaveBeenCalledWith("10.8.0.2/32");
		expect(btn.getAttribute("aria-label")).toBe("복사");
		expect(statusOf(btn).getAttribute("role")).toBe("status");
		expect(statusOf(btn).textContent).toBe("복사됨");
		expect(btn.dataset.state).toBe("copied");

		vi.advanceTimersByTime(2000);
		expect(btn.textContent).toBe("복사");
		expect(statusOf(btn).textContent).toBe("");
	});

	it("Clipboard API 가 없으면 execCommand 로 복사하고 포커스를 되돌린다", async () => {
		setClipboard(undefined);
		const exec = setExecCommand(true);
		const btn = mount('<p id="p">선택한 글</p><button data-bt-copy="abc">복사</button>');
		// jsdom 은 focus() 가 문서 선택을 지운다 - 포커스를 먼저 주고 선택을 잡는다
		btn.focus();
		const range = document.createRange();
		range.selectNodeContents(document.getElementById("p") as HTMLElement);
		document.getSelection()?.addRange(range);

		CopyButton(btn);

		btn.click();
		await vi.waitFor(() => expect(btn.textContent).toBe("복사됨"));
		expect(exec).toHaveBeenCalledWith("copy");
		expect(document.querySelector("textarea")).toBeNull();
		expect(document.activeElement).toBe(btn);
		// 선택 영역 복원은 jsdom 의 Selection 이 문자열을 내지 않아 bigtablet.copy-button.browser.test.ts 가 본다
	});

	it("API 가 거부하고 폴백도 실패하면 실패 문구를 알리고 onError 에 원래 오류를 넘긴다", async () => {
		const denied = new DOMException("denied", "NotAllowedError");
		setClipboard(() => Promise.reject(denied));
		const onError = vi.fn();
		const btn = mount();
		CopyButton(btn, { onError, failedLabel: "복사 실패" });

		btn.click();
		await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(denied));
		expect(statusOf(btn).textContent).toBe("복사 실패");
		expect(btn.textContent).toBe("복사");
	});

	it("연타하면 마지막 복사만 반영한다", async () => {
		const resolvers: Array<() => void> = [];
		setClipboard(() => new Promise<void>((r) => resolvers.push(r)));
		const onCopy = vi.fn();
		let n = 0;
		const btn = mount();
		CopyButton(btn, { text: () => `값 ${++n}`, onCopy });

		btn.click();
		btn.click();
		resolvers[1]?.();
		resolvers[0]?.();
		await vi.waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
		await flush();
		expect(onCopy).toHaveBeenCalledWith("값 2");
	});

	it("text 함수가 throw 하면 실패로 처리한다", async () => {
		setClipboard(() => Promise.resolve());
		const onError = vi.fn();
		const btn = mount();
		CopyButton(btn, {
			text: () => {
				throw new Error("no value");
			},
			onError,
		});

		btn.click();
		await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
		expect(statusOf(btn).textContent).toBe("복사하지 못했습니다");
	});

	it("[data-copy-label] 이 있으면 그 글자만 바꿔 아이콘을 남긴다", async () => {
		setClipboard(() => Promise.resolve());
		const btn = mount(
			'<button data-bt-copy="x"><svg aria-hidden="true"></svg><span data-copy-label>주소 복사</span></button>',
		);
		CopyButton(btn);

		btn.click();
		await vi.waitFor(() =>
			expect(btn.querySelector("[data-copy-label]")?.textContent).toBe("복사됨"),
		);
		expect(btn.querySelector("svg")).not.toBeNull();
		expect(btn.getAttribute("aria-label")).toBe("주소 복사");
	});

	it("label 옵션이 버튼 글자와 달라도 처음부터 문구와 이름이 같다", () => {
		const btn = mount('<button data-bt-copy="x">copy</button>');
		CopyButton(btn, { label: "주소 복사" });
		expect(btn.textContent).toBe("주소 복사");
		expect(btn.getAttribute("aria-label")).toBe("주소 복사");
	});

	it("이름만 따로 줄 수 있다 - data-aria-label · ariaLabel (#966)", async () => {
		setClipboard(() => Promise.resolve());
		const byAttr = mount(
			'<button data-bt-copy="192.168.10.1" data-aria-label="192.168.10.1 주소 복사">복사</button>',
		);
		CopyButton(byAttr);
		expect(byAttr.getAttribute("aria-label")).toBe("192.168.10.1 주소 복사");
		expect(byAttr.textContent).toBe("복사");
		byAttr.click();
		await vi.waitFor(() => expect(byAttr.textContent).toBe("복사됨"));
		expect(byAttr.getAttribute("aria-label")).toBe("192.168.10.1 주소 복사");
		const byOption = mount('<button data-bt-copy="x">복사</button>');
		CopyButton(byOption, { ariaLabel: "x 복사" });
		expect(byOption.getAttribute("aria-label")).toBe("x 복사");
		expect(byOption.textContent).toBe("복사");
	});

	it("onCopy 가 throw 해도 문구는 제때 되돌아가고 예외는 보고된다", async () => {
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		setClipboard(() => Promise.resolve());
		const reported: unknown[] = [];
		const onError = (e: ErrorEvent) => {
			reported.push(e.error);
			e.preventDefault();
		};
		window.addEventListener("error", onError);
		vi.spyOn(console, "error").mockImplementation((err) => reported.push(err));
		const btn = mount();
		CopyButton(btn, {
			onCopy: () => {
				throw new Error("toast broke");
			},
		});

		btn.click();
		await vi.waitFor(() => expect(btn.textContent).toBe("복사됨"));
		expect(reported.some((e) => e instanceof Error && e.message === "toast broke")).toBe(true);
		vi.advanceTimersByTime(2000);
		expect(btn.textContent).toBe("복사");
		window.removeEventListener("error", onError);
	});

	it("자동 초기화되고, destroy 하면 문구 · status · 리스너를 걷는다", async () => {
		const writeText = vi.fn(() => Promise.resolve());
		setClipboard(writeText);
		const btn = mount();
		init();
		const api = (btn as HTMLButtonElement & { _btCopyButton?: { destroy: () => void } })
			._btCopyButton;
		expect(api).toBeDefined();
		expect(btn.type).toBe("button");

		api?.destroy();
		expect(btn.nextElementSibling).toBeNull();
		btn.click();
		await flush();
		expect(writeText).not.toHaveBeenCalled();
	});
});

describe("CopyButton destroy (#973)", () => {
	it("덮어쓴 aria-label 을 원래대로 되돌린다", () => {
		const btn = mount('<button aria-label="원래 이름" data-bt-copy="x">복사</button>');
		CopyButton(btn)?.destroy();
		expect(btn.getAttribute("aria-label")).toBe("원래 이름");
		const bare = mount('<button data-bt-copy="x">복사</button>');
		CopyButton(bare)?.destroy();
		expect(bare.hasAttribute("aria-label")).toBe(false);
	});
});
