import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Stepper } from "./index";
import "./style.scss";

const WIDTHS = [375, 800];
const STEP_SETS = [
	["입력", "완료"],
	["업로드", "매핑·검증", "등록 완료"],
];

// 아래 두 묶음은 폰이 아닌 화면에서 좁은 상자에 놓인 경우다 - 폰 폭(compact)은 글을 숨기는 다른 배치라 따로 본다
describe("Stepper horizontal layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	for (const width of WIDTHS) {
		for (const labels of STEP_SETS) {
			it(`puts the last of ${labels.length} steps at the right edge without wrapping at ${width}px`, () => {
				const { container, unmount } = render(
					<div style={{ width }}>
						<Stepper steps={labels.map((label) => ({ id: label, label }))} current={0} />
					</div>,
				);
				const list = container.querySelector("ol")!.getBoundingClientRect();
				const last = container.querySelector("li:last-child")!;
				// li 박스가 아니라 내용 - li 는 1/N 폭이라 원래도 끝까지 가고, 비는 건 그 안이다
				const content = last.querySelector(".stepper_content")!.getBoundingClientRect();
				const label = last.querySelector(".stepper_label")!;
				const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);

				expect(Math.abs(content.right - list.right)).toBeLessThan(1);
				expect(label.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5);
				unmount();
			});
		}
	}

	// 선은 라벨 바로 뒤에서 시작해 인디케이터 중심 높이에 놓인다 - 설명이 라벨보다 길어도 라벨과 선 사이가 뜨지 않는다
	// 라벨이 여러 조각(텍스트 + <strong>)이어도 조각 사이에 연결선용 간격이 들어가지 않는다
	it("keeps a rich label in one piece", () => {
		const { container, unmount } = render(
			<div style={{ width: 800 }}>
				<Stepper
					steps={[
						{
							id: "verify",
							label: (
								<>
									본인<strong>인증</strong>
								</>
							),
						},
						{ id: "done", label: "완료" },
					]}
					current={0}
				/>
			</div>,
		);
		const text = container.querySelector(".stepper_label_text")!;
		const strong = text.querySelector("strong")!.getBoundingClientRect();
		const range = document.createRange();
		range.selectNodeContents(text.firstChild!);
		expect(strong.left - range.getBoundingClientRect().right).toBeLessThan(1);
		unmount();
	});

	it("starts each connector right after its label at the indicator's center", () => {
		const { container, unmount } = render(
			<div style={{ width: 800 }}>
				<Stepper
					steps={[
						{ id: "account", label: "계정", description: "이메일과 비밀번호" },
						{ id: "profile", label: "프로필", description: "이름과 소속" },
						{ id: "done", label: "완료" },
					]}
					current={1}
				/>
			</div>,
		);
		for (const step of container.querySelectorAll(".stepper_step:not(:last-child)")) {
			const label = step.querySelector(".stepper_label")!;
			const text = label.querySelector(".stepper_label_text")!.getBoundingClientRect();
			const line = getComputedStyle(label, "::after");
			const lineLeft = label.getBoundingClientRect().right - Number.parseFloat(line.width);
			const indicator = step.querySelector(".stepper_indicator")!.getBoundingClientRect();
			const lineCenter =
				label.getBoundingClientRect().top +
				Number.parseFloat(line.marginTop) +
				Number.parseFloat(line.height) / 2;

			// 라벨과 선 사이는 gap 8px - 겹치거나(음수) 떠도(큰 값) 실패한다
			expect(Math.abs(lineLeft - text.right - 8)).toBeLessThan(1);
			expect(Math.abs(lineCenter - (indicator.top + indicator.height / 2))).toBeLessThan(1);
		}
		unmount();
	});

	it("lets an overlong last label wrap instead of overflowing at 375px", () => {
		const { container, unmount } = render(
			<div style={{ width: 375 }}>
				<Stepper
					steps={[
						{ id: "a", label: "입력" },
						{
							id: "b",
							label: "고객 정보 매핑과 중복 검증을 모두 마친 뒤 일괄 등록 완료를 확인하는 단계",
						},
					]}
					current={0}
				/>
			</div>,
		);
		const list = container.querySelector("ol")!;
		expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
		unmount();
	});

	// 360px 에 4단계 - 칸이 어절보다 좁아도 "프로 / 필" 로 쪼개지 않고, 모자란 만큼은 목록이 스크롤된다 (#1014)
	it("keeps every word whole and does not overflow the page at 360px", () => {
		const { container, unmount } = render(
			<div style={{ width: 360 }}>
				<Stepper
					steps={[
						{ id: "account", label: "계정", description: "이메일과 비밀번호" },
						{ id: "profile", label: "프로필", description: "이름과 소속" },
						{ id: "team", label: "팀 초대", description: "건너뛸 수 있어요" },
						{ id: "done", label: "완료" },
					]}
					current={1}
				/>
			</div>,
		);
		const box = container.firstElementChild!;
		expect(box.scrollWidth).toBeLessThanOrEqual(360);
		const texts = container.querySelectorAll(".stepper_label_text, .stepper_description");
		for (const text of texts) {
			expect(splitWords(text.firstChild as Text)).toEqual([]);
		}
		unmount();
	});
});

