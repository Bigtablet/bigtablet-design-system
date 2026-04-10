import type { Meta, StoryObj } from "@storybook/react";
import { elevation } from "src/styles/elevation";

const meta: Meta = {
	title: "Foundation/elevation",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### Elevation(높이 위계) 기준

Elevation은 "떠 있음(레이어)"과 **높이 위계** 를 표현합니다.

- **level1**: 아주 가벼운 분리 (카드, 인풋 배경)
- **level2**: 드롭다운 / 팝오버 같이 떠 있는 UI
- **level3**: 사이드시트 / 작은 패널
- **level4**: 모달 / 오버레이 패널
- **level5**: 가장 강한 강조 (중요한 전체화면 레이어)
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Levels: Story = {
	name: "Elevation 단계 한눈에 보기",
	render: () => (
		<div
			style={{
				background: "#fafafa",
				padding: 24,
				borderRadius: 12,
				display: "grid",
				gap: 20,
				maxWidth: 720,
			}}
		>
			{Object.entries(elevation).map(([key, value]) => (
				<div
					key={key}
					style={{
						background: "#fff",
						borderRadius: 12,
						padding: 16,
						boxShadow: value,
						border: "1px solid rgba(0,0,0,0.06)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "baseline",
							justifyContent: "space-between",
							gap: 12,
						}}
					>
						<div>
							<strong style={{ fontSize: 16 }}>{key}</strong>
							<div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
								{elevationDescription(key)}
							</div>
						</div>

						<details style={{ fontSize: 12, opacity: 0.85 }}>
							<summary style={{ cursor: "pointer" }}>값 보기</summary>
							<code style={{ display: "block", marginTop: 8, whiteSpace: "pre-wrap" }}>
								{value}
							</code>
						</details>
					</div>

					<div style={{ marginTop: 14, display: "flex", gap: 12 }}>
						<div
							style={{
								width: 72,
								height: 44,
								borderRadius: 10,
								background: "#fff",
								boxShadow: value,
								border: "1px solid rgba(0,0,0,0.06)",
							}}
							aria-hidden
						/>
						<div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>
							이 elevation은 <strong>{elevationUseCase(key)}</strong> 같은 UI에서 사용하면 자연스럽습니다.
						</div>
					</div>
				</div>
			))}
		</div>
	),
};

export const ElevationStack: Story = {
	name: "Elevation 시각화",
	render: () => (
		<div
			style={{
				background: "#f0f0f0",
				borderRadius: 16,
				padding: 32,
				maxWidth: 480,
				position: "relative",
				height: 320,
				perspective: "800px",
			}}
		>
			<p style={{ margin: "0 0 16px", fontSize: 13, color: "#666" }}>
				아래에서 위로 갈수록 elevation이 높아집니다. 높을수록 그림자가 강해지고 "떠 있는" 느낌이 강해집니다.
			</p>
			{Object.entries(elevation).map(([key, value], i) => (
				<div
					key={key}
					style={{
						position: "absolute",
						left: 32 + i * 8,
						right: 32 + i * 8,
						bottom: 60 + i * 48,
						height: 44,
						background: "#fff",
						borderRadius: 10,
						boxShadow: value,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "0 16px",
						fontSize: 13,
						zIndex: i,
					}}
				>
					<strong>{key}</strong>
					<span style={{ fontSize: 11, color: "#999" }}>{elevationUseCase(key)}</span>
				</div>
			))}
		</div>
	),
};

export const DoAndDont: Story = {
	name: "DO / DON'T",
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 640 }}>
			{/* DO */}
			<div style={{ background: "#f0fdf4", borderRadius: 12, padding: 20 }}>
				<div style={{ fontSize: 13, fontWeight: 700, color: "#047857", marginBottom: 12 }}>DO</div>
				<div style={{ display: "grid", gap: 8 }}>
					<div style={{ background: "#fff", borderRadius: 8, padding: 12, boxShadow: elevation.level1, fontSize: 13 }}>
						카드 → level1
					</div>
					<div style={{ background: "#fff", borderRadius: 8, padding: 12, boxShadow: elevation.level2, fontSize: 13 }}>
						드롭다운 → level2
					</div>
					<div style={{ background: "#fff", borderRadius: 8, padding: 12, boxShadow: elevation.level4, fontSize: 13 }}>
						모달 → level4
					</div>
				</div>
				<p style={{ margin: "12px 0 0", fontSize: 12, color: "#047857" }}>
					UI의 높낮이에 맞게 단계적으로 사용합니다.
				</p>
			</div>

			{/* DON'T */}
			<div style={{ background: "#fef2f2", borderRadius: 12, padding: 20 }}>
				<div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>DON'T</div>
				<div style={{ display: "grid", gap: 8 }}>
					<div style={{ background: "#fff", borderRadius: 8, padding: 12, boxShadow: elevation.level5, fontSize: 13 }}>
						카드에 level5 사용
					</div>
					<div style={{ background: "#fff", borderRadius: 8, padding: 12, boxShadow: elevation.level5, fontSize: 13 }}>
						버튼에 level5 사용
					</div>
					<div style={{ background: "#fff", borderRadius: 8, padding: 12, boxShadow: elevation.level5, fontSize: 13 }}>
						모든 요소에 같은 그림자
					</div>
				</div>
				<p style={{ margin: "12px 0 0", fontSize: 12, color: "#ef4444" }}>
					강한 그림자를 남용하면 위계가 무너집니다.
				</p>
			</div>
		</div>
	),
};

export const Comparison: Story = {
	name: "차이 비교",
	render: () => (
		<div style={{ background: "#fafafa", borderRadius: 12, padding: 24, maxWidth: 720 }}>
			<p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>
				완전히 같은 카드인데, 그림자만 다릅니다.
			</p>
			<p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
				level이 올라갈수록 "공중에 떠 있는" 느낌이 강해지는 걸 비교해보세요.
			</p>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 20 }}>
				{Object.entries(elevation).map(([key, value]) => (
					<div key={key} style={{ textAlign: "center" }}>
						<div
							style={{
								background: "#fff",
								borderRadius: 12,
								padding: 16,
								boxShadow: value,
								minHeight: 100,
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								gap: 8,
							}}
						>
							<div style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6" }} />
							<div style={{ fontSize: 12, color: "#333" }}>카드 제목</div>
							<div style={{ fontSize: 11, color: "#999" }}>설명 텍스트</div>
						</div>
						<div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>{key}</div>
						<div style={{ fontSize: 11, color: "#666" }}>{elevationUseCase(key)}</div>
					</div>
				))}
			</div>
		</div>
	),
};

function elevationDescription(key: string) {
	switch (key) {
		case "level1":
			return "가벼운 경계/분리 (카드, 섹션)";
		case "level2":
			return "떠 있는 UI (드롭다운, 팝오버)";
		case "level3":
			return "작은 패널 / 사이드시트";
		case "level4":
			return "오버레이 계열 (모달 패널 등)";
		case "level5":
			return "가장 강한 강조 (중요한 레이어)";
		default:
			return "공통 elevation";
	}
}

function elevationUseCase(key: string) {
	switch (key) {
		case "level1":
			return "카드, 입력창 배경";
		case "level2":
			return "셀렉트 목록, 툴팁, 팝오버";
		case "level3":
			return "사이드시트, 작은 패널";
		case "level4":
			return "모달, 드로어";
		case "level5":
			return "전체 오버레이 강조";
		default:
			return "UI 레이어";
	}
}
