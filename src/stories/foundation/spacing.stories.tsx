import type { Meta, StoryObj } from "@storybook/react";
import { spacing } from "src/styles/ts/spacing";

const meta: Meta = {
	title: "foundation/spacing",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### Spacing (여백)

Spacing은 화면의 **호흡(간격)** 을 만드는 기준입니다.
margin / padding / gap 같은 "거리"는 가능한 한 **이 토큰만** 사용합니다.

- 작은 값(1–6): 텍스트/아이콘 사이, 인라인 요소
- 중간 값(8–16): 라벨과 입력 사이, 폼 필드 내부
- 큰 값(20–48): 카드 padding, 섹션 간격, 레이아웃 여백
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Scale: Story = {
	name: "여백 스케일 한눈에 보기",
	render: () => (
		<div
			style={{
				background: "#fafafa",
				borderRadius: 12,
				padding: 24,
				display: "grid",
				gap: 12,
				maxWidth: 720,
			}}
		>
			{Object.entries(spacing).map(([key, value]) => (
				<div
					key={key}
					style={{
						display: "grid",
						gridTemplateColumns: "100px 1fr 160px",
						alignItems: "center",
						gap: 12,
						padding: 12,
						background: "#fff",
						border: "1px solid rgba(0,0,0,0.06)",
						borderRadius: 12,
					}}
				>
					<div>
						<strong style={{ fontSize: 13 }}>{value}</strong>
						<div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>spacing-{key}</div>
					</div>

					<div
						style={{
							height: 10,
							borderRadius: 6,
							background: "#e5e5e5",
							overflow: "hidden",
						}}
						aria-hidden
					>
						<div
							style={{
								width: value === "0px" ? "2px" : value,
								maxWidth: "100%",
								height: "100%",
								background: "#000",
							}}
						/>
					</div>

					<div style={{ fontSize: 12, opacity: 0.8, textAlign: "right" }}>
						<span style={{ marginRight: 8, opacity: 0.6 }}>{value}</span>
						{spacingUseCase(key)}
					</div>
				</div>
			))}
		</div>
	),
};

function spacingUseCase(key: string) {
	switch (key) {
		case "0":
			return "간격 없음";
		case "1":
			return "최소 구분선";
		case "2":
			return "인라인 최소 간격";
		case "3":
			return "아이콘·텍스트 인접";
		case "4":
			return "텍스트 / 아이콘 간격";
		case "6":
			return "라벨 · 아이콘 사이";
		case "8":
			return "폼 필드 내부";
		case "12":
			return "요소 간 기본 간격";
		case "16":
			return "카드 내부 padding";
		case "20":
			return "카드 간격 / 섹션 내부";
		case "24":
			return "섹션 간 기본 여백";
		case "32":
			return "페이지 기본 padding";
		case "40":
			return "페이지 섹션 간격";
		case "48":
			return "큰 레이아웃 분리";
		default:
			return "공통 여백";
	}
}