describe("Stepper narrow width - current step (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	// 280px - 테스트 폰트로도 4단계가 확실히 넘치는 폭
	it("scrolls the current step into view when it starts out clipped at 280px", () => {
		const { container, unmount } = render(
			<div style={{ width: 280 }}>
				<Stepper
					steps={[
						{ id: "account", label: "계정", description: "이메일과 비밀번호" },
						{ id: "profile", label: "프로필", description: "이름과 소속" },
						{ id: "team", label: "팀 초대", description: "건너뛸 수 있어요" },
						{ id: "done", label: "완료" },
					]}
					current={3}
				/>
			</div>,
		);
		const list = container.querySelector("ol")!;
		const active = container.querySelector('[aria-current="step"]')!.getBoundingClientRect();

		expect(list.scrollLeft).toBeGreaterThan(0);
		expect(active.right).toBeLessThanOrEqual(list.getBoundingClientRect().right + 1);
		unmount();
	});
});

// 폰 폭에서 네 단계 글을 다 두면 단계마다 80px 남짓이라 설명이 어절마다 꺾였다 (#1058).
// 지금 단계만 글을 보이고, 나머지 이름은 화면에서만 빠진다
describe("Stepper on a phone (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(375, 700);
	});

	it("shows only the current step's text and keeps the rest for screen readers", () => {
		const { container, unmount } = render(
			<Stepper
				steps={[
					{ id: "account", label: "계정", description: "이메일과 비밀번호" },
					{ id: "profile", label: "프로필", description: "이름과 소속" },
					{ id: "team", label: "팀 초대", description: "건너뛸 수 있어요" },
					{ id: "done", label: "완료" },
				]}
				current={1}
			/>,
		);
		const list = container.querySelector("ol")!;
		expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);

		const active = container.querySelector(".stepper_step_active")!;
		const label = active.querySelector(".stepper_label_text")!;
		const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
		expect(label.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5);
		expect(splitWords(active.querySelector(".stepper_description")!.firstChild as Text)).toEqual(
			[],
		);

		for (const step of container.querySelectorAll(".stepper_step:not(.stepper_step_active)")) {
			expect(
				step.querySelector(".stepper_label_text")!.getBoundingClientRect().width,
			).toBeLessThanOrEqual(1);
		}
		// 화면에서 빠져도 이름은 남는다 - 목록 항목으로 읽힌다
		expect(screen.getByText("팀 초대")).toBeInTheDocument();

		// 단계 사이 선은 그대로 - 마지막 앞 단계마다 남은 폭을 채운다
		for (const step of container.querySelectorAll(".stepper_step:not(:last-child)")) {
			const line = getComputedStyle(step.querySelector(".stepper_label")!, "::after");
			expect(Number.parseFloat(line.width)).toBeGreaterThanOrEqual(16);
		}
		unmount();
	});

	const phoneSteps = [
		{ id: "account", label: "계정", description: "이메일과 비밀번호" },
		{ id: "profile", label: "프로필", description: "이름과 소속" },
		{ id: "done", label: "완료" },
	];
	const shown = (el: Element) => el.getBoundingClientRect().width > 1;

	// 지난 단계 버튼은 글이 화면에서 빠져도 이름이 남아야 눌러 돌아갈 수 있다
	it("keeps the names of the step buttons whose text is hidden", () => {
		const { container, unmount } = render(
			<Stepper steps={phoneSteps} current={2} onStepClick={() => {}} />,
		);
		const back = screen.getByRole("button", { name: /계정/ });
		expect(shown(back.querySelector(".stepper_label_text")!)).toBe(false);
		expect(screen.getByRole("button", { name: /프로필/ })).toBeInTheDocument();
		expect(container.querySelector(".stepper_step_active .stepper_label_text")!.textContent).toBe(
			"완료",
		);
		unmount();
	});

	// 모두 마치면 지금 단계가 없다 - 글이 하나도 안 보이면 어느 절차였는지 알 수 없다
	it("shows the last step's text once every step is done", () => {
		const { container, unmount } = render(<Stepper steps={phoneSteps} current={3} />);
		const steps = [...container.querySelectorAll(".stepper_step")];
		expect(container.querySelector(".stepper_step_active")).toBeNull();
		expect(shown(steps.at(-1)!.querySelector(".stepper_label_text")!)).toBe(true);
		for (const step of steps.slice(0, -1)) {
			expect(shown(step.querySelector(".stepper_label_text")!)).toBe(false);
		}
		unmount();
	});
});

/** 두 줄에 걸친 어절 - 줄바꿈이 어절 사이에서만 일어나면 빈 배열이다. */
const splitWords = (node: Text) =>
	[...node.data.matchAll(/\S+/g)]
		.filter((match) => {
			const range = document.createRange();
			range.setStart(node, match.index);
			range.setEnd(node, match.index + match[0].length);
			return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size > 1;
		})
		.map((match) => match[0]);
