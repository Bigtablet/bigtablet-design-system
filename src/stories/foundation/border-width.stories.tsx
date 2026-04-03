import type { Meta, StoryObj } from "@storybook/react";
import { baseBorderWidth, borderWidth } from "src/styles/ts/border-width";

const meta: Meta = {
	title: "foundation/border-width",
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
					<code style={{ fontSize: 12 }}>baseBorderWidth["{key}"]</code>
					<span style={{ fontSize: 13, opacity: 0.7 }}>{value}</span>
				</div>
			))}
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
