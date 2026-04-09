import type { Meta, StoryObj } from "@storybook/react";
import { opacity } from "src/styles/ts/opacity";

const meta: Meta = {
	title: "foundation/opacity",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### Opacity (불투명도)

투명도 토큰입니다. 오버레이, 비활성 상태, 호버 효과 등에서 사용합니다.

- **0**: 완전 투명 (숨김)
- **5 / 8 / 12**: 아주 연한 오버레이 (호버, 눌림, 비활성 배경)
- **38**: 비활성 텍스트 · 아이콘
- **50**: 반투명 오버레이
- **80 / 90**: 거의 불투명한 레이어
- **100**: 완전 불투명
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Scale: Story = {
	name: "Opacity 스케일 한눈에 보기",
	render: () => (
		<div
			style={{
				background: "#fafafa",
				borderRadius: 12,
				padding: 24,
				display: "grid",
				gap: 10,
				maxWidth: 560,
			}}
		>
			{(Object.entries(opacity) as [string, number][]).map(([key, value]) => (
				<div
					key={key}
					style={{
						display: "grid",
						gridTemplateColumns: "80px 1fr 60px",
						alignItems: "center",
						gap: 12,
						padding: 12,
						background: "#fff",
						border: "1px solid rgba(0,0,0,0.06)",
						borderRadius: 10,
					}}
				>
					<div>
						<strong style={{ fontSize: 12 }}>{value}</strong>
						<div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>{opacityUseCase(key)}</div>
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{/* 체커보드 배경으로 투명도 시각화 */}
						<div
							style={{
								position: "relative",
								width: "100%",
								height: 28,
								borderRadius: 6,
								backgroundImage:
									"linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
								backgroundSize: "8px 8px",
								backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
								overflow: "hidden",
							}}
						>
							<div
								style={{
									position: "absolute",
									inset: 0,
									background: "#121212",
									opacity: value,
									borderRadius: 6,
								}}
							/>
						</div>
					</div>

					<span style={{ fontSize: 11, opacity: 0.6, textAlign: "right" }}>
						<code>opacity-{key}</code>
					</span>
				</div>
			))}
		</div>
	),
};

function opacityUseCase(key: string) {
	switch (key) {
		case "0":
			return "완전 투명 (숨김)";
		case "5":
			return "호버 배경";
		case "8":
			return "눌림/서브틀 배경";
		case "12":
			return "비활성 배경";
		case "16":
			return "약한 오버레이";
		case "38":
			return "비활성 텍스트·아이콘";
		case "50":
			return "반투명 오버레이";
		case "80":
			return "거의 불투명 레이어";
		case "90":
			return "강한 불투명 레이어";
		case "100":
			return "완전 불투명";
		default:
			return "";
	}
}
