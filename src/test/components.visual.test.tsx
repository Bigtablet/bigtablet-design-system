import { render } from "@testing-library/react";
import { Inbox, Settings } from "lucide-react";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import {
	Badge,
	Button,
	Card,
	Checkbox,
	Chip,
	EmptyState,
	ErrorState,
	IconButton,
	InlineAlert,
	Pagination,
	Radio,
	Tab,
	TabList,
	Tabs,
	TextField,
	Toggle,
} from "../index";

/**
 * 시각 회귀 - 컴포넌트의 기본 모양을 기준 스크린샷과 픽셀 비교한다 (#879).
 *
 * 렌더가 바뀌는 변경을 사람 눈 말고도 잡으려는 것이다. 4.1.0 주기의 `(렌더 변경)` 4건도 눈으로만 확인했다.
 * 그래서 의도한 변경이면 기준 이미지를 같이 갱신하고, 의도하지 않은 변경이면 이 테스트가 막는다.
 *
 * 기준 이미지는 CI 와 같은 Playwright 이미지(linux)에서 만든다 - 갱신 절차는 docs/TESTING.md.
 * 팝업(Dropdown·Menu·Toast 등)은 포털·타이머가 얽혀 첫 범위에서 뺐다.
 */

const THEMES = ["light", "dark"] as const;

/** 표면 배경 위에 고정 폭으로 그려 찍는다. 테마는 `describe.each` 가 건다. */
const shoot = async (name: string, ui: React.ReactNode) => {
	render(
		<div
			data-testid="shot"
			style={{
				width: 640,
				padding: 16,
				background: "var(--bt-color-bg-solid)",
				color: "var(--bt-color-text-body)",
			}}
		>
			{ui}
		</div>,
	);
	await expect.element(page.getByTestId("shot")).toMatchScreenshot(name);
};

const row: React.CSSProperties = {
	display: "flex",
	gap: 8,
	flexWrap: "wrap",
	alignItems: "center",
};
const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };
const TONES = ["neutral", "info", "success", "warning", "error"] as const;

// 테마마다 별도 테스트다 - 한 장이 실패해도 나머지는 계속 찍혀, 첫 CI 실행이 기준 24장을 모두 남기고
// 회귀 때도 diff 가 전부 남는다. 렌더 정리는 browser-setup 의 cleanup 이 한다.
describe.each(THEMES)("visual %s", (theme) => {
	beforeEach(() => {
		document.documentElement.setAttribute("data-theme", theme);
	});
	afterEach(() => {
		document.documentElement.removeAttribute("data-theme");
	});

	it("button", async () => {
		await shoot(
			`button-${theme}`,
			<div style={col}>
				<div style={row}>
					<Button variant="filled">filled</Button>
					<Button variant="tonal">tonal</Button>
					<Button variant="outline">outline</Button>
					<Button variant="text">text</Button>
				</div>
				<div style={row}>
					<Button danger>danger</Button>
					<Button variant="outline" danger>
						danger
					</Button>
					<Button disabled>disabled</Button>
					<Button size="sm">sm</Button>
					<Button size="lg">lg</Button>
				</div>
			</div>,
		);
	});

	it("icon-button", async () => {
		await shoot(
			`icon-button-${theme}`,
			<div style={row}>
				{(["text", "filled", "tonal", "outline"] as const).map((variant) => (
					<IconButton key={variant} variant={variant} icon={<Settings />} aria-label={variant} />
				))}
			</div>,
		);
	});

	it("badge", async () => {
		await shoot(
			`badge-${theme}`,
			<div style={col}>
				{(["solid", "soft"] as const).map((appearance) => (
					<div key={appearance} style={row}>
						{(["accent", ...TONES] as const).map((tone) => (
							<Badge key={tone} tone={tone} appearance={appearance}>
								{tone}
							</Badge>
						))}
					</div>
				))}
			</div>,
		);
	});

	it("chip", async () => {
		await shoot(
			`chip-${theme}`,
			<div style={row}>
				{(["neutral", "accent", "info", "success", "warning", "error"] as const).map((tone) => (
					<Chip key={tone} type="static" tone={tone} label={tone} />
				))}
				<Chip type="filter" label="filter" selected />
			</div>,
		);
	});

	it("inline-alert", async () => {
		await shoot(
			`inline-alert-${theme}`,
			<div style={col}>
				{TONES.map((tone) => (
					<InlineAlert key={tone} tone={tone} title={tone}>
						본문 안내 문구
					</InlineAlert>
				))}
			</div>,
		);
	});

	it("empty-state", async () => {
		await shoot(
			`empty-state-${theme}`,
			<EmptyState
				illustration={<Inbox />}
				title="받은 메일이 없습니다"
				description="새 메일이 오면 여기 표시됩니다."
				action={<Button>새 메일 작성</Button>}
			/>,
		);
	});

	it("error-state", async () => {
		await shoot(
			`error-state-${theme}`,
			<div style={col}>
				<ErrorState
					variant="widget"
					title="불러오기 실패"
					action={<Button size="sm">재시도</Button>}
				/>
				<ErrorState
					title="페이지를 불러오지 못했습니다"
					description="잠시 후 다시 시도해 주세요."
				/>
			</div>,
		);
	});

	it("text-field", async () => {
		await shoot(
			`text-field-${theme}`,
			<div style={col}>
				<TextField label="이름" placeholder="입력" />
				<TextField label="이메일" defaultValue="hello@bigtablet.com" supportingText="도움말" />
				<TextField
					label="오류"
					defaultValue="잘못된 값"
					error
					supportingText="형식이 맞지 않습니다"
				/>
				<TextField label="비활성" defaultValue="수정 불가" disabled />
			</div>,
		);
	});

	it("selection", async () => {
		await shoot(
			`selection-${theme}`,
			<div style={col}>
				<div style={row}>
					<Checkbox label="체크" defaultChecked />
					<Checkbox label="미체크" />
					<Checkbox label="비활성" disabled />
				</div>
				<div style={row}>
					<Radio name="r" value="a" label="선택" defaultChecked />
					<Radio name="r" value="b" label="미선택" />
				</div>
				<div style={row}>
					<Toggle ariaLabel="켜짐" defaultChecked />
					<Toggle ariaLabel="꺼짐" />
					<Toggle ariaLabel="비활성" disabled />
				</div>
			</div>,
		);
	});

	it("card", async () => {
		await shoot(
			`card-${theme}`,
			<div style={row}>
				{(["default", "accent", "outline"] as const).map((variant) => (
					<Card key={variant} variant={variant} heading={variant} style={{ width: 180 }}>
						카드 본문
					</Card>
				))}
			</div>,
		);
	});

	it("tabs", async () => {
		await shoot(
			`tabs-${theme}`,
			<div style={col}>
				{(["line", "fills"] as const).map((variant) => (
					<Tabs key={variant} variant={variant} defaultValue="a">
						<TabList ariaLabel={variant}>
							<Tab value="a">첫째</Tab>
							<Tab value="b">둘째</Tab>
							<Tab value="c">셋째</Tab>
						</TabList>
					</Tabs>
				))}
			</div>,
		);
	});

	it("pagination", async () => {
		await shoot(
			`pagination-${theme}`,
			<Pagination page={5} totalPages={10} onPageChange={() => {}} />,
		);
	});
});
