import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dropdown } from "../dropdown";
import "../dropdown/style.scss";
import { TextField } from "../textfield";
import "../textfield/style.scss";
import { Field } from "./index";
import "./style.scss";

const options = [
	{ value: "admin", label: "관리자" },
	{ value: "member", label: "구성원" },
];

// Field 는 안의 입력을 내용 폭으로 둔다(align-items: flex-start) - 대부분의 입력은 원래 내용 폭이고
// fullWidth 로 늘린다. Dropdown 만 "부모 폭을 채운다" 가 약속이라 Field 안에서도 채워야 한다 (#1037).
describe("Field width (Chromium)", () => {
	it("lets a Dropdown fill the field like it fills any other parent", () => {
		const { container } = render(
			<div style={{ width: 360 }}>
				<Field name="role" label="역할">
					<Dropdown options={options} defaultValue="member" />
				</Field>
			</div>,
		);
		const field = container.querySelector(".field") as HTMLElement;
		const dropdown = container.querySelector(".dropdown") as HTMLElement;
		expect(dropdown.getBoundingClientRect().width).toBe(field.getBoundingClientRect().width);
	});

	it("keeps a TextField at its own width unless fullWidth asks otherwise", () => {
		const { container } = render(
			<div style={{ width: 360 }}>
				<Field name="email" label="이메일">
					<TextField />
				</Field>
			</div>,
		);
		const field = container.querySelector(".field") as HTMLElement;
		const input = container.querySelector(".text_field") as HTMLElement;
		expect(input.getBoundingClientRect().width).toBeLessThan(field.getBoundingClientRect().width);
	});
});
