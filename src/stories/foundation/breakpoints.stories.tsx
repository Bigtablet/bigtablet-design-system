import type { Meta, StoryObj } from "@storybook/react";
import { breakpoints } from "src/styles/breakpoints";

const meta: Meta = {
	title: "Foundation/breakpoints",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### 반응형 기준 (Breakpoints)

화면 크기에 따라 **레이아웃과 컴포넌트 배치를 변경하기 위한 기준값**입니다.

Material Design 3의 Window Size Class에 기반한 4단계 시스템입니다.

| 이름 | 기준 | 대표 환경 |
|------|------|-----------|
| compact | 0px~ | 모바일 (세로 방향) |
| medium | 600px~ | 태블릿 / 대형 폰 (가로) |
| expanded | 840px~ | 노트북 / 작은 데스크탑 |
| large | 1200px~ | 와이드 데스크탑 |

SCSS: \`@include token.compact { ... }\` / \`@include token.from_medium { ... }\`
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
	name: "반응형 기준 한눈에 보기",
	render: () => (
		<div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
			{Object.entries(breakpoints).map(([key, value]) => (
				<div
					key={key}
					style={{
						border: "1px solid #e5e5e5",
						borderRadius: 8,
						padding: 16,
					}}
				>
					<div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
						<strong>{key}</strong>
						<code style={{ fontSize: 12, opacity: 0.8 }}>breakpoint-{key}</code>
						<span style={{ marginLeft: "auto", opacity: 0.7, fontSize: 13 }}>
							{value === 0 ? "0px~" : `${value}px 이상`}
						</span>
					</div>

					{/* Visual bar */}
					<div
						style={{
							height: 8,
							width: "100%",
							background: "#f0f0f0",
							borderRadius: 4,
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: value === 0 ? "4%" : `${Math.min((value / 1440) * 100, 100)}%`,
								height: "100%",
								background: "#000",
							}}
						/>
					</div>

					<p style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>{breakpointDescription(key)}</p>
				</div>
			))}
		</div>
	),
};

export const LayoutTransition: Story = {
	name: "레이아웃 변화 예시",
	render: () => (
		<div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
			<h3 style={{ margin: 0, fontSize: 14 }}>각 breakpoint에서 레이아웃이 어떻게 바뀌나요?</h3>

			{/* Compact */}
			<div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 16 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
					<strong style={{ fontSize: 13 }}>compact</strong>
					<span style={{ fontSize: 11, color: "#999" }}>~ 599px (모바일)</span>
				</div>
				<div style={{ display: "grid", gap: 8, maxWidth: 200 }}>
					<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
					<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
					<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
				</div>
				<p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>단일 컬럼, 풀 너비</p>
			</div>

			{/* Medium */}
			<div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 16 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
					<strong style={{ fontSize: 13 }}>medium</strong>
					<span style={{ fontSize: 11, color: "#999" }}>600px ~ 839px (태블릿)</span>
				</div>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 320 }}>
					<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
					<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
					<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
					<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
				</div>
				<p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>2컬럼 그리드 시작</p>
			</div>

			{/* Expanded */}
			<div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 16 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
					<strong style={{ fontSize: 13 }}>expanded</strong>
					<span style={{ fontSize: 11, color: "#999" }}>840px+ (데스크탑)</span>
				</div>
				<div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, maxWidth: 400 }}>
					<div style={{ height: 80, background: "#d4d4d4", borderRadius: 6 }} />
					<div style={{ display: "grid", gap: 8 }}>
						<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
						<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
						<div style={{ height: 24, background: "#e5e5e5", borderRadius: 6 }} />
					</div>
				</div>
				<p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>사이드바 + 콘텐츠 영역</p>
			</div>
		</div>
	),
};

function breakpointDescription(key: string) {
	switch (key) {
		case "compact":
			return "모바일 환경 (세로 방향, 단일 컬럼 기준)";
		case "medium":
			return "태블릿 / 대형 폰 가로 방향 (2컬럼 레이아웃 시작)";
		case "expanded":
			return "노트북 / 작은 데스크탑 (사이드바 고정 레이아웃)";
		case "large":
			return "와이드 데스크탑 (넉넉한 여백과 높은 정보 밀도)";
		default:
			return "";
	}
}
