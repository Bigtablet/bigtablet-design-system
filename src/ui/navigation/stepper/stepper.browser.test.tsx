import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "./index";
import "./style.scss";

const WIDTHS = [375, 800];
const STEP_SETS = [
	["입력", "완료"],
	["업로드", "매핑·검증", "등록 완료"],
];

describe("Stepper horizontal layout (Chromium)", () => {
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

	// 라벨 길이가 달라도 선 길이는 같다 - 같은 칸 폭을 나누면 긴 라벨 뒤 선이 짧아져 들쭉날쭉했다
	it("draws connectors of equal length between labels of different widths", () => {
		const { container, unmount } = render(
			<div style={{ width: 800 }}>
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
		const lines = [...container.querySelectorAll(".stepper_step:not(:last-child)")].map((step) =>
			Number.parseFloat(getComputedStyle(step, "::after").width),
		);
		expect(Math.max(...lines) - Math.min(...lines)).toBeLessThan(1);
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
		const texts = container.querySelectorAll(".stepper_label, .stepper_description");
		for (const text of texts) {
			expect(splitWords(text.firstChild as Text)).toEqual([]);
		}
		unmount();
	});
});

describe("Stepper narrow width - current step (Chromium)", () => {
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
