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
		expect(screen.getByRole("button", { name: "복사됨" })).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveTextContent("복사됨");
	});

	it("goes back to the copy label after resetAfter", async () => {
		vi.useFakeTimers();
		render(<CopyButton text="x" resetAfter={500} />);
		await click(screen.getByRole("button", { name: "복사" }));
		expect(screen.getByRole("button", { name: "복사됨" })).toBeInTheDocument();
		act(() => vi.advanceTimersByTime(500));
		expect(screen.getByRole("button", { name: "복사" })).toBeInTheDocument();
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
		expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
	});
});
