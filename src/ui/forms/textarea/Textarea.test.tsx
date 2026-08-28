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
			<Textarea label="내용" transformValue={(v) => v.toUpperCase()} onChangeAction={onChange} />,
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

	it("prefers onValueChange over the deprecated onChangeAction when both are given", () => {
		const onValueChange = vi.fn();
		const onChangeAction = vi.fn();
		render(<Textarea label="내용" onValueChange={onValueChange} onChangeAction={onChangeAction} />);

		fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("hello");
		expect(onChangeAction).not.toHaveBeenCalled();
	});

	it("prefers onValueChange over onChangeAction on the mid-composition (immediate) path", () => {
		// imeStrategy="immediate" 는 emit() 을 거치지 않는 별도 방출 경로 - 여기서도 canonical 우선
		const onValueChange = vi.fn();
		const onChangeAction = vi.fn();
		render(
			<Textarea
				label="내용"
				imeStrategy="immediate"
				onValueChange={onValueChange}
				onChangeAction={onChangeAction}
			/>,
		);

		const ta = screen.getByRole("textbox");
		fireEvent.compositionStart(ta);
		fireEvent.change(ta, { target: { value: "ㅎ" } });

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("ㅎ");
		expect(onChangeAction).not.toHaveBeenCalled();
	});

	// ── toolbar 슬롯 ────────────────────────────────────────────────────────

	describe("toolbar", () => {
		it("renders nothing extra when no toolbar is given", () => {
			const { container } = render(<Textarea label="설명" />);

			expect(container.querySelector(".textarea_toolbar")).toBeNull();
			// 컨테이너의 자식은 입력 wrap 하나뿐 - 기존 DOM 과 동일하다.
			const box = container.querySelector(".textarea_container");
			expect(box?.children).toHaveLength(1);
			expect(box?.firstElementChild).toHaveClass("textarea_input_wrap");
		});

		it("puts the toolbar inside the container, above the input", () => {
			// 컨테이너가 품어야 :focus-within 테두리가 툴바까지 감싼다. 밖에 두면 소비자가
			// 모서리와 포커스 링을 직접 맞춰야 했다.
			const { container } = render(
				<Textarea label="설명" toolbar={<button type="button">굵게</button>} />,
			);

			const box = container.querySelector(".textarea_container");
			expect(box?.children).toHaveLength(2);
			expect(box?.firstElementChild).toHaveClass("textarea_toolbar");
			expect(box?.lastElementChild).toHaveClass("textarea_input_wrap");
			expect(screen.getByRole("button", { name: "굵게" })).toBeInTheDocument();
		});

		it("blocks interaction with the toolbar while disabled", () => {
			// `_disabled` 스타일은 opacity 만 걸고 pointer-events 는 건드리지 않는다. inert 가
			// 없으면 비활성 필드의 툴바 버튼이 계속 포커스·클릭된다.
			// (jsdom 은 inert 의 포커스 차단을 구현하지 않아 속성 존재로 고정한다 - 실제 차단은
			//  Chromium 실측으로 확인했다.)
			const { container, rerender } = render(
				<Textarea label="설명" disabled toolbar={<button type="button">굵게</button>} />,
			);
			expect(container.querySelector(".textarea_toolbar")).toHaveAttribute("inert");

			rerender(<Textarea label="설명" toolbar={<button type="button">굵게</button>} />);
			expect(container.querySelector(".textarea_toolbar")).not.toHaveAttribute("inert");
		});

		it("keeps the toolbar inside the disabled dimming", () => {
			// `.textarea_disabled .textarea_container > *` 가 직접 자식만 흐리게 한다.
			// 툴바가 컨테이너 직계여야 입력과 같이 흐려진다.
			const { container } = render(
				<Textarea label="설명" disabled toolbar={<button type="button">굵게</button>} />,
			);

			const toolbar = container.querySelector(".textarea_toolbar");
			expect(toolbar?.parentElement).toHaveClass("textarea_container");
			expect(container.querySelector(".textarea")).toHaveClass("textarea_disabled");
		});
	});
});
