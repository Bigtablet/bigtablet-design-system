import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { zIndex } from "src/styles/z-index";

const meta: Meta = {
	title: "Foundation/Z-Index",
	tags: ["autodocs", "!test"],
	parameters: {
		chromatic: { disableSnapshot: true },
		a11y: { test: "off" },
		docs: {
			description: {
				component: `
### Z-Index (레이어 우선순위)

z-index는 **화면에서 어떤 요소가 위에 보일지**를 정하는 기준입니다. 숫자가 클수록 위입니다.

레이어는 **7개**입니다. 값마다 두 개의 이름이 있는데 — \`level*\` 은 순서만, 의미 이름은 무엇이
거기 사는지를 말합니다. 같은 값의 별칭이므로 **한 레이어**입니다(\`popup\` === \`level5\`).
소비처에서는 의미 이름을 쓰세요.

| 값 | 이름 | 사는 것 |
|---|---|---|
| 0 | \`level0\` | 기본 배경 · flat 레이아웃 |
| 10 | \`content\` · \`level1\` | 컨텐츠 내부 겹침 — sticky 표 헤더, Hero 오버레이 |
| 100 | \`chrome\` · \`level2\` | Modal · Drawer · Sidebar · BottomNav |
| 150 | \`appChrome\` | 앱이 소유한 크롬 — DS 크롬 위, 알림 아래 |
| 200 | \`notification\` · \`level3\` | Toast · NavBar |
| 500 | \`loading\` · \`level4\` | TopLoading |
| 1000 | \`popup\` · \`level5\` | Tooltip · Popover · Menu · Dropdown 목록 · Alert |

앱 레이어를 DS 레이어 사이에 놓을 때는 값을 베끼지 말고 이름으로 계산하세요.

\`\`\`scss
.floating_bar { z-index: calc(#{token.$z_notification} - 1); } // 토스트 아래, 모달 위
\`\`\`
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
		const groups = layerGroups();

		return (
			<div style={{ display: "grid", gap: 32 }}>
				{/* 표 형태 요약 */}
				<section>
					<h3 style={{ marginBottom: 8 }}>Z-Index 값 표</h3>
					<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
						<thead>
							<tr>
								<th style={th}>이름</th>
								<th style={th}>값</th>
								<th style={th}>사는 것</th>
							</tr>
						</thead>
						<tbody>
							{groups.map((group) => (
								<tr key={group.value}>
									<td style={td}>
										<code>{group.primary}</code>
										{group.alias && (
											<span style={{ color: "#888", fontSize: 12 }}> · {group.alias}</span>
										)}
									</td>
									<td style={td}>{group.value}</td>
									<td style={td}>{group.use}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>

				{/* 인터랙티브 레이어 스택 */}
				<LayerStack groups={groups} />
			</div>
		);
	},
};

function LayerStack({ groups }: { groups: LayerGroup[] }) {
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

	// 카드는 +Z 로만 쌓이고 rotateX 는 그걸 화면 위쪽으로 투영한다. 그대로 두면 더미가
	// 위로만 자라 맨 위 카드가 상자 밖으로 잘린다 (실측 -89px). 투영된 높이의 절반만큼
	// 내려서 회전값이 바뀌어도 더미가 상자 가운데 머물게 한다.
	const cardDepth = 360 / groups.length;
	const spread = cardDepth * (groups.length - 1);
	const recenterY = (spread * Math.sin((rotation.x * Math.PI) / 180)) / 2;

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
			<p style={{ marginTop: 0, fontSize: 13, color: "#555" }}>
				{expanded
					? "마우스로 회전할 수 있습니다. 위에 있을수록 사용자에게 먼저 보입니다."
					: `구분되는 레이어는 ${groups.length}개입니다. 아래에서 위로 쌓이며, 위에 있을수록 사용자에게 먼저 보입니다.`}
			</p>

			<div
				style={{
					background: "#f5f5f5",
					borderRadius: 12,
					overflow: "hidden",
					transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
					height: expanded ? 520 : 250,
				}}
			>
				{/* 접힌 상태: 어긋나게 쌓은 카드 더미.
				    동심 `inset` 으로 감싸면 안쪽 카드가 선처럼 얇아지고 라벨이 같은 자리에 포개진다.
				    카드를 대각선으로 어긋내면 레이어가 몇 장이든 모든 라벨이 보인다. */}
				{!expanded && (
					<div style={{ position: "relative", height: 250, padding: 24 }}>
						{groups.map((group, index) => {
							const isHovered = hoveredLayer === group.primary;
							return (
								<div
									key={group.value}
									onMouseEnter={() => setHoveredLayer(group.primary)}
									onMouseLeave={() => setHoveredLayer(null)}
									style={{
										position: "absolute",
										left: 24 + index * 34,
										// 값이 큰 레이어가 위로 - 화면에서도 위쪽에 그린다.
										bottom: 40 + index * 30,
										width: 300,
										background: layerColor(index),
										color: "#fff",
										padding: "10px 14px",
										borderRadius: 10,
										zIndex: index,
										fontSize: 13,
										cursor: "pointer",
										boxShadow: isHovered
											? "0 6px 20px rgba(0,0,0,0.35)"
											: "0 2px 8px rgba(0,0,0,0.18)",
										transform: isHovered ? "translateY(-2px)" : "none",
										transition: "transform 0.15s ease, box-shadow 0.15s ease",
									}}
								>
									<div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
										<strong>{group.primary}</strong>
										{/* 반투명 흰색은 카드 위에서 대비가 4.5 아래로 떨어진다 (0.75 → 3.25:1).
										    글자는 불투명하게 두고 크기로만 위계를 준다. */}
										{group.alias && <span style={{ fontSize: 11 }}>· {group.alias}</span>}
										<span
											style={{
												marginLeft: "auto",
												// 흰색을 얹으면 배경이 밝아져 흰 글자 대비가 3.41:1 까지 떨어진다.
												// 검정으로 누르면 같은 카드에서 7.55:1 이 된다.
												background: "rgba(0,0,0,0.25)",
												padding: "1px 6px",
												borderRadius: 4,
												fontSize: 11,
											}}
										>
											{group.value}
										</span>
									</div>
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
								<strong>{hoveredLayer}</strong> ·{" "}
								{groups.find((g) => g.primary === hoveredLayer)?.use}
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
							perspective: 1400,
							cursor: dragging.current ? "grabbing" : "grab",
							userSelect: "none",
						}}
					>
						<div
							style={{
								position: "relative",
								width: 340,
								height: 150,
								transformStyle: "preserve-3d",
								transform: `translateY(${recenterY}px) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
								transition: dragging.current ? "none" : "transform 0.3s ease-out",
							}}
						>
							{groups.map((group, i) => (
								<div
									key={group.value}
									style={{
										position: "absolute",
										inset: 0,
										background: layerColor(i),
										borderRadius: 10,
										border: "1px solid rgba(255,255,255,0.35)",
										boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "0 16px",
										color: "#fff",
										fontSize: 13,
										// 간격은 장수로 나눈다 - 고정 40px 이면 장수가 늘 때 더미가 화면을 넘긴다.
										transform: `translateZ(${i * cardDepth}px)`,
										// 반투명이면 아래 카드의 글자가 배어 올라와 라벨이 서로 겹쳐 읽힌다.
										opacity: 1,
									}}
								>
									<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
										<strong>{group.primary}</strong>
										<span
											style={{
												background: "rgba(0,0,0,0.25)",
												padding: "2px 6px",
												borderRadius: 4,
												fontSize: 11,
											}}
										>
											{group.value}
										</span>
									</div>
									<span style={{ fontSize: 11 }}>{group.use}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

/**
 * 토큰은 12개 이름이지만 **구분되는 레이어는 7개**다 - `popup` 과 `level5` 는 같은 값의 별칭이다.
 * 이름마다 카드를 그리면 그림이 레이어 수를 부풀려 거짓말을 한다(같은 자리에 두 장이 겹치고,
 * 라벨끼리 포개진다). 값으로 묶고, 의미 이름을 앞에 세운다.
 */
function layerGroups() {
	const byValue = new Map<number, string[]>();
	for (const [name, value] of Object.entries(zIndex)) {
		const names = byValue.get(value as number) ?? [];
		names.push(name);
		byValue.set(value as number, names);
	}
	return [...byValue.entries()]
		.sort(([a], [b]) => a - b)
		.map(([value, names]) => ({
			value,
			// 의미 이름(level* 이 아닌 것)이 대표다. 없으면 level 이름을 쓴다 (level0).
			primary: names.find((n) => !n.startsWith("level")) ?? names[0],
			alias: names.find((n) => n.startsWith("level") && names.length > 1),
			use: describeLayer(value),
		}));
}

type LayerGroup = ReturnType<typeof layerGroups>[number];

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

/**
 * 값을 기준으로 설명한다. 이름 기준 `switch` 는 `level*` 만 알고 있어서 `popup`·`chrome` 같은
 * 의미 이름이 전부 기본값("공통 레이어")으로 떨어졌다 - 화면에 뜻 없는 문구가 찍혔다.
 * 문구는 `src/styles/z-index/_index.scss` 의 주석이 원본이다.
 */
function describeLayer(value: number) {
	switch (value) {
		case 0:
			return "기본 배경 · flat 레이아웃";
		case 10:
			return "컨텐츠 내부 겹침 (sticky 표 헤더, Hero 오버레이)";
		case 100:
			return "Modal · Drawer · Sidebar · BottomNav";
		case 150:
			return "앱이 소유한 크롬 (DS 크롬 위, 알림 아래)";
		case 200:
			return "Toast · NavBar";
		case 500:
			return "TopLoading";
		case 1000:
			return "Tooltip · Popover · Menu · Dropdown 목록 · Alert";
		default:
			return "정의되지 않은 레이어";
	}
}

/**
 * 레이어 수보다 색이 적으면 `index % length` 가 되돌아와 서로 다른 레이어가 같은 색으로 보인다
 * (7장에 6색이었을 때 `popup` 이 `level0` 과 같은 회색이었다). 색은 레이어 수 이상으로 둔다.
 *
 * 카드 글자는 흰색이라 색은 전부 흰 글자와 **4.5:1 이상**이어야 한다. 처음 쓰던 400 계열은
 * 여덟 색 전부 미달이었다 (최악 `#fbbf24` 1.67:1). 아래는 600~700 계열로, 최저가 4.83:1 이다.
 * 색을 바꿀 때는 대비를 다시 재고 넣는다.
 */
const LAYER_COLORS = [
	"#4b5563", // 7.56:1
	"#2563eb", // 5.17:1
	"#047857", // 5.48:1
	"#b45309", // 5.02:1
	"#dc2626", // 4.83:1
	"#7c3aed", // 5.70:1
	"#0e7490", // 5.36:1
	"#be185d", // 6.04:1
];

function layerColor(index: number) {
	return LAYER_COLORS[index % LAYER_COLORS.length];
}
