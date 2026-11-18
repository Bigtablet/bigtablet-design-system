// 문서 사이트 예제 a11y 검사 - Storybook a11y addon 이 스토리마다 돌리던 axe 를 사이트 예제로 옮겼다 (#1051).
// 예제가 곧 문서에 보이는 화면이라, 소비자가 따라 쓰는 조합이 그대로 검사된다.
import { render } from "@testing-library/react";
import axe from "axe-core";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";

const examples = import.meta.glob<{ default: ComponentType }>("./examples/**/*.tsx", {
	eager: true,
});

describe("문서 예제 a11y", () => {
	it.each(Object.entries(examples).map(([file, mod]) => [file.slice(11, -4), mod.default]))(
		"%s",
		async (_id, Example) => {
			const { container } = render(<Example />);
			const { violations } = await axe.run(container, {
				// axe 는 `target-size`(WCAG 2.2 SC 2.5.8, 24px AA)를 기본으로 꺼 둔다 - 아이콘 버튼 · 칩 닫기처럼
				// 토큰 밖에서 크기가 정해지는 타깃을 보려고 켠다
				rules: { "target-size": { enabled: true } },
			});
			expect(
				violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
			).toEqual([]);
		},
	);
});
