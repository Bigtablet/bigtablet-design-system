import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { a11y } from "src/styles/ts/a11y";
import { baseColors, colors } from "src/styles/ts/colors";

const meta: Meta = {
	title: "Foundation/a11y",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### 접근성 (Accessibility) 토큰

**키보드 사용자, 저시력 사용자, 터치 사용자**를 고려해
모든 인터랙션이 명확하고 안전하게 인식되도록 돕는 기준값입니다.

이 페이지에서는 다음 세 가지를 다룹니다:

1. **포커스 링** — 키보드 탐색 시 현재 위치를 표시하는 시각적 표시
2. **최소 터치 영역** — 모바일에서 손가락으로 누르기 충분한 최소 크기
3. **색상 대비** — 텍스트와 배경 간 충분한 명도 차이 (WCAG AA 기준)
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ── 포커스 링 ────────────────────────────────────────────────────────────────

export const FocusRing: Story = {
	name: "포커스 링 (Focus Ring)",
	render: () => (
		<div style={{ display: "grid", gap: 32, maxWidth: 720 }}>
			<section>
				<h3 style={{ marginBottom: 4 }}>포커스 링 스타일</h3>
				<p style={{ color: "#555", fontSize: 13, marginTop: 0 }}>
					키보드(Tab)로 이동할 때, 현재 위치를 명확히 보여주는 시각적 표시입니다.
				</p>

				<div style={{ display: "flex", gap: 16, marginTop: 16 }}>
					{(
						[
							["기본", a11y.focusRing, "focusRing"],
							["에러", a11y.focusRingError, "focusRingError"],
							["성공", a11y.focusRingSuccess, "focusRingSuccess"],
						] as const
					).map(([label, shadow, token]) => (
						<div key={token} style={{ textAlign: "center" }}>
							<button
								type="button"
								style={{
									padding: "10px 20px",
									borderRadius: 8,
									border: "1px solid #e5e5e5",
									background: "#fff",
									boxShadow: shadow,
									cursor: "pointer",
									fontSize: 14,
								}}
							>
								{label} 포커스
							</button>
							<div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>
								<code>{token}</code>
							</div>
						</div>
					))}
				</div>
			</section>

			<section>
				<h3 style={{ marginBottom: 4 }}>실제 UI 요소에서의 포커스 링</h3>
				<p style={{ color: "#555", fontSize: 13, marginTop: 0 }}>
					다양한 인터랙티브 요소 위에서 포커스 링이 어떻게 보이는지 확인하세요.
				</p>

				<div style={{ display: "grid", gap: 16, marginTop: 16 }}>
					{/* 인풋 */}
					<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", gap: 12 }}>
						<span style={{ fontSize: 13, color: "#555" }}>입력창</span>
						<input
							type="text"
							placeholder="Tab으로 포커스 이동해 보세요"
							style={{
								padding: "10px 12px",
								borderRadius: 8,
								border: "1px solid #e5e5e5",
								fontSize: 14,
								outline: "none",
								width: "100%",
								boxSizing: "border-box",
							}}
							onFocus={(e) => { e.currentTarget.style.boxShadow = a11y.focusRing; }}
							onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
						/>
					</div>

					{/* 에러 인풋 */}
					<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", gap: 12 }}>
						<span style={{ fontSize: 13, color: "#555" }}>에러 상태</span>
						<input
							type="text"
							placeholder="오류가 있는 필드"
							style={{
								padding: "10px 12px",
								borderRadius: 8,
								border: `1px solid ${baseColors.statusError}`,
								fontSize: 14,
								outline: "none",
								width: "100%",
								boxSizing: "border-box",
							}}
							onFocus={(e) => { e.currentTarget.style.boxShadow = a11y.focusRingError; }}
							onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
						/>
					</div>

					{/* 버튼 */}
					<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", gap: 12 }}>
						<span style={{ fontSize: 13, color: "#555" }}>버튼</span>
						<div style={{ display: "flex", gap: 8 }}>
							<button
								type="button"
								style={{
									padding: "10px 20px",
									borderRadius: 8,
									border: "none",
									background: "#121212",
									color: "#fff",
									fontSize: 14,
									cursor: "pointer",
									outline: "none",
								}}
								onFocus={(e) => { e.currentTarget.style.boxShadow = a11y.focusRing; }}
								onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
							>
								Primary
							</button>
							<button
								type="button"
								style={{
									padding: "10px 20px",
									borderRadius: 8,
									border: "1px solid #e5e5e5",
									background: "#fff",
									fontSize: 14,
									cursor: "pointer",
									outline: "none",
								}}
								onFocus={(e) => { e.currentTarget.style.boxShadow = a11y.focusRing; }}
								onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
							>
								Secondary
							</button>
						</div>
					</div>

					{/* 링크 */}
					<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", gap: 12 }}>
						<span style={{ fontSize: 13, color: "#555" }}>링크</span>
						<a
							href="#"
							onClick={(e) => e.preventDefault()}
							style={{
								fontSize: 14,
								color: "#121212",
								textDecoration: "underline",
								outline: "none",
								borderRadius: 4,
								padding: "2px 4px",
							}}
							onFocus={(e) => { e.currentTarget.style.boxShadow = a11y.focusRing; }}
							onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
						>
							텍스트 링크 예시
						</a>
					</div>
				</div>
			</section>
		</div>
	),
};

// ── 터치 영역 ────────────────────────────────────────────────────────────────

export const TapTarget: Story = {
	name: "최소 터치 영역 (Tap Target)",
	render: () => (
		<div style={{ display: "grid", gap: 32, maxWidth: 720 }}>
			<section>
				<h3 style={{ marginBottom: 4 }}>왜 44px인가요?</h3>
				<p style={{ color: "#555", fontSize: 13, marginTop: 0 }}>
					성인 손가락 끝 평균 크기가 약 44px입니다. 이보다 작으면 탭 실수가 잦아지고,
					특히 이동 중이거나 손이 큰 사용자에게 불편합니다. WCAG 2.2 / Apple HIG / Material Design 모두 최소 44px을 권장합니다.
				</p>
			</section>

			<section>
				<h3 style={{ marginBottom: 4 }}>크기 비교</h3>
				<p style={{ color: "#555", fontSize: 13, marginTop: 0 }}>
					아래 버튼을 직접 눌러보면 체감할 수 있습니다.
				</p>

				<div style={{ display: "flex", alignItems: "end", gap: 24, marginTop: 16 }}>
					{(
						[
							[24, "너무 작음", true],
							[32, "작음", true],
							[44, "최소 기준", false],
							[48, "권장", false],
						] as [number, string, boolean][]
					).map(([size, label, isBad]) => (
						<div key={size} style={{ textAlign: "center" }}>
							<div
								style={{
									width: size,
									height: size,
									background: isBad ? "#FEE2E2" : "#D1FAE5",
									border: `2px solid ${isBad ? "#EF4444" : "#10B981"}`,
									borderRadius: 8,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: 11,
									color: isBad ? "#991B1B" : "#065F46",
									fontWeight: 600,
									margin: "0 auto",
								}}
							>
								{size}
							</div>
							<div style={{ marginTop: 6, fontSize: 12 }}>
								<strong>{label}</strong>
							</div>
							<div style={{ fontSize: 11, color: "#666" }}>{size}×{size}px</div>
						</div>
					))}
				</div>

				<div
					style={{
						marginTop: 20,
						padding: 12,
						background: "#FFFBEB",
						border: "1px solid #FDE68A",
						borderRadius: 8,
						fontSize: 13,
					}}
				>
					<strong>규칙:</strong> 시각적으로 작아 보여도 <strong>터치 영역(hit area)</strong>은 반드시 44×44px 이상이어야 합니다.
					CSS의 <code>padding</code>이나 <code>min-width/min-height</code>로 확보하세요.
				</div>
			</section>
		</div>
	),
};

// ── 색상 대비 ────────────────────────────────────────────────────────────────

/** rgba(r, g, b, a) 또는 #rrggbb → [r, g, b] (0~255), 알파는 흰 배경과 블렌딩 */
function parseToRGB(color: string): [number, number, number] {
	const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
	if (rgba) {
		const r = parseInt(rgba[1]);
		const g = parseInt(rgba[2]);
		const b = parseInt(rgba[3]);
		const a = rgba[4] !== undefined ? parseFloat(rgba[4]) : 1;
		// 흰 배경(255,255,255)과 알파 블렌딩
		return [
			Math.round(r * a + 255 * (1 - a)),
			Math.round(g * a + 255 * (1 - a)),
			Math.round(b * a + 255 * (1 - a)),
		];
	}
	const hex = color.replace("#", "").match(/.{2}/g)!;
	return [parseInt(hex[0], 16), parseInt(hex[1], 16), parseInt(hex[2], 16)];
}

function getLuminance(color: string): number {
	const [r, g, b] = parseToRGB(color).map((c) => {
		const v = c / 255;
		return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
	const l1 = getLuminance(hex1);
	const l2 = getLuminance(hex2);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

type ContrastPair = {
	label: string;
	fg: string;
	fgName: string;
	bg: string;
	bgName: string;
};

const contrastPairs: ContrastPair[] = [
	{ label: "제목 텍스트", fg: colors.text.heading, fgName: "text.heading", bg: colors.bg.solid, bgName: "bg.solid" },
	{ label: "본문 텍스트", fg: colors.text.body, fgName: "text.body", bg: colors.bg.solid, bgName: "bg.solid" },
	{ label: "캡션 텍스트", fg: colors.text.caption, fgName: "text.caption", bg: colors.bg.solid, bgName: "bg.solid" },
	{ label: "비활성 텍스트", fg: colors.text.disabled, fgName: "text.disabled", bg: colors.bg.solid, bgName: "bg.solid" },
	{ label: "반전 텍스트", fg: colors.brand.onPrimary, fgName: "brand.onPrimary", bg: colors.brand.primary, bgName: "brand.primary" },
	{ label: "에러 텍스트", fg: colors.status.error, fgName: "status.error", bg: colors.bg.solid, bgName: "bg.solid" },
	{ label: "성공 텍스트", fg: colors.status.success, fgName: "status.success", bg: colors.bg.solid, bgName: "bg.solid" },
	{ label: "정보 텍스트", fg: colors.status.info, fgName: "status.info", bg: colors.bg.solid, bgName: "bg.solid" },
	{ label: "보조 배경 위 제목", fg: colors.text.heading, fgName: "text.heading", bg: colors.bg.solidDim, bgName: "bg.solidDim" },
	{ label: "보조 배경 위 본문", fg: colors.text.body, fgName: "text.body", bg: colors.bg.solidDim, bgName: "bg.solidDim" },
];

export const ColorContrast: Story = {
	name: "색상 대비 (Color Contrast)",
	parameters: { a11y: { test: "off" } },
	render: () => (
		<div style={{ display: "grid", gap: 32, maxWidth: 760 }}>
			<section>
				<h3 style={{ marginBottom: 4 }}>WCAG AA 기준</h3>
				<p style={{ color: "#555", fontSize: 13, marginTop: 0 }}>
					일반 텍스트는 <strong>4.5:1 이상</strong>, 큰 텍스트(18px bold 또는 24px 이상)는{" "}
					<strong>3:1 이상</strong>의 명도 대비가 필요합니다.
					아래는 우리 디자인 토큰의 주요 텍스트/배경 조합별 대비율입니다.
				</p>
			</section>

			<section style={{ display: "grid", gap: 8 }}>
				{contrastPairs.map((pair) => {
					const ratio = getContrastRatio(pair.fg, pair.bg);
					const passAA = ratio >= 4.5;
					const passAALarge = ratio >= 3;

					return (
						<div
							key={pair.label}
							style={{
								display: "grid",
								gridTemplateColumns: "160px 1fr 100px 80px",
								alignItems: "center",
								gap: 12,
								padding: 12,
								background: "#fff",
								border: "1px solid rgba(0,0,0,0.06)",
								borderRadius: 10,
							}}
						>
							<div>
								<strong style={{ fontSize: 13 }}>{pair.label}</strong>
								<div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
									{pair.fgName} / {pair.bgName}
								</div>
							</div>

							<div
								style={{
									padding: "8px 12px",
									borderRadius: 8,
									background: pair.bg,
									color: pair.fg,
									fontSize: 14,
									border: "1px solid rgba(0,0,0,0.06)",
								}}
								aria-disabled={pair.fgName === "text.disabled" || undefined}
							>
								가나다라 ABC 123
							</div>

							<div style={{ textAlign: "center", fontSize: 14, fontWeight: 600 }}>
								{ratio.toFixed(1)}:1
							</div>

							<div style={{ textAlign: "center" }}>
								{passAA ? (
									<span
										style={{
											padding: "3px 8px",
											borderRadius: 4,
											background: "#D1FAE5",
											color: "#065F46",
											fontSize: 12,
											fontWeight: 600,
										}}
									>
										AA 통과
									</span>
								) : passAALarge ? (
									<span
										style={{
											padding: "3px 8px",
											borderRadius: 4,
											background: "#FEF3C7",
											color: "#92400E",
											fontSize: 12,
											fontWeight: 600,
										}}
									>
										큰 텍스트만
									</span>
								) : (
									<span
										style={{
											padding: "3px 8px",
											borderRadius: 4,
											background: "#FEE2E2",
											color: "#991B1B",
											fontSize: 12,
											fontWeight: 600,
										}}
									>
										미달
									</span>
								)}
							</div>
						</div>
					);
				})}
			</section>

			<div
				style={{
					padding: 12,
					background: "#F0F9FF",
					border: "1px solid #BAE6FD",
					borderRadius: 8,
					fontSize: 13,
				}}
			>
				<strong>참고:</strong> 비활성(disabled) 상태는 의도적으로 대비가 낮습니다. WCAG에서도 비활성 UI는 대비
				요구사항에서 제외됩니다. 단, 비활성임을 인지할 수 있을 정도의 차이는 유지해야 합니다.
			</div>
		</div>
	),
};
