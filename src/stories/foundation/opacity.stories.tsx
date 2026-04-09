import type { Meta, StoryObj } from "@storybook/react";
import { opacity } from "src/styles/opacity";

const meta: Meta = {
	title: "Foundation/opacity",
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
						<div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>{opacityUseCase(key)}</div>
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

					<span style={{ fontSize: 11, color: "#666", textAlign: "right" }}>
						<code>opacity-{key}</code>
					</span>
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

			{/* Hover overlay */}
			<div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid rgba(0,0,0,0.06)" }}>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
					<code>opacity-5</code> — 버튼 호버 오버레이
				</div>
				<div style={{ display: "flex", gap: 12 }}>
					<div style={{ padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", fontSize: 14 }}>
						기본 상태
					</div>
					<div style={{ position: "relative", padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", fontSize: 14 }}>
						호버 상태
						<div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "#fff", opacity: 0.05 }} />
					</div>
				</div>
			</div>

			{/* Disabled */}
			<div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid rgba(0,0,0,0.06)" }}>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
					<code>opacity-38</code> — 비활성화 상태
				</div>
				<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
					<button type="button" style={{ padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", fontSize: 14, border: "none" }}>
						활성 버튼
					</button>
					<button type="button" disabled style={{ padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", fontSize: 14, border: "none", opacity: 0.38, cursor: "not-allowed" }}>
						비활성 버튼
					</button>
				</div>
			</div>

			{/* Modal overlay */}
			<div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid rgba(0,0,0,0.06)" }}>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
					<code>opacity-50</code> — 모달 배경 오버레이
				</div>
				<div style={{ position: "relative", height: 80, borderRadius: 8, overflow: "hidden" }}>
					<div style={{ padding: 12, fontSize: 13, color: "#333" }}>배경 콘텐츠 영역</div>
					<div style={{ position: "absolute", inset: 0, background: "#000", opacity: 0.5 }} />
					<div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600 }}>
						모달
					</div>
				</div>
			</div>
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
