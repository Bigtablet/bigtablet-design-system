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

// 에러 요약 - 제출 에러를 폼 위 한 곳에서 알린다 (#993)
describe("Form errorSummary", () => {
	const Fields = () => (
		<>
			<Field name="email" label="이메일">
				<TextField />
			</Field>
			<Field name="nickname" label="닉네임">
				<TextField />
			</Field>
		</>
	);

	it("lists each error with its field label and moves focus to the summary", () => {
		render(
			<Form errorSummary errors={{ email: "이미 사용 중입니다", nickname: "필수입니다" }}>
				<Fields />
			</Form>,
		);
		const summary = screen.getByRole("region", { name: "2개 항목을 확인해 주세요" });
		expect(summary).toHaveFocus();
		const links = screen.getAllByRole("link");
		expect(links.map((a) => a.textContent)).toEqual([
			"이메일: 이미 사용 중입니다",
			"닉네임: 필수입니다",
		]);
	});

	it("focuses the field when its summary link is clicked", () => {
		render(
			<Form errorSummary errors={{ nickname: "필수입니다" }}>
				<Fields />
			</Form>,
		);
		fireEvent.click(screen.getByRole("link", { name: "닉네임: 필수입니다" }));
		expect(screen.getAllByRole("textbox")[1]).toHaveFocus();
	});

	it("does not announce form errors again from each field, but keeps a field's own error alert", () => {
		render(
			<Form errorSummary errors={{ email: "서버 에러", nickname: "서버 에러 2" }}>
				<Field name="email" label="이메일">
					<TextField />
				</Field>
				<Field name="nickname" label="닉네임" error="지역 검증">
					<TextField />
				</Field>
			</Form>,
		);
		const alerts = screen.getAllByRole("alert");
		expect(alerts).toHaveLength(1);
		expect(alerts[0]).toHaveTextContent("닉네임: 지역 검증");
	});

	it("refocuses the summary after a submit, not on every re-render", () => {
		const Screen = ({ tick }: { tick: number }) => (
			<Form errorSummary errors={{ email: `에러` }} data-tick={tick} onSubmit={() => {}}>
				<Fields />
				<Button type="submit">저장</Button>
			</Form>
		);
		const { rerender } = render(<Screen tick={0} />);
		const button = screen.getByRole("button", { name: "저장" });
		button.focus();
		rerender(<Screen tick={1} />);
		expect(button).toHaveFocus();
		fireEvent.submit(button.closest("form") as HTMLFormElement);
		rerender(<Screen tick={2} />);
		expect(screen.getByRole("region", { name: "1개 항목을 확인해 주세요" })).toHaveFocus();
	});

	it("draws nothing when there are no errors or the option is off", () => {
		const { rerender } = render(
			<Form errorSummary errors={{ email: undefined }}>
				<Fields />
			</Form>,
		);
		expect(screen.queryByRole("region")).toBeNull();
		rerender(
			<Form errors={{ email: "에러" }}>
				<Fields />
			</Form>,
		);
		expect(screen.queryByRole("region")).toBeNull();
		expect(screen.getByRole("alert")).toHaveTextContent("이메일: 에러");
	});

	// 비동기 제출 - 제출 중 재렌더에 남은 이전 에러가 아니라 응답으로 온 새 에러에서 포커스한다 (#993)
	it("waits for new errors after an async submit before moving focus", () => {
		const Screen = ({ errors, busy }: { errors: Record<string, string>; busy: boolean }) => (
			<Form errorSummary errors={errors} aria-busy={busy} onSubmit={() => {}}>
				<Fields />
				<Button type="submit">저장</Button>
			</Form>
		);
		const first = { email: "옛 에러" };
		const { rerender } = render(<Screen errors={first} busy={false} />);
		const button = screen.getByRole("button", { name: "저장" });
		button.focus();
		fireEvent.submit(button.closest("form") as HTMLFormElement);
		rerender(<Screen errors={first} busy />);
		expect(button).toHaveFocus();
		rerender(<Screen errors={{ email: "새 에러" }} busy={false} />);
		expect(screen.getByRole("region", { name: "1개 항목을 확인해 주세요" })).toHaveFocus();
	});

	it("does not steal focus for errors that appear without a submit", () => {
		const { rerender } = render(
			<Form errorSummary errors={{}}>
				<Fields />
			</Form>,
		);
		const input = screen.getAllByRole("textbox")[0] as HTMLElement;
		input.focus();
		rerender(
			<Form errorSummary errors={{ email: "불러온 에러" }}>
				<Fields />
			</Form>,
		);
		expect(input).toHaveFocus();
	});

	it("renders an entry without a matching Field as plain text, not a dead link", () => {
		render(
			<Form errorSummary errors={{ unknown: "알 수 없는 에러" }}>
				<Fields />
			</Form>,
		);
		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getByRole("region")).toHaveTextContent("알 수 없는 에러");
	});
});
