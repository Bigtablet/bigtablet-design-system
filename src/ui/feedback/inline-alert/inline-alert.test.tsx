import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../../system/locale-provider";
import { InlineAlert } from "./index";

describe("InlineAlert", () => {
	it("renders title, description and action with the info tone by default", () => {
		const { container } = render(
			<InlineAlert title="만료 예정" action={<button type="button">갱신</button>}>
				7일 뒤 만료됩니다
			</InlineAlert>,
		);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("inline_alert", "inline_alert_tone_info");
		expect(screen.getByText("만료 예정")).toHaveClass("inline_alert_title");
		expect(screen.getByText("7일 뒤 만료됩니다")).toHaveClass("inline_alert_description");
		expect(screen.getByRole("button", { name: "갱신" }).parentElement).toHaveClass(
			"inline_alert_action",
		);
	});

	it("is not a live region unless the consumer asks for one", () => {
		const { container, rerender } = render(<InlineAlert>안내</InlineAlert>);
		expect(container.firstChild).not.toHaveAttribute("role");
		rerender(
			<InlineAlert tone="error" role="alert">
				저장 실패
			</InlineAlert>,
		);
		expect(screen.getByRole("alert")).toHaveTextContent("저장 실패");
	});

	it("shows the tone icon hidden from assistive tech, a custom one, or none", () => {
		const { container, rerender } = render(<InlineAlert tone="warning">경고</InlineAlert>);
		const icon = () => container.querySelector(".inline_alert_icon");
		expect(icon()).toHaveAttribute("aria-hidden", "true");
		expect(icon()?.querySelector("svg")).not.toBeNull();

		rerender(<InlineAlert icon={<span data-testid="mine" />}>경고</InlineAlert>);
		expect(screen.getByTestId("mine")).toBeInTheDocument();

		rerender(<InlineAlert icon={null}>경고</InlineAlert>);
		expect(icon()).toBeNull();
	});

	it("renders a named dismiss button only with onDismiss", () => {
		const onDismiss = vi.fn();
		const { rerender } = render(<InlineAlert>안내</InlineAlert>);
		expect(screen.queryByRole("button")).toBeNull();

		rerender(<InlineAlert onDismiss={onDismiss}>안내</InlineAlert>);
		fireEvent.click(screen.getByRole("button", { name: "알림 닫기" }));
		expect(onDismiss).toHaveBeenCalledTimes(1);

		rerender(
			<InlineAlert onDismiss={onDismiss} dismissLabel="공지 닫기">
				안내
			</InlineAlert>,
		);
		expect(screen.getByRole("button", { name: "공지 닫기" })).toBeInTheDocument();
	});

	it("takes the dismiss label from the locale catalog", () => {
		render(
			<LocaleProvider locale="en">
				<InlineAlert onDismiss={() => {}}>Notice</InlineAlert>
			</LocaleProvider>,
		);
		expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
	});

	it("supports action and dismiss together, each tone and extra props", () => {
		for (const tone of ["neutral", "info", "success", "warning", "error"] as const) {
			const { container, unmount } = render(
				<InlineAlert
					tone={tone}
					className="x"
					data-testid="a"
					action={<button type="button">재시도</button>}
					onDismiss={() => {}}
				>
					본문
				</InlineAlert>,
			);
			expect(container.firstChild).toHaveClass(`inline_alert_tone_${tone}`, "x");
			expect(screen.getAllByRole("button")).toHaveLength(2);
			unmount();
		}
	});

	it("omits empty slots", () => {
		const { container } = render(<InlineAlert title="제목만" />);
		expect(container.querySelector(".inline_alert_description")).toBeNull();
		expect(container.querySelector(".inline_alert_action")).toBeNull();
	});
});
