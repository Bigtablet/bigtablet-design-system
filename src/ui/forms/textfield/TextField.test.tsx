import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./index";

describe("TextField", () => {
	it("renders with label", () => {
		render(<TextField label="Email" />);
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
	});

	it("renders with helper text", () => {
		render(<TextField supportingText="Enter your email address" />);
		expect(screen.getByText("Enter your email address")).toBeInTheDocument();
	});

	it("shows error state", () => {
		render(<TextField error supportingText="Invalid email" />);
		const root = screen.getByRole("textbox").closest(".text_field");
		expect(root).toHaveClass("text_field_error");
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
	});

	it("handles value changes", () => {
		const handleChange = vi.fn();
		render(<TextField onChangeAction={handleChange} />);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "test@example.com" } });

		expect(handleChange).toHaveBeenCalledWith("test@example.com");
	});

	it("transforms value", () => {
		const handleChange = vi.fn();
		render(<TextField onChangeAction={handleChange} transformValue={(v) => v.toUpperCase()} />);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "hello" } });

		expect(handleChange).toHaveBeenCalledWith("HELLO");
	});

	it("renders with leading and trailing icons", () => {
		render(
			<TextField
				leadingIcon={<span data-testid="lead">Q</span>}
				trailingIcon={<span data-testid="trail">X</span>}
			/>,
		);
		expect(screen.getByTestId("lead")).toBeInTheDocument();
		expect(screen.getByTestId("trail")).toBeInTheDocument();
	});

	it("hides label when showLabel is false", () => {
		render(<TextField label="Email" showLabel={false} />);
		expect(screen.queryByText("Email")).not.toBeInTheDocument();
	});

	it("sets aria-label when showLabel is false", () => {
		render(<TextField label="Email" showLabel={false} />);
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-label", "Email");
	});

	it("does not set aria-label when showLabel is true", () => {
		render(<TextField label="Email" />);
		expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-label");
	});

	it("renders full width", () => {
		render(<TextField fullWidth />);
		expect(screen.getByRole("textbox").closest(".text_field")).toHaveClass("text_field_full_width");
	});

	it("can be disabled", () => {
		render(<TextField disabled />);
		expect(screen.getByRole("textbox")).toBeDisabled();
		expect(screen.getByRole("textbox").closest(".text_field")).toHaveClass("text_field_disabled");
	});

	it("supports controlled mode", () => {
		const { rerender } = render(<TextField value="initial" />);
		expect(screen.getByRole("textbox")).toHaveValue("initial");

		rerender(<TextField value="updated" />);
		expect(screen.getByRole("textbox")).toHaveValue("updated");
	});

	it("supports uncontrolled mode with defaultValue", () => {
		render(<TextField defaultValue="default" />);
		expect(screen.getByRole("textbox")).toHaveValue("default");
	});

	it("links helper text with aria-describedby", () => {
		render(<TextField label="Email" supportingText="Required field" />);
		const input = screen.getByRole("textbox");
		const helperId = input.getAttribute("aria-describedby");
		expect(helperId).toBeTruthy();
		expect(document.getElementById(helperId!)).toHaveTextContent("Required field");
	});

	it("handles IME composition correctly", () => {
		const handleChange = vi.fn();
		render(<TextField onChangeAction={handleChange} />);

		const input = screen.getByRole("textbox");

		fireEvent.compositionStart(input);
		fireEvent.change(input, { target: { value: "중" } });
		expect(handleChange).not.toHaveBeenCalled();

		fireEvent.compositionEnd(input, { target: { value: "중간" } });
		expect(handleChange).toHaveBeenCalledWith("중간");
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it("applies transform after IME composition ends", () => {
		const handleChange = vi.fn();
		render(<TextField onChangeAction={handleChange} transformValue={(v) => v.toUpperCase()} />);

		const input = screen.getByRole("textbox");

		fireEvent.compositionStart(input);
		fireEvent.change(input, { target: { value: "abc" } });
		fireEvent.compositionEnd(input, { target: { value: "abc" } });

		expect(handleChange).toHaveBeenCalledWith("ABC");
	});

	it("calls onValueChange (canonical) on input", () => {
		const handleChange = vi.fn();
		render(<TextField onValueChange={handleChange} />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "test@example.com" } });
		expect(handleChange).toHaveBeenCalledWith("test@example.com");
	});

	it("prefers onValueChange over the deprecated onChangeAction when both are given", () => {
		const onValueChange = vi.fn();
		const onChangeAction = vi.fn();
		render(<TextField onValueChange={onValueChange} onChangeAction={onChangeAction} />);

		fireEvent.change(screen.getByRole("textbox"), { target: { value: "test@example.com" } });

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("test@example.com");
		expect(onChangeAction).not.toHaveBeenCalled();
	});

	it("prefers onValueChange over onChangeAction on the mid-composition (immediate) path", () => {
		// imeStrategy="immediate" 는 emit() 을 거치지 않는 별도 방출 경로 - 여기서도 canonical 우선
		const onValueChange = vi.fn();
		const onChangeAction = vi.fn();
		render(
			<TextField
				imeStrategy="immediate"
				onValueChange={onValueChange}
				onChangeAction={onChangeAction}
			/>,
		);

		const input = screen.getByRole("textbox");
		fireEvent.compositionStart(input);
		fireEvent.change(input, { target: { value: "ㅈ" } });

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("ㅈ");
		expect(onChangeAction).not.toHaveBeenCalled();
	});

	// ── variant ────────────────────────────────────────────────────────────

	it("defaults to the outline variant and emits no filled class", () => {
		render(<TextField />);
		const root = screen.getByRole("textbox").closest(".text_field");
		expect(root).toHaveClass("text_field_variant_outline");
		expect(root).not.toHaveClass("text_field_variant_filled");
	});

	it("emits the filled variant class", () => {
		render(<TextField variant="filled" />);
		const root = screen.getByRole("textbox").closest(".text_field");
		expect(root).toHaveClass("text_field_variant_filled");
		expect(root).not.toHaveClass("text_field_variant_outline");
	});

	// ── success ────────────────────────────────────────────────────────────

	it("shows success state without marking the input invalid", () => {
		render(<TextField success supportingText="사용 가능한 이메일입니다" />);
		const input = screen.getByRole("textbox");
		expect(input.closest(".text_field")).toHaveClass("text_field_success");
		expect(input).toHaveAttribute("aria-invalid", "false");
	});

	it("links success helper text with aria-describedby", () => {
		render(<TextField success label="Email" supportingText="Looks good" />);
		const input = screen.getByRole("textbox");
		const helperId = input.getAttribute("aria-describedby");
		expect(helperId).toBeTruthy();
		expect(document.getElementById(helperId!)).toHaveTextContent("Looks good");
	});

	it("lets error win over success when both are set", () => {
		render(<TextField error success supportingText="Invalid email" />);
		const input = screen.getByRole("textbox");
		const root = input.closest(".text_field");
		expect(root).toHaveClass("text_field_error");
		expect(root).not.toHaveClass("text_field_success");
		expect(input).toHaveAttribute("aria-invalid", "true");
	});

	it("combines the filled variant with the success state", () => {
		render(<TextField variant="filled" success />);
		const root = screen.getByRole("textbox").closest(".text_field");
		expect(root).toHaveClass("text_field_variant_filled", "text_field_success");
	});

	// filled 는 disabled 에서도 테두리를 되살리지 않는다. jsdom 은 스타일시트를 적용하지
	// 않으므로 계산된 border-color 대신, 특이도 오버라이드가 겨냥하는 두 루트 클래스가
	// 함께 붙는지를 확인한다 (`.text_field_disabled.text_field_variant_filled`).
	it("keeps the filled variant class alongside disabled", () => {
		render(<TextField variant="filled" disabled />);
		const root = screen.getByRole("textbox").closest(".text_field");
		expect(root).toHaveClass("text_field_variant_filled", "text_field_disabled");
	});

	// ── Action slots (aria-hidden 회귀 방지) ─────────────────────────────────
	// 장식 슬롯은 aria-hidden 을 유지하고 조작 슬롯은 붙이지 않는다. 이 두 짝이 어긋나면
	// 포커스는 가는데 보조기기에 없는 요소(WCAG 4.1.2 위반)가 되고 Chrome 이 aria-hidden 적용을
	// 거부한다 — 조작 요소를 trailingIcon 에 넣던 앱들이 실제로 밟은 버그.
	it("keeps decorative icon slots hidden from the accessibility tree", () => {
		render(
			<TextField
				leadingIcon={<span data-testid="lead">Q</span>}
				trailingIcon={<span data-testid="trail">X</span>}
			/>,
		);
		expect(screen.getByTestId("lead").closest("[aria-hidden]")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		expect(screen.getByTestId("trail").closest("[aria-hidden]")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
	});

	it("exposes action slots to the accessibility tree", () => {
		render(
			<TextField
				leadingAction={
					<button type="button" aria-label="Search">
						Q
					</button>
				}
				trailingAction={
					<button type="button" aria-label="Toggle">
						X
					</button>
				}
			/>,
		);
		const search = screen.getByRole("button", { name: "Search" });
		const toggle = screen.getByRole("button", { name: "Toggle" });
		expect(search.closest("[aria-hidden]")).toBeNull();
		expect(toggle.closest("[aria-hidden]")).toBeNull();
		expect(search.parentElement).toHaveClass("text_field_icon", "text_field_action");
		expect(toggle.parentElement).toHaveClass("text_field_icon", "text_field_action");
	});

	it("lets the action slot win over the icon slot on the same side", () => {
		render(
			<TextField
				leadingIcon={<span data-testid="lead">Q</span>}
				leadingAction={
					<button type="button" aria-label="Search">
						Q
					</button>
				}
				trailingIcon={<span data-testid="trail">X</span>}
				trailingAction={
					<button type="button" aria-label="Toggle">
						X
					</button>
				}
			/>,
		);
		expect(screen.queryByTestId("lead")).not.toBeInTheDocument();
		expect(screen.queryByTestId("trail")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Toggle" })).toBeInTheDocument();
	});

	// ── Password toggle ────────────────────────────────────────────────────
	it("toggles the password input type and swaps the accessible label", () => {
		render(<TextField label="Password" type="password" showPasswordToggle />);
		const input = screen.getByLabelText("Password");
		expect(input).toHaveAttribute("type", "password");

		const toggle = screen.getByRole("button", { name: "Show password" });
		expect(toggle.closest("[aria-hidden]")).toBeNull();

		fireEvent.click(toggle);
		expect(input).toHaveAttribute("type", "text");
		expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
		expect(input).toHaveAttribute("type", "password");
	});

	it("uses injected password toggle labels", () => {
		render(
			<TextField
				type="password"
				showPasswordToggle
				passwordToggleLabels={{ show: "비밀번호 보기", hide: "비밀번호 숨기기" }}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "비밀번호 보기" }));
		expect(screen.getByRole("button", { name: "비밀번호 숨기기" })).toBeInTheDocument();
	});

	// 토글은 clear 를 이긴다 - 값이 찬 비밀번호 칸에서 토글이 사라지면 쓸 수 없다.
	it("keeps the password toggle visible when clearable also has a value", () => {
		render(<TextField type="password" showPasswordToggle clearable defaultValue="secret" />);
		expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
	});

	it("leaves the input type untouched when the toggle is off", () => {
		render(<TextField label="Password" type="password" />);
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
