import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { TagInput } from "./index";

const field = () => screen.getByRole("textbox");
const type = (value: string) => fireEvent.change(field(), { target: { value } });
const enter = () => fireEvent.keyDown(field(), { key: "Enter" });
const tagLabels = () => screen.queryAllByRole("listitem").map((li) => li.textContent?.trim());

describe("TagInput", () => {
	it("commits the draft on Enter and clears the input", () => {
		const onValueChange = vi.fn();
		render(<TagInput onValueChange={onValueChange} />);

		type("react");
		enter();

		expect(onValueChange).toHaveBeenCalledWith(["react"]);
		expect(field()).toHaveValue("");
		expect(screen.getByText("react")).toBeInTheDocument();
	});

	it("keeps Enter from submitting the surrounding form", () => {
		// preventDefault 를 놓치면 첫 태그를 만들려는 Enter 가 폼을 제출한다.
		const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
		render(
			<form onSubmit={onSubmit}>
				<TagInput />
			</form>,
		);

		type("react");
		const event = fireEvent.keyDown(field(), { key: "Enter" });

		expect(event).toBe(false); // preventDefault 됨
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("does not build a tag while the IME is composing", () => {
		// 한글 입력에서 Enter 는 조합 확정용이다. 여기서 태그를 만들면 '한' 이 태그가 되고
		// 사용자가 치려던 '한글' 은 사라진다.
		const onValueChange = vi.fn();
		render(<TagInput onValueChange={onValueChange} />);

		type("한");
		fireEvent.keyDown(field(), { key: "Enter", isComposing: true });

		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("removes the last tag when Backspace is pressed on an empty input", () => {
		// 마우스 없이 되돌리는 유일한 경로다.
		render(<TagInput defaultValue={["a", "b"]} />);

		fireEvent.keyDown(field(), { key: "Backspace" });
		expect(tagLabels()).toEqual(["a"]);
	});

	it("leaves the tags alone when Backspace edits a non-empty draft", () => {
		render(<TagInput defaultValue={["a"]} />);

		type("bc");
		fireEvent.keyDown(field(), { key: "Backspace" });

		expect(tagLabels()).toEqual(["a"]);
	});

	it("splits a pasted list on commas and newlines", () => {
		render(<TagInput />);

		fireEvent.paste(field(), { clipboardData: { getData: () => "a, b\nc" } });

		expect(tagLabels()).toEqual(["a", "b", "c"]);
	});

	it("drops duplicates unless allowDuplicates is set", () => {
		const { unmount } = render(<TagInput defaultValue={["a"]} />);
		type("a");
		enter();
		expect(tagLabels()).toEqual(["a"]);
		unmount();

		render(<TagInput defaultValue={["a"]} allowDuplicates />);
		type("a");
		enter();
		expect(tagLabels()).toEqual(["a", "a"]);
	});

	it("stops at maxTags and says why", () => {
		// readOnly 로 바뀌는 것만으로는 왜 안 들어갔는지 알 수 없다.
		render(<TagInput defaultValue={["a"]} maxTags={2} />);

		type("b");
		enter();
		expect(tagLabels()).toEqual(["a", "b"]);

		fireEvent.paste(field(), { clipboardData: { getData: () => "c,d" } });
		expect(tagLabels()).toEqual(["a", "b"]);
		expect(screen.getByRole("status")).toHaveTextContent("최대 2개까지 추가할 수 있습니다");
	});

	it("commits a leftover draft on blur", () => {
		// Enter 를 잊고 다음 필드로 넘어가면 입력이 조용히 사라진다.
		const onValueChange = vi.fn();
		render(<TagInput onValueChange={onValueChange} />);

		type("react");
		fireEvent.blur(field());

		expect(onValueChange).toHaveBeenCalledWith(["react"]);
	});

	it("returns focus to the input after a chip is removed", () => {
		// 칩이 사라지면 포커스도 사라져, 다음 Tab 이 문서 처음부터 시작한다.
		render(<TagInput defaultValue={["a", "b"]} />);

		fireEvent.click(screen.getByRole("button", { name: "a 제거" }));

		expect(tagLabels()).toEqual(["b"]);
		expect(document.activeElement).toBe(field());
	});

	it("announces what changed", () => {
		render(<TagInput defaultValue={["a"]} />);

		fireEvent.keyDown(field(), { key: "Backspace" });
		expect(screen.getByRole("status")).toHaveTextContent("a 제거됨");

		type("b");
		enter();
		expect(screen.getByRole("status")).toHaveTextContent("b 추가됨");
	});

	it("follows the controlled value instead of its own state", () => {
		const { rerender } = render(<TagInput value={["a"]} />);
		type("b");
		enter();
		// 부모가 값을 올려주지 않으면 태그는 늘지 않는다.
		expect(tagLabels()).toEqual(["a"]);

		rerender(<TagInput value={["a", "b"]} />);
		expect(tagLabels()).toEqual(["a", "b"]);
	});

	it("takes its label and description from a surrounding Field", () => {
		render(
			<Field name="keywords" label="키워드" required help="쉼표로 여러 개">
				<TagInput />
			</Field>,
		);

		const input = field();
		expect(input).toHaveAccessibleName("키워드");
		expect(input).toHaveAccessibleDescription("쉼표로 여러 개");
		expect(input).toHaveAttribute("aria-required", "true");
	});

	it("cannot be edited while disabled", () => {
		render(<TagInput defaultValue={["a"]} disabled />);

		expect(field()).toBeDisabled();
		expect(screen.queryByRole("button", { name: "a 제거" })).not.toBeInTheDocument();
	});
});
