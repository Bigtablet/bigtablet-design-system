import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./index";

const TestConsumer = () => {
	const { mode, resolved, setMode } = useTheme();
	return (
		<div>
			<span data-testid="mode">{mode}</span>
			<span data-testid="resolved">{resolved}</span>
			<button type="button" onClick={() => setMode("light")}>
				light
			</button>
			<button type="button" onClick={() => setMode("dark")}>
				dark
			</button>
			<button type="button" onClick={() => setMode("system")}>
				system
			</button>
		</div>
	);
};

let mqListeners: Array<(e: MediaQueryListEvent) => void> = [];
let systemMatches = false;

beforeEach(() => {
	mqListeners = [];
	systemMatches = false;
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: query.includes("dark") ? systemMatches : !systemMatches,
		media: query,
		addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
			mqListeners.push(cb);
		},
		// **넘어온 콜백만** 뺀다. 통째로 비우면 cleanup 을 아예 안 돌려주는 구현이나 핸들러를
		// 두 번 거는 구현에서도 아래 단정이 그대로 통과한다 - 실패할 수 없는 검사가 된다.
		removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
			const index = mqListeners.indexOf(cb);
			if (index !== -1) mqListeners.splice(index, 1);
		},
		dispatchEvent: () => true,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
	}));
	window.localStorage.clear();
	document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
	document.documentElement.removeAttribute("data-theme");
});

describe("ThemeProvider", () => {
	it("defaults to system mode and resolves to light when prefers-color-scheme=light", () => {
		systemMatches = false;
		render(
			<ThemeProvider>
				<TestConsumer />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("mode")).toHaveTextContent("system");
		expect(screen.getByTestId("resolved")).toHaveTextContent("light");
	});

	it("resolves to dark when system prefers dark", () => {
		systemMatches = true;
		render(
			<ThemeProvider>
				<TestConsumer />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
	});

	it("applies data-theme attribute when mode=dark", () => {
		render(
			<ThemeProvider>
				<TestConsumer />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByText("dark"));
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");
	});

	it("applies data-theme=light when mode=light", () => {
		render(
			<ThemeProvider defaultMode="dark">
				<TestConsumer />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByText("light"));
		expect(document.documentElement).toHaveAttribute("data-theme", "light");
	});

	it("removes data-theme in system mode (so CSS @media takes over)", () => {
		render(
			<ThemeProvider defaultMode="dark">
				<TestConsumer />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByText("system"));
		expect(document.documentElement).not.toHaveAttribute("data-theme");
	});

	it("persists mode to localStorage", () => {
		render(
			<ThemeProvider storageKey="my-theme">
				<TestConsumer />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByText("dark"));
		expect(window.localStorage.getItem("my-theme")).toBe("dark");
	});

	it("reads initial mode from localStorage", () => {
		window.localStorage.setItem("bt-theme", "dark");
		render(
			<ThemeProvider>
				<TestConsumer />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("mode")).toHaveTextContent("dark");
	});

	it("does not persist when storageKey=null", () => {
		render(
			<ThemeProvider storageKey={null}>
				<TestConsumer />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByText("dark"));
		expect(window.localStorage.getItem("bt-theme")).toBeNull();
	});

	it("updates resolved when prefers-color-scheme changes (system mode)", () => {
		render(
			<ThemeProvider>
				<TestConsumer />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("resolved")).toHaveTextContent("light");
		act(() => {
			for (const cb of mqListeners) cb({ matches: true } as MediaQueryListEvent);
		});
		expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
	});

	it("throws when useTheme is used outside provider", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<TestConsumer />)).toThrow("[Bigtablet DS]");
		consoleError.mockRestore();
	});
	it("removes its matchMedia listener on unmount", () => {
		// 구독을 정리하지 않으면 언마운트된 Provider 가 OS 테마 변경마다 계속 깨어난다.
		const { unmount } = render(
			<ThemeProvider>
				<span>child</span>
			</ThemeProvider>,
		);
		expect(mqListeners.length).toBe(1);

		unmount();
		expect(mqListeners.length).toBe(0);
	});
});