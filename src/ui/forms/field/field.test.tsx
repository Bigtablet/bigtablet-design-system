import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../checkbox";
import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";
import { Radio } from "../radio";
import { RadioGroup } from "../radio-group";
import { TextField } from "../textfield";
import { TimePicker } from "../time-picker";
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

	// ── 복합 컨트롤 (#629) ──────────────────────────────────────────────────────

	/** 문서 안에서 두 번 이상 쓰인 id. `<label for>` 는 첫 번째 것만 잡는다. */
	const duplicateIds = (root: HTMLElement) => {
		const ids = [...root.querySelectorAll("[id]")].map((el) => el.id);
		return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
	};

	it("gives each control inside a composite input its own id", () => {
		// Field 는 컨트롤 하나를 전제로 inputId 를 서브트리에 내린다. DatePicker(Dropdown 3개)
		// 처럼 여럿을 담은 컨트롤이 그 하나를 나눠 쓰면 id 가 겹쳐, 종료일의 "년" 라벨이
		// 시작일 목록을 연다.
		const { container } = render(
			<Field name="period" label="표시 기간">
				<DateRangePicker
					startLabel="표시 시작일"
					endLabel="표시 종료일"
					value={{ start: "", end: "" }}
					onValueChange={() => {}}
				/>
			</Field>,
		);

		expect(duplicateIds(container)).toEqual([]);
	});

	it("points each inner label at the control next to it", () => {
		const { container } = render(
			<Field name="when" label="날짜">
				<DatePicker value="" onValueChange={() => {}} />
			</Field>,
		);

		// 연·월·일 라벨이 각각 자기 옆 버튼을 가리켜야 한다 - 하나라도 남의 것을 가리키면
		// 라벨 클릭이 엉뚱한 목록을 연다.
		const labels = [...container.querySelectorAll("label[for]")].filter(
			(el) => el.getAttribute("for") !== null && el.className.includes("dropdown"),
		);
		expect(labels.length).toBeGreaterThan(0);
		for (const label of labels) {
			const target = document.getElementById(label.getAttribute("for") as string);
			expect(target).not.toBeNull();
			// 라벨과 버튼은 같은 Dropdown 안에 있다.
			expect(label.closest(".dropdown")).toBe(target?.closest(".dropdown"));
		}
	});

	it("names the halves of a range by their own labels, not the Field label", () => {
		// 안쪽 DatePicker 가 Field 라벨을 물려받으면 시작·종료 그룹이 둘 다 "표시 기간" 이 된다.
		render(
			<Field name="period" label="표시 기간">
				<DateRangePicker
					startLabel="표시 시작일"
					endLabel="표시 종료일"
					value={{ start: "", end: "" }}
					onValueChange={() => {}}
				/>
			</Field>,
		);

		expect(screen.getByRole("group", { name: "표시 시작일" })).toBeInTheDocument();
		expect(screen.getByRole("group", { name: "표시 종료일" })).toBeInTheDocument();
		expect(screen.getByRole("group", { name: "표시 기간" })).toBeInTheDocument();
	});

	it("keeps the ids apart inside TimePicker too", () => {
		const { container } = render(
			<Field name="at" label="시간">
				<TimePicker value="" onValueChange={() => {}} />
			</Field>,
		);

		expect(duplicateIds(container)).toEqual([]);
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
	it("keeps its own id and description when the child input also got them from a consumer", () => {
		// Radio 만 `{...props}` 를 뒤에 펼쳐, 소비자가 준 id 가 Field 의 id 를 덮어썼다.
		// 그러면 Field 의 `<label for>` 이 문서에 없는 id 를 가리켜 라벨 클릭이 죽는다.
		render(
			<Field name="plan" label="요금제">
				<Radio id="basic" name="plan" value="b" />
			</Field>,
		);

		const radio = screen.getByRole("radio");
		const label = screen.getByText("요금제");
		expect(radio.id).toBe(label.getAttribute("for"));
	});

	it("marks every wrapped input invalid when the field has an error", () => {
		// 에러 문구를 그리고 aria-describedby 로 연결해도, 입력이 aria-invalid 를 안 내면
		// 스크린리더·검증 요약 도구에는 정상 입력으로 보인다 (WCAG 4.1.2).
		const { rerender } = render(
			<Field name="agree" error="약관에 동의해야 합니다">
				<Checkbox />
			</Field>,
		);
		expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");

		rerender(
			<Field name="agree" error="약관에 동의해야 합니다">
				<Toggle ariaLabel="동의" />
			</Field>,
		);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true");

		rerender(
			<Field name="agree" error="약관에 동의해야 합니다">
				<Radio name="agree" value="y" />
			</Field>,
		);
		expect(screen.getByRole("radio")).toHaveAttribute("aria-invalid", "true");
	});
	it("describes the input with both the field help and the input's own supporting text", () => {
		// 입력이 화면에 그린 supportingText 를 aria-describedby 가 안 가리키면, 눈으로 보이는
		// 제약이 스크린리더에는 전달되지 않는다.
		render(
			<Field name="email" label="이메일" help="로그인 ID 로 사용됩니다">
				<TextField supportingText="회사 이메일만 사용하세요" />
			</Field>,
		);

		const input = screen.getByRole("textbox");
		const ids = (input.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
		const described = ids.map((id) => document.getElementById(id)?.textContent);

		expect(described).toContain("로그인 ID 로 사용됩니다");
		expect(described).toContain("회사 이메일만 사용하세요");
		// 두 id 는 서로 달라야 한다 - 같으면 문서에 중복 id 가 생기고 둘 다 같은 요소로 풀린다.
		expect(new Set(ids).size).toBe(ids.length);
	});
});