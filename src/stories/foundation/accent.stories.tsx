import { animated } from "@react-spring/web";
import type { Meta, StoryObj } from "@storybook/react";
import { baseColors, colors } from "src/styles/colors";
import { useSpringHover, useSpringPresence } from "src/utils";
import * as React from "react";

const meta: Meta = {
	title: "Foundation/accent (navy)",
	tags: ["autodocs"],
	parameters: {
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component: `
### Accent (Bigtablet Navy) — 초기 홈페이지 brand 컬러

Bigtablet의 초기 홈페이지 메인 컬러였던 **navy slate**를 brand accent로 복원. 검정(\`brand_primary\`)과 함께 사용해서 시각적 위계를 만든다.

- **메인 navy: \`#47555E\`** (slate-gray-blue, homepage git history에서 가장 많이 사용)
- **sky blue 패밀리**: \`#7AA5D2\`, \`#5A8DCB\`, \`#4C7CB6\` — 보조 강조
- **dark navy**: \`#303841\` — 진한 헤더/섹션
- Tailwind slate와 다른 Bigtablet 고유 톤

### 사용 가이드
| 토큰 | 값 | 용도 |
|------|------|------|
| \`accent.subtle\` | #F2F5F8 | hero 섹션 wash, 카드 배경 |
| \`accent.muted\` | #DDE3E9 | 보조 카드 배경 |
| \`accent.light\` | #7AA5D2 | sky blue 강조 (보조 CTA, 링크) |
| \`accent.default\` | **#47555E** | PRIMARY navy (dark hero, CTA) |
| \`accent.strong\` | #303841 | hover/pressed, 진한 navy |
| \`accent.onSurface\` | #FFFFFF | accent 위 흰 텍스트 |

### 모션 (Vercel/Linear 스타일)
\`@react-spring/web\` 기반 hooks:
- **\`useSpringPresence\`** — 마운트/언마운트 부드러운 진입·퇴출
- **\`useSpringHover\`** — 카드/CTA hover lift 효과
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

const NAVY_SCALE = [
	{ key: "50", value: baseColors.navy50 },
	{ key: "100", value: baseColors.navy100 },
	{ key: "200", value: baseColors.navy200 },
	{ key: "300", value: baseColors.navy300 },
	{ key: "400", value: baseColors.navy400 },
	{ key: "500", value: baseColors.navy500 },
	{ key: "600", value: baseColors.navy600 },
	{ key: "700", value: baseColors.navy700 },
	{ key: "800", value: baseColors.navy800 },
	{ key: "900", value: baseColors.navy900 },
];

export const Palette: Story = {
	name: "Navy 팔레트",
	render: () => (
		<div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
			<p style={{ margin: 0, fontSize: 13, color: "#666" }}>
				<strong>10단계 스케일</strong> — 라이트 wash부터 거의 검정까지. 검정 brand 컬러와 함께
				사용해 텍스트/배경 위계를 만드세요.
			</p>
			{NAVY_SCALE.map(({ key, value }) => {
				const isLight = parseInt(key, 10) <= 300;
				return (
					<div
						key={key}
						style={{
							display: "grid",
							gridTemplateColumns: "120px 1fr 100px",
							alignItems: "center",
							gap: 12,
							padding: 12,
							background: "#fff",
							border: "1px solid rgba(0,0,0,0.06)",
							borderRadius: 10,
						}}
					>
						<code style={{ fontSize: 12 }}>navy-{key}</code>
						<div
							style={{
								height: 44,
								borderRadius: 8,
								background: value,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: isLight ? "#121212" : "#fff",
								fontSize: 13,
							}}
						>
							가나다 Aa 123
						</div>
						<span style={{ fontSize: 12, opacity: 0.6, textAlign: "right" }}>{value}</span>
					</div>
				);
			})}
		</div>
	),
};

export const SemanticTokens: Story = {
	name: "Semantic accent 토큰",
	render: () => {
		const items = [
			{ key: "subtle", value: colors.accent.subtle, desc: "hero wash, 카드 배경" },
			{ key: "muted", value: colors.accent.muted, desc: "보조 카드 배경" },
			{ key: "light", value: colors.accent.light, desc: "sky blue 강조 (보조 CTA)" },
			{ key: "default", value: colors.accent.default, desc: "PRIMARY navy (dark section, CTA)" },
			{ key: "strong", value: colors.accent.strong, desc: "hover/pressed, 진한 navy" },
		];
		return (
			<div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
				{items.map(({ key, value, desc }) => {
					const isLight = key === "subtle" || key === "muted" || key === "light";
					return (
						<div
							key={key}
							style={{
								display: "grid",
								gridTemplateColumns: "160px 1fr 100px",
								alignItems: "center",
								gap: 12,
								padding: 12,
								background: "#fff",
								border: "1px solid rgba(0,0,0,0.06)",
								borderRadius: 10,
							}}
						>
							<div>
								<code style={{ fontSize: 12 }}>accent.{key}</code>
								<div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{desc}</div>
							</div>
							<div
								style={{
									height: 56,
									borderRadius: 10,
									background: value,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: isLight ? "#121212" : "#fff",
									fontSize: 14,
									fontWeight: 500,
								}}
							>
								Sample text
							</div>
							<span style={{ fontSize: 12, opacity: 0.6, textAlign: "right" }}>{value}</span>
						</div>
					);
				})}
			</div>
		);
	},
};

function PresenceDemo() {
	const [visible, setVisible] = React.useState(true);
	const style = useSpringPresence({ visible });
	return (
		<div style={{ padding: 16, background: "#fff", borderRadius: 12 }}>
			<button
				type="button"
				onClick={() => setVisible((v) => !v)}
				style={{
					padding: "8px 16px",
					background: colors.accent.default,
					color: colors.accent.onSurface,
					border: "none",
					borderRadius: 8,
					cursor: "pointer",
					fontSize: 13,
					fontWeight: 500,
				}}
			>
				{visible ? "사라지게" : "나타나게"}
			</button>
			<div style={{ marginTop: 16, minHeight: 80 }}>
				<animated.div
					style={{
						...style,
						padding: 16,
						background: colors.accent.subtle,
						borderRadius: 10,
						border: `1px solid ${colors.accent.muted}`,
					}}
				>
					<strong style={{ display: "block", marginBottom: 4 }}>useSpringPresence</strong>
					<span style={{ fontSize: 13, color: "#555" }}>
						부드러운 fade + translateY. Vercel/Linear 스타일.
					</span>
				</animated.div>
			</div>
		</div>
	);
}

function HoverDemo() {
	const a = useSpringHover();
	const b = useSpringHover({ scale: 1.04, lift: -4 });
	return (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
			<animated.div
				{...a.bind}
				style={{
					...a.style,
					padding: 24,
					background: "#fff",
					borderRadius: 12,
					border: "1px solid rgba(0,0,0,0.08)",
					boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
					cursor: "pointer",
				}}
			>
				<strong>기본 lift (-2px, scale 1.02)</strong>
				<p style={{ margin: "8px 0 0", fontSize: 13, color: "#666" }}>마우스를 올려보세요</p>
			</animated.div>

			<animated.div
				{...b.bind}
				style={{
					...b.style,
					padding: 24,
					background: colors.accent.default,
					color: colors.accent.onSurface,
					borderRadius: 12,
					cursor: "pointer",
				}}
			>
				<strong>강한 lift (-4px, scale 1.04)</strong>
				<p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.8 }}>
					CTA 카드에 적합 — navy accent 배경
				</p>
			</animated.div>
		</div>
	);
}

export const SpringMotion: Story = {
	name: "Spring 모션 (react-spring)",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
			<section>
				<h3 style={{ margin: "0 0 4px" }}>useSpringPresence</h3>
				<p style={{ margin: "0 0 12px", fontSize: 13, color: "#666" }}>
					마운트/언마운트 시 자연스러운 fade + slide. tension 280 / friction 28.
				</p>
				<PresenceDemo />
			</section>

			<section>
				<h3 style={{ margin: "0 0 4px" }}>useSpringHover</h3>
				<p style={{ margin: "0 0 12px", fontSize: 13, color: "#666" }}>
					hover 시 spring 기반 lift. CSS transition 보다 더 자연스러운 가속·감속.
				</p>
				<HoverDemo />
			</section>
		</div>
	),
};
