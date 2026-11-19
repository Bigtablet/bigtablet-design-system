// 문서 사이트 예제 a11y 검사 - Storybook a11y addon 이 스토리마다 돌리던 axe 를 사이트 예제로 옮겼다 (#1051).
// 예제가 곧 문서에 보이는 화면이라, 소비자가 따라 쓰는 조합이 그대로 검사된다.
import { fireEvent, render } from "@testing-library/react";
import axe from "axe-core";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import type { DocPage } from "./docs";
import { playgroundOf } from "./playground";

const examples = import.meta.glob<{ default: ComponentType }>("./examples/**/*.tsx", {
	eager: true,
});
const pages = Object.values(
	import.meta.glob<Record<string, DocPage>>("./pages/*.tsx", { eager: true }),
).flatMap((mod) => Object.values(mod));

async function violationsOf(container: HTMLElement, page = false) {
	const { violations } = await axe.run(container, {
		rules: {
			// axe 는 `target-size`(WCAG 2.2 SC 2.5.8, 24px AA)를 기본으로 꺼 둔다 - 아이콘 버튼 · 칩 닫기처럼
			// 토큰 밖에서 크기가 정해지는 타깃을 보려고 켠다
			"target-size": { enabled: true },
			// body 전체를 볼 때 - 테스트 페이지에는 main · nav 같은 랜드마크가 없어 "랜드마크 밖 내용" 은
			// 이 페이지 사정이다. 앱의 랜드마크 구성은 컴포넌트가 정하지 않는다
			...(page && { region: { enabled: false } }),
		},
	});
	return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

describe("문서 예제 a11y", () => {
	it.each(Object.entries(examples).map(([file, mod]) => [file.slice(11, -4), mod.default]))(
		"%s",
		async (_id, Example) => {
			const { container } = render(<Example />);
			expect(await violationsOf(container)).toEqual([]);
		},
	);
});

// 오버레이 예제(`open`)는 문서에서 열린 모습으로 보인다 - 닫힌 버튼만이 아니라 열린 패널도 검사한다 (#1060).
// 패널은 body 로 포탈되므로 body 전체를 본다
const opened = pages.flatMap((page) =>
	page.examples
		.filter((e) => e.open)
		.map((e) => [e.id, examples[`./examples/${e.id}.tsx`]?.default] as const),
);

describe("열린 오버레이 예제 a11y", () => {
	it.each(opened)("%s", async (_id, Example) => {
		if (!Example) throw new Error("예제 파일 없음");
		const { container } = render(<Example />);
		const trigger = container.querySelector("button") as HTMLElement;
		fireEvent.focusIn(trigger);
		fireEvent.click(trigger);
		await expect
			.poll(() =>
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [role="menu"], [role="tooltip"]',
				),
			)
			.not.toBeNull();
		expect(await violationsOf(document.body, true)).toEqual([]);
	});
});

// 예제는 대표 조합만 보여 준다. "조절" 이 여는 prop 은 값 하나씩 바꿔 모두 검사한다 -
// disabled · error · 모든 variant 처럼 예제에 없는 상태가 검사에서 빠지지 않게 (#1053)
const variations = pages.flatMap((page) => {
	if (!page.playground) return [];
	const config = page.playground;
	const { Comp, rows, optionsOf } = playgroundOf(page, config);
	if (!Comp) return [];
	return rows.flatMap((row) =>
		(row.type === "boolean" ? [true] : optionsOf(row.type)).map(
			(value) =>
				[
					`${page.slug} ${row.name}=${String(value)}`,
					() => (
						<Comp {...config.base} {...{ [row.name]: value }}>
							{config.children}
						</Comp>
					),
				] as const,
		),
	);
});

describe("조절 prop 조합 a11y", () => {
	it.each(variations)("%s", async (_id, Variation) => {
		const { container } = render(<Variation />);
		expect(await violationsOf(container)).toEqual([]);
	});
});
