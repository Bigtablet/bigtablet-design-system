import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../general/button";
import { Field } from "../field";
import { TextField } from "../textfield";
import { Form } from "./index";

describe("Form", () => {
	it("routes a server error to the field that owns the name", () => {
		// 422 응답을 필드에 꽂는 표준 경로. 없으면 화면마다 다르게 처리한다.
		render(
			<Form errors={{ email: "이미 사용 중인 이메일입니다" }}>
				<Field name="email" label="이메일">
					<TextField />
				</Field>
				<Field name="nickname" label="닉네임">
					<TextField />
				</Field>
			</Form>,
		);

		expect(screen.getByText("이미 사용 중인 이메일입니다")).toBeInTheDocument();

		const [email, nickname] = screen.getAllByRole("textbox");
		expect(email).toHaveAttribute("aria-invalid", "true");
		expect(nickname).toHaveAttribute("aria-invalid", "false");
	});

	it("lets a field's own error win over the server one", () => {
		// 지역 검증이 서버 응답보다 최신이다. 덮지 못하면 고친 뒤에도 옛 에러가 남는다.
		render(
			<Form errors={{ email: "서버 에러" }}>
				<Field name="email" label="이메일" error="형식이 올바르지 않습니다">
					<TextField />
				</Field>
			</Form>,
		);

		expect(screen.getByText("형식이 올바르지 않습니다")).toBeInTheDocument();
		expect(screen.queryByText("서버 에러")).not.toBeInTheDocument();
	});

	it("prevents the default submit so the page does not reload", () => {
		const onSubmit = vi.fn();
		render(
			<Form onSubmit={onSubmit}>
				<Form.Actions>
					<Button type="submit">저장</Button>
				</Form.Actions>
			</Form>,
		);

		const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
		const form = screen.getByRole("button", { name: "저장" }).closest("form") as HTMLFormElement;
		fireEvent(form, submitEvent);

		expect(onSubmit).toHaveBeenCalledTimes(1);
		expect(submitEvent.defaultPrevented).toBe(true);
	});

	it("leaves a Field outside a Form working", () => {
		// Field 는 Form 없이도 쓸 수 있어야 한다 - 한 화면에 필드 하나뿐인 경우가 흔하다.
		render(
			<Field name="email" label="이메일">
				<TextField />
			</Field>,
		);

		expect(screen.getByLabelText("이메일")).toBe(screen.getByRole("textbox"));
	});

	it("aligns the action row to the end by default", () => {
		const { container } = render(
			<Form>
				<Form.Actions>
					<Button type="submit">저장</Button>
				</Form.Actions>
			</Form>,
		);

		expect(container.querySelector(".form_actions")).toHaveClass("form_actions_end");
	});
});
