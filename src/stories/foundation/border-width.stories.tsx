import type { Meta, StoryObj } from "@storybook/react";
import { baseBorderWidth, borderWidth } from "src/styles/ts/border-width";

const meta: Meta = {
	title: "Foundation/border-width",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### Border Width (테두리 두께)

테두리 두께는 **요소의 경계와 강조 수준**을 표현합니다.

- **none (0px)**: 테두리 없음
- **standard (1px)**: 기본 테두리 (카드, 인풋, 구분선)
- **indicator (2px)**: 강조 테두리 (포커스 링, 선택 상태, 탭 인디케이터)
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Semantic: Story = {
	name: "Semantic Border Width",
	render: () => (
		<div style={{ display: "grid", gap: 16, maxWidth: 600 }}>
			{(Object.entries(borderWidth) as [string, string][]).map(([key, value]) => (
				<div
					key={key}
					style={{
						display: "grid",
						gridTemplateColumns: "140px 1fr 80px",
						alignItems: "center",
						gap: 16,
						padding: 16,
						background: "#fff",
						border: "1px solid rgba(0,0,0,0.06)",
						borderRadius: 12,
					}}
				>
					<div>
						<code style={{ fontSize: 13 }}>borderWidth.{key}</code>
						<div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
							{borderWidthDescription(key)}
						</div>
					</div>

					<div
						style={{
							height: 40,
							borderRadius: 8,
							background: "#fafafa",
							border: `${value} solid #121212`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 12,
							opacity: 0.6,
						}}
					>
						{value === "0px" ? "테두리 없음" : ""}
					</div>

					<span style={{ fontSize: 13, opacity: 0.7, textAlign: "right" }}>{value}</span>
				</div>
			))}
		</div>
	),
};

export const Base: Story = {
	name: "Base Tokens (raw)",
	render: () => (
		<div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
			{(Object.entries(baseBorderWidth) as [string, string][]).map(([key, value]) => (
				<div
					key={key}
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: 12,
						background: "#fff",
						border: "1px solid rgba(0,0,0,0.06)",
						borderRadius: 10,
					}}
				>
					<code style={{ fontSize: 12 }}>border-width-{key}</code>
					<span style={{ fontSize: 13, opacity: 0.7 }}>{value}</span>
				</div>
			))}
		</div>
	),
};

export const UsageExamples: Story = {
	name: "실제 적용 예시",
	render: () => (
		<div
			style={{
				background: "#fafafa",
				borderRadius: 12,
				padding: 24,
				display: "grid",
				gap: 20,
				maxWidth: 560,
			}}
		>
			<h3 style={{ margin: 0, fontSize: 14 }}>컴포넌트에서 이렇게 사용됩니다</h3>

			{/* none → standard → indicator 상태 변화 */}
			<div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid rgba(0,0,0,0.06)" }}>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
					입력 필드의 상태 변화: none → standard → indicator
				</div>
				<div style={{ display: "grid", gap: 12 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<span style={{ width: 80, fontSize: 12, color: "#999" }}>기본</span>
						<div style={{ flex: 1, height: 40, borderRadius: 8, border: `${borderWidth.standard} solid #e5e5e5`, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 13, color: "#999" }}>
							placeholder
						</div>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<span style={{ width: 80, fontSize: 12, color: "#999" }}>포커스</span>
						<div style={{ flex: 1, height: 40, borderRadius: 8, border: `${borderWidth.indicator} solid #000`, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 13 }}>
							입력 중...
						</div>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<span style={{ width: 80, fontSize: 12, color: "#999" }}>에러</span>
						<div style={{ flex: 1, height: 40, borderRadius: 8, border: `${borderWidth.indicator} solid #ef4444`, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 13, color: "#ef4444" }}>
							잘못된 입력
						</div>
					</div>
				</div>
			</div>

			{/* Card border */}
			<div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid rgba(0,0,0,0.06)" }}>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
					카드: <code>standard</code> (1px) — 영역 구분
				</div>
				<div style={{ border: `${borderWidth.standard} solid #e5e5e5`, borderRadius: 12, padding: 16 }}>
					<div style={{ fontWeight: 600, fontSize: 14 }}>카드 제목</div>
					<div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>standard 두께의 테두리로 영역을 구분합니다.</div>
				</div>
			</div>
		</div>
	),
};

function borderWidthDescription(key: string) {
	switch (key) {
		case "none":
			return "테두리 없음";
		case "standard":
			return "카드, 인풋, 구분선";
		case "indicator":
			return "포커스 링, 선택 상태, 탭 인디케이터";
		default:
			return "";
	}
}
