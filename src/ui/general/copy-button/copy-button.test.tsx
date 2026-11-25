import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../../system/locale-provider";
import { CopyButton } from "./index";

const writeText = vi.fn(async (_: string) => {});
beforeEach(() => {
	writeText.mockReset().mockResolvedValue(undefined);
	Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});
afterEach(() => {
	Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
	vi.useRealTimers();
});

const click = async (el: HTMLElement) => {
	await act(async () => {
		fireEvent.click(el);
	});
};

describe("CopyButton", () => {
	it("copies the text, shows 복사됨, announces it and calls onCopy", async () => {
		const onCopy = vi.fn();
		render(<CopyButton text="https://bigtablet.com/i/abc" onCopy={onCopy} />);
		expect(screen.getByRole("status")).toBeEmptyDOMElement();
		await click(screen.getByRole("button", { name: "복사" }));
		expect(writeText).toHaveBeenCalledWith("https://bigtablet.com/i/abc");
		expect(onCopy).toHaveBeenCalledWith("https://bigtablet.com/i/abc");
		// 이름은 "복사" 그대로 - 보이는 문구만 바뀌고 낭독은 status 한 번
		const button = screen.getByRole("button", { name: "복사" });
		expect(button).toHaveTextContent("복사됨");
		expect(screen.getByRole("status")).toHaveTextContent("복사됨");
	});

	// 표처럼 여러 개면 이름으로 구분한다 - 보이는 글자는 짧게 (#966)
	it("takes aria-label as the name while the visible text stays the label", async () => {
		render(
			<>
				<CopyButton text="192.168.10.1" aria-label="192.168.10.1 주소 복사" />
				<CopyButton text="10.0.0.1" iconOnly aria-label="10.0.0.1 주소 복사" />
			</>,
		);
		const first = screen.getByRole("button", { name: "192.168.10.1 주소 복사" });
		expect(first).toHaveTextContent("복사");
		expect(screen.getByRole("button", { name: "10.0.0.1 주소 복사" })).toBeInTheDocument();
		await click(first);
		expect(first).toHaveAccessibleName("192.168.10.1 주소 복사"); // 복사 뒤에도 이름은 그대로
		expect(first).toHaveTextContent("복사됨");
	});

	// 글자만 바뀌면 놓치기 쉽다 - 상태 클래스(색)와 아이콘으로도 보인다 (#1158)
	it("marks the copied and failed states with a class and a different icon", async () => {
		vi.useFakeTimers();
		const { container } = render(<CopyButton text="x" resetAfter={500} />);
		const button = screen.getByRole("button");
		const iconPath = () => button.querySelector("svg")?.innerHTML;
		const idleIcon = iconPath();

		await click(button);
		expect(button).toHaveClass("copy_button", "copy_button_copied");
		const copiedIcon = iconPath();
		expect(copiedIcon).not.toBe(idleIcon);

		act(() => vi.advanceTimersByTime(500));
		expect(button).not.toHaveClass("copy_button_copied");
		expect(iconPath()).toBe(idleIcon);

		writeText.mockRejectedValue(new Error("denied"));
		await click(button);
		expect(button).toHaveClass("copy_button_failed");
		expect(iconPath()).not.toBe(idleIcon);
		expect(iconPath()).not.toBe(copiedIcon);
		// 두 문구를 가상 요소로 잡아 단추 폭이 흔들리지 않게 한다 - 보이는 글자에는 섞이지 않는다
		const label = container.querySelector(".copy_button_label") as HTMLElement;
		expect(label.dataset).toMatchObject({ label: "복사", copied: "복사됨" });
		expect(button).toHaveTextContent(/^복사$/);
	});

	it("goes back to the copy label after resetAfter", async () => {
		vi.useFakeTimers();
		render(<CopyButton text="x" resetAfter={500} />);
		await click(screen.getByRole("button", { name: "복사" }));
		expect(screen.getByRole("button")).toHaveTextContent("복사됨");
		act(() => vi.advanceTimersByTime(500));
		expect(screen.getByRole("button")).toHaveTextContent(/^복사$/);
		expect(screen.getByRole("status")).toBeEmptyDOMElement();
	});

	it("reads a function text at click time", async () => {
		let n = 0;
		render(<CopyButton text={() => `v${++n}`} />);
		await click(screen.getByRole("button"));
		expect(writeText).toHaveBeenCalledWith("v1");
	});

	it("keeps the icon-only button name stable and announces through status", async () => {
		render(<CopyButton text="key" iconOnly label="API 키 복사" />);
		await click(screen.getByRole("button", { name: "API 키 복사" }));
		expect(screen.getByRole("button", { name: "API 키 복사" })).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveTextContent("복사됨");
	});

	it("announces failure and calls onError once", async () => {
		const denied = new Error("denied");
		writeText.mockRejectedValue(denied);
		Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
		const onError = vi.fn();
		const onCopy = vi.fn();
		render(<CopyButton text="x" onError={onError} onCopy={onCopy} />);
		await click(screen.getByRole("button"));
		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith(denied);
		expect(onCopy).not.toHaveBeenCalled();
		expect(screen.getByRole("status")).toHaveTextContent("복사하지 못했습니다");
	});

	it("uses custom labels, the locale catalog, disabled and className", async () => {
		const { unmount } = render(
			<CopyButton text="x" label="링크 복사" copiedLabel="링크 복사됨" className="c" disabled />,
		);
		const button = screen.getByRole("button", { name: "링크 복사" });
		expect(button).toBeDisabled();
		expect(button).toHaveClass("c");
		unmount();

		render(
			<LocaleProvider locale="en">
				<CopyButton text="x" />
			</LocaleProvider>,
		);
		await click(screen.getByRole("button", { name: "Copy" }));
		expect(screen.getByRole("button", { name: "Copy" })).toHaveTextContent("Copied");
	});

	it("treats a throwing text function as a failure", async () => {
		const boom = new Error("no value yet");
		const onError = vi.fn();
		render(
			<CopyButton
				text={() => {
					throw boom;
				}}
				onError={onError}
			/>,
		);
		await click(screen.getByRole("button"));
		expect(writeText).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledWith(boom);
		expect(screen.getByRole("status")).toHaveTextContent("복사하지 못했습니다");
	});

	it("forwards button attributes and ref", () => {
		const ref = { current: null as HTMLButtonElement | null };
		render(
			<>
				<span id="hint">초대 링크</span>
				<CopyButton
					text="x"
					id="copy-invite"
					data-testid="cb"
					aria-describedby="hint"
					title="복사"
					ref={ref}
				/>
			</>,
		);
		const button = screen.getByTestId("cb");
		expect(button).toHaveAttribute("id", "copy-invite");
		expect(button).toHaveAccessibleDescription("초대 링크");
		expect(ref.current).toBe(button);
	});

	it("calls onError on every failure, even the same error twice in a row", async () => {
		const boom = new Error("same");
		const onError = vi.fn();
		render(
			<CopyButton
				text={() => {
					throw boom;
				}}
				onError={onError}
			/>,
		);
		await click(screen.getByRole("button"));
		await click(screen.getByRole("button"));
		expect(onError).toHaveBeenCalledTimes(2);
	});
});
