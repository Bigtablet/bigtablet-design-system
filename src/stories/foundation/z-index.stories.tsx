import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { zIndex } from "src/styles/ts/z-index";

const meta: Meta = {
	title: "Foundation/z-index",
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

				{/* 인터랙티브 레이어 스택 */}
				<LayerStack entries={entries} />
			</div>
		);
	},
};

function LayerStack({ entries }: { entries: [string, number | string][] }) {
	const [expanded, setExpanded] = React.useState(false);
	const [rotation, setRotation] = React.useState({ x: 50, z: -25 });
	const [hoveredLayer, setHoveredLayer] = React.useState<string | null>(null);
	const dragging = React.useRef(false);
	const lastPos = React.useRef({ x: 0, y: 0 });


	const handleMouseDown = (e: React.MouseEvent) => {
		if (!expanded) return;
		dragging.current = true;
		lastPos.current = { x: e.clientX, y: e.clientY };
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!dragging.current) return;
		const dx = e.clientX - lastPos.current.x;
		const dy = e.clientY - lastPos.current.y;
		setRotation((prev) => ({
			x: Math.max(10, Math.min(80, prev.x - dy * 0.5)),
			z: prev.z + dx * 0.5,
		}));
		lastPos.current = { x: e.clientX, y: e.clientY };
	};

	const handleMouseUp = () => {
		dragging.current = false;
	};

	return (
		<section>
			<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
				<h3 style={{ margin: 0 }}>레이어 스택</h3>
				<button
					type="button"
					onClick={() => {
						setExpanded((v) => !v);
						setRotation({ x: 50, z: -25 });
					}}
					style={{
						padding: "4px 12px",
						borderRadius: 6,
						border: "1px solid #e5e5e5",
						background: expanded ? "#121212" : "#fff",
						color: expanded ? "#fff" : "#121212",
						fontSize: 12,
						cursor: "pointer",
						transition: "all 0.2s ease-in-out",
					}}
				>
					{expanded ? "접기" : "3D 분해도"}
				</button>
			</div>
			<p style={{ marginTop: 0, fontSize: 13, opacity: 0.75 }}>
				{expanded
					? "마우스로 회전할 수 있습니다. 위에 있을수록 사용자에게 먼저 보입니다."
					: "숫자가 높은 레이어가 위에 쌓입니다. 버튼을 눌러 분해도를 확인하세요."}
			</p>

			<div
				style={{
					background: "#f5f5f5",
					borderRadius: 12,
					overflow: "hidden",
					transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
					height: expanded ? 520 : 220,
				}}
			>
				{/* 접힌 상태: 겹침 예시 (absolute + inset) */}
				{!expanded && (
					<div style={{ position: "relative", height: 220 }}>
						{entries.map(([key, value], index) => {
							const isHovered = hoveredLayer === key;
							return (
								<div
									key={key}
									onMouseEnter={() => setHoveredLayer(key)}
									onMouseLeave={() => setHoveredLayer(null)}
									style={{
										position: "absolute",
										inset: 20 + index * 10,
										background: layerColor(index),
										color: "#fff",
										padding: 12,
										borderRadius: 10,
										zIndex: value as number,
										fontSize: 13,
										cursor: "pointer",
										outline: isHovered ? "2px solid #fff" : "none",
										transition: "outline 0.15s ease",
									}}
								>
									<strong>{key}</strong>
									<div style={{ opacity: 0.8 }}>z-index: {value}</div>
								</div>
							);
						})}

						{/* 호버 툴팁 */}
						{hoveredLayer && (
							<div
								style={{
									position: "absolute",
									bottom: 8,
									left: "50%",
									transform: "translateX(-50%)",
									background: "#121212",
									color: "#fff",
									padding: "6px 14px",
									borderRadius: 8,
									fontSize: 12,
									zIndex: 9999,
									whiteSpace: "nowrap",
									boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
								}}
							>
								<strong>{hoveredLayer}</strong> · z-index: {entries.find(([k]) => k === hoveredLayer)?.[1]} · {descriptionForKey(hoveredLayer)}
							</div>
						)}
					</div>
				)}

				{/* 펼친 상태: 3D 분해도 (마우스 회전 가능) */}
				{expanded && (
					<div
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
						style={{
							height: 520,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							perspective: 1000,
							paddingTop: 40,
							cursor: dragging.current ? "grabbing" : "grab",
							userSelect: "none",
						}}
					>
						<div
							style={{
								position: "relative",
								width: 360,
								height: 160,
								transformStyle: "preserve-3d",
								transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
								transition: dragging.current ? "none" : "transform 0.3s ease-out",
							}}
						>
							{entries.map(([key, value], i) => (
								<div
									key={key}
									style={{
										position: "absolute",
										inset: 0,
										background: layerColor(i),
										borderRadius: 10,
										border: "1px solid rgba(255,255,255,0.3)",
										boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "0 16px",
										color: "#fff",
										fontSize: 13,
										transform: `translateZ(${i * 40}px)`,
										opacity: 0.92,
									}}
								>
									<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
										<strong>{key}</strong>
										<span
											style={{
												background: "rgba(255,255,255,0.2)",
												padding: "2px 6px",
												borderRadius: 4,
												fontSize: 11,
											}}
										>
											{value}
										</span>
									</div>
									<span style={{ fontSize: 11 }}>
										{descriptionForKey(key)}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

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
