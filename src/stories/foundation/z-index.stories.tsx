import type { Meta, StoryObj } from "@storybook/react";
import { zIndex } from "src/styles/ts/z-index";

const meta: Meta = {
	title: "foundation/z-index",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### Z-Index (레이어 우선순위)

z-index는 **화면에서 어떤 요소가 위에 보일지**를 정하는 기준입니다.

숫자가 클수록 위에 표시되며,
아래와 같은 **레벨 기준**으로 값을 고정해 두는 것이 중요합니다.

- **level0 (0)**: 기본 배경 / flat 레이아웃 요소
- **level1 (10)**: 드롭다운 / 팝오버
- **level2 (100)**: 모달 다이얼로그
- **level3 (200)**: 토스트 / 알림
- **level4 (500)**: 전체 화면 로딩 오버레이
- **level5 (1000)**: 최상위 레이어 (긴급 공지 등)
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
	name: "레이어 우선순위 한눈에 보기",
	render: () => {
		const entries = Object.entries(zIndex).sort(([, a], [, b]) => Number(a) - Number(b));

		return (
			<div style={{ display: "grid", gap: 32 }}>
				{/* 표 형태 요약 */}
				<section>
					<h3 style={{ marginBottom: 8 }}>Z-Index 값 표</h3>
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							fontSize: 14,
						}}
					>
						<thead>
							<tr>
								<th style={th}>이름</th>
								<th style={th}>값</th>
								<th style={th}>용도</th>
							</tr>
						</thead>
						<tbody>
							{entries.map(([key, value]) => (
								<tr key={key}>
									<td style={td}>
										<code>{key}</code>
									</td>
									<td style={td}>{value}</td>
									<td style={td}>{descriptionForKey(key)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>

				{/* 시각적 레이어 예시 */}
				<section>
					<h3 style={{ marginBottom: 8 }}>겹침 예시 (시각적 이해)</h3>
					<p style={{ marginTop: 0, fontSize: 13, opacity: 0.75 }}>
						실제 화면에서 요소들이 어떤 순서로 겹쳐 보이는지 예시입니다.
					</p>

					<div
						style={{
							position: "relative",
							height: 220,
							background: "#f5f5f5",
							borderRadius: 12,
							overflow: "hidden",
						}}
					>
						{entries.map(([key, value], index) => (
							<div
								key={key}
								style={{
									position: "absolute",
									inset: 20 + index * 10,
									background: layerColor(index),
									color: "#fff",
									padding: 12,
									borderRadius: 10,
									zIndex: value as number,
									fontSize: 13,
								}}
							>
								<strong>{key}</strong>
								<div style={{ opacity: 0.8 }}>z-index: {value}</div>
							</div>
						))}
					</div>
				</section>
			</div>
		);
	},
};

const th: React.CSSProperties = {
	textAlign: "left",
	padding: "8px 12px",
	borderBottom: "1px solid #e5e5e5",
	fontWeight: 600,
};

const td: React.CSSProperties = {
	padding: "8px 12px",
	borderBottom: "1px solid #f0f0f0",
};

function descriptionForKey(key: string) {
	switch (key) {
		case "level0":
			return "기본 배경 / flat 레이아웃";
		case "level1":
			return "셀렉트, 드롭다운, 팝오버";
		case "level2":
			return "모달 다이얼로그";
		case "level3":
			return "토스트 알림";
		case "level4":
			return "전체 화면 로딩 오버레이";
		case "level5":
			return "최상위 레이어 (긴급 공지 등)";
		default:
			return "공통 레이어";
	}
}

function layerColor(index: number) {
	const colors = ["#9ca3af", "#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];
	return colors[index % colors.length];
}
