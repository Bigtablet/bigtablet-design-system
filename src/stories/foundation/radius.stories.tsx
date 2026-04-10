import type { Meta, StoryObj } from "@storybook/react";
import { radius } from "src/styles/radius";

const meta: Meta = {
	title: "Foundation/radius",
	tags: ["autodocs"],
	parameters: {
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component: `
### Radius (모서리 둥글기)

모서리 둥글기는 컴포넌트의 **성격과 친밀도**를 표현합니다.

- **none**: 모서리 없음 (표, 인라인 UI)
- **xs / sm**: 단정하고 정보성 UI (뱃지, 태그)
- **md / lg**: 클릭 가능한 요소, 친근한 UI (버튼, 카드)
- **xl**: 강조 카드 / 히어로 영역
- **full**: 원형, 토글, 아바타 등

모든 컴포넌트는 아래 기준 중 하나를 사용해야 합니다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Scale: Story = {
	name: "Radius 단계 한눈에 보기",
	render: () => (
		<div
			style={{
				background: "#fafafa",
				padding: 24,
				borderRadius: 12,
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
				gap: 20,
				maxWidth: 800,
			}}
		>
			{Object.entries(radius).map(([key, value]) => (
				<div
					key={key}
					style={{
						textAlign: "center",
						background: "#fff",
						padding: 16,
						borderRadius: 12,
						border: "1px solid rgba(0,0,0,0.06)",
					}}
				>
					<div
						style={{
							width: 64,
							height: 64,
							margin: "0 auto 12px",
							background: "#111",
							borderRadius: value,
						}}
						aria-hidden
					/>
					<strong style={{ display: "block", marginBottom: 4 }}>{key}</strong>
					<div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{value}</div>
					<div style={{ fontSize: 12, opacity: 0.8 }}>{radiusUseCase(key)}</div>
				</div>
			))}
		</div>
	),
};

export const ComponentMapping: Story = {
	name: "컴포넌트별 radius 매핑",
	render: () => {
		const mappings = [
			{ component: "Badge / Tag", token: "sm", value: radius.sm, bg: "#f3f4f6" },
			{ component: "Button", token: "md", value: radius.md, bg: "#f3f4f6" },
			{ component: "Input", token: "md", value: radius.md, bg: "#fff" },
			{ component: "Card", token: "lg", value: radius.lg, bg: "#fff" },
			{ component: "Modal", token: "lg", value: radius.lg, bg: "#fff" },
			{ component: "Avatar", token: "full", value: radius.full, bg: "#e5e5e5" },
		];

		return (
			<div style={{ background: "#fafafa", borderRadius: 12, padding: 24, maxWidth: 560 }}>
				<h3 style={{ margin: "0 0 16px", fontSize: 14 }}>어떤 컴포넌트에 어떤 radius를 쓰나요?</h3>
				<div style={{ display: "grid", gap: 10 }}>
					{mappings.map(({ component, token, value, bg }) => (
						<div key={component} style={{ display: "grid", gridTemplateColumns: "120px 56px 1fr", alignItems: "center", gap: 12, padding: 12, background: "#fff", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
							<span style={{ fontSize: 13, fontWeight: 600 }}>{component}</span>
							<div style={{ width: 40, height: 28, borderRadius: value, background: bg, border: "1.5px solid #333" }} />
							<code style={{ fontSize: 12, color: "#666" }}>radius.{token} ({value})</code>
						</div>
					))}
				</div>
			</div>
		);
	},
};

export const Comparison: Story = {
	name: "차이 비교",
	render: () => (
		<div style={{ background: "#fafafa", borderRadius: 12, padding: 24, maxWidth: 720 }}>
			<p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>
				같은 모양인데, 모서리 둥글기만 다릅니다.
			</p>
			<p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
				둥글기가 커질수록 부드럽고 친근한 느낌, 작을수록 단정하고 정보성 느낌이 됩니다.
			</p>

			{/* 버튼 비교 */}
			<div style={{ marginBottom: 24 }}>
				<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "#333" }}>버튼에 적용했을 때</div>
				<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
					{Object.entries(radius).map(([key, value]) => (
						<div key={key} style={{ textAlign: "center" }}>
							<div style={{ background: "#121212", color: "#fff", padding: "10px 20px", borderRadius: value, fontSize: 13, fontWeight: 600 }}>
								Button
							</div>
							<div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>{key} ({value})</div>
						</div>
					))}
				</div>
			</div>

			{/* 카드 비교 */}
			<div style={{ marginBottom: 24 }}>
				<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "#333" }}>카드에 적용했을 때</div>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
					{Object.entries(radius).map(([key, value]) => (
						<div key={key} style={{ textAlign: "center" }}>
							<div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: value, padding: 12, height: 60, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#999" }}>
								Card
							</div>
							<div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>{key}</div>
						</div>
					))}
				</div>
			</div>

			{/* 아바타 비교 */}
			<div>
				<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "#333" }}>아바타에 적용했을 때</div>
				<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
					{Object.entries(radius).map(([key, value]) => (
						<div key={key} style={{ textAlign: "center" }}>
							<div style={{ width: 48, height: 48, background: "#e5e5e5", borderRadius: value }} />
							<div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>{key}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	),
};

function radiusUseCase(key: string) {
	switch (key) {
		case "none":
			return "표, 인라인 UI";
		case "xs":
			return "작은 뱃지, 인디케이터";
		case "sm":
			return "뱃지, 태그, 얇은 카드";
		case "md":
			return "버튼, 입력창, 기본 카드";
		case "lg":
			return "모달, 큰 패널";
		case "xl":
			return "강조 카드, 히어로 영역";
		case "full":
			return "아바타, 토글, 원형 버튼";
		default:
			return "공통 UI";
	}
}
