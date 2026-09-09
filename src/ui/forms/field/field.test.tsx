import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Radio } from "../radio";
import { RadioGroup } from "../radio-group";
import { TextField } from "../textfield";
import { Toggle } from "../toggle";
import { Field } from "./index";

describe("Field", () => {
	it("connects the label to the input it wraps", () => {
		render(
			<Field name="email" label="이메일">
				<TextField />
			</Field>,
		);

		// 라벨 클릭으로 포커스가 가려면 htmlFor 와 input id 가 같아야 한다.
		expect(screen.getByLabelText("이메일")).toBe(screen.getByRole("textbox"));
	});

	it("describes the input with its help text", () => {
		render(
			<Field name="email" label="이메일" help="로그인 ID 로 사용됩니다">
				<TextField />
			</Field>,
		);

		const input = screen.getByRole("textbox");
		const describedBy = input.getAttribute("aria-describedby");
		expect(describedBy).toBeTruthy();
		expect(document.getElementById(describedBy as string)).toHaveTextContent(
			"로그인 ID 로 사용됩니다",
		);
	});

	it("swaps help for the error and points the input at it", () => {
		// 둘을 동시에 띄우면 어느 쪽을 고쳐야 하는지 흐려지고 세로 간격이 필드마다 달라진다.
		render(
			<Field name="email" label="이메일" help="로그인 ID" error="이미 사용 중인 이메일입니다">
				<TextField />
			</Field>,
		);

		expect(screen.queryByText("로그인 ID")).not.toBeInTheDocument();

		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("aria-invalid", "true");
		expect(
			document.getElementById(input.getAttribute("aria-describedby") as string),
		).toHaveTextContent("이미 사용 중인 이메일입니다");
	});

	it("marks the input required without relying on the asterisk", () => {
		// `*` 는 aria-hidden 이라 스크린리더에 안 읽힌다. 필수는 aria-required 로 전달돼야 한다.
		render(
			<Field name="email" label="이메일" required>
				<TextField />
			</Field>,
		);

		expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
	});

	it("names a group input through aria-labelledby, not htmlFor", () => {
		// role="group" 컨테이너는 <label htmlFor> 로 이름이 붙지 않는다. DatePicker·OtpInput·
		// RadioGroup 이 그 형태라, Field 는 labelId 도 함께 내려준다.
		render(
			<Field name="plan" label="요금제" help="언제든 변경할 수 있습니다">
				<RadioGroup name="plan">
					<Radio value="a" label="A" />
				</RadioGroup>
			</Field>,
		);

		const group = screen.getByRole("radiogroup");
		const labelledBy = group.getAttribute("aria-labelledby");
		expect(labelledBy).toBeTruthy();
		expect(document.getElementById(labelledBy as string)).toHaveTextContent("요금제");
		expect(
			document.getElementById(group.getAttribute("aria-describedby") as string),
		).toHaveTextContent("언제든 변경할 수 있습니다");
	});

	it("puts labelAction on the label row, outside the label element", () => {
		// `<label>` 안에 넣으면 라벨 클릭 → 입력 포커스 동작과 토글 클릭이 겹친다.
		render(
			<Field name="companyName" label="소속" labelAction={<Toggle ariaLabel="소속 없음" />}>
				<TextField />
			</Field>,
		);

		const toggle = screen.getByRole("switch");
		expect(toggle.closest("label")).toBeNull();
		// 조작 요소는 높이가 라벨 한 줄로 고정된 슬롯 안에 있어야 한다 - 없으면 라벨 줄이
		// 조작 요소 높이로 자라 아래 입력이 내려간다(#618). 높이는 jsdom 이 계산하지 않아
		// 구조만 지킨다.
		expect(toggle.parentElement).toHaveClass("field_label_action");
		// 라벨 줄은 FieldContext 밖이다 - 안이면 Toggle 이 자기 ariaLabel 을 버리고
		// Field 라벨("소속")을 자기 이름으로 삼아 이름 없는 토글이 된다.
		expect(toggle).toHaveAccessibleName("소속 없음");
		expect(toggle.closest(".field_label_row")).not.toBeNull();
		// 라벨은 그대로 입력을 가리킨다.
		expect(screen.getByLabelText("소속")).toBe(screen.getByRole("textbox"));
	});

	it("keeps the label row out of the DOM when there is no labelAction", () => {
		// 슬롯이 비면 지금까지의 마크업 그대로 - 기존 화면의 조판이 바뀌면 안 된다.
		const { container } = render(
			<Field name="email" label="이메일">
				<TextField />
			</Field>,
		);

		expect(container.querySelector(".field_label_row")).toBeNull();
	});

	it("leaves the input alone when there is no Field", () => {
		// Field 는 추가 경로다 - 기존 사용처가 바뀌면 안 된다.
		render(<TextField label="이메일" supportingText="도움말" />);

		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("aria-invalid", "false");
		expect(input).not.toHaveAttribute("aria-required");
		expect(
			document.getElementById(input.getAttribute("aria-describedby") as string),
		).toHaveTextContent("도움말");
	});

	it("does not render a second label for the input it wraps", () => {
		// Field 가 라벨을 소유한다. 입력에도 label 을 주면 두 개가 보인다 - 그래서 주지 않는다.
		render(
			<Field name="email" label="이메일">
				<TextField />
			</Field>,
		);

		expect(screen.getAllByText("이메일")).toHaveLength(1);
	});
});
