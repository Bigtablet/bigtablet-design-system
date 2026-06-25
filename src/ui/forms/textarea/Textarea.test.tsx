import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./index";

describe("Textarea", () => {
	it("renders label + textarea", () => {
		render(<Textarea label="내용" />);
		expect(screen.getByText("내용")).toBeInTheDocument();
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("calls onChangeAction on input (uncontrolled)", () => {
		const onChange = vi.fn();
		render(<Textarea label="내용" onChangeAction={onChange} />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });
		expect(onChange).toHaveBeenCalledWith("hello");
	});

	it("controlled value reflects prop", () => {
		const { rerender } = render(<Textarea value="a" onChangeAction={() => {}} />);
		expect(screen.getByRole("textbox")).toHaveValue("a");
		rerender(<Textarea value="ab" onChangeAction={() => {}} />);
		expect(screen.getByRole("textbox")).toHaveValue("ab");
	});

	it("applies error class + aria-invalid", () => {
		const { container } = render(<Textarea label="내용" error />);
		expect(container.firstChild).toHaveClass("textarea_error");
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
	});

	it("links supportingText via aria-describedby", () => {
		render(<Textarea label="내용" supportingText="도움말" />);
		const ta = screen.getByRole("textbox");
		const helpId = ta.getAttribute("aria-describedby");
		expect(helpId).toBeTruthy();
		expect(screen.getByText("도움말")).toHaveAttribute("id", helpId as string);
	});

	it("renders counter when showCounter + maxLength", () => {
		render(<Textarea label="내용" showCounter maxLength={100} defaultValue="abc" />);
		expect(screen.getByText("3/100")).toBeInTheDocument();
	});

	it("counter updates on input", () => {
		render(<Textarea label="내용" showCounter maxLength={10} />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "hey" } });
		expect(screen.getByText("3/10")).toBeInTheDocument();
	});

	it("respects rows prop", () => {
		render(<Textarea label="내용" rows={5} />);
		expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
	});

	it("disabled state", () => {
		const { container } = render(<Textarea label="내용" disabled />);
		expect(container.firstChild).toHaveClass("textarea_disabled");
		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("delayed IME - onChangeAction NOT called during composition", () => {
		const onChange = vi.fn();
		render(<Textarea label="내용" onChangeAction={onChange} />);
		const ta = screen.getByRole("textbox");
		fireEvent.compositionStart(ta);
		fireEvent.change(ta, { target: { value: "ㅎ" } });
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.compositionEnd(ta, { target: { value: "한" } });
		expect(onChange).toHaveBeenCalledWith("한");
	});

	it("immediate IME - onChangeAction called during composition", () => {
		const onChange = vi.fn();
		render(<Textarea label="내용" imeStrategy="immediate" onChangeAction={onChange} />);
		const ta = screen.getByRole("textbox");
		fireEvent.compositionStart(ta);
		fireEvent.change(ta, { target: { value: "ㅎ" } });
		expect(onChange).toHaveBeenCalledWith("ㅎ");
	});

	it("transformValue applied (non-composition)", () => {
		const onChange = vi.fn();
		render(
			<Textarea
				label="내용"
				transformValue={(v) => v.toUpperCase()}
				onChangeAction={onChange}
			/>,
		);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
		expect(onChange).toHaveBeenCalledWith("ABC");
	});

	it("controlled value does NOT override innerValue mid-composition", () => {
		// immediate + controlled: 조합 중 부모 value 가 되돌아와도 입력 중 글자 보존
		const { rerender } = render(
			<Textarea value="ㄱ" imeStrategy="immediate" onChangeAction={() => {}} />,
		);
		const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
		fireEvent.compositionStart(ta);
		fireEvent.change(ta, { target: { value: "가" } });
		// 부모가 조합 중 이전 value 로 re-render - 가드로 인해 innerValue 유지
		rerender(<Textarea value="ㄱ" imeStrategy="immediate" onChangeAction={() => {}} />);
		expect(ta.value).toBe("가");
		// 조합 종료 후엔 정상 동기화
		fireEvent.compositionEnd(ta, { target: { value: "가" } });
		expect(ta.value).toBe("가");
	});

	it("does NOT emit onChangeAction twice when compositionEnd is followed by duplicate onChange", () => {
		// 일부 브라우저는 compositionEnd 직후 같은 값으로 onChange 를 한 번 더 트리거 → 중복 방출 차단 검증
		const onChange = vi.fn();
		render(<Textarea onChangeAction={onChange} />);
		const ta = screen.getByRole("textbox");
		fireEvent.compositionStart(ta);
		fireEvent.change(ta, { target: { value: "한" } }); // delayed - 조합 중 방출 X
		fireEvent.compositionEnd(ta, { target: { value: "한" } }); // 방출 1회
		fireEvent.change(ta, { target: { value: "한" } }); // 같은 값 재트리거 - 중복 차단
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith("한");
	});


	it("calls onValueChange (canonical) on input", () => {
		const onValueChange = vi.fn();
		render(<Textarea label="내용" onValueChange={onValueChange} />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });
		expect(onValueChange).toHaveBeenCalledWith("hello");
	});

});
