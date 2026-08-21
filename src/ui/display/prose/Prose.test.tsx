import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Prose } from "./index";

describe("Prose", () => {
	it("renders children", () => {
		render(
			<Prose>
				<p>본문</p>
			</Prose>,
		);
		expect(screen.getByText("본문")).toBeInTheDocument();
	});

	it("defaults to the md scale", () => {
		const { container } = render(<Prose>x</Prose>);
		expect(container.firstChild).toHaveClass("prose", "prose_size_md");
	});

	it("applies the lg scale", () => {
		const { container } = render(<Prose size="lg">x</Prose>);
		expect(container.firstChild).toHaveClass("prose_size_lg");
	});

	it("merges a consumer className instead of replacing it", () => {
		const { container } = render(<Prose className="custom">x</Prose>);
		expect(container.firstChild).toHaveClass("prose", "custom");
	});

	it("forwards rest props", () => {
		const { container } = render(
			<Prose data-testid="p" aria-label="정책">
				x
			</Prose>,
		);
		expect(container.firstChild).toHaveAttribute("data-testid", "p");
		expect(container.firstChild).toHaveAttribute("aria-label", "정책");
	});

	// ── 스크롤 컨테이너 키보드 접근 ────────────────────────────────────────
	// jsdom 은 레이아웃이 없어 scrollWidth/clientWidth 가 항상 0 이므로 프로토타입에서 대신 잰다.
	const stubMetrics = (scroll: number, client: number) => {
		vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(scroll);
		vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(client);
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("makes an overflowing pre and table keyboard-reachable", () => {
		stubMetrics(500, 200);
		const { container } = render(
			<Prose>
				<pre>
					<code>long</code>
				</pre>
				<table>
					<tbody>
						<tr>
							<td>wide</td>
						</tr>
					</tbody>
				</table>
			</Prose>,
		);
		expect(container.querySelector("pre")).toHaveAttribute("tabindex", "0");
		expect(container.querySelector("table")).toHaveAttribute("tabindex", "0");
	});

	it("leaves a non-overflowing pre out of the tab order", () => {
		stubMetrics(200, 200);
		const { container } = render(
			<Prose>
				<pre>
					<code>short</code>
				</pre>
			</Prose>,
		);
		expect(container.querySelector("pre")).not.toHaveAttribute("tabindex");
	});

	// ResizeObserver 가 없는 환경(구형/SSR 후 하이드레이션 전 등)에서도 최초 동기화는 돌아야
	// 한다 - 건너뛰면 넘치는 코드 블록에 탭 정지가 아예 붙지 않는다.
	it("still marks overflow when ResizeObserver is unavailable", () => {
		const original = globalThis.ResizeObserver;
		// @ts-expect-error - 미지원 환경 재현
		globalThis.ResizeObserver = undefined;
		stubMetrics(500, 200);
		const { container } = render(
			<Prose>
				<pre>
					<code>long</code>
				</pre>
			</Prose>,
		);
		expect(container.querySelector("pre")).toHaveAttribute("tabindex", "0");
		globalThis.ResizeObserver = original;
	});

	// 조판만 담당한다 - 파서를 물지 않는다는 계약. children 을 그대로 통과시켜야
	// 앱이 어떤 마크다운 렌더러를 쓰든 붙일 수 있다.
	it("leaves the rendered markup untouched", () => {
		const { container } = render(
			<Prose>
				<h2>제목</h2>
				<pre>
					<code>const a = 1;</code>
				</pre>
			</Prose>,
		);
		expect(container.querySelector(".prose > h2")).toBeInTheDocument();
		expect(container.querySelector(".prose > pre > code")).toHaveTextContent("const a = 1;");
	});
});
